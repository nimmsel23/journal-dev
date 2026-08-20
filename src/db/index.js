// journal-dev Unified DB wrapper (wie fuel-dev)
// Imports the entire fitness-dev database layer (auth, habits, general journal, sessions)
export * from "@fitness-db/index.firestore.js";

// Der modulare fitness-app Firestore-Barrel exportiert aktuell keine
// Habit-CRUD-Helpers mehr. journal-dev nutzt getHabits weiterhin fuer die
// Timeline-Anreicherung und zieht den kompatiblen Export daher aus dem
// VitalOS-SSOT nach.
export { getHabits } from "../../../src/cloud/db.firestore.js";

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
