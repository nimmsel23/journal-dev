import { lazy, Suspense, useState } from "react";
import { DoorOpen, Flame, LayoutGrid, Hammer, Trophy } from "lucide-react";

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
            <div className="text-xs uppercase tracking-[0.2em] text-amber-400">aos/door</div>
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

      <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500 animate-pulse">Lädt {active.label}…</div>}>
        <ActiveView />
      </Suspense>
    </section>
  );
}
