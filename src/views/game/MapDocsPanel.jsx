// MapDocsPanel — Freedom (Ideal Parallel World · Annual · Quarterly) und Focus (Monthly · Weekly),
// jeweils in allen vier Domains. Die Antworten speichern beim Verlassen des Feldes (mapDb.js).
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DOMAINS, MAP_KINDS, fetchMapDocs, periodKey, periodLabel, saveMapAnswer, shiftPeriod } from "./mapDb.js";

export default function MapDocsPanel({ kind, uid }) {
  const spec = MAP_KINDS[kind];
  const views = Object.entries(spec.views);
  const qc = useQueryClient();
  const [viewKey, setViewKey] = useState(views[0][0]);
  const [day, setDay] = useState(() => new Date());
  const [err, setErr] = useState("");
  const view = spec.views[viewKey];
  const period = periodKey(view.period, day);
  const qk = ["gv2-map", uid, kind, viewKey, period];
  const q = useQuery({ queryKey: qk, enabled: !!uid, queryFn: () => fetchMapDocs(uid, kind, viewKey, period), staleTime: 30_000 });

  if (!uid) return <div className="dv2-empty">{spec.label} speichern braucht den Cloud-Login.</div>;
  const msg = (e) => (e?.code === "permission-denied" ? "Keine Berechtigung für journal/… – Firestore-Rules prüfen." : e?.message || "Fehler");
  const save = async (domain, key, value, old) => {
    if (value.trim() === (old || "").trim()) return;
    setErr("");
    try { await saveMapAnswer(uid, kind, viewKey, period, domain, key, value.trim()); qc.invalidateQueries({ queryKey: qk }); }
    catch (e) { setErr(msg(e)); }
  };
  return (
    <>
      <div className="dv2-modes gv2-views" role="tablist" aria-label={`${spec.label}-Map`} style={{ gridTemplateColumns: `repeat(${views.length}, 1fr)` }}>
        {views.map(([k, v]) => (
          <button key={k} type="button" role="tab" aria-selected={k === viewKey} onClick={() => { setViewKey(k); setErr(""); }}>{v.label}</button>
        ))}
      </div>
      {view.period && (
        <div className="dv2-src">
          <button type="button" className="dv2-link" onClick={() => setDay(shiftPeriod(view.period, day, -1))}>← zurück</button>
          <b>{periodLabel(view.period, day)}</b>
          <button type="button" className="dv2-link" onClick={() => setDay(shiftPeriod(view.period, day, 1))}>weiter →</button>
        </div>
      )}
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      {q.isError && <div className="dv2-empty" role="alert">{msg(q.error)}</div>}
      {DOMAINS.map((d) => {
        const ans = q.data?.[d]?.answers || {};
        const filled = view.fields.filter((f) => (ans[f.key] || "").trim()).length;
        return (
          <details key={`${viewKey}-${period}-${d}`} className="gv2-frame">
            <summary><b>{d[0].toUpperCase() + d.slice(1)}</b> <span>{filled}/{view.fields.length}</span></summary>
            {view.fields.map((f) => (
              <label key={`${f.key}-${ans[f.key] || ""}`} className="gv2-step"><b className="gv2-q">{f.label}</b><small className="gv2-hint">{f.prompt}</small>
                <textarea rows={f.key === "outcomes" ? 4 : 3} defaultValue={ans[f.key] || ""} onBlur={(e) => save(d, f.key, e.target.value, ans[f.key])} />
              </label>
            ))}
          </details>
        );
      })}
    </>
  );
}
