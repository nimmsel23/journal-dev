// index.js — Fassade über die Fokus-Bausteine (Stufe 0/1 des Fokus-Sperrmodus,
// ~/vitalos-prod/docs/product-dev/FOKUS-SPERRMODUS.md). Re-exportiert bewusst nur,
// ohne eigene Logik: Aufrufer importieren von "src/lib/focus" statt aus den
// Einzeldateien, damit sich die interne Aufteilung (minimumLog/inputs/dailyFour)
// ändern kann, ohne Aufrufer anzufassen.
//
//   collectMinimumLogInputs(rawEntries, rawHabitCompletions) — inputs.js
//     Rohdaten (Firestore-Snapshots/Legacy-Docs) → normalisierte Eingaben.
//     Danach hasMinimumLogToday(inputs.entries, inputs.habitCompletions, now, options).
//   hasMinimumLogToday(entries, habitCompletions, now, options) — minimumLog.js
//     Mindest-Log heute (Journal-Eintrag ODER Habit-Vollzug), optionale
//     Vor-Stunden-Frist (requiredBeforeHour).
//   buildDailyActivity(bundles) / hasDailyFourLogToday(activity, now, options) —
//     dailyFour.js, Tages-Kalenderschlüssel je Domain (fitness/fuel/relax/memoirs).

export { collectMinimumLogInputs } from "./inputs.js";
export { hasMinimumLogToday } from "./minimumLog.js";
export {
  DAILY_FOUR,
  buildDailyActivity,
  hasDailyFourLogToday,
  isHabitRecordDay,
  isJournalDay,
  isNutritionDay,
  isRelaxDay,
  isSessionDay,
} from "./dailyFour.js";
