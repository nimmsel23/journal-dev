// draft-store.test.mjs — Entwurf + Autosave (src/lib/draftStore.js): speichern/laden/löschen, Entprellen,
// Dirty-Regel, Fremdänderungen nur bei nicht-dirty, gesperrter Speicher, Wiederherstellung nach Absturz.
import test from "node:test";
import assert from "node:assert/strict";
import { createAutosaver, createDraftStore, norm } from "../src/lib/draftStore.js";

const memStorage = () => {
  const m = new Map();
  return { m, getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
};
const blocked = { getItem() { throw new Error("gesperrt"); }, setItem() { throw new Error("gesperrt"); }, removeItem() { throw new Error("gesperrt"); } };

// manuelle Timer: advance(ms) feuert fällige Callbacks
function fakeTimers() {
  let now = 0, id = 0; const list = new Map();
  return {
    set: (fn, ms) => { const i = ++id; list.set(i, { at: now + ms, fn }); return i; },
    clear: (i) => list.delete(i),
    advance(ms) { now += ms; for (const [i, t] of [...list]) if (t.at <= now) { list.delete(i); t.fn(); } },
    pending: () => list.size,
  };
}
const setup = ({ storage = memStorage(), key = "u1:frame:body:q1", delay = 700 } = {}) => {
  const store = createDraftStore(storage);
  const timers = fakeTimers();
  const saved = [];
  const mk = () => createAutosaver({ store, key, save: (v) => saved.push(v), delay, timers });
  return { store, timers, saved, storage, mk, a: mk() };
};

test("Store: speichern, laden, löschen; Werte überstehen eine neue Instanz (Reload)", () => {
  const storage = memStorage();
  const s1 = createDraftStore(storage);
  assert.equal(s1.get("k"), null);
  s1.set("k", "Hallo");
  assert.equal(createDraftStore(storage).get("k"), "Hallo");
  s1.remove("k");
  assert.equal(createDraftStore(storage).get("k"), null);
});

test("Store: gesperrter Speicher wirft nie, Sitzung hält den Entwurf im Arbeitsspeicher", () => {
  const s = createDraftStore(blocked);
  assert.equal(s.get("k"), null);
  s.set("k", "x");
  assert.equal(s.get("k"), "x");
  s.remove("k");
  assert.equal(s.get("k"), null);
});

test("Store: kaputtes JSON im Speicher wird ignoriert", () => {
  const storage = memStorage();
  storage.setItem("draft:v1:k", "{kaputt");
  assert.equal(createDraftStore(storage).get("k"), null);
});

test("Tippen sichert sofort den Entwurf und speichert erst nach der Entprellzeit", () => {
  const { a, store, timers, saved, } = setup();
  assert.equal(a.init(""), "");
  a.change("H");
  a.change("Ha");
  a.change("Hall");
  assert.equal(store.get("u1:frame:body:q1"), "Hall");
  assert.deepEqual(saved, []);
  timers.advance(699);
  assert.deepEqual(saved, []);
  timers.advance(1);
  assert.deepEqual(saved, ["Hall"]); // genau ein Speichern, nicht je Tastendruck
});

test("Weitertippen schiebt das Speichern hinaus", () => {
  const { a, timers, saved } = setup();
  a.init("");
  a.change("a"); timers.advance(500);
  a.change("ab"); timers.advance(500);
  assert.deepEqual(saved, []);
  timers.advance(200);
  assert.deepEqual(saved, ["ab"]);
});

test("flush (Blur/Seite verstecken/Unmount) speichert sofort und räumt den Timer ab", () => {
  const { a, timers, saved } = setup();
  a.init("");
  a.change("Text  ");
  assert.equal(a.flush(), true);
  assert.deepEqual(saved, ["Text"]); // getrimmt wie bisher
  assert.equal(timers.pending(), 0);
  assert.equal(a.flush(), false); // nichts Neues
  assert.deepEqual(saved, ["Text"]);
});

test("dispose speichert Ausstehendes (Feld wird ausgeblendet/Ansicht gewechselt)", () => {
  const { a, saved } = setup();
  a.init("");
  a.change("fast verloren");
  a.dispose();
  assert.deepEqual(saved, ["fast verloren"]);
});

test("Entwurf bleibt bis zum Echo des Speichers, danach wird er gelöscht", () => {
  const { a, store, saved } = setup();
  a.init("");
  a.change("Antwort");
  a.flush();
  assert.equal(store.get("u1:frame:body:q1"), "Antwort"); // Absturz jetzt → Entwurf noch da
  assert.equal(a.remote("Antwort"), null); // Echo aus dem Cache
  assert.equal(store.get("u1:frame:body:q1"), null);
  assert.deepEqual(saved, ["Antwort"]);
});

test("Zurück auf den gespeicherten Stand: Entwurf weg, kein Speichern", () => {
  const { a, store, saved, timers } = setup();
  a.init("alt");
  a.change("alt x");
  a.change("alt");
  assert.equal(store.get("u1:frame:body:q1"), null);
  timers.advance(5000);
  assert.deepEqual(saved, []);
});

test("Leeren speichert die leere Antwort (Löschen einer Antwort)", () => {
  const { a, saved } = setup();
  a.init("etwas");
  a.change("");
  a.flush();
  assert.deepEqual(saved, [""]);
});

test("Dirty-Regel: Fremdänderung wird nur übernommen, wenn nichts Ungesendetes getippt ist", () => {
  const { a } = setup();
  a.init("A");
  assert.equal(a.remote("B"), "B"); // nicht dirty → übernehmen
  a.change("B tippe");
  assert.equal(a.remote("C"), null); // dirty → lokaler Text gewinnt
  assert.equal(a.peek().current, "B tippe");
});

test("Echo des eigenen Speicherns überschreibt weitertippenden Text nicht", () => {
  const { a } = setup();
  a.init("");
  a.change("Hall");
  a.flush();
  a.change("Hallo Wel"); // weitergetippt, bevor das Echo ankommt
  assert.equal(a.remote("Hall"), null);
  assert.equal(a.peek().current, "Hallo Wel");
});

test("Nach gesendetem Text übernimmt das Feld spätere Änderungen eines anderen Geräts", () => {
  const { a } = setup();
  a.init("");
  a.change("Eins"); a.flush();
  a.remote("Eins");
  assert.equal(a.remote("Zwei von Gerät B"), "Zwei von Gerät B");
});

test("Wiederherstellung nach Absturz: abweichender Entwurf wird angezeigt und sofort nachgespeichert", () => {
  const storage = memStorage();
  createDraftStore(storage).set("u1:frame:body:q1", "ungespeicherte Gedanken");
  const { a, saved } = setup({ storage });
  assert.equal(a.init("alter Stand"), "ungespeicherte Gedanken");
  assert.deepEqual(saved, ["ungespeicherte Gedanken"]);
});

test("Entwurf gleich Stand: wird verworfen, kein Speichern", () => {
  const storage = memStorage();
  createDraftStore(storage).set("u1:frame:body:q1", "gleich");
  const { a, saved, store } = setup({ storage });
  assert.equal(a.init("gleich"), "gleich");
  assert.deepEqual(saved, []);
  assert.equal(store.get("u1:frame:body:q1"), null);
});

test("Vor dem Laden des Stands wird nichts gespeichert; der Entwurf wartet", () => {
  const { a, saved, timers, store } = setup();
  a.change("früh getippt");
  timers.advance(5000);
  assert.deepEqual(saved, []);
  assert.equal(store.get("u1:frame:body:q1"), "früh getippt");
  assert.equal(a.init("Serverstand"), "früh getippt");
  assert.deepEqual(saved, ["früh getippt"]);
});

test("save wirft: Entwurf bleibt, nächster flush versucht es erneut", () => {
  const store = createDraftStore(memStorage());
  let fail = true; const saved = [];
  const a = createAutosaver({ store, key: "k", save: (v) => { if (fail) throw new Error("x"); saved.push(v); }, timers: fakeTimers() });
  a.init("");
  a.change("wichtig");
  assert.equal(a.flush(), false);
  assert.equal(store.get("k"), "wichtig");
  fail = false;
  assert.equal(a.flush(), true);
  assert.deepEqual(saved, ["wichtig"]);
});

test("norm trimmt und verträgt null/undefined", () => {
  assert.equal(norm("  a "), "a");
  assert.equal(norm(null), "");
  assert.equal(norm(undefined), "");
});
