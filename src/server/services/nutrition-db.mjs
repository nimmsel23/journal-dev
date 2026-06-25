import Database from "better-sqlite3";
import { NUTRITION_DB_PATH } from "../config/paths.mjs";

let db = null;

function getDb() {
  if (!db) {
    db = new Database(NUTRITION_DB_PATH);
    db.pragma("journal_mode = WAL");
    initDb();
  }
  return db;
}

function initDb() {
  const db = getDb();

  // Wger ingredient cache — macros per 100g
  db.exec(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id         INTEGER PRIMARY KEY,
      wger_id    INTEGER UNIQUE,
      name       TEXT NOT NULL,
      brand      TEXT,
      kcal       REAL,
      protein    REAL,
      carbs      REAL,
      fat        REAL,
      fiber      REAL,
      sodium_mg  REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_ingredients_wger_id ON ingredients(wger_id);
    CREATE INDEX IF NOT EXISTS idx_ingredients_name    ON ingredients(name COLLATE NOCASE);
  `);

  // Meal micronutrient profiles — Gemini-estimated absolute values per meal as eaten
  db.exec(`
    CREATE TABLE IF NOT EXISTS meal_micros (
      id               INTEGER PRIMARY KEY,
      meal_name        TEXT UNIQUE NOT NULL,
      vitamin_b12_ug   REAL DEFAULT 0,
      calcium_mg       REAL DEFAULT 0,
      iron_mg          REAL DEFAULT 0,
      vitamin_d_ug     REAL DEFAULT 0,
      vitamin_e_mg     REAL DEFAULT 0,
      folate_ug        REAL DEFAULT 0,
      magnesium_mg     REAL DEFAULT 0,
      zinc_mg          REAL DEFAULT 0,
      sodium_mg        REAL DEFAULT 0,
      potassium_mg     REAL DEFAULT 0,
      vitamin_c_mg     REAL DEFAULT 0,
      vitamin_b6_mg    REAL DEFAULT 0,
      vitamin_b1_mg    REAL DEFAULT 0,
      vitamin_b2_mg    REAL DEFAULT 0,
      phosphorus_mg    REAL DEFAULT 0,
      selenium_ug      REAL DEFAULT 0,
      iodine_ug        REAL DEFAULT 0,
      source           TEXT DEFAULT 'gemini',
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_meal_micros_name ON meal_micros(meal_name COLLATE NOCASE);
  `);

  // Migrate existing DBs: add new columns if they don't exist yet
  const newCols = [
    "vitamin_a_ug REAL DEFAULT 0",  "vitamin_k_ug REAL DEFAULT 0",
    "vitamin_c_mg REAL DEFAULT 0",  "vitamin_b1_mg REAL DEFAULT 0",
    "vitamin_b2_mg REAL DEFAULT 0", "vitamin_b3_mg REAL DEFAULT 0",
    "vitamin_b5_mg REAL DEFAULT 0", "vitamin_b6_mg REAL DEFAULT 0",
    "vitamin_b7_ug REAL DEFAULT 0", "phosphorus_mg REAL DEFAULT 0",
    "selenium_ug REAL DEFAULT 0",   "iodine_ug REAL DEFAULT 0",
    "omega3_mg REAL DEFAULT 0",
  ];
  for (const col of newCols) {
    try { db.exec(`ALTER TABLE meal_micros ADD COLUMN ${col}`); } catch { /* column exists */ }
  }
}

// ── Ingredients (wger cache) ──────────────────────────────────────────────────

export function upsertIngredient(wgerId, data) {
  return getDb().prepare(`
    INSERT INTO ingredients (wger_id, name, brand, kcal, protein, carbs, fat, fiber, sodium_mg)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(wger_id) DO UPDATE SET
      name = excluded.name, brand = excluded.brand,
      kcal = excluded.kcal, protein = excluded.protein,
      carbs = excluded.carbs, fat = excluded.fat,
      fiber = excluded.fiber, sodium_mg = excluded.sodium_mg,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    wgerId, data.name, data.brand || null,
    data.kcal ?? null, data.protein ?? null,
    data.carbs ?? null, data.fat ?? null,
    data.fiber ?? null, data.sodium_mg ?? null
  );
}

export function getIngredientByWgerId(wgerId) {
  return getDb().prepare("SELECT * FROM ingredients WHERE wger_id = ?").get(wgerId) || null;
}

// ── Meal micros ───────────────────────────────────────────────────────────────

const MICRO_COLS = [
  "vitamin_a_ug", "vitamin_d_ug", "vitamin_e_mg", "vitamin_k_ug",
  "vitamin_c_mg", "vitamin_b1_mg", "vitamin_b2_mg", "vitamin_b3_mg",
  "vitamin_b5_mg", "vitamin_b6_mg", "vitamin_b7_ug", "folate_ug", "vitamin_b12_ug",
  "calcium_mg", "phosphorus_mg", "magnesium_mg", "iron_mg", "zinc_mg",
  "selenium_ug", "iodine_ug", "potassium_mg", "sodium_mg",
  "omega3_mg",
];

export function upsertMealMicros(mealName, micros, source = "gemini") {
  const db = getDb();
  const vals = MICRO_COLS.map((c) => micros[c] ?? 0);
  const sets = MICRO_COLS.map((c) => `${c} = excluded.${c}`).join(", ");

  db.prepare(`
    INSERT INTO meal_micros (meal_name, ${MICRO_COLS.join(", ")}, source)
    VALUES (?, ${MICRO_COLS.map(() => "?").join(", ")}, ?)
    ON CONFLICT(meal_name) DO UPDATE SET
      ${sets}, source = excluded.source, updated_at = CURRENT_TIMESTAMP
  `).run(mealName, ...vals, source);
}

export function getMealMicros(mealName) {
  return getDb()
    .prepare("SELECT * FROM meal_micros WHERE meal_name = ? COLLATE NOCASE")
    .get(mealName) || null;
}

export function getAllMealMicros() {
  return getDb().prepare("SELECT * FROM meal_micros ORDER BY meal_name").all();
}

export default { getDb, upsertIngredient, getIngredientByWgerId, upsertMealMicros, getMealMicros, getAllMealMicros };
