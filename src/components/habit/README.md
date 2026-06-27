# Universal Habit Primitives

Re-Exports der Habit-Komponenten aus `src/views/Habits/` (Symlink zu
`~/fitness-dev/src/views/Habits/`). Ziel: jedes Tab in journal-dev kann
Habits als Tracking-Primitive nutzen, ohne aus dem Habits-Tab zu importieren
oder Code zu duplizieren.

## Idee

Habits sind das **universelle Tracking-Primitive** in VitalOS (siehe
Memory `vitalos_habits_as_universal_primitive.md`). Supplements, Workouts,
Makro-Ziele etc. können alle als Habits modelliert werden.

## Status

- ✅ Re-Export-Layer eingerichtet — keine Code-Duplikation
- ✅ Quelle bleibt unverändert in fitness-dev (kein Doppelpflege)
- ⏳ Noch kein Konsument außer Habits-Tab selbst
- ⏳ Beispiel-Migrationen: Supplements-Tab als Habit-View, Makros-Ziele als Habits

## Nutzung

```jsx
import { HabitItem, HabitForm, ICON_COMPONENTS_MAP } from "../components/habit";
import { getHabits, recordHabit } from "../components/habit";
```

## Wann hier was hinzufügen

- Neue Habit-Variante (z.B. `SupplementHabitItem` mit Dosis-Anzeige) → eigene
  Datei im Ordner, importiert das Basis-`HabitItem` und dekoriert.
- Neue Habit-Operationen (z.B. Bulk-Record) → nicht hier, sondern in
  `src/lib/db/habits.js` ergänzen und hier re-exportieren.
- Stil-Adapter (Fuel-Look) → nicht in fitness-dev ändern, Wrapper-Komponente
  hier (Pattern wie `JournalVosView` / `HabitVosView`).
