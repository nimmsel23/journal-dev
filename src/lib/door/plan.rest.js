// Door > Plan — REST gegen den Door-Node-Server (:9400 dev / :6400 prod,
// kanonischer Prefix /api/door laut ~/aos/lib/door_routes.yaml). Eisenhower
// Door War + War Stack Wizard. Keine eigene Datenhaltung hier.
import { restRequest } from "./core.js";

const BASE = import.meta.env.VITE_DOOR_API_BASE || "";
const request = (method, path, body) => restRequest(BASE, method, path, body);

export async function fetchDoorWar() {
  const payload = await request("GET", "/api/door/plan/doorwar");
  return {
    doorWar: payload.door_war ?? payload.data?.door_war ?? null,
    candidates: payload.candidates ?? [],
    board: payload.board ?? { 1: [], 2: [], 3: [], 4: [], unsorted: [] },
    selected: payload.selected ?? payload.data?.selected ?? null,
  };
}

export async function selectWeeklyDoor(selector, reasoning = "") {
  const payload = await request("POST", "/api/door/plan/doorwar/selected", { selector, reasoning });
  return payload.selected ?? payload.data?.selected ?? null;
}

export async function assignQuadrant(selector, quadrant, reasoning = "") {
  const payload = await request("POST", "/api/door/plan/doorwar/assign", { selector, quadrant, reasoning });
  return payload.door_war ?? payload.data?.door_war ?? null;
}

export async function fetchWarstacks() {
  const payload = await request("GET", "/api/door/plan/list");
  return Array.isArray(payload.warstacks) ? payload.warstacks : [];
}

export async function startWarstack(doorTitle, selector = "") {
  const payload = await request("POST", "/api/door/plan/warstack/start", { door_title: doorTitle, selector });
  return { sessionId: payload.session_id, step: payload.step, question: payload.question };
}

export async function answerWarstack(sessionId, step, { answer, hits } = {}) {
  const body = { session_id: sessionId, step };
  if (hits) body.hits = hits;
  else body.answer = answer;
  const payload = await request("POST", "/api/door/plan/warstack/answer", body);
  return {
    sessionId: payload.session_id ?? sessionId,
    step: payload.step ?? null,
    question: payload.question ?? null,
    hits: payload.hits ?? null,
    done: Boolean(payload.done),
    warstack: payload.warstack ?? null,
  };
}

export async function fetchWarstackSessions() {
  const payload = await request("GET", "/api/door/plan/warstack/sessions");
  return Array.isArray(payload.sessions) ? payload.sessions : [];
}
