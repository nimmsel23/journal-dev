// MapDocsPanel — Freedom (Ideal Parallel World · Annual · Quarterly) und Focus (Monthly · Weekly),
// jeweils in allen vier Domains. Autosave: Entwurf beim Tippen im localStorage, entprellt lokal gespeichert, sofort beim
// Verlassen des Feldes/der Seite (AutosaveArea, mapDb.js). Fehler bleiben still, die Daten kommen aus dem lokalen Cache.
import { useState } from "react";
import { useLiveSnap } from "../../lib/useLiveSnap.js";
import AutosaveArea from "./AutosaveArea.jsx";
import { DOMAINS, MAP_KINDS, periodKey, periodLabel, saveMapAnswer, shiftPeriod, watchMapDocs } from "./mapDb.js";

export default function MapDocsPanel({ kind, uid }) {
  const spec = MAP_KINDS[kind];
  const views = Object.entries(spec.views);
  const [viewKey, setViewKey] = useState(views[0][0]);
  const [day, setDay] = useState(() => new Date());
  const view = spec.views[viewKey];
  const period = periodKey(view.period, day);
  const q = useLiveSnap(!!uid, (next, fail) => watchMapDocs(uid, kind, viewKey, period, next, fail), [uid, kind, viewKey, period]);

  if (!uid) return <div className="dv2-empty">{spec.label} speichern braucht den Cloud-Login.</div>;
  // lokal speichern, Abgleich im Hintergrund (nie awaiten); Fehler nur in der Konsole
  const save = (domain, key, value) => { saveMapAnswer(uid, kind, viewKey, period, domain, key, value); };
  return (
    <>
      <div className="dv2-modes gv2-views" role="tablist" aria-label={`${spec.label}-Map`} style={{ gridTemplateColumns: `repeat(${views.length}, 1fr)` }}>
        {views.map(([k, v]) => (
          <button key={k} type="button" role="tab" aria-selected={k === viewKey} onClick={() => setViewKey(k)}>{v.label}</button>
        ))}
      </div>
      {view.period && (
        <div className="dv2-src">
          <button type="button" className="dv2-link" onClick={() => setDay(shiftPeriod(view.period, day, -1))}>← zurück</button>
          <b>{periodLabel(view.period, day)}</b>
          <button type="button" className="dv2-link" onClick={() => setDay(shiftPeriod(view.period, day, 1))}>weiter →</button>
        </div>
      )}
      {DOMAINS.map((d) => {
        const ans = q.data?.[d]?.answers || {};
        const filled = view.fields.filter((f) => (ans[f.key] || "").trim()).length;
        return (
          <details key={`${viewKey}-${period}-${d}`} className="gv2-frame">
            <summary><b>{d[0].toUpperCase() + d.slice(1)}</b> <span>{filled}/{view.fields.length}</span></summary>
            {view.fields.map((f) => (
              <label key={f.key} className="gv2-step"><b className="gv2-q">{f.label}</b><small className="gv2-hint">{f.prompt}</small>
                <AutosaveArea rows={f.key === "outcomes" ? 4 : 3} ready={q.ready || !!q.error} remote={ans[f.key] || ""}
                  storageKey={`${uid}:map:${kind}:${viewKey}:${period}:${d}:${f.key}`} onSave={(v) => save(d, f.key, v)} />
              </label>
            ))}
          </details>
        );
      })}
    </>
  );
}
