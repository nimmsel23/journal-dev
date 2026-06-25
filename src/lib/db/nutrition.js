// nutrition.js — STUB layer for the legacy fuel-dev nutrition tabs.
//
// journal-dev's mission is journal + habits (firestore-backed) — the
// fuel tabs (Dashboard/Food/Calendar/Fuel-Log/Mikros) are kept around for
// continuity but talk to the existing api.js / firestore-db.js shim. The
// functions exported here cover the additional surface the @db barrel
// promises, returning empty defaults so views render without crashing.

import { localToday } from "./core.js";

// Re-export the cloud-aware HTTP wrappers so views can do
//   import { fetchJson, postJson } from "@db"
// instead of "../lib/api.js".
export { fetchJson, postJson, patchJson, deleteJson } from "../api.js";

export async function getNutritionDay(_date = localToday()) {
  return { meals: [], total: { kcal: 0, protein: 0, carbs: 0, fat: 0 } };
}

export async function getMacroTrend(days = 10) {
  return Array.from({ length: days }, (_, i) => ({
    day: String(i + 1).padStart(2, "0"),
    kcal: 0, protein: 0, carbs: 0, fat: 0,
  }));
}

export async function getNutritionCatalog() { return []; }
export async function searchFood(_q, _limit = 20) { return []; }
export async function logMeal(_date, _meal) { return { ok: true, stub: true }; }
export async function updateMeal(_date, _mealId, _patch) { return { ok: true, stub: true }; }
export async function deleteMeal(_date, _mealId) { return { ok: true, stub: true }; }

// Free-text "Fuel-Log" (was JournalView in fuel-dev — the Tagebuch textarea).
// Kept Firestore-free: writes go through the legacy api.js fastify path when
// the local backend is up, otherwise we return an empty string and noop saves.
export async function getNutritionJournal(_date = localToday()) {
  return { content: "" };
}
export async function saveNutritionJournal(_date, _content) {
  return { ok: true, stub: true };
}

export async function getMicrosWeekly(_year, _week) {
  return { items: [] };
}
