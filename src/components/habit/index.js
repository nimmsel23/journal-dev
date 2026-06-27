// Universal Habit Primitives — Re-Exports der Habit-Komponenten aus
// src/views/Habits/ (Symlink → ~/fitness-dev/src/views/Habits/).
//
// Zweck: Andere Tabs (Supplements, Fitness, Makros) sollen Habits als
// Tracking-Primitive nutzen können, ohne aus dem Habits-Tab zu importieren.
// Quelle bleibt unverändert in fitness-dev — kein Doppelpflege, kein Fork.
//
// Nutzung:
//   import { HabitItem, HabitForm, ICON_COMPONENTS_MAP } from "@/components/habit";

export { default as HabitItem }         from "../../views/Habits/HabitItem.jsx";
export { default as HabitForm }         from "../../views/Habits/HabitForm.jsx";
export { default as HabitStats }        from "../../views/Habits/HabitStats.jsx";
export { default as HabitJournalModal } from "../../views/Habits/HabitJournalModal.jsx";
export { default as HabitSidebar }      from "../../views/Habits/HabitSidebar.jsx";
export { ICON_COMPONENTS_MAP }          from "../../views/Habits/utils.js";

// Data-Layer Re-Exports — direkter Pfad zu Habit-CRUD ohne @db-Barrel-Roundtrip.
export {
  getHabits, addHabit, deleteHabit, updateHabit,
  recordHabit, unrecordHabit, getHabitRecordsForDate,
  getHabitJournal, getHabitJournalHistory, saveHabitJournal,
} from "../../lib/db/habits.js";
