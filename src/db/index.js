// journal-dev Unified DB wrapper (wie fuel-dev)
// Imports the entire fitness-dev database layer (auth, habits, general journal, sessions)
export * from "../../../fitness-dev/src/lib/db/index.firestore.js";

// Selective overrides from fuel-dev's own database layer
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
} from "../../../fuel-dev/src/client/lib/db/firestore/index.js";

export {
  getJournal as getNutritionJournal,
  saveJournal as saveNutritionJournal,
  getNutritionJournalHistory,
} from "../../../fuel-dev/src/client/lib/db/firestore/journal.js";
