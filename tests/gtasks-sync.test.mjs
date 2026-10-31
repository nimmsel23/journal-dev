// Hintergrund-Abgleich (gtasks.sync.js): Outbox senden, id-Mapping, stille Fehler, Backoff, Rebase,
// verlorene Antworten, mehrere Origins/Geräte gegen dasselbe Konto.
import test from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../src/lib/door/gtasks.store.js";
import { createDoorModel, LIST_POTENTIAL as P, LIST_PRODUCTION as PR } from "../src/lib/door/gtasks.model.js";
import { createSync } from "../src/lib/door/gtasks.sync.js";
import { memoryStorage, fakeClock, fakeGoogle } from "./helpers/fake-google.mjs";

/** Ein Client = eine Origin/ein Gerät: eigener Speicher, eigener Store, eigene Outbox. */
function client(g, clock, { uid = "u1", canRun = () => true } = {}) {
  const storage = memoryStorage();
  const store = createStore({ storage, uid, now: clock.now });
  const model = createDoorModel(store);
  const sync = createSync({ store, api: g.api, canRun, now: clock.now, timeoutMs: 500 });
  return { storage, store, model, sync };
}
const titles = (arr) => arr.map((t) => t.title);

test("offline schreiben → online: Outbox geht raus, temporäre ids werden gemappt, Server hat alles in Reihenfolge", async () => {
  const clock = fakeClock(), g = fakeGoogle({ now: clock.now });
  const c = client(g, clock);
  g.st.offline = true;
  await c.model.addHotlistItem("Eins");
  await c.model.addHotlistItem("Zwei");
  await c.sync.run(); // offline: still, wirft nicht
  assert.equal(c.store.pending(), 2, "Outbox bleibt unverändert");
  assert.deepEqual((await c.model.fetchHotlist()).map((i) => i.title), ["Eins", "Zwei"], "UI sieht alles weiter");

  g.st.offline = false;
  clock.advance(10 * 60_000); // Backoff vorbei
  const [zwei] = (await c.model.fetchHotlist()).filter((i) => i.title === "Zwei");
  await c.model.assignQuadrant(zwei.id, 1); // arbeitet mit der noch temporären id weiter
  await c.sync.run();
  assert.equal(c.store.pending(), 0);
  assert.deepEqual(titles(g.arr(P)), ["Zwei", "Eins"], "Q1 steht oben");
  const items = await c.model.fetchHotlist();
  assert.ok(items.every((i) => !i.id.startsWith("tmp:")), "alle ids sind echt");
  assert.equal(items[0].quadrant, 1);
  assert.equal(g.arr(P)[0].notes, "Door: Q1");
});

test("Fehler bleiben still: kein Wurf, Daten unverändert, Backoff statt Retry-Sturm, danach wieder", async () => {
  const clock = fakeClock(), g = fakeGoogle({ now: clock.now });
  const c = client(g, clock);
  await c.model.addHotlistItem("A");
  g.st.fail = [Object.assign(new Error("tasks 503"), { status: 503 })];
  await c.sync.run();
  assert.equal(c.store.pending(), 1);
  const calls = g.st.calls.length;
  await c.sync.run(); await c.sync.run();
  assert.equal(g.st.calls.length, calls, "während des Backoffs keine weiteren Anfragen");
  clock.advance(5_000);
  await c.sync.run();
  assert.equal(c.store.pending(), 0);
  assert.equal(g.arr(P).length, 1);
  // abgelaufener Token / Offline-Fehler der Google-Schicht: ebenfalls still
  await c.model.addHotlistItem("B");
  g.st.fail = [Object.assign(new Error("google-expired"), {})];
  await assert.doesNotReject(c.sync.run({ force: true }));
  assert.equal(c.store.pending(), 1);
});

test("canRun=false (offline/nicht verbunden): nichts passiert, nichts geht verloren", async () => {
  const clock = fakeClock(), g = fakeGoogle({ now: clock.now });
  let on = false;
  const c = client(g, clock, { canRun: () => on });
  await c.model.addHotlistItem("A");
  await c.sync.run({ force: true });
  assert.equal(g.st.calls.length, 0);
  on = true;
  await c.sync.run({ force: true });
  assert.equal(g.arr(P).length, 1);
});

test("endgültig abgelehnte Op (404: Task gibt es nicht mehr) blockiert die Warteschlange nicht", async () => {
  const clock = fakeClock(), g = fakeGoogle({ now: clock.now });
  g.seed(P, [{ title: "alt" }]);
  const c = client(g, clock);
  await c.sync.run({ force: true });
  const [alt] = await c.model.fetchHotlist();
  g.arr(P).length = 0; // woanders gelöscht
  await c.model.completeHotlistItem(alt.id);
  await c.model.addHotlistItem("neu");
  await c.sync.run({ force: true });
  assert.equal(c.store.pending(), 0);
  assert.deepEqual(titles(g.arr(P)), ["neu"]);
  assert.deepEqual((await c.model.fetchHotlist()).map((i) => i.title), ["neu"]);
});

test("Pull-Rebase: lokale, noch nicht gesendete Änderungen überleben einen Pull; Pull ist atomar", async () => {
  const clock = fakeClock(), g = fakeGoogle({ now: clock.now });
  g.seed(P, [{ title: "A" }, { title: "B" }]);
  const c = client(g, clock);
  await c.sync.run({ force: true });
  g.st.offline = true;
  const [a] = await c.model.fetchHotlist();
  await c.model.addNote(a.id, "lokal notiert");
  await c.model.addHotlistItem("C lokal");
  g.st.offline = false;
  // Pull schlägt bei der zweiten Liste fehl → Store bleibt komplett unverändert
  let before = "";
  g.st.calls.length = 0;
  g.st.fail = [];
  const realList = g.api.listTasks;
  let n = 0;
  g.api.listTasks = async (...args) => { if (++n === 3) { before = JSON.stringify(c.store.snapshot().lists); throw new TypeError("Failed to fetch"); } return realList(...args); };
  await c.sync.run({ force: true });
  g.api.listTasks = realList;
  // flush war erfolgreich (Outbox leer), Pull gescheitert → Store zeigt Zwischenstand, nichts halb ersetzt
  assert.equal(c.store.pending(), 0);
  assert.ok(before, "der Pull wurde mitten drin unterbrochen");
  assert.deepEqual(c.store.snapshot().lists, JSON.parse(before), "gescheiterter Pull ersetzt nichts");
  clock.advance(10 * 60_000);
  await c.sync.run({ force: true });
  const items = await c.model.fetchHotlist();
  assert.deepEqual(items.map((i) => i.title), ["A", "B", "C lokal"]);
  assert.equal(items[0].description, "lokal notiert");
});

test("Pull ohne eigene Änderungen wird gedrosselt (alle 30 s), Schreiben löst sofort aus", async () => {
  const clock = fakeClock(), g = fakeGoogle({ now: clock.now });
  const c = client(g, clock);
  await c.sync.run({ force: true });
  const listCalls = () => g.st.calls.filter((x) => x === "list").length;
  const first = listCalls();
  await c.sync.run();
  assert.equal(listCalls(), first, "innerhalb von 30 s kein neuer Pull");
  clock.advance(31_000);
  await c.sync.run();
  assert.equal(listCalls(), first + 4);
});

test("Antwort eines Inserts ging verloren: Wiederholung adoptiert den angelegten Task statt ihn doppelt anzulegen", async () => {
  const clock = fakeClock(), g = fakeGoogle({ now: clock.now });
  const c = client(g, clock);
  await c.model.addHotlistItem("Einmalig");
  g.st.lostResponse = 1;
  await c.sync.run();
  assert.equal(g.arr(P).length, 1, "Task liegt schon auf dem Server");
  assert.equal(c.store.pending(), 1);
  clock.advance(10_000);
  await c.sync.run();
  assert.equal(c.store.pending(), 0);
  assert.equal(g.arr(P).length, 1, "kein Duplikat");
  const [item] = await c.model.fetchHotlist();
  assert.equal(item.id, g.arr(P)[0].id);
});

test("zwei Origins/Geräte, gleiche Remote-Daten, konkurrierende Änderungen: last-write-wins pro Task, kein Datenverlust", async () => {
  const clock = fakeClock(), g = fakeGoogle({ now: clock.now });
  g.seed(P, [{ title: "X" }, { title: "Y" }, { title: "Z" }]);
  const a = client(g, clock), b = client(g, clock); // getrennte Speicher/Outboxen
  await a.sync.run({ force: true });
  await b.sync.run({ force: true });
  const idOf = (c, t) => c.store.tasks(P).find((x) => x.title === t).id;

  // beide offline und gleichzeitig aktiv
  g.st.offline = true;
  await a.model.addNote(idOf(a, "X"), "Notiz von A");          // A: X Notiz
  await b.model.assignQuadrant(idOf(b, "X"), 2);                // B: X Quadrant (andere Felder → beides soll bleiben)
  await a.model.completeHotlistItem(idOf(a, "Y"));              // A: Y erledigt
  await b.model.deleteHotlistItem(idOf(b, "Z"));                // B: Z gelöscht
  await a.model.assignQuadrant(idOf(a, "Z"), 1);                // A ändert das von B gelöschte Z → geht ins Leere, ohne Fehler
  await a.model.addHotlistItem("Neu von A");
  await b.model.addHotlistItem("Neu von B");
  assert.ok(a.store.pending() > 0 && b.store.pending() > 0);

  g.st.offline = false;
  await a.sync.run({ force: true });
  await b.sync.run({ force: true });
  clock.advance(60_000);
  await a.sync.run({ force: true }); // A holt B's Änderungen

  for (const c of [a, b]) assert.equal(c.store.pending(), 0);
  const server = Object.fromEntries(g.arr(P).map((t) => [t.title, t]));
  assert.ok(!server.Z, "Löschen von B gilt");
  assert.equal(server.Y.status, "completed", "Erledigt von A gilt");
  assert.ok(server["Neu von A"] && server["Neu von B"], "beide neuen Tasks sind da, keiner doppelt");
  assert.equal(g.arr(P).filter((t) => t.title.startsWith("Neu")).length, 2);
  // Quadrant und Notiz teilen sich das Google-Feld `notes`: bei gleichzeitiger Offline-Änderung beider Geräte
  // gewinnt der zuletzt sendende (B) — bekannte Grenze des Datenmodells, kein Absturz, beide konvergieren.
  assert.match(server.X.notes, /Door: Q2/);
  assert.equal(a.store.tasks(P).find((t) => t.title === "X").notes, server.X.notes, "A hat nach dem Pull denselben Stand");
});

test("zwei Geräte: verschiedene Felder desselben Tasks überschreiben sich nicht", async () => {
  const clock = fakeClock(), g = fakeGoogle({ now: clock.now });
  g.seed(PR, [{ title: "Hit", due: "2026-10-30T00:00:00.000Z" }]);
  const a = client(g, clock), b = client(g, clock);
  await a.sync.run({ force: true }); await b.sync.run({ force: true });
  const idA = a.store.tasks(PR)[0].id, idB = b.store.tasks(PR)[0].id;
  g.st.offline = true;
  a.store.patch(PR, idA, { title: "Hit umbenannt" });
  b.store.patch(PR, idB, { status: "completed" });
  g.st.offline = false;
  await a.sync.run({ force: true }); await b.sync.run({ force: true });
  clock.advance(60_000);
  await a.sync.run({ force: true });
  const t = g.arr(PR)[0];
  assert.equal(t.title, "Hit umbenannt");
  assert.equal(t.status, "completed");
  assert.equal(a.store.tasks(PR)[0].status, "completed", "A sieht nach dem Pull den Stand von B");
  await b.sync.run({ force: true });
  assert.equal(b.store.tasks(PR)[0].title, "Hit umbenannt", "B sieht nach dem Pull die Umbenennung von A");
});

test("Konvergenz: nach Abgleich haben beide Clients exakt den Serverstand", async () => {
  const clock = fakeClock(), g = fakeGoogle({ now: clock.now });
  const a = client(g, clock), b = client(g, clock);
  await a.model.addHotlistItem("1"); await a.model.addHotlistItem("2");
  await b.model.addHotlistItem("3");
  for (let i = 0; i < 3; i++) { await a.sync.run({ force: true }); await b.sync.run({ force: true }); clock.advance(60_000); }
  const server = titles(g.arr(P)).sort();
  assert.deepEqual(titles(a.store.tasks(P)).sort(), server);
  assert.deepEqual(titles(b.store.tasks(P)).sort(), server);
});
