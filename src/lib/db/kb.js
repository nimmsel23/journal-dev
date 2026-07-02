import { api } from "./core";

export async function getExercise(exerciseId) {
  try {
    const data = await api.get("/fitness/exercises/all");
    return (data?.exercises || []).find((ex) => String(ex.exercise_id || ex.id) === String(exerciseId)) || null;
  } catch {
    return null;
  }
}

export async function getAllExercises() {
  try {
    const data = await api.get("/fitness/exercises/all");
    return data?.exercises || [];
  } catch {
    return [];
  }
}

export async function searchExercises(query, limit = 12) {
  const q = String(query || "").trim();
  if (!q) return { ok: true, results: [], query: q, suggestions: [] };
  try {
    const stored = localStorage.getItem('fitness-sessionSources');
    const sources = stored ? JSON.parse(stored) : { wger: true, yuhonas: true, coach: false };
    const active = Object.entries(sources).filter(([, v]) => v).map(([k]) => k).join(',') || 'wger';
    const data = await api.get(`/fitness/search?q=${encodeURIComponent(q)}&limit=${limit}&sources=${active}`);
    return data || { ok: false, results: [], query: q };
  } catch {
    return { ok: false, results: [], query: q };
  }
}

export async function getAnatomy(exerciseId) {
  try {
    const data = await api.get(`/exercise/${encodeURIComponent(exerciseId)}/teaching`);
    return data?.lesson || null;
  } catch {
    return null;
  }
}

export async function getMuscle(muscleId) {
  try { return await api.get(`/fitness/muscles/${encodeURIComponent(muscleId)}`); } catch { return null; }
}

export async function getConfig() {
  try {
    return await api.get("/fitness/config");
  } catch {
    return null;
  }
}

export async function getInbox() {
  try {
    const data = await api.get("/fitness/inbox");
    return data?.exercises || [];
  } catch {
    return [];
  }
}

export async function getGlobalInbox() {
  return getInbox();
}

export async function approveInbox(id) {
  try {
    return await api.post(`/fitness/inbox/${id}/approve`, {});
  } catch {
    return { ok: false };
  }
}

const FAVS_KEY = 'fitness_favourites';

export function getFavourites() {
  try { return JSON.parse(localStorage.getItem(FAVS_KEY) || '[]'); } catch { return []; }
}

export function toggleFavourite(id) {
  const favs = getFavourites();
  const next = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
  localStorage.setItem(FAVS_KEY, JSON.stringify(next));
}

export async function queueForEnrichment(ex) {
  if (!ex || ex.source === 'expert') return;
  try {
    await fetch('http://localhost:9120/inbox/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercise_id: ex.id || ex.exercise_id, name: ex.name || ex.display_name }),
    });
  } catch {}
}

export async function deleteInbox(id) {
  try {
    return await api.delete(`/fitness/inbox/${id}`);
  } catch {
    return { ok: false };
  }
}

export async function sendToInbox(exerciseData) {
  try {
    return await api.post("/fitness/inbox", exerciseData);
  } catch {
    return { ok: false };
  }
}

export async function getGlobalJournalFeed() { return []; }
export async function getAllUserProfiles() { return {}; }
export async function saveCoachFeedback() { return { ok: true }; }
