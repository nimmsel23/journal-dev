// Door v1 — Datenquelle: ausschließlich Google Tasks (kein aos server, kein Firestore).
// Gleiche Funktionsnamen/Rückgabeformen wie die Facaden potential/plan/production/profit.js,
// damit die v1-Views nur den Import wechseln. Potential, Plan und Production kommen aus
// gtasks.door.js (Door v2 teilt sich dieselben Listen); War Stacks und Profit sind v1-eigen:
//
//  War Stack = Liste "Door · War Stacks": ein Task je War Stack, `notes` = JSON (Inquiry + 4 Hits).
//    Läuft der Wizard noch: status needsAction (= Session). Fertig: status completed.
//  Profit    = Liste "Door · Profit": ein Task je Wochen-Reflexion, der Text steht in den `notes`:
//        Woche: 2026-W44
//        Door: <Titel>
//
//        <Reflexion>
//    Die Reflexion wird sofort als erledigt abgelegt, damit sie keine offene Aufgabe in der
//    Google-Tasks-App bleibt.
// Google Tasks begrenzt `notes` auf 8192 Zeichen → längere Inhalte werden mit Fehler abgelehnt.
import { WARSTACK_STEPS, buildWarStackHits, weekKey } from "./warstack.js";
import {
  LIST_POTENTIAL, LIST_WARSTACK, LIST_PROFIT,
  listTasks, getTask, insertTask, patchTask,
} from "./gtasks.js";
import * as gt from "./gtasks.door.js";

const MAX_NOTES = 8000;
const DONE_LIMIT = 100;

function checkNotes(notes, tooLong) {
  if (notes.length > MAX_NOTES) throw new Error(tooLong);
  return notes;
}

// ── Potential ──
export async function fetchHotlist(mode = "active") {
  if (mode === "deleted") return []; // Google Tasks löscht endgültig
  const active = mode === "done" ? [] : await gt.fetchHotlist();
  if (mode === "active") return active;
  const all = await listTasks(LIST_POTENTIAL, { showCompleted: true });
  const done = all
    .filter((t) => t.status === "completed" && (t.title || "").trim())
    .sort((a, b) => String(b.completed || "").localeCompare(String(a.completed || "")))
    .slice(0, DONE_LIMIT)
    .map(gt.toItem);
  return [...active, ...done];
}
export const addHotlistItem = gt.addHotlistItem;
export const completeHotlistItem = gt.completeHotlistItem;
export const deleteHotlistItem = gt.deleteHotlistItem;
export const updateHotlistItem = (id, title) => {
  const t = String(title || "").trim();
  if (!t) throw new Error("title_required");
  return patchTask(LIST_POTENTIAL, id, { title: t });
};
/** Notiztext ohne die Plan-Markierung (Quadrant/Door) in der ersten Zeile. */
export async function fetchHotlistNote(id) {
  return gt.parseNotes((await getTask(LIST_POTENTIAL, id)).notes).rest;
}
export async function saveHotlistNote(id, note) {
  const n = gt.parseNotes((await getTask(LIST_POTENTIAL, id)).notes);
  const notes = checkNotes(gt.buildNotes({ quadrant: n.quadrant, doorWeek: n.doorWeek, rest: String(note || "").trim() }), "note_too_long");
  return patchTask(LIST_POTENTIAL, id, { notes });
}

// ── Plan ──
export const fetchDoorWar = gt.fetchDoorWar;
export const selectWeeklyDoor = gt.selectWeeklyDoor;
export const assignQuadrant = gt.assignQuadrant;

const parseJson = (s) => { try { return JSON.parse(s) || {}; } catch { return {}; } };
const tooLongWs = "War Stack zu lang für Google Tasks (max. 8000 Zeichen) – bitte Antworten kürzen.";

function toSession(t) {
  const d = parseJson(t.notes);
  return {
    id: t.id, door_title: d.door_title || "", source_selector: d.source_selector || "",
    step_index: d.step_index || 0, inquiry: d.inquiry || {}, hits: d.hits || [], created_at: d.created_at || t.updated || "",
  };
}
function toWarstack(t) {
  const d = parseJson(t.notes);
  return {
    id: t.id, door_title: d.door_title || "", source_selector: d.source_selector || "",
    inquiry: d.inquiry || {}, hits: d.hits || [], week: d.week || "", created_at: d.created_at || t.updated || "",
  };
}
const byCreatedDesc = (a, b) => String(b.created_at).localeCompare(String(a.created_at));

export async function fetchWarstackSessions() {
  const tasks = await listTasks(LIST_WARSTACK, { showCompleted: false });
  return tasks.map(toSession);
}
export async function fetchWarstacks() {
  const tasks = await listTasks(LIST_WARSTACK, { showCompleted: true });
  return tasks.filter((t) => t.status === "completed").map(toWarstack).sort(byCreatedDesc);
}

export async function startWarstack(doorTitle, selector = "") {
  const session = {
    door_title: doorTitle, source_selector: selector, step_index: 0,
    inquiry: { domino_door: doorTitle }, hits: buildWarStackHits(), created_at: new Date().toISOString(),
  };
  const task = await insertTask(LIST_WARSTACK, {
    title: `War Stack · ${doorTitle}`, notes: checkNotes(JSON.stringify(session), tooLongWs),
  });
  const step = WARSTACK_STEPS[0];
  return { sessionId: task.id, step: step.key, question: step.question };
}

export async function answerWarstack(sessionId, step, { answer, hits } = {}) {
  const task = await getTask(LIST_WARSTACK, sessionId);
  if (task.status === "completed") throw new Error("session_not_found");
  const session = parseJson(task.notes);
  const stepIndex = session.step_index || 0;
  const current = WARSTACK_STEPS[stepIndex];
  if (!current) throw new Error("session_invalid_state");
  if (step && step !== current.key) throw new Error("step_mismatch");

  if (current.key === "hits") {
    if (!Array.isArray(hits) || hits.length !== 4) throw new Error("hits_required");
    session.hits = hits;
  } else {
    if (!answer) throw new Error("answer_required");
    session.inquiry = { ...session.inquiry, [current.key]: answer };
  }
  session.step_index = stepIndex + 1;

  const next = WARSTACK_STEPS[session.step_index];
  if (next) {
    await patchTask(LIST_WARSTACK, sessionId, { notes: checkNotes(JSON.stringify(session), tooLongWs) });
    return { sessionId, step: next.key, question: next.question, hits: next.key === "hits" ? session.hits : null, done: false };
  }
  const finished = { ...session, week: weekKey() };
  const saved = await patchTask(LIST_WARSTACK, sessionId, { notes: checkNotes(JSON.stringify(finished), tooLongWs), status: "completed" });
  return { sessionId, step: null, question: null, done: true, warstack: toWarstack(saved) };
}

/** Hit eines fertigen War Stacks abhaken/zurücknehmen. */
export async function toggleWarstackHit(warstackId, hitId) {
  const d = parseJson((await getTask(LIST_WARSTACK, warstackId)).notes);
  const hits = (d.hits || []).map((h) => (h.id === hitId
    ? { ...h, done: !h.done, completed_at: h.done ? null : new Date().toISOString() }
    : h));
  return patchTask(LIST_WARSTACK, warstackId, { notes: checkNotes(JSON.stringify({ ...d, hits }), tooLongWs) });
}

// ── Production ──
export const fetchDailyWeek = gt.fetchDailyWeek;
export const toggleDailyHit = gt.toggleDailyHit;
export const addHitOnDate = gt.addHitOnDate;
export const fetchHitsWeek = gt.fetchHitsWeek;

// ── Profit ──
export async function fetchProfitWeek(week = "") {
  const w = week || weekKey();
  const [{ selected, candidates }, warstacks] = await Promise.all([fetchDoorWar(), fetchWarstacks()]);
  const door = candidates.find((c) => c.id === selected?.selector);
  const warstack = warstacks.find((ws) => ws.week === w && (!selected?.selector || ws.source_selector === selected.selector)) || null;
  const hitDone = (warstack?.hits || []).filter((h) => h.done).length;
  return {
    week: w,
    selected: selected?.selector ? { ...selected, title: door?.title || "" } : selected,
    warstack: warstack
      ? {
          id: warstack.id, door_title: warstack.door_title, week: warstack.week, created_at: warstack.created_at,
          hit_count: warstack.hits.length, hit_done_count: hitDone,
          opened: warstack.hits.length > 0 && hitDone === warstack.hits.length,
          hits: warstack.hits,
        }
      : null,
  };
}

export async function fetchCompletedWarstacks() {
  const warstacks = await fetchWarstacks();
  return warstacks
    .filter((ws) => ws.hits.length > 0 && ws.hits.every((h) => h.done))
    .map((ws) => ({
      id: ws.id, door_title: ws.door_title, week: ws.week, created_at: ws.created_at,
      completed_at: ws.hits.reduce((latest, h) => ((h.completed_at || "") > latest ? h.completed_at : latest), ""),
      hit_count: ws.hits.length,
    }))
    .sort((a, b) => String(b.completed_at).localeCompare(String(a.completed_at)));
}

const REFLECTION_RE = /^Woche:[ \t]*(.*)\nDoor:[ \t]*(.*)\n\n?([\s\S]*)$/;

export async function saveReflection(fields) {
  const week = fields.week || weekKey();
  const door = String(fields.door_title || fields.title || "").trim();
  const text = String(fields.reflection || fields.text || fields.body || "").trim();
  if (!text) throw new Error("answer_required");
  const notes = checkNotes(`Woche: ${week}\nDoor: ${door}\n\n${text}`, "Reflexion zu lang für Google Tasks (max. 8000 Zeichen).");
  const task = await insertTask(LIST_PROFIT, { title: `Reflexion ${week}${door ? ` · ${door}` : ""}`, notes });
  await patchTask(LIST_PROFIT, task.id, { status: "completed" });
  return task.id;
}

export async function fetchReflections() {
  const tasks = await listTasks(LIST_PROFIT, { showCompleted: true });
  return tasks
    .map((t) => {
      const m = (t.notes || "").match(REFLECTION_RE);
      return {
        id: t.id, week: m ? m[1] : "", door_title: m ? m[2] : t.title || "",
        reflection: m ? m[3] : t.notes || "", created_at: t.completed || t.updated || "",
      };
    })
    .sort(byCreatedDesc);
}
