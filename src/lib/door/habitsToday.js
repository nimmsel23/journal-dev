// habitsToday.js — „Habits, Planner und The Door verbinden" (roadmap p2-habits,
// Phase 02): Lesefassade der heutigen Habit-Vollzüge für das Production-Panel
// (Door v2). Quelle-unabhängig wie die Reviews aus dem Journal
// (profitFromJournal.js): gelesen wird der gemeinsame Habits-SOT
// (fitness/{uid}/habits + habitRecords über getHabitsRange, cache-first und
// damit offline-tauglich) — die Door-Quelle (Backend/Google Tasks/Taskwarrior)
// bleibt unberührt. NUR Lesen: der Vollzug bleibt im Journal/Habits-UI, es
// gibt keinen zweiten Write-Pfad; damit verweisen Journal und Door auf
// dieselben Datensätze, und alles bleibt Free-Kern (kein Premium, kein KI).
// Vollzüge des Tages: getHabitsRange(today, today) liefert nur heute-datierte
// Records; sichtbar sind keine gelöschten/versteckten/Tracker-System-Habits
// (Regel wie trackerHabitModel.isVisibleHabit in apps/habits) und nur heute
// fällige Habits (dueOnDate wie habitsModel.habitStats).
import { getHabitsRange } from "../../views/v2/habitsDb.js";
import { dueOnDate } from "../../views/v2/habitsModel.js";
import { localToday } from "../db/core.js";

const isVisibleHabit = (habit) => Boolean(habit) && !habit.deleted && !habit.hidden && !habit.systemTracker;

/** Sichtbare, heute fällige Habits mit heutigem DONE-Stand; leer ohne uid. */
export async function fetchHabitsToday(uid) {
  if (!uid) return [];
  const today = localToday();
  const habits = await getHabitsRange(today, today);
  return habits
    .filter((h) => isVisibleHabit(h) && dueOnDate(h, today))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.name).localeCompare(String(b.name)))
    .map((h) => ({ uuid: h.uuid, name: h.name, icon: h.icon || "Activity", done: h.hasRecord(today) }));
}
