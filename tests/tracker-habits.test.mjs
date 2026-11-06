import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TRACKER_HABITS, TRACKER_KEYS, isVisibleHabit, visibleHabits,
  hasSessionDetails, isTrackerActive, trackerDatesToWrite,
} from '../apps/habits/src/views/Habits/trackerHabitModel.js';
import {
  DAILY_FOUR, buildDailyActivity, hasDailyFourLogToday,
  isJournalDay, isHabitRecordDay, isNutritionDay, isSessionDay, isRelaxDay,
} from '../src/lib/focus/dailyFour.js';

const TODAY = '2026-11-06';
const YESTERDAY = '2026-11-05';
const NOW = new Date(2026, 10, 6, 12);

// ── Tracker-Habit-Modell (Ur-Modell: alles ein umfunktioniertes Journal) ────────

test('TRACKER_HABITS deckt die Daily Four ab: fitness, fuel, relax (Memoirs sind direkt im Bestand)', () => {
  assert.deepEqual(TRACKER_KEYS, ['fitness', 'fuel', 'relax']);
  assert.equal(TRACKER_HABITS.every((t) => t.key && t.name && t.icon), true);
});

test('Tages-Aktivität je Tracker aus den bestehenden Datenformen', () => {
  // fitness: Sessions mit Substanz zählen, leere nicht
  assert.equal(isTrackerActive('fitness', [{ exercises: [{ name: 'Bench' }] }, { duration: 30 }, { activityAddons: ['x'] }]), true);
  assert.equal(isTrackerActive('fitness', [{ activity: {} }]), false);
  assert.equal(isTrackerActive('fitness', []), false);
  assert.equal(isTrackerActive('fitness', null), false);
  // fuel: Mahlzeit ODER Wasser (wie dailySkillRecordModel/dailyNutritionRecordOption)
  assert.equal(isTrackerActive('fuel', { date: TODAY, meals: [{ description: 'Hafer' }] }), true);
  assert.equal(isTrackerActive('fuel', { date: TODAY, water_ml: 500 }), true);
  assert.equal(isTrackerActive('fuel', { date: TODAY }), false);
  // relax: Praxis mit Details — wortlose leere Übung zählt nicht
  assert.equal(isTrackerActive('relax', { date: TODAY, items: [{ technique: 'Boxen' }, { minutes: 10 }] }), true);
  assert.equal(isTrackerActive('relax', { date: TODAY, items: [{ technique: '   ' }] }), false);
  assert.equal(isTrackerActive('unbekannt', { date: TODAY, meals: [] }), false);
});

test('hasSessionDetails entspricht den Daily-Four-Session-Kriterien', () => {
  assert.equal(hasSessionDetails({ exercises: [{}, {}] }), true);
  assert.equal(hasSessionDetails({ duration_minutes: 45 }), true);
  assert.equal(hasSessionDetails({ activity: { minutes: 20 } }), true);
  assert.equal(hasSessionDetails({}), false);
});

test('System-Habits bleiben in UI und Zuordnung unsichtbar', () => {
  const sichtbar = { uuid: 'a', name: 'Lesen' };
  const gelöscht = { uuid: 'b', deleted: true };
  const tracker = { uuid: 'c', systemTracker: 'fuel', hidden: true };
  const nurHidden = { uuid: 'd', hidden: true };
  assert.deepEqual(visibleHabits([sichtbar, gelöscht, tracker, nurHidden, null]), [sichtbar]);
  assert.equal(isVisibleHabit(sichtbar), true);
  assert.equal(isVisibleHabit(tracker), false);
});

test('trackerDatesToWrite: nur aktive, nicht gespiegelte, nicht-zukünftige Tage (additiv, sortiert)', () => {
  const days = {
    // aktiv, noch nicht gespiegelt → schreiben
    [TODAY]: { date: TODAY, meals: [{ description: 'Mittag' }] },
    [YESTERDAY]: { date: YESTERDAY, water_ml: 750 },
    // aktiv, aber bereits DONE → nicht doppelt
    '2026-11-04': { date: '2026-11-04', meals: [{ description: 'Abend' }] },
    // im Fenster, aber ohne Aktivität → nicht vermerken
    '2026-11-03': { date: '2026-11-03' },
    // Aktivität, aber Zukunft → nicht schreiben
    '2026-11-07': { date: '2026-11-07', meals: [{ description: 'Früh' }] },
    // kaputter Schlüssel → ignorieren
    'unsinn': null,
  };
  assert.deepEqual(
    trackerDatesToWrite({ trackerKey: 'fuel', days, doneDays: new Set(['2026-11-04']), today: TODAY }),
    [YESTERDAY, TODAY]
  );
  // doneDays auch als Array defensiv
  assert.deepEqual(
    trackerDatesToWrite({ trackerKey: 'fuel', days: { [TODAY]: { meals: [{}] } }, doneDays: ['2026-11-06'], today: TODAY }),
    []
  );
  // morgen existiert im Einzelfall nicht im Tages-Set → Ergebnis bleibt leer, nie zukünftig
  assert.deepEqual(
    trackerDatesToWrite({ trackerKey: 'fuel', days: {}, doneDays: undefined, today: TODAY }),
    []
  );
});

// ── Daily Four (Mindest-Log-Wurzel) ────────────────────────────────────────────

test('Daily Four: fitness, fuel, relax, memoirs — Memoirs = Journal und Habit-Vollzüge', () => {
  assert.deepEqual([...DAILY_FOUR], ['fitness', 'fuel', 'relax', 'memoirs']);
  assert.equal(isJournalDay({ date: TODAY, text: '4B-Check-in' }), true);
  assert.equal(isJournalDay({ date: TODAY, text: '   ' }), false);
  assert.equal(isJournalDay({ date: TODAY, content: 'Alt-Doc' }), true);
  assert.equal(isHabitRecordDay({ date: TODAY, completion: 'DONE' }), true);
  assert.equal(isHabitRecordDay({ date: TODAY, completion: 'MISSED' }), false);
  assert.equal(isNutritionDay({ date: TODAY, meals: [] }), false);
  assert.equal(isNutritionDay({ date: TODAY, meals: [{}], water_ml: 0 }), true);
  assert.equal(isSessionDay({ date: TODAY }), false);
  assert.equal(isRelaxDay({ date: TODAY, items: [{ note: 'Stille' }] }), true);
  assert.equal(isRelaxDay({ date: TODAY, items: [] }), false);
});

test('buildDailyActivity sammelt Tages-Sets je Domain (Datenstand, defensiv)', () => {
  const activity = buildDailyActivity({
    journalEntries: [{ date: TODAY, text: 'Memoir' }, { date: TODAY, text: '' }, null, { date: 'unsinn', text: 'x' }],
    habitRecords: [{ date: YESTERDAY, completion: 'DONE' }, { date: TODAY, completion: 'MISSED' }],
    habitJournals: [{ date: TODAY, text: 'Habit-Memoir' }],
    fitnessSessions: [{ date: TODAY, exercises: [{}] }, { date: TODAY, activity: {} }],
    nutritionLogs: [{ date: TODAY, meals: [{}] }, { date: YESTERDAY, water_ml: 300 }, { date: TODAY }],
    relaxLogs: [{ date: TODAY, items: [{ technique: 'Atem' }] }, {}],
  });
  assert.deepEqual({ ...Object.fromEntries(Object.entries(activity).map(([k, s]) => [k, [...s]])) }, {
    fitness: [TODAY],
    fuel: [TODAY, YESTERDAY],
    relax: [TODAY],
    memoirs: [TODAY, YESTERDAY],
  });
  // leere/Junk-Bundles werfen nicht
  assert.equal(hasDailyFourLogToday(buildDailyActivity(), NOW), false);
  assert.equal(hasDailyFourLogToday(null, NOW), false);
});

test('hasDailyFourLogToday: heute geloggt in einer Domain genügt, domains schränken ein', () => {
  const nurFitness = buildDailyActivity({ fitnessSessions: [{ date: TODAY, exercises: [{}] }] });
  const nurFuel = buildDailyActivity({ nutritionLogs: [{ date: TODAY, meals: [{}] }] });
  const nurRelax = buildDailyActivity({ relaxLogs: [{ date: TODAY, items: [{ minutes: 5 }] }] });
  const nurMemoirs = buildDailyActivity({ journalEntries: [{ date: TODAY, text: 'x' }] });
  const gestern = buildDailyActivity({ fitnessSessions: [{ date: YESTERDAY, exercises: [{}] }] });

  assert.equal(hasDailyFourLogToday(nurFitness, NOW), true);
  assert.equal(hasDailyFourLogToday(nurFuel, NOW), true);
  assert.equal(hasDailyFourLogToday(nurRelax, NOW), true);
  assert.equal(hasDailyFourLogToday(nurMemoirs, NOW), true);
  assert.equal(hasDailyFourLogToday(gestern, NOW), false);

  // domains: nur die genannten zählen
  assert.equal(hasDailyFourLogToday(nurFuel, NOW, { domains: ['fuel'] }), true);
  assert.equal(hasDailyFourLogToday(nurFuel, NOW, { domains: ['fitness', 'relax', 'memoirs'] }), false);
  assert.equal(hasDailyFourLogToday(nurMemoirs, NOW, { domains: ['memoirs'] }), true);
  // ungültige domains fallen auf alle vier zurück, zählen also nicht als Sperre
  assert.equal(hasDailyFourLogToday(nurFuel, NOW, { domains: 'quatsch' }), true);

  // Vortag zählt nicht, Mitternachtgrenze liegt beim lokalen Kalendertag
  assert.equal(hasDailyFourLogToday(nurFitness, new Date(2026, 10, 5, 23, 59)), false);
  assert.equal(hasDailyFourLogToday(nurFitness, new Date(2026, 10, 6, 0, 5)), true);
  // ungültiges now → false, keine Ausnahme
  assert.equal(hasDailyFourLogToday(nurFitness, 'kein Datum'), false);
});
