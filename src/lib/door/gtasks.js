// gtasks.js — Google Tasks im Browser (Auth + REST) für Door v2 "Quelle: Google Tasks".
// Muster wie views/v2/gcal.js: Firebase-Google-Login wird per reauthenticateWithPopup
// um den Scope `tasks` erweitert; der Access-Token (~1 h) lebt nur in sessionStorage.
// 401 → Token verworfen, Fehler "gtasks-expired".
//
// Voraussetzung: Tasks API im GCP-Projekt aktiviert (fitness-aos: ja) und der Scope
// https://www.googleapis.com/auth/tasks im OAuth-Zustimmungsbildschirm (oder Testnutzer).
//
// Sicherheitsrahmen: Es werden nur die beiden Listen "Door · Potential" und
// "Door · Production" angefasst (find-or-create über den Titel); andere Listen
// werden nie gelesen oder verändert.
import { GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { auth } from "../firebase.js";

const SCOPE = "https://www.googleapis.com/auth/tasks";
const API = "https://tasks.googleapis.com/tasks/v1";
const STORE_KEY = "dv2:gtasks-token";

export const LIST_POTENTIAL = "Door · Potential";
export const LIST_PRODUCTION = "Door · Production";

function readStored() {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const { token, exp } = JSON.parse(raw);
    return exp > Date.now() ? token : null;
  } catch {
    return null;
  }
}

function store(token) {
  try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ token, exp: Date.now() + 55 * 60 * 1000 })); } catch {}
}

export function disconnect() {
  try { sessionStorage.removeItem(STORE_KEY); } catch {}
  listIds.clear();
}

export const connected = () => !!readStored();

export async function connect() {
  if (!auth?.currentUser) throw new Error("not authenticated");
  const provider = new GoogleAuthProvider();
  provider.addScope(SCOPE);
  const result = await reauthenticateWithPopup(auth.currentUser, provider);
  const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken;
  if (!token) throw new Error("kein Tasks-Token erhalten");
  store(token);
  return token;
}

async function api(method, path, { params, body } = {}) {
  const token = readStored();
  if (!token) throw new Error("gtasks-expired");
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API}${path}${qs}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    disconnect();
    throw new Error("gtasks-expired");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `tasks ${res.status}`);
  return data;
}

// ── Listen ──
const listIds = new Map(); // Titel → id (pro Sitzung)

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

// ── Tasks (immer nur in einer der beiden Door-Listen) ──
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
