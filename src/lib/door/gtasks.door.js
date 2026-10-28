// gtasks.door.js — Adapter: Door-v2-Funktionen auf Google Tasks, mit denselben
// Signaturen/Rückgabeformen wie potential/plan/production/profit.* (Panels bleiben gleich).
//
// Mapping
//  Potential = Liste "Door · Potential": ein Task je Hot-List-Item. Titel = Text,
//    erledigt = status completed, löschen = DELETE.
//  Plan      = dieselben Tasks. Die Priorität steht in der ERSTEN Zeile von `notes`
//    (Titel bleibt in der Google-Tasks-App sauber lesbar):
//        Door: Q2 · Door 2026-W42
//    "Q1–Q4" = Quadrant, "Door <Woche>" = Door der Woche (höchstens ein Task je
//    Kalenderwoche). Weitere Zeilen in notes bleiben unangetastet. Die Marker bleiben
//    nach dem Erledigen stehen → daraus ergibt sich im Profit die Liste erledigter Doors.
//    Google Tasks kennt keine Priorität: sie wird zusätzlich als Reihenfolge der Liste
//    abgebildet (Q1 oben … Q4, danach Tasks ohne Quadrant), damit sie auch in der
//    Google-Tasks-App sichtbar ist (tasks.move beim Zuordnen).
//  Production = Liste "Door · Production": ein Task je Daily Hit, `due` = Tag der
//    Woche; Toggle = status completed ↔ needsAction; Quote = erledigt/gesamt der Woche.
//  Profit    = nur lesend, aus `completed`-Zeitstempeln der letzten Wochen: je Woche
//    Anzahl erledigter Potential-Tasks und Production-Hits + erledigte Wochen-Doors.
//    Reflexionen gibt es in dieser Quelle nicht (UI blendet sie aus).
import { addDays, format, startOfWeek } from "date-fns";
import { weekKey } from "./warstack.js";
import { LIST_POTENTIAL, LIST_PRODUCTION, listTasks, insertTask, patchTask, deleteTask, moveTask } from "./gtasks.js";

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const PROFIT_WEEKS = 8;

// ── Notes-Marker ──
const MARK_RE = /^Door:\s*(.*)$/;
export function parseNotes(notes = "") {
  const [first = "", ...rest] = notes.split("\n");
  const m = first.match(MARK_RE);
  if (!m) return { quadrant: null, doorWeek: "", rest: notes };
  const q = m[1].match(/Q([1-4])/);
  const w = m[1].match(/Door (\d{4}-W\d{2})/);
  return { quadrant: q ? Number(q[1]) : null, doorWeek: w ? w[1] : "", rest: rest.join("\n") };
}
export function buildNotes({ quadrant, doorWeek, rest }) {
  const parts = [quadrant ? `Q${quadrant}` : "", doorWeek ? `Door ${doorWeek}` : ""].filter(Boolean);
  const head = parts.length ? `Door: ${parts.join(" · ")}` : "";
  return [head, rest].filter((s) => s !== "" && s != null).join("\n");
}

export function toItem(t) {
  const n = parseNotes(t.notes);
  return {
    id: t.id, selector: t.id, title: t.title || "Untitled", description: n.rest, source: "gtasks",
    status: t.status === "completed" ? "done" : "active", phase: "potential",
    created_at: t.updated || "", quadrant: n.quadrant, doorWeek: n.doorWeek,
  };
}

// ── Potential ──
export async function fetchHotlist() {
  const tasks = await listTasks(LIST_POTENTIAL, { showCompleted: false });
  return tasks.filter((t) => (t.title || "").trim()).map(toItem);
}
export const addHotlistItem = (text) => {
  const title = String(text || "").trim();
  if (!title) throw new Error("title_required");
  return insertTask(LIST_POTENTIAL, { title });
};
/** Notiz hängt unter die Marker-Zeile an (Quadrant/Door bleiben erhalten). */
export async function addNote(id, text) {
  const note = String(text || "").trim();
  if (!note) throw new Error("answer_required");
  const n = parseNotes((await currentTask(id)).notes);
  return patchTask(LIST_POTENTIAL, id, { notes: buildNotes({ quadrant: n.quadrant, doorWeek: n.doorWeek, rest: [n.rest, note].filter(Boolean).join("\n") }) });
}
export const completeHotlistItem = (id) => patchTask(LIST_POTENTIAL, id, { status: "completed" });
export const deleteHotlistItem = (id) => deleteTask(LIST_POTENTIAL, id);

// ── Plan ──
export async function fetchDoorWar() {
  const items = await fetchHotlist();
  const wk = weekKey();
  const board = { 1: [], 2: [], 3: [], 4: [], unsorted: [] };
  const candidates = items.map((i) => ({ ...i, war_uuid: i.id }));
  for (const i of items) (board[i.quadrant] || board.unsorted).push(i.id);
  const door = items.find((i) => i.doorWeek === wk && i.quadrant === 2);
  const selected = { selector: door?.id || "", uuid: door?.id || "", week: door ? wk : "" };
  return { doorWar: { selected }, candidates, board, selected };
}

async function currentTask(id) {
  const tasks = await listTasks(LIST_POTENTIAL, { showCompleted: false });
  const t = tasks.find((x) => x.id === id);
  if (!t) throw new Error("task_not_found");
  return t;
}

export async function assignQuadrant(id, quadrant) {
  const t = await currentTask(id);
  const n = parseNotes(t.notes);
  // Door-Markierung nur auf Q2-Tasks
  const doorWeek = Number(quadrant) === 2 ? n.doorWeek : "";
  const patched = await patchTask(LIST_POTENTIAL, id, { notes: buildNotes({ quadrant: Number(quadrant), doorWeek, rest: n.rest }) });
  await placeByPriority(id, Number(quadrant));
  return patched;
}

/** Task hinter den letzten Task mit gleicher oder höherer Priorität schieben (Listenreihenfolge = Priorität). */
async function placeByPriority(id, quadrant) {
  const rank = (q) => q || 5; // ohne Quadrant ans Ende
  const others = (await listTasks(LIST_POTENTIAL, { showCompleted: false })).filter((t) => t.id !== id);
  let previous;
  for (const t of others) if (rank(parseNotes(t.notes).quadrant) <= rank(quadrant)) previous = t.id;
  return moveTask(LIST_POTENTIAL, id, previous);
}

export async function selectWeeklyDoor(id) {
  const wk = weekKey();
  const tasks = await listTasks(LIST_POTENTIAL, { showCompleted: false });
  const t = tasks.find((x) => x.id === id);
  if (!t) throw new Error("task_not_found");
  if (parseNotes(t.notes).quadrant !== 2) throw new Error("selected_requires_q2");
  // alte Door dieser Woche abwählen (eine Door pro Woche)
  for (const o of tasks) {
    const n = parseNotes(o.notes);
    if (o.id !== id && n.doorWeek === wk) await patchTask(LIST_POTENTIAL, o.id, { notes: buildNotes({ ...n, doorWeek: "" }) });
  }
  const n = parseNotes(t.notes);
  return patchTask(LIST_POTENTIAL, id, { notes: buildNotes({ ...n, doorWeek: wk }) });
}

// ── Production ──
const dueOf = (d) => `${d}T00:00:00.000Z`;
const weekDates = (base = new Date()) => {
  const mon = startOfWeek(base, { weekStartsOn: 1 });
  return DAY_KEYS.map((k, i) => [k, format(addDays(mon, i), "yyyy-MM-dd")]);
};
async function weekHits() {
  const dates = weekDates();
  const tasks = await listTasks(LIST_PRODUCTION, {
    showCompleted: true, dueMin: dueOf(dates[0][1]), dueMax: dueOf(format(addDays(new Date(`${dates[6][1]}T00:00:00Z`), 1), "yyyy-MM-dd")),
  });
  return { dates, tasks };
}

export async function fetchDailyWeek() {
  const { dates, tasks } = await weekHits();
  const days = Object.fromEntries(DAY_KEYS.map((k) => [k, []]));
  for (const t of tasks) {
    const day = dates.find(([, d]) => d === (t.due || "").slice(0, 10));
    if (day) days[day[0]].push({ id: t.id, label: t.title || "", done: t.status === "completed", kind: "little" });
  }
  return { week: weekKey(), days };
}
export async function toggleDailyHit(id) {
  const { tasks } = await weekHits();
  const t = tasks.find((x) => x.id === id);
  if (!t) throw new Error("daily_hit_not_found");
  return patchTask(LIST_PRODUCTION, id, t.status === "completed" ? { status: "needsAction", completed: null } : { status: "completed" });
}
export async function addDailyHit(dayKey, text) {
  const title = String(text || "").trim();
  const date = weekDates().find(([k]) => k === dayKey)?.[1];
  if (!title || !date) throw new Error("title_required");
  return insertTask(LIST_PRODUCTION, { title, due: dueOf(date) });
}
export async function fetchHitsWeek() {
  const { tasks } = await weekHits();
  const done = tasks.filter((t) => t.status === "completed").length;
  return { week: weekKey(), total_hits: tasks.length, completed_hits: done, open_hits: tasks.length - done, completion_rate: tasks.length ? done / tasks.length : 0 };
}

// ── Profit (nur lesend) ──
export async function fetchProfitGtasks() {
  const since = startOfWeek(addDays(new Date(), -7 * (PROFIT_WEEKS - 1)), { weekStartsOn: 1 });
  const completedMin = since.toISOString();
  const [pot, prod] = await Promise.all([
    listTasks(LIST_POTENTIAL, { showCompleted: true, completedMin }),
    listTasks(LIST_PRODUCTION, { showCompleted: true, completedMin }),
  ]);
  const weeks = new Map();
  for (let i = 0; i < PROFIT_WEEKS; i++) weeks.set(weekKey(addDays(since, i * 7)), { week: weekKey(addDays(since, i * 7)), potential: 0, hits: 0 });
  const bump = (t, field) => {
    if (t.status !== "completed" || !t.completed) return;
    const w = weeks.get(weekKey(new Date(t.completed)));
    if (w) w[field] += 1;
  };
  pot.forEach((t) => bump(t, "potential"));
  prod.forEach((t) => bump(t, "hits"));
  const doors = pot
    .filter((t) => t.status === "completed" && t.completed && parseNotes(t.notes).doorWeek)
    .map((t) => ({ id: t.id, door_title: t.title || "", week: parseNotes(t.notes).doorWeek, completed_at: t.completed }))
    .sort((a, b) => b.completed_at.localeCompare(a.completed_at));
  return { weeks: [...weeks.values()].reverse(), doors };
}
