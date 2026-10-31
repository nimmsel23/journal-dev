// Listenauflösung (gtasks.lists.js): nie doppelt anlegen, deterministisch dieselbe Liste, nie löschen.
import test from "node:test";
import assert from "node:assert/strict";
import { pickList, resolveListId } from "../src/lib/door/gtasks.lists.js";

const T = "Door · Production";
const pager = (all, size = 2) => async (token) => {
  const from = Number(token || 0);
  const items = all.slice(from, from + size);
  return { items, nextPageToken: from + size < all.length ? String(from + size) : undefined };
};

test("pickList: mehrere Treffer → kleinste id, unabhängig von der Reihenfolge", () => {
  const a = [{ id: "b", title: T }, { id: "a", title: T }, { id: "c", title: T }, { id: "0", title: "andere" }];
  assert.equal(pickList(a, T).id, "a");
  assert.equal(pickList([...a].reverse(), T).id, "a");
  assert.equal(pickList([], T), null);
});

test("findet die Liste auch auf der letzten Seite und legt nichts an", async () => {
  const all = [{ id: "1", title: "x" }, { id: "2", title: "y" }, { id: "3", title: "z" }, { id: "9", title: T }];
  let created = 0;
  const id = await resolveListId({ title: T, fetchPage: pager(all), create: async () => { created += 1; return { id: "new" }; } });
  assert.equal(id, "9");
  assert.equal(created, 0);
});

test("doppelte Listen: alle Seiten lesen, kleinste id gewinnt, nichts wird gelöscht", async () => {
  const all = [{ id: "m", title: T }, { id: "q", title: "x" }, { id: "b", title: T }, { id: "z", title: T }];
  const id = await resolveListId({ title: T, fetchPage: pager(all), create: async () => assert.fail("darf nicht anlegen") });
  assert.equal(id, "b");
  assert.equal(all.length, 4);
});

test("Abruffehler legt NIE eine Liste an", async () => {
  let created = 0;
  await assert.rejects(resolveListId({ title: T, fetchPage: async () => { throw new TypeError("Failed to fetch"); }, create: async () => { created += 1; return { id: "n" }; } }), /Failed to fetch/);
  // Fehler auf der zweiten Seite: unvollständiger Abruf → ebenfalls nichts anlegen
  let page = 0;
  await assert.rejects(resolveListId({ title: T, fetchPage: async () => { if (page++ === 0) return { items: [{ id: "1", title: "x" }], nextPageToken: "t" }; throw new Error("503"); }, create: async () => { created += 1; return { id: "n" }; } }), /503/);
  assert.equal(created, 0);
});

test("zwei Clients legen gleichzeitig an → beide landen nach dem Nachprüfen auf derselben Liste", async () => {
  const remote = [];
  let n = 0;
  const mk = () => ({
    title: T,
    fetchPage: async () => ({ items: remote.map((l) => ({ ...l })) }),
    create: async (title) => { const l = { id: `L${++n}`, title }; remote.push(l); return l; },
  });
  // beide haben "keine Liste" gesehen (Race): simuliert, indem beide create() vor dem Nachprüfen laufen
  const a = mk(), b = mk();
  const seenEmpty = { items: [] };
  let firstScanA = true, firstScanB = true;
  const origA = a.fetchPage, origB = b.fetchPage;
  a.fetchPage = async (t) => (firstScanA ? ((firstScanA = false), seenEmpty) : origA(t));
  b.fetchPage = async (t) => (firstScanB ? ((firstScanB = false), seenEmpty) : origB(t));
  const [ia, ib] = await Promise.all([resolveListId(a), resolveListId(b)]);
  assert.equal(ia, ib);
  assert.equal(ia, "L1"); // kleinste id
  assert.equal(remote.length, 2); // doppelte Liste bleibt bestehen, wird nie gelöscht
});

test("Nachprüfung scheitert → die eigene Liste wird genutzt", async () => {
  let calls = 0;
  const id = await resolveListId({ title: T, fetchPage: async () => { if (calls++ === 0) return { items: [] }; throw new Error("offline"); }, create: async () => ({ id: "mine" }) });
  assert.equal(id, "mine");
});
