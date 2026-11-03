import * as db from "@journal-db";
import { saveJournal, updateJournal } from "./db/journal.js";
import { createSmartJournalApplier } from "./smartJournalApplyCore.js";

const apply = createSmartJournalApplier({
  saveJournal,
  updateJournal,
  applyNutrition: db.applySmartNutrition,
  recordHabit: db.recordHabit,
});

export function applySmartAnalysis(args) {
  return apply(args);
}
