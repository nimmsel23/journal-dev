import { useEffect, useMemo, useState } from "react";
import { Activity, BrainCircuit, CheckSquare, Droplets, Sparkles, Utensils, Wand2 } from "lucide-react";

import * as db from "@journal-db";
import { analyzeSmartJournal } from "../lib/smartJournalLogger.js";

const MEAL_LABELS = {
  breakfast: "Fruehstueck",
  lunch: "Mittag",
  dinner: "Abend",
  snack: "Snack",
};

function SectionCard({ icon: Icon, title, subtitle, children, tone = "indigo" }) {
  const toneClasses = {
    indigo: "border-indigo-500/20 bg-indigo-500/5 text-indigo-300",
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300",
    amber: "border-amber-500/20 bg-amber-500/5 text-amber-300",
    sky: "border-sky-500/20 bg-sky-500/5 text-sky-300",
  };

  return (
    <section className={`rounded-3xl border p-5 ${toneClasses[tone] || toneClasses.indigo}`}>
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl bg-black/20 p-2.5">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function AiLogVosView({ date, user }) {
  const [text, setText] = useState("");
  const [habits, setHabits] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    db.getHabits?.(28).then((items) => {
      if (!cancelled) setHabits(Array.isArray(items) ? items : []);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [user?.uid]);

  const habitMap = useMemo(() => {
    const map = new Map();
    for (const habit of habits) {
      map.set(String(habit.name || "").trim().toLowerCase(), habit);
    }
    return map;
  }, [habits]);

  async function handleAnalyze() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await analyzeSmartJournal({ text: text.trim(), habits });
      setAnalysis(result);
    } catch (err) {
      console.error("[AiLogVosView] analyze failed", err);
      setError(err?.message === "vertex_ai_unavailable"
        ? "Vertex AI ist in diesem Kontext nicht verfuegbar."
        : (err?.message || "Analyse fehlgeschlagen."));
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
    if (!analysis) return;
    setApplying(true);
    setError("");
    setSuccess("");

    try {
      if (analysis.journal_entry) {
        await db.saveJournal(date, analysis.journal_entry, { tags: ["smart-log"] });
      }

      if (analysis.meals.length > 0 || analysis.water_ml > 0) {
        const currentLog = await db.getNutritionLog(date);
        const nextMeals = [
          ...(currentLog?.meals || []),
          ...analysis.meals.map((meal, index) => ({
            id: `smart_${Date.now().toString(36)}_${index}`,
            type: meal.type,
            description: meal.description,
            notes: meal.notes || "Smart Logger",
            kcal: meal.kcal,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            time: new Date().toISOString(),
            catalog_item_id: null,
            catalog_components: [],
            catalog_addon_ids: [],
          })),
        ];
        await db.saveNutritionLog(date, {
          ...currentLog,
          date,
          meals: nextMeals,
          water_ml: Math.max(Number(currentLog?.water_ml || 0), Number(analysis.water_ml || 0)),
        });
      }

      for (const habitHit of analysis.habits_done) {
        const match = habitMap.get(habitHit.name.toLowerCase());
        if (!match?.uuid) continue;
        await db.recordHabit(match.uuid, date);
      }

      setSuccess("Journal, Meals und Habits wurden uebernommen.");
      setAnalysis(null);
      setText("");
    } catch (err) {
      console.error("[AiLogVosView] apply failed", err);
      setError(err?.message || "Uebernahme fehlgeschlagen.");
    } finally {
      setApplying(false);
    }
  }

  const unmatchedHabits = useMemo(
    () => (analysis?.habits_done || []).filter((item) => !habitMap.has(item.name.toLowerCase())),
    [analysis, habitMap]
  );

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 px-6 py-5 shadow-glow md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-indigo-400">Smart Journal</div>
            <h2 className="text-lg font-semibold text-slate-100">Freitext zu Trackern machen</h2>
          </div>
        </div>
        <p className="text-sm text-indigo-300/80 md:max-w-md md:text-right">
          Ein Text. Dann Vertex-Analyse. Danach uebernimmst du Journal, Mahlzeiten, Wasser und passende Habits mit einem Klick.
        </p>
      </header>

      <SectionCard
        icon={Wand2}
        title="Dein Tag in eigenen Worten"
        subtitle="Explizit genannte Mahlzeiten, Trinkmenge und bekannte Habits werden extrahiert."
      >
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-h-[180px] w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Heute Morgen 2 Eier und Kaffee. Mittags Sushi. 2 Liter Wasser. 30 Minuten Lesen und Meditation. Abends kurzer Spaziergang und noch ein Proteinshake..."
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={loading || applying || !text.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Analysiert..." : "Vertex analysieren"}
          </button>
          <div className="text-xs text-slate-500">
            Tag: <span className="text-slate-300">{date}</span>
          </div>
        </div>
        {error ? <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
        {success ? <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div> : null}
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={NotebookPenFallback}
          title="Journal Preview"
          subtitle="Das landet als sauberer Journal-Eintrag fuer den Tag."
          tone="sky"
        >
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm leading-6 text-slate-200">
            {analysis?.journal_entry || "Noch keine Analyse."}
          </div>
        </SectionCard>

        <SectionCard
          icon={Droplets}
          title="Wasser"
          subtitle="Nur wenn im Text eine klare Menge genannt wurde."
          tone="sky"
        >
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
            {analysis ? `${analysis.water_ml || 0} ml` : "Noch keine Analyse."}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={Utensils}
          title="Mahlzeiten"
          subtitle="Diese Meals werden direkt in den Nutrition-Log fuer den Tag geschrieben."
          tone="emerald"
        >
          <div className="space-y-3">
            {(analysis?.meals || []).length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">Noch keine Mahlzeiten erkannt.</div>
            ) : analysis.meals.map((meal, index) => (
              <div key={`${meal.description}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{meal.description}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-emerald-300">{MEAL_LABELS[meal.type] || meal.type}</div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <div>{Math.round(meal.kcal)} kcal</div>
                    <div>P {meal.protein} · C {meal.carbs} · F {meal.fat}</div>
                  </div>
                </div>
                {meal.notes ? <div className="mt-3 text-xs text-slate-400">{meal.notes}</div> : null}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          icon={CheckSquare}
          title="Habits"
          subtitle="Nur exakte Treffer auf deine bestehenden Habit-Namen werden uebernommen."
          tone="amber"
        >
          <div className="space-y-3">
            {(analysis?.habits_done || []).length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">Noch keine Habits erkannt.</div>
            ) : analysis.habits_done.map((habit, index) => {
              const matched = habitMap.has(habit.name.toLowerCase());
              return (
                <div key={`${habit.name}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-100">{habit.name}</div>
                    <div className={`text-xs font-semibold ${matched ? "text-emerald-300" : "text-amber-300"}`}>
                      {matched ? "Match" : "Nicht im Habit-Katalog"}
                    </div>
                  </div>
                  {habit.evidence ? <div className="mt-2 text-xs text-slate-400">{habit.evidence}</div> : null}
                </div>
              );
            })}
            {unmatchedHabits.length > 0 ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-100">
                Nicht gematchte Habits werden nur angezeigt, nicht geschrieben.
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        icon={Activity}
        title="Was dieser Ausbau jetzt wirklich macht"
        subtitle="Kein Platzhalter mehr: Preview plus echte Writes in die vorhandenen Firestore-Layer."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">Journal: speichert einen bereinigten Eintrag fuer den Tag.</div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">Nutrition: fuegt erkannte Meals an den Tages-Log an und setzt Wasser auf den hoechsten bekannten Tageswert.</div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">Habits: hakt nur bestehende, exakt gematchte Habits fuer das Datum ab.</div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleApply}
            disabled={applying || loading || !analysis}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {applying ? "Uebernimmt..." : "Analyse uebernehmen"}
          </button>
        </div>
      </SectionCard>
    </section>
  );
}

function NotebookPenFallback(props) {
  return <BrainCircuit {...props} />;
}
