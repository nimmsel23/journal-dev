// journal-dev Unified DB wrapper (wie fuel-dev)
// Imports the entire fitness-dev database layer (auth, habits, general journal, sessions)
export * from "../../../fitness-dev/src/lib/db/index.firestore.js";

// Local nutrition layer (Firestore access to Fuel's nutrition logs)
export {
  getMealsHistory,
  getNutritionLog,
  getNutritionNotesHistory,
} from "../lib/db/firestore/nutrition.js";
