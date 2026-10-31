/**
 * Door > Plan — Firestore-natives Gegenstück zu plan.rest.js (REST gegen den
 * Door-Node-Server :6400). Für den cloud channel: eigenständiger Door War
 * (Eisenhower-Board) + War Stack Wizard unter fitness/{uid}/door/*, ohne
 * Node/Taskwarrior-Backend. Candidates kommen aus potential.firestore.js
 * (dieselbe Hot List, die auch im Potential-Tab läuft).
 *
 * Shapes:
 *   fitness/{uid}/door/plan                     Door-War-Doc (quadrants, selected, meta)
 *   fitness/{uid}/door-warstacks/{id}            fertige War Stacks
 *   fitness/{uid}/door-warstack-sessions/{id}    laufende Wizard-Sessions
 */
import {
  collection, doc, setDoc, getDoc, getDocs, deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { track } from "../offline.js";
import { getUid } from "../db/core.js";
import { fetchHotlist as fetchPotentialItems } from "./potential.firestore.js";
import { WARSTACK_STEPS, buildWarStackHits, weekKey } from "./warstack.js";

function planDoc() {
  return doc(db, "fitness", getUid(), "door", "plan");
}
function warstacksCol() {
  return collection(db, "fitness", getUid(), "door-warstacks");
}
function sessionsCol() {
  return collection(db, "fitness", getUid(), "door-warstack-sessions");
}

function basePlan() {
  return { quadrants: { 1: [], 2: [], 3: [], 4: [] }, meta: {}, selected: { selector: "", uuid: "", week: "", chosen_at: "" } };
}

async function loadPlan() {
  const snap = await getDoc(planDoc());
  if (!snap.exists()) return basePlan();
  const d = snap.data() || {};
  const base = basePlan();
  return {
    quadrants: { ...base.quadrants, ...(d.quadrants || {}) },
    meta: d.meta || {},
    selected: { ...base.selected, ...(d.selected || {}) },
  };
}

async function savePlan(plan) {
  track(setDoc(planDoc(), plan, { merge: false }));
  return plan;
}

function boardKeyFor(item) {
  return item?.id || item?.selector || "";
}

export async function fetchDoorWar() {
  const [plan, items] = await Promise.all([loadPlan(), fetchPotentialItems("active")]);
  const byKey = new Map(items.map((item) => [boardKeyFor(item), item]));
  const candidates = [];
  const board = { 1: [], 2: [], 3: [], 4: [], unsorted: [] };

  for (const q of [1, 2, 3, 4]) {
    for (const key of plan.quadrants[q] || []) {
      const item = byKey.get(key);
      if (!item) continue;
      candidates.push({ ...item, quadrant: q, war_uuid: key });
      board[q].push(key);
    }
  }
  for (const item of items) {
    const key = boardKeyFor(item);
    if (!key) continue;
    if ([1, 2, 3, 4].some((q) => board[q].includes(key))) continue;
    candidates.push({ ...item, quadrant: null, war_uuid: key });
    board.unsorted.push(key);
  }

  return { doorWar: plan, candidates, board, selected: plan.selected };
}

export async function selectWeeklyDoor(selector, reasoning = "") {
  const plan = await loadPlan();
  const isQ2 = (plan.quadrants[2] || []).includes(selector);
  if (!isQ2) throw new Error("selected_requires_q2");
  plan.selected = { selector, uuid: selector, week: weekKey(), chosen_at: new Date().toISOString() };
  if (reasoning) plan.meta[selector] = { ...(plan.meta[selector] || {}), reasoning };
  await savePlan(plan);
  return plan.selected;
}

export async function assignQuadrant(selector, quadrant, reasoning = "") {
  const plan = await loadPlan();
  for (const q of [1, 2, 3, 4]) {
    plan.quadrants[q] = (plan.quadrants[q] || []).filter((k) => k !== selector);
  }
  plan.quadrants[quadrant] = [...(plan.quadrants[quadrant] || []), selector];
  if (reasoning) plan.meta[selector] = { ...(plan.meta[selector] || {}), reasoning };
  if (plan.selected?.selector === selector && Number(quadrant) !== 2) {
    plan.selected = { selector: "", uuid: "", week: "", chosen_at: "" };
  }
  await savePlan(plan);
  return plan;
}

export async function fetchWarstacks() {
  const snap = await getDocs(warstacksCol());
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
}

export async function startWarstack(doorTitle, selector = "") {
  const sessionId = crypto.randomUUID();
  const session = {
    id: sessionId,
    door_title: doorTitle,
    source_selector: selector,
    step_index: 0,
    inquiry: { domino_door: doorTitle },
    hits: buildWarStackHits(),
    created_at: new Date().toISOString(),
  };
  track(setDoc(doc(sessionsCol(), sessionId), session));
  const step = WARSTACK_STEPS[0];
  return { sessionId, step: step.key, question: step.question };
}

export async function answerWarstack(sessionId, step, { answer, hits } = {}) {
  const ref = doc(sessionsCol(), sessionId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("session_not_found");
  const session = snap.data();
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
    track(setDoc(ref, session, { merge: false }));
    return { sessionId, step: next.key, question: next.question, hits: next.key === "hits" ? session.hits : null, done: false };
  }

  const createdAt = new Date().toISOString();
  const warstack = {
    id: crypto.randomUUID(),
    session_id: sessionId,
    door_title: session.door_title,
    source_selector: session.source_selector || "",
    inquiry: session.inquiry,
    hits: session.hits,
    week: weekKey(),
    created_at: createdAt,
  };
  track(setDoc(doc(warstacksCol(), warstack.id), warstack));
  track(deleteDoc(ref));
  return { sessionId, step: null, question: null, done: true, warstack };
}

export async function fetchWarstackSessions() {
  const snap = await getDocs(sessionsCol());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
