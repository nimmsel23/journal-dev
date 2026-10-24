import { lazy } from "react";
import { NotebookPen, Sparkles, DoorOpen } from "lucide-react";

export const TAB_CONFIG = [
  {
    key: "journal",
    label: "Journal",
    title: "Journal",
    Icon: NotebookPen,
    View: lazy(() => import("./views/JournalVosView.jsx")),
    getProps: (ctx) => ({ date: ctx.date, onDateChange: ctx.setDate, user: ctx.user }),
  },
  {
    // Hash-Alias: #v2 (siehe main.jsx HASH_ALIASES). Rendert ohne App-Header.
    key: "journal-v2",
    label: "Journal v2",
    title: "Journal v2",
    Icon: NotebookPen,
    bare: true,
    View: lazy(() => import("./views/v2/JournalV2View.jsx")),
    getProps: (ctx) => ({ date: ctx.date, onDateChange: ctx.setDate, user: ctx.user, mode: ctx.mode, onModeChange: ctx.setMode }),
  },
  {
    // Hash-Alias: #door2 (Modus: #door2/plan). Rendert ohne App-Header.
    key: "door-v2",
    label: "Door v2",
    title: "Door v2",
    Icon: DoorOpen,
    bare: true,
    View: lazy(() => import("./views/door/v2/DoorV2View.jsx")),
    getProps: (ctx) => ({ user: ctx.user, mode: ctx.mode, onModeChange: ctx.setMode }),
  },
  {
    // Hash-Alias: #game2/<fire|focus|freedom|frame|voice> (Kurzformen #fire … #voice). Rendert ohne App-Header.
    key: "game-v2",
    label: "Game v2",
    title: "Game v2",
    Icon: Sparkles,
    bare: true,
    View: lazy(() => import("./views/game/GameV2View.jsx")),
    getProps: (ctx) => ({ user: ctx.user, mode: ctx.mode, onModeChange: ctx.setMode }),
  },
  {
    // Hash-Alias: #tent2 (optional #tent2/<datum>). Rendert ohne App-Header.
    key: "tent-v2",
    label: "Tent v2",
    title: "General's Tent",
    Icon: Sparkles,
    bare: true,
    View: lazy(() => import("./views/tent/TentV2View.jsx")),
    getProps: (ctx) => ({ user: ctx.user, date: ctx.date, onDateChange: ctx.setDate }),
  },
  {
    key: "ai-log",
    label: "Smart Log",
    title: "AI Freihand Logging",
    Icon: Sparkles,
    View: lazy(() => import("./views/AiLogVosView.jsx")),
    getProps: (ctx) => ({ date: ctx.date, onDateChange: ctx.setDate, user: ctx.user }),
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
