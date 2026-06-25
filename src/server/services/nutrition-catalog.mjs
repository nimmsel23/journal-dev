import fs from "fs";
import path from "path";
import YAML from "yaml";
import { NUTRITION_MEALS_DIR } from "../config/paths.mjs";
import { slugifyId } from "../../shared/utils/ids.mjs";

function mealPath(id, ext = ".yaml") {
  return path.join(NUTRITION_MEALS_DIR, `${id}${ext}`);
}

export function loadCatalog() {
  if (!fs.existsSync(NUTRITION_MEALS_DIR)) fs.mkdirSync(NUTRITION_MEALS_DIR, { recursive: true });
  
  // Support both .yaml and .json
  const files = fs.readdirSync(NUTRITION_MEALS_DIR).filter((f) => 
    f.endsWith(".yaml") || f.endsWith(".yml") || f.endsWith(".json")
  );
  
  const items = [];
  const seenIds = new Set();

  for (const file of files) {
    const ext = path.extname(file);
    const id = path.basename(file, ext);
    
    // If we have both .yaml and .json for the same ID, prefer .yaml
    if (seenIds.has(id) && (ext === ".json")) continue;
    
    try {
      const raw = fs.readFileSync(path.join(NUTRITION_MEALS_DIR, file), "utf-8");
      let data;
      if (ext === ".json") {
        data = JSON.parse(raw);
      } else {
        data = YAML.parse(raw);
      }
      items.push(data);
      seenIds.add(id);
    } catch (e) {
      console.warn(`[nutrition-catalog] skip corrupt file ${file}:`, e.message);
    }
  }
  return { items: items.sort((a, b) => (a.name || "").localeCompare(b.name || "")) };
}

export function loadMeal(id) {
  // Check YAML first, then JSON
  const pYaml = mealPath(id, ".yaml");
  const pYml = mealPath(id, ".yml");
  const pJson = mealPath(id, ".json");

  if (fs.existsSync(pYaml)) {
    try { return YAML.parse(fs.readFileSync(pYaml, "utf-8")); } catch { return null; }
  }
  if (fs.existsSync(pYml)) {
    try { return YAML.parse(fs.readFileSync(pYml, "utf-8")); } catch { return null; }
  }
  if (fs.existsSync(pJson)) {
    try { return JSON.parse(fs.readFileSync(pJson, "utf-8")); } catch { return null; }
  }
  return null;
}

export function saveMeal(item) {
  if (!fs.existsSync(NUTRITION_MEALS_DIR)) fs.mkdirSync(NUTRITION_MEALS_DIR, { recursive: true });
  
  item.updated_at = new Date().toISOString();
  
  // Always save as .yaml
  const p = mealPath(item.id, ".yaml");
  fs.writeFileSync(p, YAML.stringify(item, { indent: 2 }), "utf-8");
  
  // If a legacy .json exists, remove it to avoid confusion
  const pJson = mealPath(item.id, ".json");
  if (fs.existsSync(pJson)) {
    try { fs.unlinkSync(pJson); } catch {}
  }
  
  return item;
}

export function deleteMeal(id) {
  for (const ext of [".yaml", ".yml", ".json"]) {
    const p = mealPath(id, ext);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

export function normalizeMeal(input, existingId = null) {
  const name = (input.name || input.description || "").toString().trim();
  if (!name) return null;

  const id = existingId || input.id || slugifyId(name, "meal");

  return {
    id,
    kind:             input.kind || "meal",
    category:         input.category || "meal",
    name,
    alias:            input.alias || null,
    meal_type:        input.meal_type || "meal",
    description:      input.description || name,
    notes:            input.notes || "",
    kcal:             Math.max(0, Math.round((input.kcal ?? 0) * 10) / 10),
    protein:          Math.max(0, Math.round((input.protein ?? 0) * 10) / 10),
    carbs:            Math.max(0, Math.round((input.carbs ?? 0) * 10) / 10),
    fat:              Math.max(0, Math.round((input.fat ?? 0) * 10) / 10),
    yield_g:          input.yield_g || null,
    components:       input.components || [],
    addons:           input.addons || [],
    default_addon_ids: input.default_addon_ids || [],
    source:           input.source || "manual",
    created_at:       input.created_at || new Date().toISOString(),
    updated_at:       new Date().toISOString(),
  };
}

export function addOrUpdateItem(catalog, input) {
  const existing = catalog.items.find((i) => i.id === input.id || i.name === input.name);
  const item = normalizeMeal(input, existing?.id);
  if (!item) return null;
  if (existing) item.created_at = existing.created_at;
  saveMeal(item);
  return item;
}

// Legacy compat — catalog.items is built on the fly, no save needed
export function saveCatalog(_catalog) { /* no-op: individual files are saved directly */ }
