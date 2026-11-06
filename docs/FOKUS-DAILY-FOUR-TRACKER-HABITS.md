# Fokus „Daily Four" — Tracker-Habits und Mindest-Log (Stand 2026-11-06)

Ur-Modell (Daniel): **Alles ist ein umfunktioniertes Journal — Datenstand.** Mahlzeit,
Session, Meditation, Memoir sind Einträge auf dem einen Zeitstrahl; die Journal-Timeline
zeigt sie längst alle (Workouts bis Supplements), und auch die Shell zeigt pro Kalendertag
unifiziert, ob (und wo) geloggt wurde (`buildDayMap` in `src/shell/ShellHeader.jsx`, vitalos).
Weekly-Strukturen wie Push/Pull/Legs sind Habits (Frequenz `weekly` + `weekdays`,
`src/views/v2/habitsModel.js`).

## Die Daily Four

| Domain | Quelle (Datenform) | Zähl-Kriterium |
|---|---|---|
| **fitness** | `fitness/{uid}/sessions`, `{ date, exercises, duration, ... }` | Session mit Substanz (Übungen/Dauer/Addons) |
| **fuel** | `nutrition/{uid}/logs/{date}`, `{ date, meals, water_ml }` | Mahlzeit ODER Wasser (wie Daily-Four-Linking) |
| **relax** | `relax/{uid}/sessions/{date}`, `{ date, items }` | Praxis mit Details (Technik/Minuten/Notiz/Reflexion/Fokus) |
| **memoirs** | Journal-Einträge + Habit-Vollzüge + Habit-Journale | nicht-leerer Text bzw. `DONE` |

Entscheidung Daniel 2026-11-06: „fitness(sessions), fuel(Mahlzeiten), relax(Meditation),
journal/habits(memoirs)". Der Memoirs-Begriff existiert in der Habits-UI bereits
(`memoirWrittenIds`, `src/views/Habits/index.jsx`); die Habits↔Journal-Äquivalenz ist als
`fitness/{uid}/habitJournals/{habitId}_{date}` materialisiert.

## Tracker-Habits (unter der Haube)

Für jeden quantitativen Tracker existiert ein verstecktes **System-Habit**:
`fitness/{uid}/habits` mit `hidden: true`, `systemTracker: 'fitness'|'fuel'|'relax'`,
Frequenz `{ type: 'daily', timesPerPeriod: 1 }` (reines Abbild, keine Pflicht-Rhythmik).

- Anlegen: `ensureTrackerHabits()` (idempotent, erzeugt fehlende System-Habits).
- Spiegeln: `syncTrackerHabits(days = 28)` — als Fire-and-forget beim App-Start
  (`index.jsx load()`). Liest je Tages-Datenstand die Bestände und schreibt fehlende
  DONE-Records nach `fitness/{uid}/habitRecords/{uuid}_{date}` mit
  `systemTracker`-Provenance.
- **Nur additiv:** Bestehende Records werden nie verändert oder entfernt; Tage ohne
  Aktivität werden nicht vermerkt. Löscht ein Nutzer eine Mahlzeit (Tombstone), bleibt
  der Spiegel-Vollzug konservativ stehen (konservative Logik, wie beim Mindest-Log).
- **Niemals Zukunft:** `date <= today`, wie `daily_future_completion_not_allowed` im
  Daily-Execution-Modell.
- Sichtbarkeit: System-Habits sind in UI und Daily-Four-Zuordnung unsichtbar
  (`isVisibleHabit`/Filter in `index.jsx`, `DailyFourLayout.jsx`,
  `dailyExecutionModel.js` `normalizeDailyAssignments`).

## Mindest-Log (Fokus-Sperre Stufe 0/1)

- `src/lib/focus/minimumLog.js` — `hasMinimumLogToday(entries, habitCompletions, now, options)`:
  erfüllt, wenn heute lokal mind. 1 Journal-Eintrag ODER 1 Habit-Vollzug existiert;
  `options.rule` ('journal'|'habit'|'any'), `options.requiredBeforeHour` (Log-Zeitpunkt-
  Frist, von Daniel bestätigt). Tracker-Aktivität fließt hier über die gespiegelten
  Habit-Vollzüge ein, sobald `syncTrackerHabits` lief.
- `src/lib/focus/dailyFour.js` — `buildDailyActivity(bundles)` + `hasDailyFourLogToday(activity, now, options)`:
  bewertet die Datenstände direkt (unabhängig vom Spiegel), `options.domains` schränkt
  ein. Tages-Predikate spiegeln die kanonische Semantik aus apps/habits
  (`dailySkillRecordModel.js`/`trackerHabitModel.js`). Keine Uhrzeit-Fristen — dafür ist
  `minimumLog.js` da (zeitgestempelte Quellen).

## Offene Punkte (nicht angenommen)

- Streaks/Stats der System-Habits werden nirgends gerendert, aber Push-Reminder-Backends
  sollten `hidden`-Habits ausschließen (hier: Anstoß bei Reminder-Auswertung prüfen).
- Backfill-Fenster: Standard 28 Tage (wie `getHabits`); ältere Tage bleiben ungespiegelt,
  Mindest-Log bewertet die heutigen Datenstände direkt, ist also unabhängig.
- `hidden`-Habits in evtl. dritten Konsumenten (fitness-dev Ansichten) — dort beim
  ersten Auftreten ebenfalls filtern.
- UI-Anbindung des Mindest-Logs (Stufe-0-Erinnerung) weiterhin offen; Baustein ist pure.
