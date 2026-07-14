import { lazy } from "react";
import { NotebookPen, CheckSquare } from "lucide-react";

export const TAB_CONFIG = [
  {
    key: "journal",
    label: "Journal",
    title: "Journal",
    Icon: NotebookPen,
    View: lazy(() => import("./views/JournalVosView.jsx")),
    getProps: (ctx) => ({ date: ctx.activeDate, user: ctx.user }),
  },
  {
    key: "habits",
    label: "Habits",
    title: "Habits",
    Icon: CheckSquare,
    View: lazy(() => import("./views/HabitVosView.jsx")),
    getProps: (ctx) => ({ date: ctx.activeDate }),
  },
];
