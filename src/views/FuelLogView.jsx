import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotebookPen, UtensilsCrossed, Pencil, Trash2, Sparkles } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { postJson, patchJson } from "../lib/api.js";
import FoodSearch from "../components/FoodSearch.jsx";

const MEAL_TYPES = [
  { value: "breakfast", label: "Frühstück" },
  { value: "lunch",     label: "Mittagessen" },
  { value: "dinner",    label: "Abendessen" },
  { value: "snack",     label: "Snack" },
];

const MEAL_LABEL = Object.fromEntries(MEAL_TYPES.map(({ value, label }) => [value, label]));

const inputCls = "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100";
const EMPTY_FORM = { id: null, type: "breakfast", description: "", notes: "", kcal: "", protein: "", carbs: "", fat: "" };

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm text-slate-300">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export default function JournalView({ date, nutrition, journal }) {
  const qc = useQueryClient();
  const [text, setText] = useState(journal || "");
  const [loading, setLoading] = useState(false);
  
  // Food Form State
  const [form, setForm] = useState(EMPTY_FORM);
  const [moveDate, setMoveDate] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  
  const isEditing = Boolean(form.id);
  const meals = nutrition?.meals || [];
  const cloud = window.location.hostname.includes("web.app") || window.location.hostname.includes("firebaseapp.com");

  const handleJournalSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postJson("/nutrition/journal", { date, content: text });
      qc.invalidateQueries({ queryKey: ["journal", date] });
    } catch (err) {
      console.error("Journal save error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAiLog = async (e) => {
    e.preventDefault();
    if (!aiText.trim()) return;
    setAiLoading(true);
    try {
      await postJson("/nutrition/ai-log", { text: aiText, date });
      qc.invalidateQueries({ queryKey: ["nutrition", date] });
      setAiText("");
    } catch (err) {
      console.error("AI Logging error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const cancelEdit = () => { setForm(EMPTY_FORM); setMoveDate(""); };

  function loadForEdit(meal) {
    setForm({ id: meal.id, type: meal.type, description: meal.description,
      notes: meal.notes || "", kcal: meal.kcal, protein: meal.protein,
      carbs: meal.carbs, fat: meal.fat });
    setMoveDate("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const saveMeal = useMutation({
    mutationFn: () => {
      if (isEditing) {
        const body = {
          date, meal_id: form.id,
          meal: { type: form.type, description: form.description, notes: form.notes,
            kcal: form.kcal, protein: form.protein, carbs: form.carbs, fat: form.fat },
        };
        if (moveDate && moveDate !== date) body.new_date = moveDate;
        return patchJson("/nutrition/log", body);
      }
      return postJson("/nutrition/log", {
        date,
        meal: { type: form.type, description: form.description, notes: form.notes,
          kcal: form.kcal, protein: form.protein, carbs: form.carbs, fat: form.fat },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition", date] });
      if (moveDate) qc.invalidateQueries({ queryKey: ["nutrition", moveDate] });
      qc.invalidateQueries({ queryKey: ["week-logs"] });
      setForm(EMPTY_FORM);
      setMoveDate("");
    },
  });

  const saveCatalog = useMutation({
    mutationFn: () => postJson("/nutrition/catalog", { 
      item: {
        kind: "meal",
        category: "meal",
        name: form.description.trim(),
        description: form.description.trim(),
        meal_type: form.type,
        notes: form.notes,
        kcal: Number(form.kcal) || 0,
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        fat: Number(form.fat) || 0,
        source: "manual",
      }
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition-catalog"] }),
  });

  const deleteMeal = useMutation({
    mutationFn: (id) => postJson("/nutrition/log", { date, delete_meal_id: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition", date] });
      qc.invalidateQueries({ queryKey: ["week-logs"] });
      if (isEditing) setForm(EMPTY_FORM);
    },
  });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Column: Food Logging */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="h-6 w-6 text-orange-300" />
          <h2 className="text-2xl font-bold tracking-tight">Ernährung</h2>
        </div>

        {/* AI Logger — nur lokal (kein Cloud-Backend) */}
        {!cloud && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur shadow-glow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-300" />
              AI Logger
            </h2>
            <form onSubmit={handleAiLog}>
              <textarea
                className={inputCls + " min-h-24 focus:ring-2 focus:ring-sky-400/50 outline-none transition-all"}
                placeholder="Was hast du gegessen? z.B. '200g Skyr mit Beeren'"
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
              />
              <button
                disabled={aiLoading || !aiText.trim()}
                className="mt-4 w-full bg-sky-300 text-slate-950 rounded-full py-3 font-bold disabled:opacity-50 hover:bg-sky-200 transition-colors shadow-lg active:scale-[0.98]"
              >
                {aiLoading ? "Verarbeite..." : "Loggen"}
              </button>
            </form>
          </div>
        )}

        {!isEditing && (
          <FoodSearch
            onSelect={({ description, kcal, protein, carbs, fat }) =>
              setForm((f) => ({ ...f, description, kcal, protein, carbs, fat }))
            }
          />
        )}

        {/* Manuelles Log-Formular */}
        <div className={twMerge(
          "rounded-3xl border p-5 space-y-4 transition-all duration-300",
          isEditing ? "border-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.2)] bg-orange-400/5 ring-1 ring-orange-400/20" : "border-white/10 bg-white/5 backdrop-blur"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isEditing ? <Pencil className="h-4 w-4 text-orange-400" /> : <UtensilsCrossed className="h-4 w-4 text-slate-400" />}
              <h3 className={twMerge("text-sm font-semibold uppercase tracking-widest", isEditing ? "text-orange-400" : "text-slate-400")}>
                {isEditing ? "Eintrag bearbeiten" : "Mahlzeit loggen"}
              </h3>
            </div>
            {isEditing && (
              <button onClick={cancelEdit} className="text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors bg-white/5 px-2 py-1 rounded-md">
                Abbrechen
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Mahlzeit">
              <select className={inputCls} value={form.type} onChange={set("type")}>
                {MEAL_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
            {isEditing && (
              <Field label="Datum verschieben">
                <input type="date" className={inputCls} value={moveDate} onChange={(e) => setMoveDate(e.target.value)} />
              </Field>
            )}
          </div>
          
          <Field label="Beschreibung">
            <input className={inputCls} placeholder="Mahlzeit…" value={form.description} onChange={set("description")} />
          </Field>

          <div className="grid grid-cols-4 gap-3">
            {[["kcal", "kcal"], ["protein", "Prot g"], ["carbs", "Carb g"], ["fat", "Fett g"]].map(([k, lbl]) => (
              <Field key={k} label={lbl}>
                <input type="number" min="0" className={inputCls} value={form[k]} onChange={set(k)} />
              </Field>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => saveMeal.mutate()} disabled={saveMeal.isPending || !form.description}
              className={twMerge("w-full rounded-2xl py-4 font-bold transition shadow-lg",
                saveMeal.isPending || !form.description
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-orange-400 text-slate-950 hover:bg-orange-300 active:scale-[0.98]"
              )}>
              {saveMeal.isPending ? "Speichert…" : isEditing ? "Änderungen speichern" : "Mahlzeit loggen"}
            </button>
            <button
              onClick={() => saveCatalog.mutate()}
              disabled={saveCatalog.isPending || !form.description}
              className={twMerge(
                "w-full rounded-2xl border py-4 font-bold transition border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
                (saveCatalog.isPending || !form.description) && "opacity-50 cursor-not-allowed"
              )}
            >
              Katalog+
            </button>
          </div>
        </div>

        {/* Geloggte Mahlzeiten Liste */}
        {meals.length > 0 && (
          <div className="space-y-2">
            <h3 className="px-1 text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
              Geloggte Mahlzeiten
            </h3>
            {meals.map((m) => (
              <div key={m.id}
                className={twMerge(
                  "flex items-center justify-between rounded-2xl border px-4 py-3 transition",
                  form.id === m.id
                    ? "border-orange-400/40 bg-orange-400/5"
                    : "border-white/5 bg-slate-900/40 hover:bg-slate-900/70"
                )}>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-slate-100">{m.description}</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {MEAL_LABEL[m.type] || m.type}
                    {" · "}<span className="text-orange-300">{m.kcal} kcal</span>
                    {" · "}P {m.protein}g · C {m.carbs}g · F {m.fat}g
                  </div>
                </div>
                <div className="ml-3 flex gap-2 shrink-0">
                  <button onClick={() => loadForEdit(m)}
                    title="Bearbeiten"
                    className={twMerge(
                      "rounded-lg border p-2 transition",
                      form.id === m.id 
                        ? "border-orange-400 bg-orange-400 text-slate-950" 
                        : "border-white/10 bg-white/5 text-slate-400 hover:text-orange-400 hover:bg-orange-400/10"
                    )}>
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => deleteMeal.mutate(m.id)}
                    title="Löschen"
                    className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Right Column: Journaling */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <NotebookPen className="h-6 w-6 text-sky-300" />
          <h2 className="text-2xl font-bold tracking-tight">Tagebuch</h2>
        </div>

        <form onSubmit={handleJournalSave} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur shadow-glow">
          <textarea 
            className="min-h-[500px] w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-400/50 outline-none transition-all" 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Was hat dich heute bewegt? Training, Schlaf, Befinden..."
          />
          
          <button disabled={loading} className="mt-4 w-full rounded-full bg-sky-300 py-4 font-bold text-slate-950 disabled:opacity-60 hover:bg-sky-200 transition-colors shadow-lg active:scale-[0.98]">
            {loading ? "Speichere..." : "Journal speichern"}
          </button>
        </form>
      </section>
    </div>
  );
}
