// taskwarrior.door.js — Adapter: Door-v2-Funktionen auf Taskwarrior (TaskChampion-Replik im Browser),
// gleiche Signaturen/Rückgabeformen wie gtasks.door.js. Derzeit NUR LESEND.
//
// Mapping (Tags der bestehenden Taskwarrior-Datenbank)
//  Potential  = offene Tasks mit +hot oder +potential (Hot List)
//  Plan       = dieselben Tasks; Quadrant aus +q1…+q4, Door der Woche = +door (zusammen mit +q2 oder allein)
//  Production = Tasks mit +hit und `due` in dieser Woche; erledigt = status completed
//  Profit     = erledigte Tasks (`end`) der letzten 8 Wochen: +hot/+potential und +hit; Doors = erledigte +door
import { addDays, format, startOfWeek } from "date-fns";
import { weekKey } from "./warstack.js";
import { tasks } from "./taskchampion.js";

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const PROFIT_WEEKS = 8;
const RO = () => { throw new Error("taskwarrior-readonly"); };

const has = (t, tag) => t[`tag_${tag}`] !== undefined;
const secs = (v) => (v ? new Date(Number(v) * 1000) : null);
const isPot = (t) => has(t, "hot") || has(t, "potential");
const waiting = (t) => t.wait && Number(t.wait) * 1000 > Date.now();
const open = (t) => t.status === "pending" && !waiting(t);
const quadrantOf = (t) => [1, 2, 3, 4].find((q) => has(t, `q${q}`)) || null;

function toItem(t) {
  const q = quadrantOf(t);
  return {
    id: t.uuid, selector: t.uuid, title: t.description || "Untitled", description: "", source: "taskwarrior",
    status: "active", phase: "potential", created_at: secs(t.entry)?.toISOString() || "",
    quadrant: q, doorWeek: has(t, "door") && (q === 2 || q === null) ? weekKey() : "",
  };
}

// ── Potential ──
export async function fetchHotlist() {
  return (await tasks()).filter((t) => open(t) && isPot(t)).map(toItem)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}
export const addHotlistItem = RO;
export const completeHotlistItem = RO;
export const deleteHotlistItem = RO;

// ── Plan ──
export async function fetchDoorWar() {
  const items = await fetchHotlist();
  const wk = weekKey();
  const board = { 1: [], 2: [], 3: [], 4: [], unsorted: [] };
  const candidates = items.map((i) => ({ ...i, war_uuid: i.id }));
  for (const i of items) (board[i.quadrant] || board.unsorted).push(i.id);
  const door = items.find((i) => i.doorWeek === wk);
  const selected = { selector: door?.id || "", uuid: door?.id || "", week: door ? wk : "" };
  return { doorWar: { selected }, candidates, board, selected };
}
export const assignQuadrant = RO;
export const selectWeeklyDoor = RO;

// ── Production ──
const weekDates = (base = new Date()) => {
  const mon = startOfWeek(base, { weekStartsOn: 1 });
  return DAY_KEYS.map((k, i) => [k, format(addDays(mon, i), "yyyy-MM-dd")]);
};
async function weekHits() {
  const dates = weekDates();
  const list = (await tasks()).filter((t) => has(t, "hit") && (t.status === "pending" || t.status === "completed") && t.due)
    .filter((t) => dates.some(([, d]) => d === format(secs(t.due), "yyyy-MM-dd")));
  return { dates, list };
}
export async function fetchDailyWeek() {
  const { dates, list } = await weekHits();
  const days = Object.fromEntries(DAY_KEYS.map((k) => [k, []]));
  for (const t of list) {
    const day = dates.find(([, d]) => d === format(secs(t.due), "yyyy-MM-dd"));
    if (day) days[day[0]].push({ id: t.uuid, label: t.description || "", done: t.status === "completed", kind: "little" });
  }
  return { week: weekKey(), days };
}
export const toggleDailyHit = RO;
export const addDailyHit = RO;
export async function fetchHitsWeek() {
  const { list } = await weekHits();
  const done = list.filter((t) => t.status === "completed").length;
  return { week: weekKey(), total_hits: list.length, completed_hits: done, open_hits: list.length - done, completion_rate: list.length ? done / list.length : 0 };
}

// ── Profit (nur lesend) ──
export async function fetchProfitTw() {
  const since = startOfWeek(addDays(new Date(), -7 * (PROFIT_WEEKS - 1)), { weekStartsOn: 1 });
  const done = (await tasks()).filter((t) => t.status === "completed" && t.end && secs(t.end) >= since);
  const weeks = new Map();
  for (let i = 0; i < PROFIT_WEEKS; i++) weeks.set(weekKey(addDays(since, i * 7)), { week: weekKey(addDays(since, i * 7)), potential: 0, hits: 0 });
  for (const t of done) {
    const w = weeks.get(weekKey(secs(t.end)));
    if (!w) continue;
    if (has(t, "hit")) w.hits += 1; else if (isPot(t)) w.potential += 1;
  }
  const doors = done.filter((t) => has(t, "door"))
    .map((t) => ({ id: t.uuid, door_title: t.description || "", week: weekKey(secs(t.end)), completed_at: secs(t.end).toISOString() }))
    .sort((a, b) => b.completed_at.localeCompare(a.completed_at));
  return { weeks: [...weeks.values()].reverse(), doors };
}
