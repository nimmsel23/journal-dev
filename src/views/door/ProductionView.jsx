import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addWeeks } from "date-fns";
import { Hammer, Check, ChevronLeft, ChevronRight } from "lucide-react";

import { fetchDailyWeek, toggleDailyHit, addHitOnDate, fetchHitsWeek } from "../../lib/door/v1.js";

const DAY_LABELS = { mon: "Montag", tue: "Dienstag", wed: "Mittwoch", thu: "Donnerstag", fri: "Freitag" };

export default function ProductionView() {
  const qc = useQueryClient();
  const [weekOffset, setWeekOffset] = useState(0);
  const base = addWeeks(new Date(), weekOffset);

  const { data: plan, isLoading, isError, refetch } = useQuery({
    queryKey: ["door-production", weekOffset],
    queryFn: () => fetchDailyWeek(base),
    staleTime: 15_000,
  });

  const { data: summary } = useQuery({
    queryKey: ["door-production-summary", weekOffset],
    queryFn: () => fetchHitsWeek(base),
    staleTime: 15_000,
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => toggleDailyHit(id, base),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["door-production"] });
      qc.invalidateQueries({ queryKey: ["door-production-summary"] });
    },
  });

  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState("");
  const addMutation = useMutation({
    mutationFn: ({ day, text }) => addHitOnDate(plan?.dates?.[day], text),
    onSuccess: (_, { day }) => {
      setDrafts((prev) => ({ ...prev, [day]: "" }));
      qc.invalidateQueries({ queryKey: ["door-production"] });
      qc.invalidateQueries({ queryKey: ["door-production-summary"] });
    },
    onError: (err) => setError(err?.message || "Hit konnte nicht angelegt werden."),
  });

  function submitHit(event, day) {
    event.preventDefault();
    const text = (drafts[day] || "").trim();
    if (!text) return;
    setError("");
    addMutation.mutate({ day, text });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/40 px-5 py-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-2">
          <Hammer className="h-3.5 w-3.5" /> Daily Hits · {plan?.week || "…"}
          <button type="button" onClick={() => setWeekOffset((w) => w - 1)} title="Vorherige Woche" className="rounded p-0.5 hover:bg-white/10"><ChevronLeft className="h-3.5 w-3.5" /></button>
          {weekOffset !== 0 ? <button type="button" onClick={() => setWeekOffset(0)} className="underline hover:text-white">heute</button> : null}
          <button type="button" onClick={() => setWeekOffset((w) => w + 1)} title="Nächste Woche" className="rounded p-0.5 hover:bg-white/10"><ChevronRight className="h-3.5 w-3.5" /></button>
        </span>
        <span>Google Tasks · „Door · Production“</span>
        {summary ? (
          <span>{summary.completed_hits}/{summary.total_hits} Hits erledigt ({Math.round((summary.completion_rate || 0) * 100)}%)</span>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
      ) : null}

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
              <h3 className="mb-3 text-sm font-semibold text-slate-100">
                {DAY_LABELS[day] || day}
                {plan?.dates?.[day] ? <span className="ml-2 text-xs font-normal text-slate-500">{plan.dates[day].slice(8, 10)}.{plan.dates[day].slice(5, 7)}.</span> : null}
              </h3>
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
              <form onSubmit={(event) => submitHit(event, day)} className="mt-3">
                <input
                  value={drafts[day] || ""}
                  onChange={(event) => setDrafts((prev) => ({ ...prev, [day]: event.target.value }))}
                  placeholder="+ Hit für diesen Tag"
                  aria-label={`Neuer Hit ${DAY_LABELS[day] || day}`}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                />
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
