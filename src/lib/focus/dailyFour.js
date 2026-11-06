// dailyFour.js — Fokus-Sperrmodus Stufe 0/1, Baustein „Daily Four“.
// Ur-Modell (Daniel, 2026-11-06): Alles ist ein umfunktioniertes Journal
// (Datenstand) — Mahlzeit, Session, Meditation, Memoir. Die Daily Four, auf die
// ein Mindest-Log prüft:
//   fitness  – Sessions (fitness/{uid}/sessions, { date, exercises, duration, ... })
//   fuel     – Ernährung (nutrition/{uid}/logs/{date}, { date, meals, water_ml })
//   relax    – Meditation (relax/{uid}/sessions/{date}, { date, items })
//   memoirs  – Journal-Einträge ({ date, text }) und Habit-Vollzüge
//              ({ date, completion: "DONE" }); unter der Haube laufen Tracker
//              zusätzlich als versteckte System-Habits (apps/habits
//              trackerHabitModel + syncTrackerHabits) und damit ebenfalls als
//              Habit-Vollzüge auf.
// Tages-Predikate spiegeln die kanonische Semantik aus apps/habits
// (dailySkillRecordModel.js / trackerHabitModel.js): Mahlzeit ODER Wasser zählt,
// Session nur mit Substanz, Relax-Praxis nur mit Details.
// Rein + testbar, keine Imports; die Stunden-Frist (requiredBeforeHour) für
// zeitgestempelte Quellen bietet src/lib/focus/minimumLog.js — diese Auswertung
// arbeitet auf Tages-Kalenderschlüsseln und kennt keine Uhrzeiten.

export const DAILY_FOUR = Object.freeze(["fitness", "fuel", "relax", "memoirs"]);
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

function localDateKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ── Tages-Predikate je Datenform (Datenstand) ───────────────────────────────────

export function isJournalDay(entry) {
  return Boolean(entry && DATE_KEY.test(String(entry.date ?? "")) && String(entry.text ?? entry.content ?? "").trim());
}

export function isHabitRecordDay(record) {
  return Boolean(record && record.completion === "DONE" && DATE_KEY.test(String(record.date ?? "")));
}

export function isNutritionDay(log) {
  const meals = Array.isArray(log?.meals) ? log.meals.length : 0;
  const water = Number(log?.water_ml) || 0;
  return Boolean(log && DATE_KEY.test(String(log.date ?? "")) && (meals > 0 || water > 0));
}

export function isSessionDay(session) {
  const exercises = Array.isArray(session?.exercises) ? session.exercises.length : 0;
  const duration = Number(session?.duration || session?.duration_minutes || session?.activity?.duration || session?.activity?.minutes) || 0;
  const addons = Array.isArray(session?.activityAddons) ? session.activityAddons.length : 0;
  return exercises > 0 || duration > 0 || addons > 0;
}

export function isRelaxDay(log) {
  const items = Array.isArray(log?.items) ? log.items : [];
  const hasDetails = (item) => Boolean(
    String(item?.technique || "").trim() || Number(item?.minutes) > 0
    || String(item?.note || "").trim() || String(item?.reflection || "").trim() || String(item?.focus || "").trim()
  );
  return Boolean(log && DATE_KEY.test(String(log.date ?? "")) && items.some(hasDetails));
}

// ── Daily-Four-Tageskarte ───────────────────────────────────────────────────────
// Sets von Datum-Schlüsseln (YYYY-MM-DD) je Domain; Form kompatibel zur
// Shell-Header-Auswertung (buildDayMap), plus relax und ohne UI-Bindung.

export function buildDailyActivity(bundles = {}) {
  const activity = { fitness: new Set(), fuel: new Set(), relax: new Set(), memoirs: new Set() };
  // pro Domain explizit — bewusst keine generische Schleife, damit die Formen lesbar bleiben
  (Array.isArray(bundles.journalEntries) ? bundles.journalEntries : []).forEach((e) => { if (isJournalDay(e)) activity.memoirs.add(String(e.date)); });
  (Array.isArray(bundles.habitRecords) ? bundles.habitRecords : []).forEach((r) => { if (isHabitRecordDay(r)) activity.memoirs.add(String(r.date)); });
  (Array.isArray(bundles.habitJournals) ? bundles.habitJournals : []).forEach((j) => { if (j && DATE_KEY.test(String(j.date ?? ""))) activity.memoirs.add(String(j.date)); });
  (Array.isArray(bundles.fitnessSessions) ? bundles.fitnessSessions : []).forEach((s) => { if (s && isSessionDay(s) && DATE_KEY.test(String(s.date ?? ""))) activity.fitness.add(String(s.date)); });
  (Array.isArray(bundles.nutritionLogs) ? bundles.nutritionLogs : []).forEach((l) => { if (isNutritionDay(l)) activity.fuel.add(String(l.date)); });
  (Array.isArray(bundles.relaxLogs) ? bundles.relaxLogs : []).forEach((l) => { if (isRelaxDay(l)) activity.relax.add(String(l.date)); });
  return activity;
}

/**
 * Mindest-Log über die Daily Four: erfüllt, wenn heute (lokale Zeitzone) in
 * irgendeiner der erlaubten Domains etwas geloggt wurde.
 * options.domains: Teilmenge von DAILY_FOUR (Default: alle vier).
 */
export function hasDailyFourLogToday(activity, now, options) {
  const today = localDateKey(now === undefined ? new Date() : now instanceof Date ? now : new Date(now));
  if (!today) return false;
  const wanted = Array.isArray(options?.domains) && options.domains.length
    ? options.domains
    : DAILY_FOUR;
  return wanted.some((domain) =>
    DAILY_FOUR.includes(domain) && activity?.[domain] instanceof Set && activity[domain].has(today));
}
