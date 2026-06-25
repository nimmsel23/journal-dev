#!/usr/bin/env node
/**
 * meal-composer.mjs — Combine ingredients into a meal + save to catalog
 * Usage: node scripts/meal-composer.mjs --name "KLK" --component "Käseleberkäse" 125 --component "Semmel" 65
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_DIR = process.env.AOS_FUEL_DATA_DIR
  ? path.resolve(process.env.AOS_FUEL_DATA_DIR)
  : path.join(process.env.HOME || process.env.USERPROFILE, ".aos", "fuel");
const NUTRITION_CATALOG_PATH = path.join(DATA_DIR, "nutrition", "catalog.json");
const WGER_API = "https://wger.de/api/v2";

async function searchWger(query) {
  return new Promise((resolve, reject) => {
    const url = new URL("/ingredient/", WGER_API);
    url.searchParams.set("search", query);
    url.searchParams.set("limit", "1");

    https
      .get(url.toString(), (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            const result = json.results?.[0];
            if (result) {
              resolve({
                id: result.id,
                name: result.name,
                kcal: result.energy || 0,
                protein: result.protein || 0,
                carbs: result.carbohydrates || 0,
                fat: result.fat || 0,
              });
            } else {
              resolve(null);
            }
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function loadCatalog() {
  if (fs.existsSync(NUTRITION_CATALOG_PATH)) {
    return JSON.parse(fs.readFileSync(NUTRITION_CATALOG_PATH, "utf-8"));
  }
  return { version: 1, updated_at: new Date().toISOString(), items: [] };
}

function saveCatalog(catalog) {
  const dir = path.dirname(NUTRITION_CATALOG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(NUTRITION_CATALOG_PATH, JSON.stringify(catalog, null, 2));
}

async function composeMeal(name, components) {
  let totalKcal = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  const ingredients = [];

  console.log(`\nComposing meal: "${name}"\n`);

  for (const [ingredient, grams] of components) {
    console.log(`→ Searching: ${ingredient} (${grams}g)...`);
    const result = await searchWger(ingredient);

    if (!result) {
      console.log(`  ❌ Not found in wger\n`);
      return null;
    }

    const factor = grams / 100;
    const kcal = Math.round(result.kcal * factor);
    const protein = Math.round(result.protein * factor * 10) / 10;
    const carbs = Math.round(result.carbs * factor * 10) / 10;
    const fat = Math.round(result.fat * factor * 10) / 10;

    console.log(`  ✓ ${result.name}: ${kcal} kcal | ${protein}g P | ${carbs}g C | ${fat}g F\n`);

    totalKcal += kcal;
    totalProtein += protein;
    totalCarbs += carbs;
    totalFat += fat;

    ingredients.push({
      name: result.name,
      wger_id: result.id,
      grams,
      kcal: result.kcal,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
    });
  }

  return {
    name,
    ingredients,
    kcal: totalKcal,
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
  };
}

async function main() {
  const args = process.argv.slice(2);
  let name = null;
  const components = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--name") {
      name = args[++i];
    } else if (args[i] === "--component") {
      components.push([args[++i], parseInt(args[++i])]);
    }
  }

  if (!name || !components.length) {
    console.error("Usage: node meal-composer.mjs --name <name> --component <ingredient> <grams> [--component ...]");
    process.exit(1);
  }

  try {
    const meal = await composeMeal(name, components);
    if (!meal) {
      console.error("Failed to compose meal");
      process.exit(1);
    }

    console.log(`\n${"=".repeat(50)}`);
    console.log(`MEAL: ${meal.name}`);
    console.log(`${"=".repeat(50)}`);
    console.log(`${meal.kcal} kcal | ${meal.protein}g P | ${meal.carbs}g C | ${meal.fat}g F`);
    console.log(`${"=".repeat(50)}\n`);

    const confirm = await new Promise((resolve) => {
      process.stdout.write("Save to catalog? (y/n): ");
      process.stdin.once("data", (data) => {
        process.stdin.destroy();
        resolve(data.toString().trim().toLowerCase() === "y");
      });
    });

    if (!confirm) {
      console.log("Cancelled.");
      process.exit(0);
    }

    // Save to catalog
    const catalog = loadCatalog();
    const id = `meal_${name.toLowerCase().replace(/\s+/g, "_")}`;
    const item = {
      id,
      kind: "meal",
      category: "meal",
      name: meal.name,
      meal_type: "meal",
      description: meal.ingredients.map((i) => `${i.grams}g ${i.name}`).join(" + "),
      notes: "",
      kcal: meal.kcal,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      yield_g: null,
      components: meal.ingredients,
      addons: [],
      default_addon_ids: [],
      source: "wger",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const idx = catalog.items.findIndex((x) => x.id === id);
    if (idx >= 0) {
      catalog.items[idx] = item;
      console.log(`✓ Updated existing meal: ${item.id}`);
    } else {
      catalog.items.push(item);
      console.log(`✓ Added new meal: ${item.id}`);
    }

    catalog.updated_at = new Date().toISOString();
    saveCatalog(catalog);
    console.log(`✓ Saved to: ${NUTRITION_CATALOG_PATH}\n`);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
