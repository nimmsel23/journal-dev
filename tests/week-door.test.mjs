import test from "node:test";
import assert from "node:assert/strict";
import { weekDoor } from "../src/lib/door/weekDoor.js";

// Samstag 2026-10-31 = ISO-Woche 44 (Mo 26.10. – So 01.11.)
const NOW = new Date(2026, 9, 31, 12, 0, 0);
const at = (y, m, d, h = 0) => String(Math.floor(new Date(y, m - 1, d, h).getTime() / 1000));
const mk = (uuid, description, tags, extra = {}) => ({
  uuid, description, status: "pending", entry: "1", ...Object.fromEntries(tags.map((t) => [`tag_${t}`, "x"])), ...extra,
});
const dep = (...uuids) => Object.fromEntries(uuids.map((u) => [`dep_${u}`, "x"]));

test("Door der Woche ist die +door, von der die Wochen-Hits abhängen — nicht irgendeine", () => {
  const all = [
    mk("d4", "Door #4 Bridge Job", ["door"]), // steht in der Liste vorn, hat aber keine Hits dieser Woche
    mk("dv", "Vitaltrainer", ["door"], dep("h1", "h2", "h3", "h4")),
    ...[1, 2, 3, 4].map((n) => mk(`h${n}`, `Hit ${n}`, ["hit"], { due: at(2026, 10, 26 + n), status: "completed", end: at(2026, 10, 27) })),
  ];
  const r = weekDoor(all, NOW);
  assert.equal(r.door.uuid, "dv");
  assert.deepEqual(r.slots.map((h) => h?.uuid), ["h1", "h2", "h3", "h4"]);
  assert.equal(r.extra.length, 0);
});

test("Hits anderer Doors landen nicht unter der Door der Woche", () => {
  const all = [
    mk("a", "Door A", ["door"], dep("h1")),
    mk("b", "Door B", ["door"], dep("h2", "h3")),
    mk("h1", "A-Hit", ["hit"], { due: at(2026, 10, 28) }),
    mk("h2", "B-Hit 1", ["hit"], { due: at(2026, 10, 28) }),
    mk("h3", "B-Hit 2", ["hit"], { due: at(2026, 10, 29) }),
    mk("h9", "ohne Door", ["hit"], { due: at(2026, 10, 29) }),
  ];
  const r = weekDoor(all, NOW);
  assert.equal(r.door.uuid, "b");
  assert.deepEqual(r.slots.filter(Boolean).map((h) => h.uuid), ["h2", "h3"]);
  assert.equal(r.weekHits.length, 4);
});

test("Hits mit due in anderer Woche zählen nicht; Montag der Folgewoche gehört nicht mehr dazu", () => {
  const all = [
    mk("a", "Door A", ["door"], dep("h1", "h2", "h3")),
    mk("h1", "diese Woche", ["hit"], { due: at(2026, 10, 30) }),
    mk("h2", "Folgemontag 00:00", ["hit"], { due: at(2026, 11, 2) }),
    mk("h3", "Vorwoche", ["hit"], { due: at(2026, 10, 20) }),
  ];
  const r = weekDoor(all, NOW);
  assert.deepEqual(r.slots.filter(Boolean).map((h) => h.uuid), ["h1"]);
});

test("ohne Wochen-Hits: Rückfall auf +door mit kw-Tag der Woche, sonst keine Door", () => {
  const all = [mk("x", "ohne kw", ["door"]), mk("k", "Entspannungstrainer", ["door", "kw44"]), mk("o", "andere Woche", ["door", "kw45"])];
  assert.equal(weekDoor(all, NOW).door.uuid, "k");
  assert.equal(weekDoor([all[0], all[2]], NOW).door, null);
});

test("hit_number bestimmt den Platz, Überzählige gehen nach extra", () => {
  const all = [
    mk("a", "Door", ["door"], dep("h1", "h2", "h3", "h4", "h5")),
    mk("h1", "1", ["hit"], { due: at(2026, 10, 27), hit_number: "2" }),
    mk("h2", "2", ["hit"], { due: at(2026, 10, 27), hit_number: "1" }),
    mk("h3", "3", ["hit"], { due: at(2026, 10, 28) }),
    mk("h4", "4", ["hit"], { due: at(2026, 10, 29) }),
    mk("h5", "5", ["hit"], { due: at(2026, 10, 30) }),
  ];
  const r = weekDoor(all, NOW);
  assert.deepEqual(r.slots.map((h) => h.uuid), ["h2", "h1", "h3", "h4"]);
  assert.deepEqual(r.extra.map((h) => h.uuid), ["h5"]);
});
