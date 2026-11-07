// Editierbare Start-Habits fuer neue Nutzer. Werden nur angelegt, wenn das
// Konto noch keine persoenlichen Habit-Dokumente hat (auch geloeschte zaehlen).
export const DEFAULT_STARTER_HABITS = [
  {
    id: "vitalos-starter-body-movement",
    name: "10.000 Steps or 1 hr Workout everyday",
    icon: "Footprints",
    category: "body",
    frequency: { type: "daily", weekdays: [], timesPerPeriod: 1 },
    order: 0,
  },
  {
    id: "vitalos-starter-being-practice",
    name: "Meditate or pray everyday",
    icon: "Brain",
    category: "being",
    frequency: { type: "daily", weekdays: [], timesPerPeriod: 1 },
    order: 1,
  },
];
