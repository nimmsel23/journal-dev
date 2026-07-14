import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { localToday, TYPE_COLORS } from "./journalUtils";

// Leichter Monats-Grid zur Timeline-Navigation (DayOne-Muster).
// Bewusst ohne Kalender-Library: FullCalendar existiert nicht in allen
// Konsumenten-Builds (fitness bündelt diesen Kern via Symlink).

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

function iso(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function JournalCalendar({ date, onSelectDate, timeline }) {
  const today = localToday();
  const [view, setView] = useState(() => {
    const [y, m] = (date || today).split("-").map(Number);
    return { year: y, month: m - 1 };
  });

  // Datum → bis zu 3 Typ-Farben für die Punkte unter dem Tag.
  const dotsByDate = useMemo(() => {
    const map = {};
    (timeline || []).forEach(group => {
      const colors = [];
      const seen = new Set();
      group.entries.forEach(e => {
        const c = TYPE_COLORS[e.type] || "var(--j-accent)";
        if (!seen.has(c) && colors.length < 3) { seen.add(c); colors.push(c); }
      });
      if (colors.length) map[group.date] = colors;
    });
    return map;
  }, [timeline]);

  const { year, month } = view;
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Mo=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const shift = (delta) => {
    const d = new Date(year, month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  };

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="p-4 rounded-2xl bg-[var(--j-card)] border border-[var(--j-line)] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => shift(-1)} className="p-2 rounded-xl hover:bg-[var(--j-bg2)] text-[var(--j-dim)] transition-all">
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--j-ink)]">{monthLabel(year, month)}</span>
          {iso(year, month, 1).slice(0, 7) !== today.slice(0, 7) && (
            <button
              onClick={() => { const [y, m] = today.split("-").map(Number); setView({ year: y, month: m - 1 }); }}
              className="text-[9px] font-bold uppercase tracking-widest text-[var(--j-accent)] hover:opacity-80"
            >
              Heute
            </button>
          )}
        </div>
        <button onClick={() => shift(1)} className="p-2 rounded-xl hover:bg-[var(--j-bg2)] text-[var(--j-dim)] transition-all">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-[9px] font-bold uppercase tracking-widest text-[var(--j-dim)] py-1">{w}</div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`pad-${i}`} />;
          const dStr = iso(year, month, d);
          const isFuture = dStr > today;
          const isSelected = dStr === date;
          const isToday = dStr === today;
          const dots = dotsByDate[dStr];
          return (
            <button
              key={dStr}
              disabled={isFuture}
              onClick={() => onSelectDate(dStr)}
              className={`relative flex flex-col items-center justify-center h-10 rounded-xl text-xs transition-all
                ${isFuture ? "opacity-20 cursor-default" : "hover:bg-[var(--j-bg2)]"}
                ${isSelected ? "bg-[var(--j-accent)] text-[var(--j-bg)] font-black hover:bg-[var(--j-accent)]" : "text-[var(--j-ink)]"}
                ${isToday && !isSelected ? "border border-[var(--j-accent)]/40" : ""}`}
            >
              {d}
              {dots && !isSelected && (
                <span className="absolute bottom-1 flex gap-0.5">
                  {dots.map((c, j) => (
                    <span key={j} className="w-1 h-1 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
