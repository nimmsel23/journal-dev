// Lokaler Store (gtasks.store.js): offline schreiben, Outbox, Zusammenfassen, Neustart, gesperrter Speicher, mehrere Tabs.
import test from "node:test";
import assert from "node:assert/strict";
import { createStore, storeKey, isTmp, applyOp } from "../src/lib/door/gtasks.store.js";
import { memoryStorage, fakeClock } from "./helpers/fake-google.mjs";

const P = "Door · Potential";
const mk = (opts = {}) => {
  const clock = fakeClock();
  const storage = opts.storage || memoryStorage();
  let i = 0;
  const store = createStore({ storage, uid: opts.uid || "u1", now: clock.now, newId: () => `tmp:${++i}` });
  return { store, storage, clock };
};

test("Schlüssel ist je uid und Quelle getrennt (nichts origin-/nutzerübergreifend)", () => {
  assert.notEqual(storeKey("u1"), storeKey("u2"));
  assert.notEqual(storeKey("u1", "gtasks"), storeKey("u1", "taskwarrior"));
  const { store, storage } = mk({ uid: "u1" });
  store.insert(P, { title: "A" });
  const other = createStore({ storage, uid: "u2" });
  assert.equal(other.hasData(), false);
});

test("offline anlegen: sofort lesbar, temporäre id, Outbox, Neustart behält alles", () => {
  const { store, storage, clock } = mk();
  const id = store.insert(P, { title: "Idee" });
  assert.ok(isTmp(id));
  assert.deepEqual(store.tasks(P).map((t) => t.title), ["Idee"]);
  assert.equal(store.pending(), 1);
  // "Neustart": neuer Store auf demselben Speicher
  const again = createStore({ storage, uid: "u1", now: clock.now });
  assert.deepEqual(again.tasks(P).map((t) => t.title), ["Idee"]);
  assert.equal(again.pending(), 1);
  assert.equal(again.head().kind, "insert");
});

test("mehrere Patches eines Tasks werden zu einer Op zusammengefasst; Patch auf noch nicht gesendeten insert fließt in den insert", () => {
  const { store } = mk();
  const id = store.insert(P, { title: "A" });
  store.patch(P, id, { notes: "Door: Q1" });
  store.patch(P, id, { title: "A2" });
  assert.equal(store.pending(), 1);
  assert.deepEqual(store.snapshot().outbox[0].task, { title: "A2", notes: "Door: Q1" });

  // schon vorhandener (gesendeter) Task: Patches fassen sich zusammen
  store.replaceLists({ [P]: [{ id: "g1", title: "X", status: "needsAction" }] });
  store.ack(store.head().seq);
  store.patch(P, "g1", { notes: "a" });
  store.patch(P, "g1", { status: "completed" });
  assert.equal(store.pending(), 1);
  assert.deepEqual(store.head().patch, { notes: "a", status: "completed" });
  assert.ok(store.find(P, "g1").completed, "lokal sofort mit completed-Zeitstempel");
});

test("Löschen eines nie gesendeten Tasks verschwindet spurlos (keine Anfrage nötig)", () => {
  const { store } = mk();
  const id = store.insert(P, { title: "A" });
  store.patch(P, id, { notes: "x" });
  store.remove(P, id);
  assert.equal(store.pending(), 0);
  assert.equal(store.tasks(P).length, 0);
});

test("bereits sendender Insert wird nicht mehr zusammengefasst; Patch danach arbeitet nach dem id-Mapping mit der echten id", () => {
  const { store } = mk();
  const id = store.insert(P, { title: "A" });
  store.beginSend(store.head().seq); // unterwegs
  store.patch(P, id, { notes: "später" }); // darf nicht in den unterwegs befindlichen insert
  assert.equal(store.pending(), 2);
  store.mapId(P, id, { id: "g7", title: "A", status: "needsAction" });
  store.ack(store.snapshot().outbox[0].seq);
  assert.equal(store.head().id, "g7");
  assert.equal(store.resolve(id), "g7"); // Oberfläche mit alter id arbeitet weiter
  assert.equal(store.find(P, id).id, "g7");
});

test("Rebase: Pull ersetzt den Serverstand, offene lokale Änderungen bleiben obenauf (kein Flackern, kein Verlust)", () => {
  const { store } = mk();
  store.replaceLists({ [P]: [{ id: "g1", title: "A", status: "needsAction" }, { id: "g2", title: "B", status: "needsAction" }] });
  store.patch(P, "g1", { title: "A lokal" });
  store.remove(P, "g2");
  const neu = store.insert(P, { title: "C neu" }, "g1");
  // Server kennt davon nichts, hat aber einen dritten Task und eine Änderung an g2
  store.replaceLists({ [P]: [{ id: "g1", title: "A", status: "needsAction" }, { id: "g2", title: "B server", status: "needsAction" }, { id: "g3", title: "D", status: "needsAction" }] });
  assert.deepEqual(store.tasks(P).map((t) => t.title), ["A lokal", "C neu", "D"]);
  assert.ok(isTmp(neu));
});

test("gesperrter Speicher (privates Fenster): läuft im Speicher weiter, wirft nie", () => {
  const { store } = mk({ storage: memoryStorage({ locked: true }) });
  const id = store.insert(P, { title: "A" });
  store.patch(P, id, { notes: "n" });
  assert.equal(store.tasks(P).length, 1);
  assert.equal(store.pending(), 1);
});

test("kaputtes JSON im Speicher: leerer Start statt Absturz", () => {
  const storage = memoryStorage();
  storage.setItem(storeKey("u1"), "{kaputt");
  const store = createStore({ storage, uid: "u1" });
  assert.equal(store.hasData(), false);
  store.insert(P, { title: "A" });
  assert.equal(store.pending(), 1);
});

test("zwei Tabs derselben Origin: Ops des anderen Tabs gehen nicht verloren", () => {
  const storage = memoryStorage();
  const a = createStore({ storage, uid: "u1" });
  const b = createStore({ storage, uid: "u1" });
  a.insert(P, { title: "von A" });
  b.insert(P, { title: "von B" }); // b liest vor dem Schreiben den Stand von a
  a.insert(P, { title: "von A 2" });
  const c = createStore({ storage, uid: "u1" });
  assert.deepEqual(c.snapshot().outbox.map((o) => o.task.title).sort(), ["von A", "von A 2", "von B"]);
  assert.equal(b.reload(), true); // storage-Event: b übernimmt den Stand
  assert.equal(b.tasks(P).length, 3);
});

test("applyOp: move/complete/reopen wie Google (Position, completed-Zeitstempel)", () => {
  const lists = { [P]: [{ id: "a" }, { id: "b" }, { id: "c" }] };
  applyOp(lists, { kind: "move", list: P, id: "c", previous: "a" });
  assert.deepEqual(lists[P].map((t) => t.id), ["a", "c", "b"]);
  applyOp(lists, { kind: "move", list: P, id: "b" });
  assert.deepEqual(lists[P].map((t) => t.id), ["b", "a", "c"]);
  applyOp(lists, { kind: "patch", list: P, id: "a", patch: { status: "completed" }, at: "2026-10-31T10:00:00.000Z" });
  assert.equal(lists[P][1].completed, "2026-10-31T10:00:00.000Z");
  applyOp(lists, { kind: "patch", list: P, id: "a", patch: { status: "needsAction", completed: null }, at: "x" });
  assert.equal("completed" in lists[P][1], false);
});
