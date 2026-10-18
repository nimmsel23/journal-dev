// taskwarrior.door.js — Adapter: Door-v2-Funktionen auf Taskwarrior (TaskChampion-Replik im Browser),
// gleiche Signaturen/Rückgabeformen wie gtasks.door.js. Schreiben per TaskChampion-AddVersion (taskchampion.commit).
//
// Mapping (Tags der bestehenden Taskwarrior-Datenbank)
//  Potential  = offene Tasks mit +hot oder +potential (Hot List)
//  Plan       = dieselben Tasks; Quadrant aus priority (H=Q1, M=Q2, L=Q3, leer=Q4), Door der Woche = +door
//  Production = Tasks mit +hit und `due` in dieser Woche; erledigt = status completed
//  Profit     = erledigte Tasks (`end`) der letzten 8 Wochen: +hot/+potential und +hit; Doors = erledigte +door
import { addDays, format, startOfWeek } from "date-fns";
import { WARSTACK_STEPS, buildWarStackHits, weekKey } from "./warstack.js";
import { tasks, commit, editOps, tagProps, newTaskOps, nowSecs } from "./taskchampion.js";

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const PROFIT_WEEKS = 8;

/** Task per UUID ändern (immer gegen frischen Stand); props: null = entfernen. */
async function edit(uuid, props) {
  const t = (await tasks({ force: true })).find((x) => x.uuid === uuid);
  if (!t) throw new Error("task_not_found");
  await commit(editOps(t, { ...props, modified: nowSecs() }));
  return t;
}

const has = (t, tag) => t[`tag_${tag}`] !== undefined;
const secs = (v) => (v ? new Date(Number(v) * 1000) : null);
const isPot = (t) => has(t, "hot") || has(t, "potential");
const waiting = (t) => t.wait && Number(t.wait) * 1000 > Date.now();
const open = (t) => t.status === "pending" && !waiting(t);
// Quadrant aus Taskwarrior-Priorität: H→Q1, M→Q2, L→Q3, ohne Priorität → Q4 (+q1…+q4 überschreibt)
const PRIO_Q = { H: 1, M: 2, L: 3 };
const quadrantOf = (t) => [1, 2, 3, 4].find((q) => has(t, `q${q}`)) || PRIO_Q[t.priority] || 4;

function toItem(t) {
  const q = quadrantOf(t);
  return {
    id: t.uuid, selector: t.uuid, title: t.description || "Untitled", description: "", source: "taskwarrior",
    status: "active", phase: "potential", created_at: secs(t.entry)?.toISOString() || "",
    quadrant: q, doorWeek: has(t, "door") ? weekKey() : "",
  };
}

// ── Potential ──
export async function fetchHotlist() {
  return (await tasks()).filter((t) => open(t) && isPot(t)).map(toItem)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}
export async function addHotlistItem(text) {
  const title = String(text || "").trim();
  if (!title) throw new Error("title_required");
  await commit(newTaskOps(title, { tags: ["hot"] }).ops);
}
/** Notiz als Annotation „NOTE\n<text>“ (door-taskopen legt daraus die Potential-Markdown an). */
export async function addNote(id, text) {
  const note = String(text || "").trim();
  if (!note) throw new Error("answer_required");
  await edit(id, { [`annotation_${nowSecs()}`]: `NOTE\n${note}` });
}
export const completeHotlistItem = (id) => edit(id, { status: "completed", end: nowSecs() });
export const deleteHotlistItem = (id) => edit(id, { status: "deleted", end: nowSecs() });

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
const PRIO_OF = { 1: "H", 2: "M", 3: "L", 4: null };
export async function assignQuadrant(id, quadrant) {
  const t = (await tasks({ force: true })).find((x) => x.uuid === id);
  if (!t) throw new Error("task_not_found");
  // Priorität setzen; Q-Tags (Override) entfernen, sonst gewinnen sie weiter
  let props = { priority: PRIO_OF[Number(quadrant)] };
  for (const n of [1, 2, 3, 4]) if (has(t, `q${n}`)) props = { ...props, ...tagProps({ ...t, ...props }, `q${n}`, false) };
  await commit(editOps(t, { ...props, modified: nowSecs() }));
}
// Eine Door pro Woche: +door von anderen offenen Tasks entfernen, am gewählten setzen
export async function selectWeeklyDoor(id) {
  const all = await tasks({ force: true });
  const t = all.find((x) => x.uuid === id);
  if (!t) throw new Error("task_not_found");
  const now = nowSecs();
  const ops = [];
  for (const o of all) if (o.uuid !== id && o.status === "pending" && has(o, "door")) ops.push(...editOps(o, { ...tagProps(o, "door", false), modified: now }));
  ops.push(...editOps(t, { ...tagProps(t, "door", true), modified: now }));
  await commit(ops);
}

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
export async function toggleDailyHit(id) {
  const t = (await tasks({ force: true })).find((x) => x.uuid === id);
  if (!t) throw new Error("daily_hit_not_found");
  await commit(editOps(t, t.status === "completed" ? { status: "pending", end: null, modified: nowSecs() } : { status: "completed", end: nowSecs(), modified: nowSecs() }));
}
export async function addDailyHit(dayKey, text) {
  const title = String(text || "").trim();
  const date = weekDates().find(([k]) => k === dayKey)?.[1];
  if (!title || !date) throw new Error("title_required");
  const due = String(Math.floor(new Date(`${date}T00:00:00`).getTime() / 1000)); // lokale Mitternacht wie `task due:`
  await commit(newTaskOps(title, { tags: ["hit"], props: { due } }).ops);
}
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

// ── War Stack ──
// Entwurf (Wizard-Stand) liegt in localStorage, je Door-Task. Beim Abschluss entsteht EIN Markdown-Dokument,
// das als Annotation „WARSTACK\n<md>" am +door-Task hängt; dazu werden die UDAs domain, subdomain und
// domino_door gesetzt. `door-taskopen` legt daraus beim ersten Öffnen die Datei
// Vault/Door/War-Stacks/STACK_<slug>.md an (Browser kann keine Dateien schreiben).
const DRAFT = "dv2:tw-ws:";
const drafts = () => {
  try {
    return Object.keys(localStorage).filter((k) => k.startsWith(DRAFT)).map((k) => JSON.parse(localStorage.getItem(k)));
  } catch { return []; }
};
const saveDraft = (d) => { try { localStorage.setItem(DRAFT + d.id, JSON.stringify(d)); } catch {} };
const dropDraft = (id) => { try { localStorage.removeItem(DRAFT + id); } catch {} };
const LABEL = { domain: "Domain", subdomain: "Sub-domain", domino_door: "Domino Door", trigger: "Trigger", narrative: "Narrative", validation: "Validation", impact_opening: "Impact on opening", consequences: "Consequences of inaction", insights: "Insights", lessons: "Lessons learned" };
const HITS = [["fact", "Fact"], ["obstacle", "Obstacle"], ["strike", "Strike"], ["responsibility", "Responsibility"]];

function warstackMd(d) {
  const q = d.inquiry;
  const lines = ["---", "type: warstack", `tw_uuid: ${d.id}`, `week: ${weekKey()}`, `domain: ${q.domain || ""}`, `subdomain: ${q.subdomain || ""}`, `created: ${new Date().toISOString()}`, "---", "", `# War Stack – ${q.domino_door || d.door_title}`, ""];
  for (const { key } of WARSTACK_STEPS) {
    if (key === "hits") {
      lines.push("## Hits", "");
      d.hits.forEach((h, i) => { lines.push(`### Hit ${i + 1}`); HITS.forEach(([f, l]) => lines.push(`- **${l}:** ${h[f] || ""}`)); lines.push(""); });
    } else lines.push(`## ${LABEL[key]}`, "", q[key] || "", "");
  }
  return lines.join("\n");
}

export async function fetchWarstackSessions() { return drafts(); }
export async function fetchWarstacks() { return []; }
export async function startWarstack(doorTitle, selector = "") {
  if (!selector) throw new Error("door_required");
  const d = { id: selector, door_title: doorTitle, step_index: 0, inquiry: { domino_door: doorTitle }, hits: buildWarStackHits() };
  saveDraft(d);
  return { sessionId: d.id, step: WARSTACK_STEPS[0].key, question: WARSTACK_STEPS[0].question };
}
export async function answerWarstack(sessionId, step, { answer, hits } = {}) {
  const d = drafts().find((x) => x.id === sessionId);
  if (!d) throw new Error("session_not_found");
  const cur = WARSTACK_STEPS[d.step_index];
  if (!cur || (step && step !== cur.key)) throw new Error("step_mismatch");
  if (cur.key === "hits") {
    if (!Array.isArray(hits) || hits.length !== 4) throw new Error("hits_required");
    d.hits = hits;
  } else {
    if (!answer) throw new Error("answer_required");
    d.inquiry = { ...d.inquiry, [cur.key]: answer };
  }
  d.step_index += 1;
  const next = WARSTACK_STEPS[d.step_index];
  if (next) {
    saveDraft(d);
    return { sessionId, step: next.key, question: next.question, hits: next.key === "hits" ? d.hits : null, done: false };
  }
  const t = (await tasks({ force: true })).find((x) => x.uuid === d.id);
  if (!t) throw new Error("task_not_found");
  const md = warstackMd(d);
  const ops = editOps(t, {
    domain: d.inquiry.domain || null, subdomain: d.inquiry.subdomain || null, domino_door: d.inquiry.domino_door || null, modified: nowSecs(),
    // alte WARSTACK-Annotation ersetzen
    ...Object.fromEntries(Object.entries(t).filter(([k, v]) => k.startsWith("annotation_") && String(v).startsWith("WARSTACK\n")).map(([k]) => [k, null])),
    [`annotation_${nowSecs()}`]: `WARSTACK\n${md}`,
  });
  await commit(ops);
  dropDraft(d.id);
  return { sessionId, step: null, question: null, done: true, warstack: { id: d.id, door_title: d.door_title } };
}
