import { lazy } from "react";
import { Flame, NotebookPen, CheckSquare, UtensilsCrossed, FileText, CalendarDays, Pill, Microscope, Settings2 } from "lucide-react";

export const TAB_CONFIG = [
  {
    key: "dashboard",
    label: "Dashboard",
    Icon: Flame,
    View: lazy(() => import("@fuel/views/DashboardView.jsx")),
    getProps: (ctx) => ({ nutrition: ctx.nutrition, sup: ctx.sup, journal: ctx.journal, macroTrend: ctx.macroTrend }),
  },
  {
    key: "journal",
    label: "Journal",
    Icon: NotebookPen,
    View: lazy(() => import("./views/JournalVosView.jsx")),
    getProps: (ctx) => ({ date: ctx.activeDate }),
  },
  {
    key: "habits",
    label: "Habits",
    Icon: CheckSquare,
    View: lazy(() => import("./views/HabitVosView.jsx")),
    getProps: (ctx) => ({ date: ctx.activeDate }),
  },
  {
    key: "food",
    label: "Food",
    Icon: UtensilsCrossed,
    View: lazy(() => import("@fuel/views/FoodView.jsx")),
    getProps: (ctx) => ({ activeDate: ctx.activeDate, setActiveDate: ctx.setActiveDate, nutrition: ctx.nutrition }),
  },
  {
    key: "log",
    label: "Log",
    Icon: FileText,
    View: lazy(() => import("@fuel/views/LogView.jsx")),
    getProps: (ctx) => ({ date: ctx.activeDate, nutrition: ctx.nutrition, journal: ctx.journal || "" }),
  },
  {
    key: "calendar",
    label: "Big Calendar",
    Icon: CalendarDays,
    View: lazy(() => import("@fuel/views/CalendarView.jsx")),
    getProps: (ctx) => ({ date: ctx.activeDate, nutrition: ctx.nutrition }),
  },
  {
    key: "supplements",
    label: "Supplements",
    Icon: Pill,
    View: lazy(() => import("@fuel/views/SupplementsView.jsx")),
    getProps: (ctx) => ({ date: ctx.activeDate, sup: ctx.sup, catalog: ctx.suppCatalog || [], suppLog: ctx.suppLog }),
  },
  {
    key: "micros",
    label: "Mikros",
    Icon: Microscope,
    View: lazy(() => import("@fuel/views/MicrosView.jsx")),
    getProps: () => ({}),
  },
  {
    key: "settings",
    label: "Setup",
    Icon: Settings2,
    View: lazy(() => import("@fuel/views/SettingsView.jsx")),
    getProps: () => ({}),
  },
];
