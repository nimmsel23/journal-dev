// Door-Modell auf dem lokalen Store (gtasks.model.js): gleiche Ergebnisse wie vorher mit Google, aber ohne Netz.
import test from "node:test";
import assert from "node:assert/strict";
import { format } from "date-fns";
import { createStore } from "../src/lib/door/gtasks.store.js";
import { createDoorModel, parseNotes, buildNotes, LIST_POTENTIAL as P, LIST_PRODUCTION as PR } from "../src/lib/door/gtasks.model.js";
import { weekKey } from "../src/lib/door/warstack.js";
import { memoryStorage } from "./helpers/fake-google.mjs";

const mk = () => {
  let kicks = 0;
  const store = createStore({ storage: memoryStorage(), uid: "u1" });
  const model = createDoorModel(store, { kick: () => { kicks += 1; } });
  return { store, model, kicks: () => kicks };
};

test("Notes-Marker: parse/build Round-Trip", () => {
  const n = buildNotes({ quadrant: 2, doorWeek: "2026-W44", rest: "Zeile" });
  assert.equal(n, "Door: Q2 · Door 2026-W44\nZeile");
  assert.deepEqual(parseNotes(n), { quadrant: 2, doorWeek: "2026-W44", rest: "Zeile" });
});

test("Potential: anlegen (ans Ende), erledigen, löschen — alles lokal, mit Abgleich-Anstoß", async () => {
  const { model, store, kicks } = mk();
  await model.addHotlistItem("Eins");
  await model.addHotlistItem("Zwei");
  assert.deepEqual((await model.fetchHotlist()).map((i) => i.title), ["Eins", "Zwei"]);
  assert.equal(kicks(), 2);
  const [a, b] = await model.fetchHotlist();
  await model.completeHotlistItem(a.id);
  await model.deleteHotlistItem(b.id);
  assert.deepEqual(await model.fetchHotlist(), []);
  assert.ok(store.pending() >= 1);
  await assert.rejects(model.addHotlistItem("  "), /title_required/);
});

test("Plan: Quadrant ordnet die Liste (Q1 oben … ohne Quadrant unten), Door der Woche nur auf Q2, eine pro Woche", async () => {
  const { model } = mk();
  for (const t of ["a", "b", "c"]) await model.addHotlistItem(t);
  const ids = Object.fromEntries((await model.fetchHotlist()).map((i) => [i.title, i.id]));
  await model.assignQuadrant(ids.c, 1);
  await model.assignQuadrant(ids.a, 2);
  await model.assignQuadrant(ids.b, 2);
  assert.deepEqual((await model.fetchHotlist()).map((i) => i.title), ["c", "a", "b"]);
  await assert.rejects(model.selectWeeklyDoor(ids.c), /selected_requires_q2/);
  await model.selectWeeklyDoor(ids.a);
  await model.selectWeeklyDoor(ids.b);
  const war = await model.fetchDoorWar();
  assert.equal(war.selected.selector, ids.b);
  assert.equal(war.selected.week, weekKey());
  assert.deepEqual(war.board[1], [ids.c]);
  assert.deepEqual(war.board[2], [ids.a, ids.b]);
  assert.equal((await model.fetchHotlist()).filter((i) => i.doorWeek === weekKey()).length, 1);
});

test("Production: Hits der Woche, Toggle, Quote; offline angelegter Hit lässt sich mit der temporären id umschalten", async () => {
  const { model } = mk();
  await model.addDailyHit("mon", "Hit 1");
  await model.addHitOnDate(format(new Date(), "yyyy-MM-dd"), "Heute");
  const week = await model.fetchDailyWeek();
  const all = Object.values(week.days).flat();
  assert.equal(all.length, 2);
  const hit = all.find((h) => h.label === "Hit 1");
  await model.toggleDailyHit(hit.id);
  const sum = await model.fetchHitsWeek({ queryKey: ["react-query-kontext"] }); // Kontextobjekt wird als Basis ignoriert
  assert.equal(sum.total_hits, 2);
  assert.equal(sum.completed_hits, 1);
  assert.equal(sum.completion_rate, 0.5);
  await model.toggleDailyHit(hit.id);
  assert.equal((await model.fetchHitsWeek()).completed_hits, 0);
  await assert.rejects(model.toggleDailyHit("gibt-es-nicht"), /daily_hit_not_found/);
});

test("Profit: erledigte Potentials/Hits der letzten Wochen und erledigte Wochen-Doors", async () => {
  const { model } = mk();
  await model.addHotlistItem("Door-Task");
  const [t] = await model.fetchHotlist();
  await model.assignQuadrant(t.id, 2);
  await model.selectWeeklyDoor(t.id);
  await model.completeHotlistItem(t.id);
  await model.addDailyHit("mon", "Hit");
  const [h] = Object.values((await model.fetchDailyWeek()).days).flat();
  await model.toggleDailyHit(h.id);
  const p = await model.fetchProfitGtasks();
  assert.equal(p.weeks.length, 8);
  assert.deepEqual([p.weeks[0].potential, p.weeks[0].hits], [1, 1]);
  assert.equal(p.doors[0].door_title, "Door-Task");
});

test("peek liefert dieselben Daten synchron (Ansicht startet ohne Lade-Zustand)", async () => {
  const { model } = mk();
  await model.addHotlistItem("X");
  assert.deepEqual(model.peek.hotlist(), await model.fetchHotlist());
  assert.deepEqual(model.peek.doorWar(), await model.fetchDoorWar());
  assert.deepEqual(model.peek.profit(), await model.fetchProfitGtasks());
});

test("Notiz hängt unter die Marker-Zeile; unbekannter Task → task_not_found", async () => {
  const { model } = mk();
  await model.addHotlistItem("N");
  const [t] = await model.fetchHotlist();
  await model.assignQuadrant(t.id, 3);
  await model.addNote(t.id, "erste");
  await model.addNote(t.id, "zweite");
  const [u] = await model.fetchHotlist();
  assert.equal(u.quadrant, 3);
  assert.equal(u.description, "erste\nzweite");
  await assert.rejects(model.addNote("nope", "x"), /task_not_found/);
});
