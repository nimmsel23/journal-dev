// Wochen- und Monatsansicht für Journal v2 (Design "Raster").
// Reine Darstellung: Daten kommen als Props aus JournalV2View.
import {
  addDays, eachDayOfInterval, endOfMonth, endOfISOWeek, endOfYear, format, getISODay, getISOWeek,
  isSameMonth, startOfMonth, startOfISOWeek, startOfYear,
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
  if (mode === "jahr") return [startOfYear(day), endOfYear(day)];
  // Monat inkl. Randtage, damit das Raster volle Wochen zeigt
  return [startOfISOWeek(startOfMonth(day)), endOfISOWeek(endOfMonth(day))];
}

export function WeekView({ day, entries, habits, events = new Map(), onPick }) {
  const [from, to] = rangeFor("woche", day);
  const days = eachDayOfInterval({ start: from, end: to });
  const byDate = groupByDate(entries);
  const today = iso(new Date());
  // p2-weekly: Wochenbilanz aus den vorhandenen Props — reine Client-
  // Aggregation, keine neue Query, kein KI, keine Datenveraenderung.
  const weekKeys = days.map(iso);
  const lists = weekKeys.map((key) => byDate.get(key) || []);
  const total = lists.reduce((n, list) => n + list.length, 0);
  const loggedDays = lists.filter((list) => list.length > 0).length;
  const eventsTotal = weekKeys.reduce((n, key) => n + (events.get(key) || []).length, 0);
  const avg = (total / 7).toFixed(1).replace(".", ",");
  // Skill-/Tag-Verteilung: nur persistierte e.tags (kein Text-Re-Parsing).
  const tagCounts = new Map();
  entries.forEach((e) => (e.tags || []).forEach((t) => tagCounts.set(t, (tagCounts.get(t) || 0) + 1)));
  const tagList = [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return (
    <div className="jv2-week">
      <div className="jv2-wsum" role="status">
        <span><b>{total}</b> {total === 1 ? "Eintrag" : "Einträge"}</span>
        <span><b>{loggedDays}</b>/7 Tage mit Eintrag</span>
        <span>⌀ {avg}/Tag</span>
        {eventsTotal > 0 && <span><b>{eventsTotal}</b> {eventsTotal === 1 ? "Termin" : "Termine"}</span>}
      </div>
      {weekKeys.map((key, i) => {
        const d = days[i];
        const list = byDate.get(key) || [];
        const done = habits.filter((h) => h.hasRecord(key)).length;
        const evs = events.get(key) || [];
        return (
          <button key={key} type="button" className={`jv2-wrow${key === today ? " today" : ""}`} onClick={() => onPick(key)}>
            <span className="jv2-wnum">{format(d, "dd")}</span>
            <span className="jv2-wmain">
              <span className="jv2-wday">{format(d, "EEEE", { locale: de })}</span>
              {list.length === 0 ? (
                <span className="jv2-wempty">—</span>
              ) : (
                <span className="jv2-wline">{firstLine(list[list.length - 1].text)}</span>
              )}
              {(list.length > 0 || evs.length > 0) && (
                <span className="jv2-wcount">
                  {list.length > 0 && `${list.length} ${list.length === 1 ? "Eintrag" : "Einträge"}`}
                  {list.length > 0 && evs.length > 0 && " · "}
                  {evs.length > 0 && `${evs.length} ${evs.length === 1 ? "Termin" : "Termine"}`}
                </span>
              )}
            </span>
            <span className="jv2-wdots" aria-label={`${done} von ${habits.length} Habits`}>
              {habits.map((h) => <i key={h.uuid} className={h.hasRecord(key) ? "on" : ""} />)}
            </span>
          </button>
        );
      })}
      {habits.length > 0 && (
        <div className="jv2-whabits" aria-label="Habit-Wochenbilanz">
          {habits.map((h) => {
            const done = weekKeys.reduce((n, key) => n + (h.hasRecord(key) ? 1 : 0), 0);
            return (
              <span key={h.uuid} className="jv2-whabit">
                <span className="jv2-whname" title={h.name}>{h.name}</span>
                <span className="jv2-whbar" aria-hidden="true"><i style={{ width: `${Math.round((done / 7) * 100)}%` }} /></span>
                <b>{done}/7</b>
              </span>
            );
          })}
        </div>
      )}
      {tagList.length > 0 && (
        <div className="jv2-wtags" aria-label="Skill- und Tag-Verteilung der Woche">
          {tagList.map(([tag, count]) => (
            <span key={tag} className="jv2-tag jv2-wtag">+{tag} <b>{count}×</b></span>
          ))}
        </div>
      )}
      {loggedDays > 0 && (
        <details className="jv2-wmirror">
          <summary>Wochenspiegel · Exzerpte pro Tag</summary>
          {weekKeys.map((key, i) => {
            const list = lists[i];
            if (list.length === 0) return null;
            return (
              <div key={key} className="jv2-wmday">
                <button type="button" onClick={() => onPick(key)}>
                  {format(days[i], "EEE d.M.", { locale: de })} · {list.length} {list.length === 1 ? "Eintrag" : "Einträge"}
                </button>
                {list.slice(0, 2).map((e) => <p key={e.id}>{firstLine(e.text)}</p>)}
                {list.length > 2 && <p className="jv2-wmmore">+{list.length - 2} weitere</p>}
              </div>
            );
          })}
        </details>
      )}
    </div>
  );
}

export function MonthView({ day, entries, habits, events = new Map(), onPick }) {
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
            const ne = (events.get(key) || []).length;
            const full = habits.length > 0 && done === habits.length;
            const cls = ["jv2-mcell", isSameMonth(d, day) ? "" : "out", key === today ? "today" : "", full ? "full" : ""].join(" ");
            return (
              <button key={key} type="button" className={cls} onClick={() => onPick(key)} aria-label={`${format(d, "d. MMMM", { locale: de })}: ${n} Einträge, ${done} Habits`}>
                <b>{format(d, "d")}</b>
                <span className="jv2-mmark">
                  {n > 0 && <em>{n}</em>}
                  {ne > 0 && <u title={`${ne} Termine`}>{ne}</u>}
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

// Jahresübersicht: zwölf Mini-Monate, jeder Tag ein Feld nach Zahl der Einträge (0 / 1 / 2 / 3+).
export function YearView({ day, entries, onPick, onPickMonth }) {
  const byDate = groupByDate(entries);
  const today = iso(new Date());
  const year = day.getFullYear();
  return (
    <div className="jv2-year">
      {Array.from({ length: 12 }, (_, m) => {
        const first = new Date(year, m, 1);
        const days = eachDayOfInterval({ start: first, end: endOfMonth(first) });
        const total = days.reduce((n, d) => n + (byDate.get(iso(d))?.length || 0), 0);
        return (
          <section className="jv2-ymonth" key={m}>
            <button type="button" className="jv2-yhead" onClick={() => onPickMonth(iso(first))} aria-label={`${format(first, "MMMM", { locale: de })}: ${total} Einträge`}>
              <span>{format(first, "MMM", { locale: de })}</span>
              {total > 0 && <em>{total}</em>}
            </button>
            <div className="jv2-ydays">
              {Array.from({ length: getISODay(first) - 1 }, (_, i) => <span key={`o${i}`} aria-hidden="true" />)}
              {days.map((d) => {
                const key = iso(d);
                const n = (byDate.get(key) || []).length;
                return (
                  <button key={key} type="button" className={`jv2-yday${key === today ? " today" : ""}`} data-n={Math.min(n, 3)}
                    onClick={() => onPick(key)} aria-label={`${format(d, "d. MMMM", { locale: de })}: ${n} Einträge`}>{format(d, "d")}</button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
