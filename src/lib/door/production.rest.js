// Door > Production — REST gegen den Door-Node-Server (:6400, /api/door).
// Wöchentlicher Daily-Hit-Plan (Mon–Fri), abgeleitet aus dem War Stack der
// gewählten Door der Woche.
import { restRequest } from "./core.js";

const BASE = import.meta.env.VITE_DOOR_API_BASE || "";
const request = (method, path, body) => restRequest(BASE, method, path, body);

export async function fetchDailyWeek(week = "") {
  const qs = week ? `?week=${encodeURIComponent(week)}` : "";
  const payload = await request("GET", `/api/door/production/daily/week${qs}`);
  return payload.plan ?? payload.data?.plan ?? null;
}

export async function toggleDailyHit(id, week = "") {
  const payload = await request("POST", `/api/door/production/daily/${encodeURIComponent(id)}/toggle`, { week });
  return { plan: payload.plan ?? null, hit: payload.hit ?? null };
}

export async function fetchHitsWeek() {
  const payload = await request("GET", "/api/door/production/hits/week");
  return payload.summary ?? payload.data?.summary ?? null;
}

export async function fetchHits() {
  const payload = await request("GET", "/api/door/production/hits");
  return { week: payload.week ?? "", hits: payload.hits ?? [] };
}

export async function toggleHit(id) {
  const payload = await request("POST", `/api/door/production/hits/${encodeURIComponent(id)}/toggle`, {});
  return payload.hit ?? null;
}
