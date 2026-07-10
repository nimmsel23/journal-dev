/**
 * journal-dev Standalone-@db — Doppelwrapper über die modularen
 * Firestore-Layer der Nachbar-Repos (gleiches Muster wie vitalos
 * src/shell/db/).
 *
 * Ersetzt den früheren Hard-Alias auf fitness-dev/src/db.firestore.js
 * (toter Monolith) und journal-devs eigenen lib/firestore-db.js-Auth-Flow.
 *
 *   @fitness-db/index.firestore.js → fitness-dev src/lib/db/firestore/*  (alles)
 *   @fuel/lib/db/firestore/*       → fuel-dev Nutrition/Supplements      (selektiv)
 *
 * Firebase-Init ist einmalig: src/lib/firebase.js (journal-eigen, guarded).
 * Der resolveId-Redirect in vite.config.cjs leitet die firebase.js der
 * Nachbar-Repos darauf um.
 */

// Init zuerst evaluieren, damit alle Sub-Repo-Module dieselbe Instanz sehen.
import "../lib/firebase.js";

export * from "@fitness-db/index.firestore.js";

// fuel selektiv — Auth/todayISO/getJournal kommen aus dem fitness-Layer.
export {
  getMealsHistory,
  getSupplementsHistory,
  getNutritionLog,
  getNutritionLogsInRange,
  getSupplementsCatalog,
  getSupplementLog,
  getSupplementStats,
  MICRO_KEYS,
  zeroMicros,
} from "@fuel/lib/db/firestore/index.js";

export {
  getJournal as getNutritionJournal,
  saveJournal as saveNutritionJournal,
} from "@fuel/lib/db/firestore/journal.js";
