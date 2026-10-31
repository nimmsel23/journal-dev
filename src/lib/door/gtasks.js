// gtasks.js — Google Tasks im Browser (REST) für Door v2 "Quelle: Google Tasks".
// Auth und Token liegen im gemeinsamen Dienst src/lib/google/ (derselbe wie für Google Calendar):
// dauerhafte Verknüpfung über die Cloud Function, Rückfall Firebase-Popup (~1 h); 401 wird dort
// einmal mit frischem Token wiederholt. Fehler: "google-expired" (neu verbinden), "google-offline".
//
// Door v2 ruft diese Funktionen NICHT mehr aus der Oberfläche auf: die UI liest/schreibt den lokalen Store
// (gtasks.store.js/gtasks.model.js), gtasks.sync.js gleicht still im Hintergrund über diese REST-Funktionen ab.
// Direkt genutzt wird gtasks.js nur noch vom Sync und von Door v1 (War Stacks, Profit-Reflexionen).
//
// Voraussetzung: Tasks API im GCP-Projekt aktiviert (fitness-aos: ja) und der Scope
// https://www.googleapis.com/auth/tasks im OAuth-Zustimmungsbildschirm.
//
// Sicherheitsrahmen: Es werden nur die vier Door-Listen ("Door · Potential",
// "Door · Production", "Door · War Stacks", "Door · Profit") angefasst (find-or-create
// über den Titel); andere Listen werden nie gelesen oder verändert.
import { google } from "../google/auth.js";
import { resolveListId } from "./gtasks.lists.js";

const API = "https://tasks.googleapis.com/tasks/v1";
const TIMEOUT_MS = 20_000; // schlechtes Netz darf den Abgleich nie ewig hängen lassen (er läuft im Hintergrund)

// Titel der Listen: gemeinsam mit dem lokalen Modell (gtasks.model.js)
export { LIST_POTENTIAL, LIST_PRODUCTION, LIST_WARSTACK, LIST_PROFIT } from "./gtasks.model.js";

async function api(method, path, { params, body } = {}) {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  const res = await google.authFetch(`${API}${path}${qs}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    signal: typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(TIMEOUT_MS) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  // status: der Abgleich (gtasks.sync.js) unterscheidet "Task gibt es nicht mehr" (404) von "später erneut" (Netz, 5xx, 429)
  if (!res.ok) throw Object.assign(new Error(data?.error?.message || `tasks ${res.status}`), { status: res.status });
  return data;
}

// ── Listen ──
const listIds = new Map(); // Titel → id (pro Sitzung)
// Konto getrennt (oder gewechselt): gemerkte Listen-IDs gehören dann nicht mehr dazu
google.subscribe(() => { if (google.snapshot() === "off") listIds.clear(); });

/**
 * Id der Liste mit diesem Titel; wird nur angelegt, wenn der vollständige Abruf keine fand
 * (mehrere Treffer: kleinste id, nie löschen — siehe gtasks.lists.js).
 */
export async function ensureList(title) {
  if (listIds.has(title)) return listIds.get(title);
  const id = await resolveListId({
    title,
    fetchPage: (pageToken) => api("GET", "/users/@me/lists", { params: { maxResults: "100", ...(pageToken ? { pageToken } : {}) } }),
    create: (t) => api("POST", "/users/@me/lists", { body: { title: t } }),
  });
  listIds.set(title, id);
  return id;
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
