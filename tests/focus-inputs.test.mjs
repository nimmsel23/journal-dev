import test from 'node:test';
import assert from 'node:assert/strict';
import { collectMinimumLogInputs } from '../src/lib/focus/inputs.js';
import { hasMinimumLogToday } from '../src/lib/focus/minimumLog.js';
import * as focus from '../src/lib/focus/index.js';

// Zeitpunkte lokal konstruieren, damit die Tests in jeder Runtime-Zeitzone
// dasselbe Ergebnis liefern (gespeicherte `time`-Werte sind UTC-ISO-Strings).
const LOCAL_DAY = [2026, 11, 6];
const local = (h, min = 0) => new Date(LOCAL_DAY[0], LOCAL_DAY[1] - 1, LOCAL_DAY[2], h, min);
const iso = (h, min = 0) => local(h, min).toISOString();
const NOW = local(12);
const TODAY = '2026-11-06';

// Firestore-Snapshot-Doc-Fake: data() liefert das Roh-Doc.
const snap = (id, data) => ({ id, data: () => ({ ...data }) });
// Timestamp-Fake wie Firestore ({ toDate }).
const ts = (h, min = 0) => ({ toDate: () => local(h, min) });

test('Fassade index.js exportiert Adapter, Prädikat und Daily-Four-Bausteine', () => {
  assert.equal(focus.collectMinimumLogInputs, collectMinimumLogInputs);
  assert.equal(focus.hasMinimumLogToday, hasMinimumLogToday);
  assert.equal(typeof focus.buildDailyActivity, 'function');
  assert.equal(typeof focus.hasDailyFourLogToday, 'function');
  assert.deepEqual(focus.DAILY_FOUR, ['fitness', 'fuel', 'relax', 'memoirs']);
});

test('bereits normalisierte Daten laufen unverändert durch', () => {
  const entries = [{ date: TODAY, text: '4B-Check-in', time: iso(9) }];
  const habitCompletions = [{ date: TODAY, completion: 'DONE', recorded_at: ts(9) }];
  const result = collectMinimumLogInputs(entries, habitCompletions);
  assert.deepEqual(result.entries, entries);
  assert.deepEqual(result.habitCompletions, habitCompletions);
  assert.equal(hasMinimumLogToday(result.entries, result.habitCompletions, NOW), true);
});

test('Journal-Snapshot-Docs werden wie normalizeEntry gelesen (Alt-Format inklusive)', () => {
  // Neu-Format: { date, text, time }.
  const { entries } = collectMinimumLogInputs([snap('a1', { date: TODAY, text: 'Text', time: iso(8) })]);
  assert.equal(entries[0].text, 'Text');
  assert.equal(entries[0].date, TODAY);
  // Alt-Format: Doc-ID = Datum, Feld content, Zeitstempel nur in updated_at.
  const { entries: alt } = collectMinimumLogInputs([snap(TODAY, { content: 'Alt-Doc', updated_at: ts(7) })]);
  assert.equal(alt[0].text, 'Alt-Doc');
  assert.equal(alt[0].date, TODAY);
  assert.equal(alt[0].time, local(7).toISOString());
  // text schlägt content vor; leeres Textfeld bleibt leer (kein Eintrag).
  const { entries: leer } = collectMinimumLogInputs([snap('a2', { date: TODAY, content: '', time: iso(8) })]);
  assert.equal(leer[0].text, '');
  assert.equal(hasMinimumLogToday(leer, [], NOW), false);
});

test('QuerySnapshot-Wrapper { docs } wird entpackt, fehlende Zeitstempel ergeben kein Datum', () => {
  const { entries } = collectMinimumLogInputs({ docs: [snap('a3', { text: 'nur Wrapper' })] });
  assert.equal(entries.length, 1);
  assert.equal(entries[0].date, '');
  assert.equal(hasMinimumLogToday(entries, [], NOW), false);
});

test('Habit-Vollzüge: Doc-ID liefert das Datum, recorded_at bleibt unverändert', () => {
  // Doc-ID `${habitId}_${date}`, Datum-Feld fehlt.
  const stamped = ts(9);
  const { habitCompletions } = collectMinimumLogInputs(null, [snap('uuid-x_2026-11-06', { completion: 'DONE', recorded_at: stamped })]);
  assert.equal(habitCompletions[0].date, TODAY);
  assert.equal(habitCompletions[0].recorded_at, stamped);
  assert.equal(hasMinimumLogToday([], habitCompletions, NOW), true);
  // Fehlender completion-Wert zählt nicht (konservativ, kein Default DONE).
  const { habitCompletions: offen } = collectMinimumLogInputs(null, [snap('uuid-y_2026-11-06', { recorded_at: ts(9) })]);
  assert.equal(hasMinimumLogToday([], offen, NOW), false);
  // Mehrfach-Vollzüge am selben Tag bleiben alle erhalten.
  const { habitCompletions: doppelt } = collectMinimumLogInputs(null, [
    { date: TODAY, completion: 'DONE', recorded_at: ts(8) },
    { date: TODAY, completion: 'DONE', recorded_at: ts(10) },
  ]);
  assert.equal(doppelt.length, 2);
});

test('junk in den Rohdaten wird still übersprungen bzw. entschärft, statt zu werfen', () => {
  // null/String/Zahl/Dokument mit werfendem data() fallen heraus.
  const { entries } = collectMinimumLogInputs(
    [null, 'x', 7, { data: () => { throw new Error('boom'); } }, snap('ok', { date: TODAY, text: 'gültig', time: iso(9) })],
  );
  assert.equal(entries.length, 1);
  assert.equal(entries[0].text, 'gültig');
  // Leere Objekte laufen als unbrauchbare Datensätze durch (kein Datum, kein
  // completion) — das Prädikat ignoriert sie, wie minimumLog selbst auch.
  const { habitCompletions } = collectMinimumLogInputs(null, [{}, [], { date: TODAY, completion: 'DONE' }]);
  assert.equal(habitCompletions.length, 3);
  assert.equal(hasMinimumLogToday([], habitCompletions, NOW), true);
  assert.equal(hasMinimumLogToday([], [{}, []], NOW), false);
});

test('nicht-Array-/ungültige Argumente ergeben leere Listen, Prädikat bleibt false', () => {
  assert.deepEqual(collectMinimumLogInputs(undefined, null), { entries: [], habitCompletions: [] });
  assert.deepEqual(collectMinimumLogInputs('kein Array', 42), { entries: [], habitCompletions: [] });
  const { entries, habitCompletions } = collectMinimumLogInputs(undefined, undefined);
  assert.equal(hasMinimumLogToday(entries, habitCompletions, NOW), false);
});

test('Round-Trip über die Fassade: Rohdaten → Adapter → hasMinimumLogToday', () => {
  const raw = collectMinimumLogInputs(
    { docs: [snap(TODAY, { content: ' aus dem Alt-Format', updated_at: ts(9, 30) })] },
    [snap('h1_2026-11-05', { completion: 'DONE', recorded_at: ts(9) })],
  );
  assert.equal(focus.hasMinimumLogToday(raw.entries, raw.habitCompletions, NOW), true);
  // Vor-Stunden-Frist: Alt-Doc-Stempel 9:30 erfüllt „vor 10 Uhr“, verfehlt 9 Uhr.
  assert.equal(
    focus.hasMinimumLogToday(raw.entries, [], NOW, { requiredBeforeHour: 10 }),
    true,
  );
  assert.equal(
    focus.hasMinimumLogToday(raw.entries, [], NOW, { requiredBeforeHour: 9 }),
    false,
  );
});
