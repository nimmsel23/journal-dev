import { lazy } from "react";
import { NotebookPen, Sparkles } from "lucide-react";

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
    key: "ai-log",
    label: "Smart Log",
    title: "AI Freihand Logging",
    Icon: Sparkles,
    View: lazy(() => import("./views/AiLogVosView.jsx")),
    getProps: (ctx) => ({ date: ctx.activeDate, user: ctx.user }),
  },
];
