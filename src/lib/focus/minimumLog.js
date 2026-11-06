// minimumLog.js — Fokus-Sperrmodus (Stufe 0/1), Baustein „Mindest-Log heute“.
// Siehe ~/vitalos-prod/docs/product-dev/FOKUS-SPERRMODUS.md: Ohne Log des Tages bleiben
// ausgewählte Apps gesperrt; ein Mindest-Log schaltet die Sperre bis Tagesende frei.
// Pure Funktion ohne Imports und ohne UI-Anbindung; der Aufrufer liefert die Daten.
//
// Datenformen (unverändert aus den vorhandenen Layern, siehe Tests):
//   Journal-Einträge — src/lib/db/journal.js (getJournal/normalizeEntry):
//     { date: "YYYY-MM-DD", text: string, time: ISO-String, ... }
//     Zählt nur mit nicht-leerem Text, wie die Lesefunktionen dort `.filter((e) => e.text)`.
//   Habit-Vollzüge — src/views/v2/habitsModel.js (habit.records) bzw.
//     apps/habits Views/Habits/manualHabitTransaction.js:
//     { date: "YYYY-MM-DD", completion: "DONE", recorded_at?: Firestore-Timestamp | Date | ISO-String }
//
// Semantik: erfüllt, wenn heute (lokale Zeitzone des Geräts) mindestens 1 Journal-Eintrag
// ODER 1 Habit-Vollzug des Tages existiert — optionales `requiredBeforeHour` (0–23)
// verlangt zusätzlich, dass der Log lokal VOR dieser vollen Stunde angelegt wurde
// (Beispiel-Regel „4B-Check-in vor 10 Uhr“). Ein Log ohne prüfbaren Zeitstempel kann
// die Vor-Stunden-Bedingung nicht erfüllen (konservativ, Kriterium einer Sperre).
// Semantik von Daniel bestätigt (2026-11-06): Frist gilt für den Log-Zeitpunkt, nicht
// als Gnadenfrist — ein Log nach der Frist erfüllt sie nicht mehr.

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const RULES = ["journal", "habit", "any"];

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Akzeptiert Date, Millisekunden, ISO-String oder Firestore-Timestamp ({toDate}); null bei ungültig.
function toValidDate(v) {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (v && typeof v.toDate === "function") {
    try { return toValidDate(v.toDate()); } catch { return null; }
  }
  if (typeof v === "number" || typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function requiredHour(v) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= 23 ? n : null;
}

// Lokal VOR der vollen Stunde `hour` am selben Kalendertag wie `today`.
function stampedBeforeHour(stamp, today, hour) {
  return hour === null ? true : !!stamp && localDateKey(stamp) === today && stamp.getHours() < hour;
}

// Eintrag gehört zu `today`, wenn `date` ( YYYY-MM-DD ) dahin zeigt — sonst über
// den Zeitstempel, falls `date` fehlt oder unparsebar ist (Alt-Docs).
function entryDay(entry, stamp) {
  const date = String(entry?.date ?? "");
  if (DATE_KEY.test(date)) return date;
  return stamp ? localDateKey(stamp) : null;
}

export function hasMinimumLogToday(entries, habitCompletions, now, options) {
  const rule = RULES.includes(options?.rule) ? options.rule : "any";
  const hour = options?.requiredBeforeHour === undefined ? null : requiredHour(options.requiredBeforeHour);
  const nowDate = now === undefined ? new Date() : toValidDate(now);
  if (!nowDate) return false;
  const today = localDateKey(nowDate);

  const journalDone = Array.isArray(entries) && entries.some((e) => {
    if (!e || typeof e !== "object") return false;
    const text = String(e.text ?? e.content ?? "").trim();
    if (!text) return false;
    const stamp = toValidDate(e.time);
    if (entryDay(e, stamp) !== today) return false;
    return stampedBeforeHour(stamp, today, hour);
  });

  const habitDone = Array.isArray(habitCompletions) && habitCompletions.some((r) => {
    if (!r || typeof r !== "object" || r.completion !== "DONE") return false;
    const day = String(r.date ?? "");
    if (!DATE_KEY.test(day) || day !== today) return false;
    return stampedBeforeHour(toValidDate(r.recorded_at ?? r.time), today, hour);
  });

  if (rule === "journal") return journalDone;
  if (rule === "habit") return habitDone;
  return journalDone || habitDone;
}
