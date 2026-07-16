import { Sparkles, BrainCircuit, Activity, Utensils, CheckSquare } from "lucide-react";

export default function AiLogVosView({ date, user }) {
  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 px-6 py-5 shadow-glow md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-indigo-400">Smart Journal</div>
            <h2 className="text-lg font-semibold text-slate-100">AI Freihand Logging</h2>
          </div>
        </div>
        <p className="text-sm text-indigo-300/80 md:max-w-xs md:text-right">
          Schreibe einfach frei auf, was du heute gemacht hast. Die KI extrahiert daraus automatisch deine Tracker-Daten.
        </p>
      </header>

      {/* Input Area */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-glow">
        <label className="mb-3 block text-sm font-medium text-slate-300">
          Dein Tag in eigenen Worten:
        </label>
        <textarea 
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[160px]"
          placeholder="z.B. Heute Morgen 5km gelaufen. Zum Frühstück gab es 3 Rühreier und einen Kaffee. Habe danach 2 Stunden am Projekt gearbeitet und 2 Liter Wasser getrunken..."
        />
        <div className="mt-4 flex justify-end">
          <button className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Sparkles className="h-4 w-4" />
            AI Verarbeitung starten (Demnächst)
          </button>
        </div>
      </div>

      {/* How it works / Preview Stub */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-blue-500/10 bg-blue-500/5 p-5">
          <Activity className="mb-3 h-6 w-6 text-blue-400" />
          <h3 className="mb-2 font-medium text-slate-200">Fitness & Aktivität</h3>
          <p className="text-sm text-slate-400">Erkennt automatisch Workouts, Distanzen und verbrannte Kalorien aus deinem Text und synchronisiert sie mit Fitness-AOS.</p>
        </div>
        <div className="rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-5">
          <Utensils className="mb-3 h-6 w-6 text-emerald-400" />
          <h3 className="mb-2 font-medium text-slate-200">Ernährung</h3>
          <p className="text-sm text-slate-400">Extrahiert Mahlzeiten und Zutaten, berechnet grobe Nährwerte und legt sie in deinem Ernährungs-Log ab.</p>
        </div>
        <div className="rounded-3xl border border-orange-500/10 bg-orange-500/5 p-5">
          <CheckSquare className="mb-3 h-6 w-6 text-orange-400" />
          <h3 className="mb-2 font-medium text-slate-200">Habits</h3>
          <p className="text-sm text-slate-400">Hakt vollautomatisch deine täglichen Gewohnheiten ab (z.B. "Wasser trinken", "Lesen", "Meditation").</p>
        </div>
      </div>
    </section>
  );
}
