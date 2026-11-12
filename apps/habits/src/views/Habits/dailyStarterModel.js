// Ein-Klick-Start für „Dein Tag“: vier vorgeschlagene Gewohnheiten, je eine für
// Doing / Thinking / Feeling / Being. Sie werden als normale Habits angelegt
// (bestehender Datenpfad addHabit) und danach den Ebenen zugeordnet.
import { DAILY_DIMENSIONS } from "./dailyExecutionModel.js";

export const STARTER_HABITS = Object.freeze([
  { dimension: "doing", name: "10 Min. Bewegung", icon: "Footprints" },
  { dimension: "thinking", name: "5 Min. Lesen", icon: "BookOpen" },
  { dimension: "feeling", name: "Kurz Journal schreiben", icon: "Heart" },
  { dimension: "being", name: "2 Min. Atmen", icon: "Wind" },
]);

const sameName = (a, b) => String(a || "").trim().toLocaleLowerCase("de") === String(b || "").trim().toLocaleLowerCase("de");

// Welche Starter-Habits müssen noch angelegt werden? Gleichnamige aktive Habits
// werden wiederverwendet, damit ein wiederholter Klick (z. B. nach einem
// Verbindungsabbruch) nichts doppelt anlegt.
export function planStarterHabits(habits) {
  const active = (habits || []).filter((habit) => habit && !habit.deleted && !habit.hidden);
  const taken = new Set();
  return STARTER_HABITS.map((starter) => {
    const existing = active.find((habit) => !taken.has(habit.uuid) && sameName(habit.name, starter.name));
    if (existing) taken.add(existing.uuid);
    return { ...starter, existingId: existing?.uuid || null };
  });
}

export function starterAssignments(planned, idsByDimension) {
  return Object.fromEntries(DAILY_DIMENSIONS.map(({ key }) => {
    const habitId = idsByDimension[key] || planned.find((item) => item.dimension === key)?.existingId;
    if (!habitId) throw new Error(`starter_habit_${key}_missing`);
    return [key, { habitId, skillLinks: [] }];
  }));
}
