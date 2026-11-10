import { lazy } from "react";
import { NotebookPen, Sparkles, DoorOpen, Mic } from "lucide-react";

// Vite ersetzt VITE_SOLO_TABS zur Build-Zeit durch einen String-Literal.
// Solo-Flavors setzen genau einen Key (siehe package.json); Hub = "".
// Vergleich mit === damit Rolldown tote if-Zweige + lazy()-Imports droppt.
const SOLO = import.meta.env.VITE_SOLO_TABS || "";

const tabs = [];

if (!SOLO || SOLO === "journal") {
  tabs.push({
    key: "journal",
    label: "Journal",
    title: "Journal",
    Icon: NotebookPen,
    View: lazy(() => import("./views/JournalVosView.jsx")),
    getProps: (ctx) => ({ date: ctx.date, onDateChange: ctx.setDate, user: ctx.user }),
  });
}

if (!SOLO || SOLO === "journal-v2") {
  // Hash-Alias: #v2. Rendert ohne App-Header.
  tabs.push({
    key: "journal-v2",
    label: "Journal v2",
    title: "Journal v2",
    Icon: NotebookPen,
    bare: true,
    View: lazy(() => import("./views/v2/JournalV2View.jsx")),
    getProps: (ctx) => ({ date: ctx.date, onDateChange: ctx.setDate, user: ctx.user, mode: ctx.mode, onModeChange: ctx.setMode, onStartVoice: ctx.startVoiceFromJournal }),
  });
}

if (!SOLO || SOLO === "door-v2") {
  tabs.push({
    key: "door-v2",
    label: "Door v2",
    title: "Door v2",
    Icon: DoorOpen,
    bare: true,
    View: lazy(() => import("./views/door/v2/DoorV2View.jsx")),
    getProps: (ctx) => ({ user: ctx.user, mode: ctx.mode, onModeChange: ctx.setMode }),
  });
}

if (!SOLO || SOLO === "game-v2") {
  tabs.push({
    key: "game-v2",
    label: "Game v2",
    title: "Game v2",
    Icon: Sparkles,
    bare: true,
    View: lazy(() => import("./views/game/GameV2View.jsx")),
    getProps: (ctx) => ({ user: ctx.user, mode: ctx.mode, onModeChange: ctx.setMode }),
  });
}

if (!SOLO || SOLO === "voice-v2") {
  tabs.push({
    key: "voice-v2",
    label: "Voice",
    title: "Voice",
    Icon: Mic,
    bare: true,
    View: lazy(() => import("./views/voice/VoiceV2View.jsx")),
    getProps: (ctx) => ({ user: ctx.user }),
  });
}

if (!SOLO || SOLO === "tent-v2") {
  tabs.push({
    key: "tent-v2",
    label: "Tent v2",
    title: "General's Tent",
    Icon: Sparkles,
    bare: true,
    View: lazy(() => import("./views/tent/TentV2View.jsx")),
    getProps: (ctx) => ({ user: ctx.user, date: ctx.date, onDateChange: ctx.setDate }),
  });
}

if (!SOLO || SOLO === "ai-log") {
  tabs.push({
    key: "ai-log",
    label: "Smart Log",
    title: "AI Freihand Logging",
    Icon: Sparkles,
    View: lazy(() => import("./views/AiLogVosView.jsx")),
    getProps: (ctx) => ({ date: ctx.date, onDateChange: ctx.setDate, user: ctx.user }),
  });
}

if (!SOLO || SOLO === "door") {
  tabs.push({
    key: "door",
    label: "Door",
    title: "The Door Framework",
    Icon: DoorOpen,
    View: lazy(() => import("./views/door/DoorView.jsx")),
    getProps: () => ({}),
  });
}

export const TAB_CONFIG = tabs;
