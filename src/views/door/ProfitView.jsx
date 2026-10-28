import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trophy, Check } from "lucide-react";

import { fetchProfitWeek, fetchCompletedWarstacks, saveReflection, fetchReflections, toggleWarstackHit } from "../../lib/door/v1.js";

export default function ProfitView() {
  const qc = useQueryClient();
  const [reflectionText, setReflectionText] = useState("");
  const [error, setError] = useState("");

  const { data: week, isLoading, isError, refetch } = useQuery({
    queryKey: ["door-profit-week"],
    queryFn: () => fetchProfitWeek(),
    staleTime: 15_000,
  });

  const { data: completed = [] } = useQuery({
    queryKey: ["door-profit-completed"],
    queryFn: fetchCompletedWarstacks,
    staleTime: 15_000,
  });

  const { data: reflections = [] } = useQuery({
    queryKey: ["door-profit-reflections"],
    queryFn: fetchReflections,
    staleTime: 15_000,
  });

  const reflectionMutation = useMutation({
    mutationFn: (fields) => saveReflection(fields),
    onSuccess: () => {
      setReflectionText("");
      qc.invalidateQueries({ queryKey: ["door-profit-reflections"] });
    },
    onError: (err) => setError(err?.message || "Reflexion speichern fehlgeschlagen."),
  });

  const hitMutation = useMutation({
    mutationFn: ({ warstackId, hitId }) => toggleWarstackHit(warstackId, hitId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["door-profit-week"] });
      qc.invalidateQueries({ queryKey: ["door-profit-completed"] });
    },
    onError: (err) => setError(err?.message || "Hit konnte nicht gespeichert werden."),
  });

  function submitReflection(event) {
    event.preventDefault();
    const text = reflectionText.trim();
    if (!text) return;
    setError("");
    reflectionMutation.mutate({ door_title: week?.warstack?.door_title || week?.selected?.title || "", reflection: text, week: week?.week });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/40 px-5 py-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-2"><Trophy className="h-3.5 w-3.5" /> Wochenabschluss</span>
        <span>Google Tasks · Notes in „Door · Profit“</span>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
      ) : null}

      {isLoading ? (
        <div className="py-10 text-center text-sm text-slate-500 animate-pulse">Lädt Profit…</div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
          Profit nicht erreichbar.
          <button onClick={() => refetch()} className="ml-3 underline hover:text-white">Erneut versuchen</button>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 className="text-sm font-semibold text-slate-100">Door der Woche: {week?.warstack?.door_title || week?.selected?.title || "— keine gewählt —"}</h3>
          {week?.warstack ? (
            <>
              <p className="mt-1 text-xs text-slate-400">
                {week.warstack.hit_done_count}/{week.warstack.hit_count} Hits erledigt
                {week.warstack.opened ? " · Door geöffnet 🎉" : ""}
              </p>
              <ul className="mt-3 space-y-1.5">
                {(week.warstack.hits || []).map((hit) => (
                  <li key={hit.id}>
                    <button
                      type="button"
                      onClick={() => hitMutation.mutate({ warstackId: week.warstack.id, hitId: hit.id })}
                      disabled={hitMutation.isPending}
                      title="Hit abhaken"
                      className="flex w-full items-center gap-2 text-left text-xs text-slate-300 hover:text-white disabled:opacity-60"
                    >
                      {hit.done ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <span className="h-3.5 w-3.5 rounded border border-slate-600" />}
                      {hit.fact || <span className="text-slate-600">— leer —</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-1 text-xs text-slate-500">Noch kein War Stack für diese Woche abgeschlossen.</p>
          )}
        </div>
      )}

      <form onSubmit={submitReflection} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-100">Reflexion</h3>
        <textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="Was hat diese Woche funktioniert, was nicht?"
          className="min-h-[90px] w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={reflectionMutation.isPending || !reflectionText.trim()}
          className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
        >
          Reflexion speichern
        </button>
      </form>

      <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-100">Abgeschlossene War Stacks ({completed.length})</h3>
        {completed.length === 0 ? (
          <p className="text-xs text-slate-500">Noch keine vollständig erledigten War Stacks.</p>
        ) : (
          <ul className="space-y-2">
            {completed.map((ws) => (
              <li key={ws.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                <span>{ws.door_title} <span className="text-slate-600">· {ws.week}</span></span>
                <span className="text-xs text-slate-500">{ws.hit_count} Hits</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {reflections.length > 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">Bisherige Reflexionen</h3>
          <ul className="space-y-2">
            {reflections.map((r) => (
              <li key={r.id || r.path} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                <div className="font-medium text-slate-200">{r.door_title || "—"}</div>
                <div className="mt-1 text-slate-400">{r.reflection || ""}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
