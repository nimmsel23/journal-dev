import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, Swords, ChevronRight, Check } from "lucide-react";

import {
  fetchDoorWar,
  selectWeeklyDoor,
  assignQuadrant,
  fetchWarstacks,
  startWarstack,
  answerWarstack,
  isPlanCloudMode,
} from "../../lib/door/plan.js";

const QUADRANTS = [
  { key: 1, label: "Q1 · Dringend + Wichtig", hint: "sofort" },
  { key: 2, label: "Q2 · Wichtig, nicht dringend", hint: "Door der Woche" },
  { key: 3, label: "Q3 · Dringend, nicht wichtig", hint: "delegieren" },
  { key: 4, label: "Q4 · Weder noch", hint: "später/weg" },
];

function keyFor(item) {
  return item.war_uuid || item.id || item.task_uuid || "";
}

export default function PlanView() {
  const qc = useQueryClient();
  const [error, setError] = useState("");
  const [wizard, setWizard] = useState(null); // { sessionId, step, question, hits }
  const [answer, setAnswer] = useState("");
  const [hitDrafts, setHitDrafts] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["door-plan"],
    queryFn: fetchDoorWar,
    staleTime: 15_000,
  });

  const { data: warstacks = [] } = useQuery({
    queryKey: ["door-warstacks"],
    queryFn: fetchWarstacks,
    staleTime: 15_000,
  });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["door-plan"] });
    qc.invalidateQueries({ queryKey: ["door-warstacks"] });
  }

  const assignMutation = useMutation({
    mutationFn: ({ selector, quadrant }) => assignQuadrant(selector, quadrant),
    onSuccess: invalidate,
    onError: (err) => setError(err?.message || "Zuordnen fehlgeschlagen."),
  });

  const selectMutation = useMutation({
    mutationFn: (selector) => selectWeeklyDoor(selector),
    onSuccess: invalidate,
    onError: (err) => setError(err?.message || "Konnte Door der Woche nicht wählen (muss in Q2 liegen)."),
  });

  const startMutation = useMutation({
    mutationFn: ({ title, selector }) => startWarstack(title, selector),
    onSuccess: ({ sessionId, step, question }) => {
      setWizard({ sessionId, step, question });
      setAnswer("");
      setHitDrafts(null);
    },
    onError: (err) => setError(err?.message || "War Stack konnte nicht gestartet werden."),
  });

  const answerMutation = useMutation({
    mutationFn: ({ sessionId, step, payload }) => answerWarstack(sessionId, step, payload),
    onSuccess: (result) => {
      if (result.done) {
        setWizard(null);
        setAnswer("");
        setHitDrafts(null);
        invalidate();
        return;
      }
      setWizard({ sessionId: result.sessionId, step: result.step, question: result.question });
      setAnswer("");
      setHitDrafts(result.hits ? result.hits : null);
    },
    onError: (err) => setError(err?.message || "Antwort konnte nicht gespeichert werden."),
  });

  function submitAnswer(event) {
    event.preventDefault();
    if (!wizard) return;
    setError("");
    if (wizard.step === "hits") {
      answerMutation.mutate({ sessionId: wizard.sessionId, step: "hits", payload: { hits: hitDrafts } });
      return;
    }
    const trimmed = answer.trim();
    if (!trimmed) return;
    answerMutation.mutate({ sessionId: wizard.sessionId, step: wizard.step, payload: { answer: trimmed } });
  }

  function updateHitField(index, field, value) {
    setHitDrafts((prev) => {
      const next = [...(prev || [])];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  const board = data?.board || { 1: [], 2: [], 3: [], 4: [], unsorted: [] };
  const candidates = data?.candidates || [];
  const byKey = new Map(candidates.map((item) => [keyFor(item), item]));
  const selected = data?.selected?.selector || data?.doorWar?.selected?.selector || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/40 px-5 py-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-2"><LayoutGrid className="h-3.5 w-3.5" /> Eisenhower-Board</span>
        <span>{isPlanCloudMode() ? "Cloud-Modus (Firestore)" : "Lokal über Door-Server (:6400)"}</span>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
      ) : null}

      {isLoading ? (
        <div className="py-10 text-center text-sm text-slate-500 animate-pulse">Lädt Door War…</div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
          Plan nicht erreichbar.
          <button onClick={() => refetch()} className="ml-3 underline hover:text-white">Erneut versuchen</button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {QUADRANTS.map(({ key, label, hint }) => (
              <div key={key} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-100">{label}</h3>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">{hint}</span>
                </div>
                <ul className="space-y-2">
                  {(board[key] || []).map((k) => {
                    const item = byKey.get(k);
                    if (!item) return null;
                    const isSelectedDoor = selected === k;
                    return (
                      <li key={k} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm text-slate-200">{item.title}</span>
                          {isSelectedDoor ? <Check className="h-4 w-4 flex-shrink-0 text-amber-400" /> : null}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {QUADRANTS.map((q) => (
                            <button
                              key={q.key}
                              onClick={() => assignMutation.mutate({ selector: k, quadrant: q.key })}
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                                q.key === key ? "border-amber-400/40 bg-amber-400/20 text-amber-300" : "border-white/10 text-slate-400 hover:bg-white/10"
                              }`}
                            >
                              Q{q.key}
                            </button>
                          ))}
                          {key === 2 && !isSelectedDoor ? (
                            <button
                              onClick={() => { setError(""); selectMutation.mutate(k); }}
                              className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/20"
                            >
                              Door der Woche
                            </button>
                          ) : null}
                          {isSelectedDoor ? (
                            <button
                              onClick={() => { setError(""); startMutation.mutate({ title: item.title, selector: k }); }}
                              className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 hover:bg-amber-500/20"
                            >
                              <Swords className="h-3 w-3" /> War Stack starten
                            </button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                  {(board[key] || []).length === 0 ? (
                    <li className="rounded-xl border border-dashed border-white/10 p-3 text-center text-xs text-slate-600">leer</li>
                  ) : null}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-100">Unsorted ({(board.unsorted || []).length})</h3>
            <ul className="flex flex-wrap gap-2">
              {(board.unsorted || []).map((k) => {
                const item = byKey.get(k);
                if (!item) return null;
                return (
                  <li key={k} className="group relative rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                    {item.title}
                    <span className="ml-2 inline-flex gap-1">
                      {QUADRANTS.map((q) => (
                        <button
                          key={q.key}
                          onClick={() => assignMutation.mutate({ selector: k, quadrant: q.key })}
                          className="rounded-full border border-white/10 px-1.5 text-[10px] text-slate-500 hover:bg-white/10"
                        >
                          Q{q.key}
                        </button>
                      ))}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}

      <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-100">War Stacks ({warstacks.length})</h3>
        {warstacks.length === 0 ? (
          <p className="text-xs text-slate-500">Noch kein War Stack erstellt. Wähle oben eine Door der Woche (Q2) und starte einen War Stack.</p>
        ) : (
          <ul className="space-y-2">
            {warstacks.map((ws) => (
              <li key={ws.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                <span>{ws.door_title} <span className="text-slate-600">· {ws.week}</span></span>
                <span className="text-xs text-slate-500">{(ws.hits || []).filter((h) => h.done).length}/{(ws.hits || []).length} Hits</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {wizard ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={submitAnswer} className="w-full max-w-lg space-y-4 rounded-3xl border border-amber-500/20 bg-slate-900 p-6 shadow-glow">
            <div className="flex items-center gap-2 text-amber-400">
              <Swords className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">War Stack Wizard</span>
            </div>
            <p className="text-sm text-slate-200">{wizard.question}</p>

            {wizard.step === "hits" ? (
              <div className="space-y-3">
                {(hitDrafts || []).map((hit, idx) => (
                  <div key={hit.id || idx} className="rounded-xl border border-white/10 bg-slate-950/50 p-3 space-y-2">
                    <div className="text-xs font-semibold text-amber-300">Hit {idx + 1}</div>
                    {["fact", "obstacle", "strike", "responsibility"].map((field) => (
                      <input
                        key={field}
                        value={hit[field] || ""}
                        onChange={(e) => updateHitField(idx, field, e.target.value)}
                        placeholder={field}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                autoFocus
                className="min-h-[90px] w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
              />
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setWizard(null); setAnswer(""); setHitDrafts(null); }}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300 hover:bg-white/10"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={answerMutation.isPending}
                className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
              >
                Weiter <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
