import { lazy } from "react";
import { NotebookPen, Sparkles, DoorOpen } from "lucide-react";

export const TAB_CONFIG = [
  {
    key: "journal",
    label: "Journal",
    title: "Journal",
    Icon: NotebookPen,
    View: lazy(() => import("./views/JournalVosView.jsx")),
    getProps: (ctx) => ({ date: ctx.activeDate, onDateChange: ctx.setActiveDate, user: ctx.user }),
  },
  {
    // Hash-Alias: #v2 (siehe main.jsx HASH_ALIASES). Rendert ohne App-Header.
    key: "journal-v2",
    label: "Journal v2",
    title: "Journal v2",
    Icon: NotebookPen,
    bare: true,
    View: lazy(() => import("./views/v2/JournalV2View.jsx")),
    getProps: (ctx) => ({ date: ctx.activeDate, onDateChange: ctx.setActiveDate, user: ctx.user, mode: ctx.v2Mode, onModeChange: ctx.setV2Mode }),
  },
  {
    key: "ai-log",
    label: "Smart Log",
    title: "AI Freihand Logging",
    Icon: Sparkles,
    View: lazy(() => import("./views/AiLogVosView.jsx")),
    getProps: (ctx) => ({ date: ctx.activeDate, onDateChange: ctx.setActiveDate, user: ctx.user }),
  },
  {
    key: "door",
    label: "Door",
    title: "The Door Framework",
    Icon: DoorOpen,
    View: lazy(() => import("./views/door/DoorView.jsx")),
    getProps: () => ({}),
  },
];
