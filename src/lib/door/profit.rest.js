// Door > Profit — REST gegen den Door-Node-Server (:6400, /api/door).
// Wochenabschluss: Review der Door der Woche + Reflexion.
import { restRequest } from "./core.js";

const BASE = import.meta.env.VITE_DOOR_API_BASE || "";
const request = (method, path, body) => restRequest(BASE, method, path, body);

export async function fetchProfitWeek(week = "") {
  const qs = week ? `?week=${encodeURIComponent(week)}` : "";
  const payload = await request("GET", `/api/door/profit/week${qs}`);
  return { week: payload.week ?? "", selected: payload.selected ?? null, warstack: payload.warstack ?? null };
}

export async function fetchCompletedWarstacks() {
  const payload = await request("GET", "/api/door/profit/completed");
  return Array.isArray(payload.completed) ? payload.completed : [];
}

export async function saveReflection(fields) {
  const payload = await request("POST", "/api/door/profit/reflection", fields);
  return payload.path ?? null;
}

export async function fetchReflections() {
  const payload = await request("GET", "/api/door/profit/reflections");
  return Array.isArray(payload.reflections) ? payload.reflections : [];
}
