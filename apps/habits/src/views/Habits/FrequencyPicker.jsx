import { FREQUENCY_TYPES, WEEKDAY_OPTIONS } from "./utils";

// Kompakter Frequenz-Editor (Typ + je nach Typ Wochentage oder Ziel-Anzahl),
// geteilt zwischen V1 (HabitForm/HabitItem) und Core4Layout, damit die
// daily/weekly/monthly-Logik nicht drei Mal implementiert wird.
export default function FrequencyPicker({ frequency, onChange, compact = false }) {
  const freq = frequency || { type: "daily", weekdays: [], timesPerPeriod: 1 };

  function setType(type) {
    onChange({ ...freq, type });
  }

  function toggleWeekday(day) {
    const weekdays = freq.weekdays || [];
    const next = weekdays.includes(day)
      ? weekdays.filter((d) => d !== day)
      : [...weekdays, day];
    onChange({ ...freq, weekdays: next });
  }

  function setTimesPerPeriod(value) {
    const n = Math.max(1, Math.min(31, Number(value) || 1));
    onChange({ ...freq, timesPerPeriod: n });
  }

  const chipClass = compact
    ? "px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-colors"
    : "px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest transition-colors";
  const activeClass = "bg-orange-400 border-orange-400 text-black";
  const inactiveClass = "bg-slate-900 border-white/10 text-slate-400 hover:border-orange-400";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {FREQUENCY_TYPES.map((t) => (
          <button
            type="button"
            key={t.key}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => { e.stopPropagation(); setType(t.key); }}
            className={`${chipClass} ${freq.type === t.key ? activeClass : inactiveClass}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {freq.type === "weekly" && (
        <div className="flex flex-wrap gap-2">
          {WEEKDAY_OPTIONS.map((w) => (
            <button
              type="button"
              key={w.key}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => { e.stopPropagation(); toggleWeekday(w.key); }}
              className={`${chipClass} ${(freq.weekdays || []).includes(w.key) ? activeClass : inactiveClass}`}
            >
              {w.label}
            </button>
          ))}
        </div>
      )}

      {freq.type === "monthly" && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="31"
            value={freq.timesPerPeriod || 1}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setTimesPerPeriod(e.target.value)}
            className="w-16 bg-slate-900 border-white/10 rounded-md px-2 py-1 text-sm font-bold focus:border-orange-400 outline-none"
          />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">mal / Monat</span>
        </div>
      )}
    </div>
  );
}
