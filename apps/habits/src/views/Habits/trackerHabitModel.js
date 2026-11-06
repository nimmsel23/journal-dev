// trackerHabitModel.js — Ur-Modell „alles ist ein umfunktioniertes Journal“:
// Jeder quantitative Tracker (Fitness-Session, Mahlzeit, Meditation) bekommt
// unter der Haube ein verstecktes System-Habit; Tages-Aktivität wird als
// DONE-Vollzug in habitRecords gespiegelt. Damit bildet sich die Daily Four
// einheitlich als Habits-Bestand: fitness, fuel, relax + Memoirs
// (Journal-Einträge/Habit-Vollzüge, s. Views memoir-Flow).
// Rein + testbar; die Writes macht src/db/index.js (nur additiv, mit Provenance).
// Quellen der Formen: fitness/{uid}/sessions (listSessionsForDate),
// nutrition/{uid}/logs/{date} ({ meals, water_ml }), relax/{uid}/sessions/{date}
// ({ items }), fitness/{uid}/habitRecords/{habitId}_{date}.

import { hasDailySkillRecordData } from "./dailySkillRecordModel.js";

export const TRACKER_HABITS = Object.freeze([
  { key: "fitness", name: "Training (Tracker)", icon: "Dumbbell" },
  { key: "fuel", name: "Ernährung (Tracker)", icon: "Utensils" },
  { key: "relax", name: "Meditation (Tracker)", icon: "Brain" },
]);
export const TRACKER_KEYS = Object.freeze(TRACKER_HABITS.map((t) => t.key));

// Frequenz wie habitsModel.DEFAULT_FREQUENCY: täglich, 1x — Tracker-Habits sind
// reine Abbilder („heute geloggt ja/nein“), keine Pflicht-Rhythmik.
export const TRACKER_FREQUENCY = Object.freeze({ type: "daily", weekdays: [], timesPerPeriod: 1 });

export function isTrackerHabit(habit) {
  return TRACKER_KEYS.includes(habit?.systemTracker);
}

/** Sichtbar in Habits-UI und Daily-Four-Zuordnung ist nur, was nicht gelöscht und kein System-Habit ist. */
export function isVisibleHabit(habit) {
  return Boolean(habit) && !habit.deleted && !habit.hidden && !isTrackerHabit(habit);
}

export function visibleHabits(habits) {
  return (Array.isArray(habits) ? habits : []).filter(isVisibleHabit);
}

// Session zählt, wenn sie Substanz hat — gleiche Kriterien wie
// getDailyFitnessSessionOptions (src/db/index.js).
export function hasSessionDetails(session) {
  const exerciseCount = Array.isArray(session?.exercises) ? session.exercises.length : 0;
  const duration = Number(session?.duration || session?.duration_minutes || session?.activity?.duration || session?.activity?.minutes) || 0;
  const addons = Array.isArray(session?.activityAddons) ? session.activityAddons.length : 0;
  return exerciseCount > 0 || duration > 0 || addons > 0;
}

// Tages-Aktivität je Tracker aus den bestehenden Datenformen (Datenstand).
// fitness: Array von Sessions des Tages; fuel/relax: Tages-Doc.
export function isTrackerActive(trackerKey, dayLog) {
  if (trackerKey === "fitness") return Array.isArray(dayLog) && dayLog.some(hasSessionDetails);
  if (trackerKey === "fuel") return hasDailySkillRecordData("nutrition", dayLog);
  if (trackerKey === "relax") return hasDailySkillRecordData("relax", dayLog);
  return false;
}

/**
 * Tage, für die ein Spiegel-Vollzug zu schreiben ist: Tage mit Aktivität im
 * Fenster (date <= today), die noch kein DONE des System-Habits haben.
 * Nur additiv: fehlende Tracker-Daten löschen NIEMALS bestehende Vollzüge.
 * days: { [date]: dayLog }, doneDays: Set(date) des Tracker-Habits.
 */
export function trackerDatesToWrite({ trackerKey, days, doneDays, today }) {
  const done = doneDays instanceof Set ? doneDays : new Set(doneDays || []);
  return (Object.entries(days || {}))
    .filter(([date, log]) =>
      /^\d{4}-\d{2}-\d{2}$/.test(date)
      && String(today || "") >= date
      && isTrackerActive(trackerKey, log)
      && !done.has(date))
    .map(([date]) => date)
    .sort((a, b) => a.localeCompare(b));
}
