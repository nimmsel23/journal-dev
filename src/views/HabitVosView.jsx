import { CheckSquare } from "lucide-react";
import Habits from "@habits/views/Habits/index.jsx";

export default function HabitVosView(props) {
  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between gap-3 rounded-3xl border border-emerald-400/15 bg-emerald-400/5 px-6 py-4 shadow-glow">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-5 w-5 text-emerald-300" />
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Habits · VOS</div>
            <h2 className="text-base font-semibold text-slate-100">Tägliche Gewohnheiten</h2>
          </div>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-glow vos-fuel">
        <Habits {...props} />
      </div>
    </section>
  );
}
