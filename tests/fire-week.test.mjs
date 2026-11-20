import test from "node:test";
import assert from "node:assert/strict";
import { fireWeek } from "../src/lib/door/fireWeek.js";
const now = new Date(2026, 10, 20, 12);
const due = String(new Date(2026, 10, 17, 12).getTime() / 1000);
test("Fire groups weekly actions once per domain, preserving completed and unassigned actions", () => {
 const tasks = [
  {uuid:"a", status:"pending", tag_fire:"x", domain:"Body", due},
  {uuid:"b", status:"completed", tag_hit:"x", domain:"being", end:due},
  {uuid:"c", status:"pending", tag_fire:"x", domain:"Other", due},
  {uuid:"d", status:"pending", tag_door:"x", tag_hit:"x", domain:"body", due},
  {uuid:"old", status:"pending", tag_fire:"x", domain:"body", due:"1"},
  {uuid:"deleted", status:"deleted", tag_fire:"x", domain:"body", due},
 ];
 const groups = fireWeek(tasks, now);
 assert.deepEqual(groups.body.map(t=>t.uuid), ["a"]);
 assert.deepEqual(groups.being.map(t=>t.uuid), ["b"]);
 assert.deepEqual(groups.unassigned.map(t=>t.uuid), ["c"]);
 assert.equal(Object.values(groups).flat().length, 3);
});
