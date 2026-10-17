// Habits-Ansicht für Journal v2 (Design "Raster"): alle Habits mit
// Heute-Toggle, Streak, 28-Tage-Raster und Quote. Reine Darstellung,
// Daten + Schreibzugriffe kommen als Props aus JournalV2View.
import { useState } from "react";
import { addDays, format, parseISO } from "date-fns";

const iso = (d) => format(d, "yyyy-MM-dd");
const WINDOW = 28;

// Streak = aufeinanderfolgende erledigte Tage bis zum gewählten Tag; ist der
// gewählte Tag noch offen, zählt die Serie bis gestern (Tag läuft ja noch).
function streakOf(habit, endDate) {
  let d = parseISO(endDate);
  if (!habit.hasRecord(iso(d))) d = addDays(d, -1);
  let n = 0;
  while (n < 120 && habit.hasRecord(iso(d))) {
    n += 1;
    d = addDays(d, -1);
  }
  return n;
}

export default function HabitsView({ date, habits, onToggle, onAdd, onArchive }) {
  const [name, setName] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const end = parseISO(date);
  const days = Array.from({ length: WINDOW }, (_, i) => iso(addDays(end, i - (WINDOW - 1))));

  const submit = (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    onAdd(name);
    setName("");
  };

  return (
    <div className="jv2-hab">
      {habits.length === 0 && <div className="jv2-empty">Noch keine Habits. Unten anlegen.</div>}
      {habits.map((h) => {
        const done = h.hasRecord(date);
        const hits = days.filter((d) => h.hasRecord(d)).length;
        const rate = Math.round((hits / WINDOW) * 100);
        const streak = streakOf(h, date);
        return (
          <div key={h.uuid} className={`jv2-hrow${done ? " done" : ""}`}>
            <button type="button" className="jv2-htoggle" aria-pressed={done} aria-label={`${h.name} für ${date} ${done ? "zurücknehmen" : "erledigen"}`} onClick={() => onToggle(h)}>
              <i>{done ? "✓" : ""}</i>
            </button>
            <div className="jv2-hmain">
              <h3>{h.name}</h3>
              <div className="jv2-hstats">
                <span>Serie {streak}</span>
                <span>{rate} % · {hits}/{WINDOW} T</span>
              </div>
              <div className="jv2-hstrip" aria-hidden="true">
                {days.map((d) => <i key={d} className={h.hasRecord(d) ? "on" : ""} title={d} />)}
              </div>
            </div>
            {confirmId === h.uuid ? (
              <button type="button" className="jv2-hdel sure" onClick={() => { onArchive(h); setConfirmId(null); }}>
                Archivieren?
              </button>
            ) : (
              <button type="button" className="jv2-hdel" aria-label={`${h.name} archivieren`} onClick={() => setConfirmId(h.uuid)}>×</button>
            )}
          </div>
        );
      })}
      <form className="jv2-compose" onSubmit={submit}>
        <input id="jv2-habit-input" aria-label="Neues Habit" placeholder="Neues Habit …" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" disabled={!name.trim()}>Neu</button>
      </form>
    </div>
  );
}
