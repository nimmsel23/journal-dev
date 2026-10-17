// Door > Potential (aos/door Hot List) — spricht den aos server (:7001) über
// den kanonischen Bridge-Endpoint /api/hotlist an (server/routers/hotlist.py).
// Taskwarrior ist dort die Quelle — aber pro User getrennt: jede Firebase-UID
// bekommt ihre eigene Taskwarrior-DB unter ~/.aos/users/<uid>/task/ (Server-
// seitig in data_dir_for_uid()). Ohne UID (nicht eingeloggt) fällt der Server
// auf die alte Single-Operator-DB zurück — kein Bruch für CLI/Bot-Aufrufe.
import { restRequest } from "./core.js";
import { getUid } from "../db/core.js";

const BASE = import.meta.env.VITE_HOTLIST_API_BASE || "";
const request = (method, path, body) => restRequest(BASE, method, path, body);

function safeUid() {
  try {
    return getUid();
  } catch {
    return "";
  }
}

function withUid(path) {
  const uid = safeUid();
  if (!uid) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}uid=${encodeURIComponent(uid)}`;
}

function withUidBody(body = {}) {
  const uid = safeUid();
  return uid ? { ...body, uid } : body;
}

export async function fetchHotlist(mode = "active") {
  const payload = await request("GET", withUid(`/api/hotlist?mode=${encodeURIComponent(mode)}`));
  return Array.isArray(payload.items) ? payload.items : [];
}

export async function addHotlistItem(text) {
  const payload = await request("POST", "/api/hotlist", withUidBody({ text }));
  return payload.item ?? null;
}

export async function updateHotlistItem(selector, title) {
  const payload = await request("PUT", `/api/hotlist/${encodeURIComponent(selector)}`, withUidBody({ title }));
  return payload.item ?? null;
}

export async function completeHotlistItem(selector) {
  const payload = await request("POST", `/api/hotlist/${encodeURIComponent(selector)}/done`, withUidBody({}));
  return payload.completed ?? null;
}

export async function deleteHotlistItem(selector) {
  const payload = await request("DELETE", withUid(`/api/hotlist/${encodeURIComponent(selector)}`));
  return payload.removed ?? null;
}

export async function fetchHotlistNote(selector) {
  const payload = await request("GET", withUid(`/api/hotlist/note?id=${encodeURIComponent(selector)}`));
  return payload.note ?? "";
}

export async function saveHotlistNote(selector, note) {
  const payload = await request("POST", "/api/hotlist/note", withUidBody({ selector, note }));
  return payload.note ?? "";
}
