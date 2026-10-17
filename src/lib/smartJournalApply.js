// smartJournalApply.js — übernimmt eine Smart-Logger-Analyse (analyzeSmartJournal)
// in Journal, Nutrition-Log (Mahlzeiten, Wasser) und Habits. Gemeinsam genutzt
// von views/AiLogVosView.jsx und views/v2/JournalV2View.jsx.
import * as db from "@journal-db";
import { saveJournal } from "./db/journal.js";

export async function applySmartAnalysis({ date, analysis, habits = [] }) {
  const done = { journal: false, meals: 0, water_ml: 0, habits: [], unmatched: [] };

  if (analysis.journal_entry) {
    await saveJournal(date, analysis.journal_entry, { tags: ["smart-log"] });
    done.journal = true;
  }

  if (analysis.meals.length > 0 || analysis.water_ml > 0) {
    const currentLog = await db.getNutritionLog(date);
    const nextMeals = [
      ...(currentLog?.meals || []),
      ...analysis.meals.map((meal, index) => ({
        id: `smart_${Date.now().toString(36)}_${index}`,
        type: meal.type,
        description: meal.description,
        notes: meal.notes || "Smart Logger",
        kcal: meal.kcal,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        time: new Date().toISOString(),
        catalog_item_id: null,
        catalog_components: [],
        catalog_addon_ids: [],
      })),
    ];
    await db.saveNutritionLog(date, {
      ...currentLog,
      date,
      meals: nextMeals,
      water_ml: Math.max(Number(currentLog?.water_ml || 0), Number(analysis.water_ml || 0)),
    });
    done.meals = analysis.meals.length;
    done.water_ml = analysis.water_ml;
  }

  const byName = new Map(habits.map((h) => [String(h.name || "").trim().toLowerCase(), h]));
  for (const hit of analysis.habits_done) {
    const match = byName.get(hit.name.toLowerCase());
    if (!match?.uuid) {
      done.unmatched.push(hit.name);
      continue;
    }
    await db.recordHabit(match.uuid, date);
    done.habits.push(match.uuid);
  }
  return done;
}
