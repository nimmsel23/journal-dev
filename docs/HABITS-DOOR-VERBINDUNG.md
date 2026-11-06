# HABITS-DOOR-VERBINDUNG (roadmap p2-habits, Phase 02)

Auftrag: „Habits, Planner und The Door verbinden" — Aufgaben: Habit-Execution
und Planner-Relation definieren; Hotlist und Aufgabenansichten verknüpfen.
Abnahme: Habits und Planner funktionieren ohne Premium; Journal und The Door
verweisen konsistent auf dieselben Datensätze.

## Definition der Relation (v1, umgesetzt)

- **Habits** = wiederkehrender Vollzug. SOT: `fitness/{uid}/habits` +
  `habitRecords` (DONE-Records mit Datum; Tracker-System-Habits versteckt mit
  Provenance, s. `apps/habits/src/views/Habits/trackerHabitModel.js`).
- **Planner / The Door** = Wochenproduktion in vier Phasen
  (Potential/Plan/Production/Profit), Datenquelle austauschbar
  (Backend, Google Tasks, Taskwarrior — `lib/door/source.js`).
- **Verbindung v1:** Der Habits-Bestand ist in der Door **sichtbar**, der
  Vollzug bleibt im Journal/Habits-UI. Das Production-Panel zeigt „Habits
  heute"": sichtbare, heute fällige Habits mit DONE-Stand, quelle-unabhängig
  gelesen aus dem gemeinsamen Habits-SOT
  (`lib/door/habitsToday.js`, cache-first via `getHabitsRange`).
  Muster: Reviews aus dem Journal im Profit-Panel
  (`lib/door/profitFromJournal.js`) — Door-Panels zeigen Journal-Bestand
  quelle-unabhängig, ohne die gewählte Door-Quelle zu berühren.
- **Kein zweiter Write-Pfad:** Aus der Door wird der Habit-Status NIEMALS
  geschrieben. Damit verweisen Journal und The Door konsistent auf dieselben
  Datensätze, und nichts von der Verbindung ist Premium (Free-Kern komplett
  manuell nutzbar, kein KI, kein Functions-Bedarf).

## Bewusst NICHT (spätere Owner-Entscheidung)

- Schreib-Synchronisation in die Door-Quellen (Verträge REST/gtasks/
  Taskwarrior würden Schema-Anforderungen an Fremdsysteme stellen).
- Zweiseitige Spiegelung (Habit-DONE erzeugt/aktualisiert Daily Hit o. ä.).
- Rückverweis am Potential-Item auf den Journal-Eintrag (`+hot`-Brücke bleibt
  Titel-Extraktion, `lib/door/hotFromJournal.js`).

## Orte

- `src/lib/door/habitsToday.js` — Lesefassade (Provider-frei, testbar).
- `src/views/door/v2/DoorV2Panels.jsx` — `HabitsToday`-Sektion im
  Production-Panel (nur Ansicht, Tooltip nennt den Vollzug-Ort).
