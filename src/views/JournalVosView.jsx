// JournalVosView — dünner Wrapper für journal-Standalone (routes.js) und
// fuel-dev (@journal/views/JournalVosView.jsx). Die eigentliche View ist
// der gemeinsame Kern components/Journal/JournalTimeline.jsx (auch von
// fitness-dev via Verzeichnis-Symlink views/Journal eingebunden).
import { NotebookPen } from "lucide-react";
import JournalTimeline from "../components/Journal/JournalTimeline.jsx";

export default function JournalVosView(props) {
  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <NotebookPen className="h-5 w-5 text-[#4a9eff]" />
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#4a9eff]">Journal · VOS</div>
            <h2 className="text-base font-semibold text-slate-100">Tagesnotizen</h2>
          </div>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6">
        <JournalTimeline {...props} showCrossover />
      </div>
    </section>
  );
}
