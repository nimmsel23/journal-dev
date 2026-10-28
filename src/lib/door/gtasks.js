// gtasks.js — Google Tasks im Browser (REST) für Door v2 "Quelle: Google Tasks".
// Auth und Token liegen im gemeinsamen Dienst src/lib/google/ (derselbe wie für Google Calendar):
// dauerhafte Verknüpfung über die Cloud Function, Rückfall Firebase-Popup (~1 h); 401 wird dort
// einmal mit frischem Token wiederholt. Fehler: "google-expired" (neu verbinden), "google-offline".
//
// Voraussetzung: Tasks API im GCP-Projekt aktiviert (fitness-aos: ja) und der Scope
// https://www.googleapis.com/auth/tasks im OAuth-Zustimmungsbildschirm.
//
// Sicherheitsrahmen: Es werden nur die vier Door-Listen ("Door · Potential",
// "Door · Production", "Door · War Stacks", "Door · Profit") angefasst (find-or-create
// über den Titel); andere Listen werden nie gelesen oder verändert.
import { google } from "../google/auth.js";

const API = "https://tasks.googleapis.com/tasks/v1";

export const LIST_POTENTIAL = "Door · Potential";
export const LIST_PRODUCTION = "Door · Production";
export const LIST_WARSTACK = "Door · War Stacks"; // Door v1: je War Stack ein Task, Inhalt in den Notes
export const LIST_PROFIT = "Door · Profit";       // Door v1: je Wochen-Reflexion ein Task, Text in den Notes

async function api(method, path, { params, body } = {}) {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  const res = await google.authFetch(`${API}${path}${qs}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `tasks ${res.status}`);
  return data;
}

// ── Listen ──
const listIds = new Map(); // Titel → id (pro Sitzung)
// Konto getrennt (oder gewechselt): gemerkte Listen-IDs gehören dann nicht mehr dazu
google.subscribe(() => { if (google.snapshot() === "off") listIds.clear(); });

/** Id der Liste mit diesem Titel; wird beim ersten Zugriff angelegt, falls sie fehlt. */
export async function ensureList(title) {
  if (listIds.has(title)) return listIds.get(title);
  let pageToken;
  let found = null;
  do {
    const data = await api("GET", "/users/@me/lists", { params: { maxResults: "100", ...(pageToken ? { pageToken } : {}) } });
    found = (data.items || []).find((l) => l.title === title) || null;
    pageToken = found ? null : data.nextPageToken;
  } while (pageToken);
  if (!found) found = await api("POST", "/users/@me/lists", { body: { title } });
  listIds.set(title, found.id);
  return found.id;
}

// ── Tasks (immer nur in einer der Door-Listen) ──
const enc = encodeURIComponent;

/** opts: { showCompleted, dueMin, dueMax, completedMin } — paginiert, gibt alle zurück. */
export async function listTasks(listTitle, opts = {}) {
  const listId = await ensureList(listTitle);
  const params = { maxResults: "100", showHidden: "true", showCompleted: opts.showCompleted ? "true" : "false" };
  if (opts.dueMin) params.dueMin = opts.dueMin;
  if (opts.dueMax) params.dueMax = opts.dueMax;
  if (opts.completedMin) params.completedMin = opts.completedMin;
  const out = [];
  let pageToken;
  do {
    const data = await api("GET", `/lists/${enc(listId)}/tasks`, { params: { ...params, ...(pageToken ? { pageToken } : {}) } });
    out.push(...(data.items || []));
    pageToken = data.nextPageToken;
  } while (pageToken);
  return out;
}

export async function getTask(listTitle, id) {
  const listId = await ensureList(listTitle);
  return api("GET", `/lists/${enc(listId)}/tasks/${enc(id)}`);
}

export async function insertTask(listTitle, task, previous) {
  const listId = await ensureList(listTitle);
  return api("POST", `/lists/${enc(listId)}/tasks`, { body: task, params: previous ? { previous } : undefined });
}

export async function patchTask(listTitle, id, patch) {
  const listId = await ensureList(listTitle);
  return api("PATCH", `/lists/${enc(listId)}/tasks/${enc(id)}`, { body: patch });
}

export async function deleteTask(listTitle, id) {
  const listId = await ensureList(listTitle);
  return api("DELETE", `/lists/${enc(listId)}/tasks/${enc(id)}`);
}

/** Reihenfolge: Task hinter `previous` (oder an den Anfang) schieben. */
export async function moveTask(listTitle, id, previous) {
  const listId = await ensureList(listTitle);
  return api("POST", `/lists/${enc(listId)}/tasks/${enc(id)}/move`, { params: previous ? { previous } : undefined });
}
