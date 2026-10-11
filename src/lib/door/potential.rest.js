// Door > Potential (aos/door Hot List) — spricht den aos server (:7001) über
// den kanonischen Bridge-Endpoint /api/hotlist an (server/routers/hotlist.py).
// Taskwarrior ist dort die einzige Quelle — kein eigener Datenspeicher hier.
import { restRequest } from "./core.js";

const BASE = import.meta.env.VITE_HOTLIST_API_BASE || "";
const request = (method, path, body) => restRequest(BASE, method, path, body);

export async function fetchHotlist(mode = "active") {
  const payload = await request("GET", `/api/hotlist?mode=${encodeURIComponent(mode)}`);
  return Array.isArray(payload.items) ? payload.items : [];
}

export async function addHotlistItem(text) {
  const payload = await request("POST", "/api/hotlist", { text });
  return payload.item ?? null;
}

export async function updateHotlistItem(selector, title) {
  const payload = await request("PUT", `/api/hotlist/${encodeURIComponent(selector)}`, { title });
  return payload.item ?? null;
}

export async function completeHotlistItem(selector) {
  const payload = await request("POST", `/api/hotlist/${encodeURIComponent(selector)}/done`, {});
  return payload.completed ?? null;
}

export async function deleteHotlistItem(selector) {
  const payload = await request("DELETE", `/api/hotlist/${encodeURIComponent(selector)}`);
  return payload.removed ?? null;
}

export async function fetchHotlistNote(selector) {
  const payload = await request("GET", `/api/hotlist/note?id=${encodeURIComponent(selector)}`);
  return payload.note ?? "";
}

export async function saveHotlistNote(selector, note) {
  const payload = await request("POST", "/api/hotlist/note", { selector, note });
  return payload.note ?? "";
}
