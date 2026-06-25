import { getMealMicros, upsertMealMicros, getAllMealMicros } from "./nutrition-db.mjs";

export const MICRO_KEYS = [
  "vitamin_a_ug", "vitamin_d_ug", "vitamin_e_mg", "vitamin_k_ug",
  "vitamin_c_mg", "vitamin_b1_mg", "vitamin_b2_mg", "vitamin_b3_mg",
  "vitamin_b5_mg", "vitamin_b6_mg", "vitamin_b7_ug", "folate_ug", "vitamin_b12_ug",
  "calcium_mg", "phosphorus_mg", "magnesium_mg", "iron_mg", "zinc_mg",
  "selenium_ug", "iodine_ug", "potassium_mg", "sodium_mg",
  "omega3_mg",
];

export function zeroMicros() {
  return Object.fromEntries(MICRO_KEYS.map((k) => [k, 0]));
}

// Lookup meal micros by name (case-insensitive, SQLite handles it)
export function getMicrosForMeal(mealName) {
  if (!mealName) return null;
  return getMealMicros(mealName);
}

// Save Gemini-estimated micros for a meal
export function saveMicrosForMeal(mealName, micros, source = "gemini") {
  upsertMealMicros(mealName, micros, source);
}

export function listAllMealMicros() {
  return getAllMealMicros();
}
