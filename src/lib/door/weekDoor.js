// weekDoor.js — Door der Woche und ihre Hits aus der Taskwarrior-Replik (TaskChampion-Tasks, rein, kein Netz).
//
// Modell (wie ~/aos/door): jeder +door-Task ist eine Door (= der Domino Door seiner Hits). Die Hits einer Door sind
// ihre `depends` (in TaskChampion die Schlüssel `dep_<uuid>`). Ein Hit hat in der Regel ein `due`. Daraus folgt:
//   Hits der Woche  = +hit-Tasks (bzw. alphatype bigrock) mit `due` in dieser ISO-Woche (oder in dieser Woche erledigt)
//   Door der Woche  = die +door, von der die meisten dieser Hits abhängen
// Bestehen noch keine Hits, bleibt als Rückfall die +door mit dem Wochen-Tag `kw<NN>` (z. B. kw44). Ohne beides:
// keine Door der Woche — es zählt nie "irgendeine" +door.
import { endOfISOWeek, getISOWeek, startOfISOWeek } from "date-fns";

const has = (t, tag) => t[`tag_${tag}`] !== undefined;
const secs = (v) => (v ? new Date(Number(v) * 1000) : null);
const open = (t) => t.status === "pending" && !(t.wait && Number(t.wait) * 1000 > Date.now());

export const isHit = (t) => has(t, "hit") || t.alphatype === "bigrock";
/** uuids der Tasks, von denen `t` abhängt. */
export const dependsOf = (t) => Object.keys(t).filter((k) => k.startsWith("dep_")).map((k) => k.slice(4));

const sortHits = (a, b) => (Number(a.hit_number) || 99) - (Number(b.hit_number) || 99) || (secs(a.due)?.getTime() || 0) - (secs(b.due)?.getTime() || 0);

/**
 * @param {object[]} all  tasks() aus taskchampion.js
 * @param {Date} [now]
 * @returns {{door: object|null, slots: (object|null)[], extra: object[], weekHits: object[]}}
 *   slots = die ersten 4 Hits DER Door (Platz = hit_number), extra = weitere Hits der Door,
 *   weekHits = alle Wochen-Hits (auch die anderer Doors oder ohne Door)
 */
export function weekDoor(all, now = new Date()) {
  const from = startOfISOWeek(now), to = endOfISOWeek(now);
  const inW = (t, f) => { const d = secs(t[f]); return d && d >= from && d <= to; };
  const weekHits = all
    .filter((t) => (t.status === "pending" || t.status === "completed") && isHit(t) && (inW(t, "due") || (t.status === "completed" && inW(t, "end"))))
    .sort(sortHits);
  const hitIds = new Set(weekHits.map((h) => h.uuid));

  let door = null;
  let linked = [];
  for (const t of all) {
    if (!has(t, "door") || !(open(t) || (t.status === "completed" && inW(t, "end")))) continue;
    const mine = dependsOf(t).filter((u) => hitIds.has(u));
    if (!mine.length) continue;
    const better = !door || mine.length > linked.length
      || (mine.length === linked.length && (open(t) ? 0 : 1) - (open(door) ? 0 : 1) < 0);
    if (better) { door = t; linked = mine; }
  }
  if (!door) door = all.find((t) => open(t) && has(t, "door") && has(t, `kw${String(getISOWeek(now)).padStart(2, "0")}`)) || null;

  const own = new Set(door ? dependsOf(door) : []);
  const hits = weekHits.filter((h) => own.has(h.uuid));
  const slots = [null, null, null, null];
  const rest = [];
  for (const h of hits) { const n = Number(h.hit_number); if (n >= 1 && n <= 4 && !slots[n - 1]) slots[n - 1] = h; else rest.push(h); }
  const extra = [];
  for (const h of rest) { const i = slots.indexOf(null); if (i >= 0) slots[i] = h; else extra.push(h); }
  return { door, slots, extra, weekHits };
}
