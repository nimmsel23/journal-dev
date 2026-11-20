import { useState } from "react";
import { format, startOfISOWeek, addDays } from "date-fns";
import { FIRE_DOMAINS, fireWeek } from "../../lib/door/fireWeek.js";
import { usePersistedText } from "../../lib/useAutosaveField.js";

export default function FireDomains({ all, uid, busy, onToggle, onAdd }) {
  const groups = fireWeek(all);
  const [text, setText] = usePersistedText(`${uid}:fire:domain-action`);
  const [domain, setDomain] = useState("body");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const monday = startOfISOWeek(new Date());
  async function submit(event) {
    event.preventDefault();
    if (!text.trim() || !date) return;
    setError("");
    try { await onAdd({ text: text.trim(), domain, date }); setText(""); }
    catch (err) { setError(err.message || "Aktion konnte nicht gespeichert werden."); }
  }
  return <section>
    <h4 className="dv2-sec">Structured Blaze · Wochenaktionen <span>4 × 4 als Orientierung</span></h4>
    {Object.entries(groups).map(([key, tasks]) => key === "unassigned" && !tasks.length ? null : <details className="gv2-frame" key={key} open>
      <summary><b>{key === "unassigned" ? "Ohne Domain" : key[0].toUpperCase() + key.slice(1)}</b><span>{tasks.filter((t) => t.status === "completed").length}/{tasks.length} erledigt</span></summary>
      {tasks.length ? tasks.map((task) => <button type="button" className={`dv2-hit gv2-action ${task.status === "completed" ? "done" : ""}`} key={task.uuid} disabled={busy} onClick={() => onToggle(task)} aria-pressed={task.status === "completed"} style={{ width: "100%" }}>
        <i /><span>{task.description}<small style={{ display: "block", opacity: .6 }}>{task.due ? format(new Date(Number(task.due) * 1000), "dd.MM.") : "Ohne Termin"}</small></span>
      </button>) : <p className="dv2-empty">Noch keine Wochenaktion geplant.</p>}
    </details>)}
    <form onSubmit={submit} className="gv2-step">
      <label>Aktion<input aria-label="Neue Wochenaktion" required disabled={busy} value={text} onChange={(e) => setText(e.target.value)} placeholder="Welches konkrete Ergebnis willst du erreichen?" /></label>
      <label>Domain<select disabled={busy} value={domain} onChange={(e) => setDomain(e.target.value)}>{FIRE_DOMAINS.map((d) => <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>)}</select></label>
      <label>Tag<input type="date" required disabled={busy} min={format(monday, "yyyy-MM-dd")} max={format(addDays(monday, 4), "yyyy-MM-dd")} value={date} onChange={(e) => setDate(e.target.value)} /></label>
      <small className="gv2-hint">Mo–Do planen; Freitag als Puffer. Du wählst den Tag selbst.</small>
      {error && <p role="alert">{error}</p>}
      <button className="dv2-link" type="submit" disabled={busy || !text.trim() || !date}>Wochenaktion anlegen</button>
    </form>
  </section>;
}
