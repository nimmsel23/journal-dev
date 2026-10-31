// gtasks.door.js — Adapter: Door-v2-Funktionen auf Google Tasks, mit denselben Signaturen/Rückgabeformen
// wie potential/plan/production/profit.* (Panels bleiben gleich).
//
// OFFLINE-FIRST: Alle Funktionen lesen und schreiben den lokalen Store (gtasks.store.js, localStorage je uid);
// Google Tasks wird still im Hintergrund abgeglichen (gtasks.sync.js). Nichts hier wartet auf das Netz, nichts
// wirft wegen Offline/abgelaufener Verbindung. Mapping Potential/Plan/Production/Profit auf Google-Listen,
// Notes-Marker und Reihenfolge-Logik: gtasks.model.js. Verdrahtung (Store, Sync, Auslöser): gtasks.local.js.
import { getModel } from "./gtasks.local.js";

export { parseNotes, buildNotes, toItem } from "./gtasks.model.js";

const m = () => getModel();

// ── Potential ──
export const fetchHotlist = (...a) => m().fetchHotlist(...a);
export const addHotlistItem = (...a) => m().addHotlistItem(...a);
export const addNote = (...a) => m().addNote(...a);
export const completeHotlistItem = (...a) => m().completeHotlistItem(...a);
export const deleteHotlistItem = (...a) => m().deleteHotlistItem(...a);
// ── Plan ──
export const fetchDoorWar = (...a) => m().fetchDoorWar(...a);
export const assignQuadrant = (...a) => m().assignQuadrant(...a);
export const selectWeeklyDoor = (...a) => m().selectWeeklyDoor(...a);
// ── Production ──
export const fetchDailyWeek = (...a) => m().fetchDailyWeek(...a);
export const toggleDailyHit = (...a) => m().toggleDailyHit(...a);
export const addDailyHit = (...a) => m().addDailyHit(...a);
export const addHitOnDate = (...a) => m().addHitOnDate(...a);
export const fetchHitsWeek = (...a) => m().fetchHitsWeek(...a);
// ── Profit (nur lesend) ──
export const fetchProfitGtasks = (...a) => m().fetchProfitGtasks(...a);

/** Synchrone Lese-Kerne: die Ansichten starten damit ohne "Lade …"-Zwischenzustand (react-query `initialData`). */
export const peek = {
  hotlist: () => m().peek.hotlist(),
  doorWar: () => m().peek.doorWar(),
  dailyWeek: (...a) => m().peek.dailyWeek(...a),
  hitsWeek: (...a) => m().peek.hitsWeek(...a),
  profit: () => m().peek.profit(),
};
