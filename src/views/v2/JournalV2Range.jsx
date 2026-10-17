// Wochen- und Monatsansicht für Journal v2 (Design "Raster").
// Reine Darstellung: Daten kommen als Props aus JournalV2View.
import {
  addDays, eachDayOfInterval, endOfMonth, endOfISOWeek, format, getISOWeek,
  isSameMonth, startOfMonth, startOfISOWeek,
} from "date-fns";
import { de } from "date-fns/locale";

const iso = (d) => format(d, "yyyy-MM-dd");

function groupByDate(entries = []) {
  const map = new Map();
  entries.forEach((e) => {
    if (!map.has(e.date)) map.set(e.date, []);
    map.get(e.date).push(e);
  });
  return map;
}

function firstLine(text) {
  return String(text || "").split("\n")[0].slice(0, 80);
}

export function rangeFor(mode, day) {
  if (mode === "woche") return [startOfISOWeek(day), endOfISOWeek(day)];
  // Monat inkl. Randtage, damit das Raster volle Wochen zeigt
  return [startOfISOWeek(startOfMonth(day)), endOfISOWeek(endOfMonth(day))];
}

export function WeekView({ day, entries, habits, onPick }) {
  const [from, to] = rangeFor("woche", day);
  const byDate = groupByDate(entries);
  const today = iso(new Date());
  return (
    <div className="jv2-week">
      {eachDayOfInterval({ start: from, end: to }).map((d) => {
        const key = iso(d);
        const list = byDate.get(key) || [];
        const done = habits.filter((h) => h.hasRecord(key)).length;
        return (
          <button key={key} type="button" className={`jv2-wrow${key === today ? " today" : ""}`} onClick={() => onPick(key)}>
            <span className="jv2-wnum">{format(d, "dd")}</span>
            <span className="jv2-wmain">
              <span className="jv2-wday">{format(d, "EEEE", { locale: de })}</span>
              {list.length === 0 ? (
                <span className="jv2-wempty">—</span>
              ) : (
                <>
                  <span className="jv2-wline">{firstLine(list[list.length - 1].text)}</span>
                  <span className="jv2-wcount">{list.length} {list.length === 1 ? "Eintrag" : "Einträge"}</span>
                </>
              )}
            </span>
            <span className="jv2-wdots" aria-label={`${done} von ${habits.length} Habits`}>
              {habits.map((h) => <i key={h.uuid} className={h.hasRecord(key) ? "on" : ""} />)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function MonthView({ day, entries, habits, onPick }) {
  const [from, to] = rangeFor("monat", day);
  const byDate = groupByDate(entries);
  const today = iso(new Date());
  const days = eachDayOfInterval({ start: from, end: to });
  const heads = eachDayOfInterval({ start: from, end: addDays(from, 6) });
  return (
    <div className="jv2-month">
      <div className="jv2-mhead">
        <span className="jv2-mkw" />
        {heads.map((d) => <span key={iso(d)}>{format(d, "EEEEEE", { locale: de })}</span>)}
      </div>
      {Array.from({ length: days.length / 7 }, (_, w) => days.slice(w * 7, w * 7 + 7)).map((week) => (
        <div className="jv2-mweek" key={iso(week[0])}>
          <span className="jv2-mkw">{getISOWeek(week[0])}</span>
          {week.map((d) => {
            const key = iso(d);
            const n = (byDate.get(key) || []).length;
            const done = habits.filter((h) => h.hasRecord(key)).length;
            const full = habits.length > 0 && done === habits.length;
            const cls = ["jv2-mcell", isSameMonth(d, day) ? "" : "out", key === today ? "today" : "", full ? "full" : ""].join(" ");
            return (
              <button key={key} type="button" className={cls} onClick={() => onPick(key)} aria-label={`${format(d, "d. MMMM", { locale: de })}: ${n} Einträge, ${done} Habits`}>
                <b>{format(d, "d")}</b>
                <span className="jv2-mmark">
                  {n > 0 && <em>{n}</em>}
                  {done > 0 && <i style={{ width: `${(done / Math.max(habits.length, 1)) * 100}%` }} />}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
