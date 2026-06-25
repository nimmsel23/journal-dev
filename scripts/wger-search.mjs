#!/usr/bin/env node
/**
 * wger-search.mjs — Search wger API for ingredients + get nutrition per 100g
 * Usage: node scripts/wger-search.mjs "Käseleberkäse"
 */

import https from "https";

const WGER_API = "https://wger.de/api/v2";

async function searchWger(query) {
  return new Promise((resolve, reject) => {
    const url = new URL("/ingredient/", WGER_API);
    url.searchParams.set("search", query);
    url.searchParams.set("limit", "10");

    https
      .get(url.toString(), (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(json.results || []);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function normalizeNutrition(item) {
  // wger API returns: energy (kcal), carbohydrates, protein, fat (all per 100g)
  return {
    id: item.id,
    name: item.name,
    kcal: item.energy || 0,
    protein: item.protein || 0,
    carbs: item.carbohydrates || 0,
    fat: item.fat || 0,
  };
}

async function main() {
  const query = process.argv.slice(2).join(" ");
  if (!query) {
    console.error("Usage: node scripts/wger-search.mjs <ingredient>");
    process.exit(1);
  }

  try {
    console.log(`Searching wger for: "${query}"\n`);
    const results = await searchWger(query);

    if (!results.length) {
      console.log("No results found.");
      return;
    }

    results.forEach((item) => {
      const norm = normalizeNutrition(item);
      console.log(`${norm.name} (ID: ${norm.id})`);
      console.log(`  ${norm.kcal} kcal | ${norm.protein}g P | ${norm.carbs}g C | ${norm.fat}g F (per 100g)\n`);
    });
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
