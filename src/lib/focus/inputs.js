// inputs.js — Fokus-Sperrmodus (Stufe 0/1), Adapter „Rohdaten → Mindest-Log-Eingaben“.
// Siehe ~/vitalos-prod/docs/product-dev/FOKUS-SPERRMODUS.md. Der Adapter nimmt die
// Rohformen, wie sie aus den DB-Layern kommen, und liefert die normalisierten Listen
// für hasMinimumLogToday (minimumLog.js). Rein und ohne Imports, wie die übrigen
// Bausteine; die Fassade src/lib/focus/index.js re-exportiert diese Funktion.
//
// Akzeptierte Rohformen (jeweils Array oder QuerySnapshot-artiger Wrapper { docs }):
//   Journal — src/lib/db/journal.js (getDocsFast auf fitness/{uid}/journal):
//     Firestore-Snapshot-Docs { id, data(): { date, text, tags, time, created_at, updated_at } },
//     mit Lese-Kompat zum Alt-Format (Doc-ID = Datum, Feld `content`) wie normalizeEntry dort:
//     text = text ?? content, Datum aus Doc-ID, wenn das Feld fehlt, Zeitstempel aus
//     updated_at (toDate) übernommen, wenn `time` fehlt.
//     Schon normalisierte Einträge (aus getJournal) laufen unverwertet durch.
//   Habit-Vollzüge — src/views/v2/habitsDb.js (fitness/{uid}/habitRecords) bzw.
//     apps/habits Views/Habits/manualHabitTransaction.js:
//     { date, completion, recorded_at?: Firestore-Timestamp | Date | ISO-String };
//     Doc-ID ist dort `${habitId}_${date}` — fehlt das Feld `date`, wird es aus der
//     Doc-ID abgeleitet.
//
// Abweichend vom Lese-Layer (normalizeEntry fällt bei fehlendem Datum auf das
// lokale Heute zurück) wird hier KEIN Datum erfunden: Einträge ohne prüfbares
// Datum und ohne Zeitstempel liefern kein Datum und zählen damit nicht als
// „heute geloggt“ — konservativ, das ist das Kriterium einer Sperre.

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const DOC_DATE_ID = /_(\d{4}-\d{2}-\d{2})$/;

function toList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.docs)) return raw.docs;
  return [];
}

// Firestore-Snapshot-Doc → Datenobjekt; bereits flache Objekte bleiben, was sie sind.
function payload(item) {
  if (!item || typeof item !== "object") return null;
  if (typeof item.data === "function") {
    try {
      const d = item.data();
      return d && typeof d === "object" ? d : null;
    } catch {
      return null;
    }
  }
  return item;
}

function docId(item, d) {
  const id = item?.id ?? d?.id;
  return typeof id === "string" ? id : "";
}

function stampIso(updated_at) {
  return updated_at?.toDate?.()?.toISOString?.() || "";
}

function normalizeJournalEntry(item) {
  const d = payload(item);
  if (!d || typeof d !== "object") return null;
  const id = docId(item, d);
  const text = d.text ?? d.content ?? "";
  const date = d.date || (DATE_KEY.test(id) ? id : "");
  const time = d.time || stampIso(d.updated_at) || d.date || id;
  const entry = { ...d, text, date, time };
  if (id && d.id === undefined) entry.id = id;
  return entry;
}

function normalizeHabitCompletion(item) {
  const d = payload(item);
  if (!d || typeof d !== "object") return null;
  const id = docId(item, d);
  const docDate = DOC_DATE_ID.exec(id);
  const record = { ...d, date: d.date || (docDate ? docDate[1] : "") };
  if (id && d.id === undefined) record.id = id;
  return record;
}

// Rohdaten → { entries, habitCompletions } für hasMinimumLogToday.
// Junk (null, Strings, Docs ohne Objekt-Daten) fällt still heraus, statt zu werfen.
export function collectMinimumLogInputs(rawEntries, rawHabitCompletions) {
  return {
    entries: toList(rawEntries).map(normalizeJournalEntry).filter(Boolean),
    habitCompletions: toList(rawHabitCompletions).map(normalizeHabitCompletion).filter(Boolean),
  };
}
