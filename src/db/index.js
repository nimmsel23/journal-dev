// journal-dev Unified DB wrapper (wie fuel-dev)
// Imports the entire fitness-dev database layer (auth, habits, general journal, sessions)
export * from "../../../fitness-app/src/lib/db/index.firestore.js";

// Local nutrition layer (Firestore access to Fuel's nutrition logs)
export {
  getMealsHistory,
  getNutritionLog,
  getNutritionNotesHistory,
} from "../lib/db/firestore/nutrition.js";

// Supplements — kein eigenes journal-dev-Modul dafür, direkt aus fuel-dev
export { getSupplementsHistory } from "@fuel/lib/db/firestore/supplements.js";

// Relax — kein eigenes journal-dev-Modul dafür, direkt aus relax-dev
export { getRelaxSessionHistory } from "@relax/lib/db/firestore/sessions.js";
