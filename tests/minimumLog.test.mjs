import test from 'node:test';
import assert from 'node:assert/strict';
import { hasMinimumLogToday } from '../src/lib/focus/minimumLog.js';

// Alle Zeitpunkte werden lokal konstruiert, damit die Tests in jeder Runtime-Zeitzone
// dasselbe Ergebnis liefern (gespeicherte Journal-`time`-Werte sind UTC-ISO-Strings).
const LOCAL_DAY = [2026, 11, 6]; // 2026-11-06 (Freitag, Woche 2)
const local = (h, min = 0) => new Date(LOCAL_DAY[0], LOCAL_DAY[1] - 1, LOCAL_DAY[2], h, min);
const iso = (h, min = 0) => local(h, min).toISOString();
const NOW = local(12);
const TODAY = '2026-11-06';
const YESTERDAY = '2026-11-05';

const journal = (over = {}) => ({ date: TODAY, text: '4B-Check-in', time: iso(9), ...over });
const habit = (over = {}) => ({ date: TODAY, completion: 'DONE', recorded_at: local(9), ...over });

test('any (Default): 1 Journal-Eintrag ODER 1 Habit-Vollzug des Tages genügt', () => {
  assert.equal(hasMinimumLogToday([journal()], [], NOW), true);
  assert.equal(hasMinimumLogToday([], [habit()], NOW), true);
  assert.equal(hasMinimumLogToday([], [], NOW), false);
  assert.equal(hasMinimumLogToday(undefined, undefined, NOW), false);
});

test('rule journal/habit schränkt die anerkannte Quelle ein', () => {
  assert.equal(hasMinimumLogToday([], [habit()], NOW, { rule: 'journal' }), false);
  assert.equal(hasMinimumLogToday([journal()], [], NOW, { rule: 'habit' }), false);
  assert.equal(hasMinimumLogToday([journal()], [], NOW, { rule: 'journal' }), true);
  assert.equal(hasMinimumLogToday([], [habit()], NOW, { rule: 'habit' }), true);
  assert.equal(hasMinimumLogToday([], [habit()], NOW, { rule: 'any' }), true);
});

test('ungültige Werte werden defensiv behandelt, ohne zu werfen', () => {
  // Ungültige rule fällt auf den Default 'any' zurück.
  assert.equal(hasMinimumLogToday([], [habit()], NOW, { rule: 'nope' }), true);
  // Junk in den Listen überlebt; unpassende Einträge zählen nicht.
  assert.equal(hasMinimumLogToday([null, 'x', { date: TODAY }], [null, { date: TODAY }, { date: TODAY, completion: 'MISSED', recorded_at: local(8) }], NOW), false);
  // Leerer/Whitespace-Text ist kein Eintrag (wie getJournal `filter((e) => e.text)`).
  assert.equal(hasMinimumLogToday([journal({ text: '   ' })], [], NOW), false);
  // Ungültiges now → false, keine Ausnahme; Zahl (ms) wird akzeptiert.
  assert.equal(hasMinimumLogToday([journal()], [], new Date('kein Datum')), false);
  assert.equal(hasMinimumLogToday([journal()], [], NOW.getTime()), true);
  // now undefiniert → aktuelle Zeit (hier ohne Log → false).
  assert.equal(hasMinimumLogToday([], [], undefined), false);
});

test('Mitternachts-Grenze: nur Einträge des heutigen lokalen Kalendertags zählen', () => {
  // 00:05 heute zählt, 23:59 gestern nicht.
  assert.equal(hasMinimumLogToday([journal({ time: iso(0, 5) })], [], NOW), true);
  assert.equal(hasMinimumLogToday([journal({ date: YESTERDAY, time: new Date(2026, 10, 5, 23, 59).toISOString() })], [], NOW), false);
  // Habit-Vollzug gestern zählt nicht.
  assert.equal(hasMinimumLogToday([], [habit({ date: YESTERDAY })], NOW), false);
  // Alt-Doc ohne date-Feld: der Zeitstempel ordnet den Tag zu.
  assert.equal(hasMinimumLogToday([{ text: 'nur Zeitstempel', time: iso(8) }], [], NOW), true);
  assert.equal(hasMinimumLogToday([{ text: 'nur Zeitstempel', time: new Date(2026, 10, 5, 23, 59).toISOString() }], [], NOW), false);
});

test('Zeitzone: UTC-Speicherformat wird lokal bewertet, nicht in UTC', () => {
  // Eintrag mit lokal-gestern 23:30 ist in UTC evtl. derselbe Kalendertag wie heute;
  // entscheidend ist der lokale Tag, hier also gestern → nicht erfüllt.
  const grenzfall = new Date(2026, 10, 5, 23, 30).toISOString();
  assert.equal(hasMinimumLogToday([{ text: 'später Abend', time: grenzfall }], [], NOW), false);
  // Dasselbe Datum-hash-Format (date) entscheidet, wenn time fehlt.
  assert.equal(hasMinimumLogToday([{ date: TODAY, text: 'ohne Zeit' }], [], NOW), true);
});

test('requiredBeforeHour: der Log muss lokal VOR der vollen Stunde existiert haben', () => {
  // Journal: 09:59 zählt, 10:00 nicht mehr.
  assert.equal(hasMinimumLogToday([journal({ time: iso(9, 59) })], [], NOW, { requiredBeforeHour: 10 }), true);
  assert.equal(hasMinimumLogToday([journal({ time: iso(10) })], [], NOW, { requiredBeforeHour: 10 }), false);
  assert.equal(hasMinimumLogToday([journal({ time: iso(11, 30) })], [], NOW, { requiredBeforeHour: 10 }), false);
  // Habit: recorded_at (Firestore-Timestamp mit toDate) vor 10 Uhr genügt …
  assert.equal(hasMinimumLogToday([], [{ date: TODAY, completion: 'DONE', recorded_at: { toDate: () => local(9, 30) } }], NOW, { requiredBeforeHour: 10 }), true);
  assert.equal(hasMinimumLogToday([], [habit({ recorded_at: local(10, 15) })], NOW, { requiredBeforeHour: 10 }), false);
  // … ohne prüfbaren Zeitstempel erfüllt ein Habit die Vor-Stunden-Regel nicht (konservativ),
  // ohne die Option zählt es bis Tagesende.
  assert.equal(hasMinimumLogToday([], [{ date: TODAY, completion: 'DONE' }], NOW, { requiredBeforeHour: 10 }), false);
  assert.equal(hasMinimumLogToday([], [{ date: TODAY, completion: 'DONE' }], NOW), true);
  // Journal ohne Zeitstempel: dito.
  assert.equal(hasMinimumLogToday([{ date: TODAY, text: 'ohne Zeit' }], [], NOW, { requiredBeforeHour: 10 }), false);
});

test('ungültiges requiredBeforeHour wird ignoriert (Tages-Log reicht bis Tagesende)', () => {
  assert.equal(hasMinimumLogToday([{ date: TODAY, text: 'später am Tag' }], [], NOW, { requiredBeforeHour: 24 }), true);
  assert.equal(hasMinimumLogToday([{ date: TODAY, text: 'später am Tag' }], [], NOW, { requiredBeforeHour: 'zehn' }), true);
  assert.equal(hasMinimumLogToday([{ date: TODAY, text: 'später am Tag' }], [], NOW, { requiredBeforeHour: '7' }), false); // '7' ist gültig: 7 Uhr
});

test('rule-Kombination mit requiredBeforeHour bleibt strikt', () => {
  const vorFrist = { rule: 'habit', requiredBeforeHour: 10 };
  assert.equal(hasMinimumLogToday([journal({ time: iso(8) })], [habit({ recorded_at: local(11) })], NOW, vorFrist), false);
  assert.equal(hasMinimumLogToday([], [habit({ recorded_at: local(9) })], local(11), vorFrist), true);
});
