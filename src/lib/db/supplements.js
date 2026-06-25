// supplements.js — STUB layer for the legacy fuel-dev supplements tab.
// All functions return empty defaults so SupplementsView renders without
// crashing in journal-dev.

import { localToday } from "./core.js";

export async function getSupplements(_date = localToday()) {
  return { intakes: [] };
}

export async function getSupplementCatalog() {
  return [];
}

export async function getSupplementStats(_anchor, _days = 30) {
  return { stats: [] };
}

export async function logSupplement(_date, _intake) {
  return { ok: true, stub: true };
}

export async function deleteSupplement(_date, _id) {
  return { ok: true, stub: true };
}

export async function addSupplementToCatalog(_item) {
  return { ok: true, stub: true };
}
