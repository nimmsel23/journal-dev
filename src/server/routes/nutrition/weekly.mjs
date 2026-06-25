import path from "path";
import fs from "fs";
import { NUTRITION_DIR } from "../../config/paths.mjs";
import { getMicrosForMeal, zeroMicros, MICRO_KEYS } from "../../services/nutrition-micros.mjs";
import { loadCatalog } from "../../services/nutrition-catalog.mjs";
import { loadCatalog as loadSupplementsCatalog } from "../../services/supplements-catalog.mjs";
import { loadLog as loadSupplementLog } from "../../services/supplements-log.mjs";
import { DACH, getStatus } from "../../../shared/config/dach.mjs";

function getWeekDates(year, week) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(ISOweekStart);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function loadNutritionLog(date) {
  const filePath = path.join(NUTRITION_DIR, `${date}.json`);
  if (fs.existsSync(filePath)) {
    try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch { /* fall through */ }
  }
  return { date, meals: [], water_ml: 0 };
}

function addSupplementMicros(dayTotals, date, supplementCatalogMap) {
  const suppLog = loadSupplementLog(date);
  for (const intake of suppLog.intakes || []) {
    const entry = supplementCatalogMap[intake.supplement_id];
    if (!entry?.micros) continue;
    for (const k of MICRO_KEYS) {
      if (entry.micros[k]) {
        dayTotals[k] = Math.round((dayTotals[k] + entry.micros[k]) * 10) / 10;
      }
    }
  }
}

export default async function weeklyRoute(app) {
  app.get("/nutrition/weekly/:year/:week", async (req, reply) => {
    try {
      const y = parseInt(req.params.year);
      const w = parseInt(req.params.week);

      if (isNaN(y) || isNaN(w) || w < 1 || w > 53) {
        return reply.status(400).send({ ok: false, error: "Invalid year or week" });
      }

      const dates = getWeekDates(y, w);
      const catalog = loadCatalog();
      const suppCatalog = loadSupplementsCatalog();
      const suppCatalogMap = Object.fromEntries(suppCatalog.items.map((i) => [i.id, i]));

      const weekTotals = zeroMicros();
      const dayBreakdown = {};

      for (const date of dates) {
        const log = loadNutritionLog(date);
        const dayTotals = zeroMicros();

        for (const meal of log.meals || []) {
          const catalogEntry = catalog.items.find(
            (i) => (meal.catalog_id && i.id === meal.catalog_id) || i.name === meal.description
          );
          const lookupName = catalogEntry?.name || meal.description;

          const micros = getMicrosForMeal(lookupName);
          if (!micros) {
            // Asynchronously trigger estimation in the background
            import("../../services/nutrition-estimate-micros.mjs").then(({ estimateMicros }) => {
              import("../../services/nutrition-micros.mjs").then(({ saveMicrosForMeal }) => {
                estimateMicros(lookupName).then((est) => {
                  if (Object.keys(est).length > 0) {
                    saveMicrosForMeal(lookupName, est);
                    console.log(`[micros] Background estimation completed for: ${lookupName}`);
                  }
                });
              });
            });
            continue;
          }

          for (const k of MICRO_KEYS) {
            dayTotals[k] = Math.round((dayTotals[k] + (micros[k] || 0)) * 10) / 10;
          }
        }

        addSupplementMicros(dayTotals, date, suppCatalogMap);

        dayBreakdown[date] = dayTotals;
        for (const k of MICRO_KEYS) {
          weekTotals[k] = Math.round((weekTotals[k] + dayTotals[k]) * 10) / 10;
        }
      }

      const status = {};
      for (const [key, dach] of Object.entries(DACH)) {
        const avg = weekTotals[key] / 7;
        status[key] = {
          dach: dach.value,
          unit: dach.unit,
          total_week: Math.round(weekTotals[key] * 10) / 10,
          avg_daily: Math.round(avg * 10) / 10,
          percent_of_dach: Math.round((avg / dach.value) * 100),
          status: getStatus(avg, dach.value),
        };
      }

      return reply.send({ ok: true, year: y, week: w, dates, week_totals: weekTotals, rda_comparison: status, day_breakdown: dayBreakdown });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ ok: false, error: "Internal server error" });
    }
  });
}
