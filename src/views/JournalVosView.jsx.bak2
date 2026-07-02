import { NotebookPen } from "lucide-react";
import Journal from "./Journal/index.jsx";

export default function JournalVosView(props) {
  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between gap-3 rounded-3xl border border-amber-400/15 bg-amber-400/5 px-6 py-4 shadow-glow">
        <div className="flex items-center gap-3">
          <NotebookPen className="h-5 w-5 text-amber-300" />
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-amber-300">Journal · VOS</div>
            <h2 className="text-base font-semibold text-slate-100">Tagesnotizen</h2>
          </div>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-glow vos-fuel">
        <Journal {...props} />
      </div>
    </section>
  );
}
