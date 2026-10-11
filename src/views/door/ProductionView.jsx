import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Hammer, Check } from "lucide-react";

import { fetchDailyWeek, toggleDailyHit, fetchHitsWeek, isProductionCloudMode } from "../../lib/door/production.js";

const DAY_LABELS = { mon: "Montag", tue: "Dienstag", wed: "Mittwoch", thu: "Donnerstag", fri: "Freitag" };

export default function ProductionView() {
  const qc = useQueryClient();

  const { data: plan, isLoading, isError, refetch } = useQuery({
    queryKey: ["door-production"],
    queryFn: () => fetchDailyWeek(),
    staleTime: 15_000,
  });

  const { data: summary } = useQuery({
    queryKey: ["door-production-summary"],
    queryFn: fetchHitsWeek,
    staleTime: 15_000,
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => toggleDailyHit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["door-production"] });
      qc.invalidateQueries({ queryKey: ["door-production-summary"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/40 px-5 py-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-2"><Hammer className="h-3.5 w-3.5" /> Daily Hits · {plan?.week || "…"}</span>
        <span>{isProductionCloudMode() ? "Cloud-Modus (Firestore)" : "Lokal über Door-Server (:6400)"}</span>
        {summary ? (
          <span>{summary.completed_hits}/{summary.total_hits} Hits erledigt ({Math.round((summary.completion_rate || 0) * 100)}%)</span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-slate-500 animate-pulse">Lädt Production…</div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
          Production nicht erreichbar.
          <button onClick={() => refetch()} className="ml-3 underline hover:text-white">Erneut versuchen</button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-5">
          {Object.entries(plan?.days || {}).map(([day, items]) => (
            <div key={day} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-100">{DAY_LABELS[day] || day}</h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={`rounded-xl border p-2.5 text-xs ${
                      item.kind === "big" ? "border-amber-500/20 bg-amber-500/5" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={item.done ? "text-slate-500 line-through" : "text-slate-200"}>
                        {item.label || item.fact || <span className="text-slate-600">— leer —</span>}
                      </span>
                      <button
                        onClick={() => toggleMutation.mutate(item.id)}
                        className={`flex-shrink-0 rounded-lg p-1 ${
                          item.done ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 hover:bg-white/10"
                        }`}
                        title="Erledigt umschalten"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {item.kind === "big" && item.obstacle ? (
                      <div className="mt-1 text-[10px] text-slate-500">Obstacle: {item.obstacle}</div>
                    ) : null}
                  </li>
                ))}
                {items.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-white/10 p-2.5 text-center text-[11px] text-slate-600">leer</li>
                ) : null}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
