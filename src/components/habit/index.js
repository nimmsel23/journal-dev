// Universal Habit Primitives — Source of Truth: habits-dev
// Zugriff via Symlink journal-dev/src/views/Habits/ → habits-dev/src/views/Habits/
// Nutzung:
//   import { HabitItem, HabitForm, ICON_COMPONENTS_MAP } from "../components/habit";

export { default as HabitItem }         from "../../views/Habits/HabitItem.jsx";
export { default as HabitForm }         from "../../views/Habits/HabitForm.jsx";
export { default as HabitStats }        from "../../views/Habits/HabitStats.jsx";
export { default as HabitJournalModal } from "../../views/Habits/HabitJournalModal.jsx";
export { default as HabitSidebar }      from "../../views/Habits/HabitSidebar.jsx";
export { ICON_COMPONENTS_MAP }          from "../../views/Habits/utils.js";

export {
  getHabits, addHabit, deleteHabit, updateHabit,
  recordHabit, unrecordHabit, getHabitRecordsForDate,
  getHabitJournal, getHabitJournalHistory, saveHabitJournal,
} from "../../lib/db/habits.js";
