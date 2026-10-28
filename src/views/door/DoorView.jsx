import { lazy, Suspense, useState } from "react";
import { DoorOpen, Flame, LayoutGrid, Hammer, Trophy } from "lucide-react";

import { useGoogle } from "../../lib/google/useGoogle.js";

const PotentialView = lazy(() => import("./PotentialView.jsx"));
const PlanView = lazy(() => import("./PlanView.jsx"));
const ProductionView = lazy(() => import("./ProductionView.jsx"));
const ProfitView = lazy(() => import("./ProfitView.jsx"));

const SUB_TABS = [
  { key: "potential", label: "Potential", Icon: Flame, View: PotentialView },
  { key: "plan", label: "Plan", Icon: LayoutGrid, View: PlanView },
  { key: "production", label: "Production", Icon: Hammer, View: ProductionView },
  { key: "profit", label: "Profit", Icon: Trophy, View: ProfitView },
];

// subTab/onSubTab optional: die VitalOS-Shell steuert die Phase von außen (Hash, Kontextmenü);
// ohne Props verwaltet die Ansicht den Tab selbst.
export default function DoorView({ subTab: controlledTab, onSubTab }) {
  const [localTab, setLocalTab] = useState("potential");
  // Door v1 liegt komplett in Google Tasks — ohne Verbindung gibt es keine Daten
  const g = useGoogle();
  const subTab = controlledTab ?? localTab;
  const setSubTab = (key) => {
    setLocalTab(key);
    onSubTab?.(key);
  };
  const active = SUB_TABS.find((tab) => tab.key === subTab) ?? SUB_TABS[0];
  const ActiveView = active.View;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-amber-500/20 bg-amber-500/5 px-6 py-5 shadow-glow">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
            <DoorOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-amber-400">Door · Google Tasks</div>
            <h2 className="text-lg font-semibold text-slate-100">The Door Framework</h2>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {SUB_TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setSubTab(key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                subTab === key
                  ? "border-amber-400/40 bg-amber-400 text-slate-950"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </nav>
      </header>

      {g.error ? (
        <div role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{g.error}</div>
      ) : null}

      {g.connected ? (
        <>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>Google Tasks verbunden{g.mode === "popup" ? " (gilt ca. 1 h – dauerhafte Anbindung nicht eingerichtet)" : ""}</span>
            <button type="button" onClick={g.disconnect} className="underline hover:text-slate-300">Trennen</button>
          </div>
          <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500 animate-pulse">Lädt {active.label}…</div>}>
            <ActiveView />
          </Suspense>
        </>
      ) : (
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 text-center shadow-glow">
          <p className="text-sm text-slate-300">
            Die Door-Daten liegen in deinem Google-Konto (Listen „Door · Potential“, „Door · Production“, „Door · War Stacks“, „Door · Profit“).
          </p>
          <button
            type="button"
            disabled={g.busy}
            onClick={g.connect}
            className="mt-4 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
          >
            {g.busy ? "Verbinde…" : "Google Tasks verbinden"}
          </button>
        </div>
      )}
    </section>
  );
}
