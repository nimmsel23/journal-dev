// Die vier Phasen-Panels von Door v2. Query-Keys tragen die uid, damit ein
// Nutzerwechsel keine fremden Daten aus dem Cache zeigt.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { door } from "../../../lib/door/source.js";
import { fetchProfitGtasks, addDailyHit } from "../../../lib/door/gtasks.door.js";
import { fetchProfitTw } from "../../../lib/door/taskwarrior.door.js";

const MSGS = {
  "gtasks-expired": "Google-Tasks-Sitzung abgelaufen – oben neu verbinden.",
  "taskwarrior-readonly": "Taskwarrior ist hier nur lesend – bitte in Taskwarrior ändern und danach „Sync“ drücken.",
  "tc-unconfigured": "Taskwarrior ist nicht eingerichtet.",
  "tc-decrypt": "Entschlüsselung fehlgeschlagen – Client-ID oder Secret falsch.",
  "tc-network": "Sync-Server nicht erreichbar (offline, CORS oder Proxy).",
};
const msg = (e) => MSGS[e?.message] || e?.message || "Fehler";
const selectorFor = (i) => i?.id || i?.task_uuid || i?.tw_uuid || i?.selector || "";
const keyFor = (i) => i.war_uuid || i.id || i.task_uuid || "";

function State({ q, children, empty }) {
  if (q.isLoading) return <div className="dv2-empty">Lade …</div>;
  if (q.isError) {
    return <div className="dv2-empty" role="alert">{msg(q.error)} <button type="button" className="dv2-link" onClick={() => q.refetch()}>Erneut versuchen</button></div>;
  }
  return empty ? <div className="dv2-empty">{empty}</div> : children;
}

/* ── Potential: Hot List ── */
export function PotentialPanel({ uid, source = "backend" }) {
  const D = door(source);
  const qc = useQueryClient();
  const key = ["dv2-hotlist", uid, source];
  const [draft, setDraft] = useState("");
  const [armed, setArmed] = useState(null); // Zwei-Klick-Löschen
  const [err, setErr] = useState("");
  const q = useQuery({ queryKey: key, queryFn: () => D.fetchHotlist("active"), staleTime: 15_000 });
  const refresh = () => qc.invalidateQueries({ queryKey: key });
  const run = async (fn) => {
    setErr("");
    try { await fn(); await refresh(); } catch (e) { setErr(msg(e)); }
  };
  const items = (q.data || []).filter((i) => i.status !== "done" && i.status !== "deleted");
  const submit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    run(async () => { await D.addHotlistItem(text); setDraft(""); });
  };
  const del = (sel) => {
    if (armed !== sel) { setArmed(sel); return; }
    setArmed(null);
    run(() => D.deleteHotlistItem(sel));
  };
  return (
    <>
      <State q={q} empty={!q.isLoading && !q.isError && items.length === 0 ? "Hot List leer." : null}>
        {items.map((i) => {
          const sel = selectorFor(i);
          return (
            <div key={sel || i.title} className="dv2-row">
              <button type="button" className="dv2-check" aria-label="Erledigt" onClick={() => run(() => D.completeHotlistItem(sel))}><i /></button>
              <div className="dv2-text"><h3>{i.title}</h3></div>
              <button type="button" className={`dv2-del${armed === sel ? " armed" : ""}`} aria-label={armed === sel ? "Löschen bestätigen" : "Löschen"} onClick={() => del(sel)} onBlur={() => setArmed(null)}>{armed === sel ? "Löschen?" : "×"}</button>
            </div>
          );
        })}
      </State>
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      <form className="dv2-compose" onSubmit={submit}>
        <input aria-label="Neues Hot-List-Item" placeholder="Neue Idee …" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="submit" disabled={!draft.trim()}>Add</button>
      </form>
    </>
  );
}

/* ── Plan: Door War ── */
const QLABEL = { 1: "Q1 · Dringend + Wichtig", 2: "Q2 · Wichtig, nicht dringend", 3: "Q3 · Dringend, nicht wichtig", 4: "Q4 · Weder noch" };
export function PlanPanel({ uid, source = "backend" }) {
  const D = door(source);
  const qc = useQueryClient();
  const key = ["dv2-plan", uid, source];
  const [err, setErr] = useState("");
  const q = useQuery({ queryKey: key, queryFn: D.fetchDoorWar, staleTime: 15_000 });
  const act = useMutation({
    mutationFn: (fn) => fn(),
    onSuccess: () => { setErr(""); qc.invalidateQueries({ queryKey: key }); },
    onError: (e) => setErr(msg(e)),
  });
  const board = q.data?.board || { 1: [], 2: [], 3: [], 4: [], unsorted: [] };
  const byKey = new Map((q.data?.candidates || []).map((i) => [keyFor(i), i]));
  const selected = q.data?.selected?.selector || q.data?.doorWar?.selected?.selector || "";
  const total = Object.values(board).reduce((n, a) => n + (a?.length || 0), 0);
  const Item = ({ k }) => {
    const item = byKey.get(k);
    if (!item) return null;
    const isDoor = selected === k;
    return (
      <div className={`dv2-row dv2-plan${isDoor ? " door" : ""}`}>
        <div className="dv2-text">
          <h3>{item.title}</h3>
          <div className="dv2-qs">
            {[1, 2, 3, 4].map((n) => (
              <button key={n} type="button" aria-pressed={item.quadrant === n} disabled={act.isPending} onClick={() => act.mutate(() => D.assignQuadrant(k, n))}>Q{n}</button>
            ))}
            {item.quadrant === 2 && (isDoor
              ? <span className="dv2-tag">Door der Woche</span>
              : <button type="button" className="dv2-pick" disabled={act.isPending} onClick={() => act.mutate(() => D.selectWeeklyDoor(k))}>Door wählen</button>)}
          </div>
        </div>
      </div>
    );
  };
  return (
    <State q={q} empty={!q.isLoading && !q.isError && total === 0 ? "Keine Kandidaten. Erst Items in Potential anlegen." : null}>
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      {[1, 2, 3, 4].map((n) => (
        <section key={n}>
          <h4 className="dv2-sec">{QLABEL[n]} <span>{(board[n] || []).length}</span></h4>
          {(board[n] || []).map((k) => <Item key={k} k={k} />)}
        </section>
      ))}
      {(board.unsorted || []).length > 0 && (
        <section>
          <h4 className="dv2-sec">Unsortiert <span>{board.unsorted.length}</span></h4>
          {board.unsorted.map((k) => <Item key={k} k={k} />)}
        </section>
      )}
    </State>
  );
}

/* ── Production: Daily Hits ── */
const DAYS = [["mon", "Mo"], ["tue", "Di"], ["wed", "Mi"], ["thu", "Do"], ["fri", "Fr"], ["sat", "Sa"], ["sun", "So"]];
export function ProductionPanel({ uid, source = "backend" }) {
  const D = door(source);
  const qc = useQueryClient();
  const [err, setErr] = useState("");
  const q = useQuery({ queryKey: ["dv2-prod", uid, source], queryFn: () => D.fetchDailyWeek(), staleTime: 15_000 });
  const s = useQuery({ queryKey: ["dv2-prod-sum", uid, source], queryFn: D.fetchHitsWeek, staleTime: 15_000 });
  const tog = useMutation({
    mutationFn: (id) => D.toggleDailyHit(id),
    onSuccess: () => { setErr(""); qc.invalidateQueries({ queryKey: ["dv2-prod", uid, source] }); qc.invalidateQueries({ queryKey: ["dv2-prod-sum", uid, source] }); },
    onError: (e) => setErr(msg(e)),
  });
  const [draft, setDraft] = useState("");
  const [day, setDay] = useState(() => DAYS[Math.min(6, (new Date().getDay() + 6) % 7)][0]);
  const add = useMutation({
    mutationFn: ({ day: d, t }) => addDailyHit(d, t),
    onSuccess: () => { setErr(""); setDraft(""); qc.invalidateQueries({ queryKey: ["dv2-prod", uid, source] }); qc.invalidateQueries({ queryKey: ["dv2-prod-sum", uid, source] }); },
    onError: (e) => setErr(msg(e)),
  });
  const days = q.data?.days || {};
  const none = !q.isLoading && !q.isError && !DAYS.some(([d]) => (days[d] || []).length);
  const sum = s.data;
  return (
    <>
      <div className="dv2-sum">
        <b>{sum ? `${sum.completed_hits}/${sum.total_hits}` : "–"}</b>
        <span>Hits der Woche{sum ? ` · ${Math.round((sum.completion_rate || 0) * 100)} %` : ""}{q.data?.week ? ` · ${q.data.week}` : ""}</span>
      </div>
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      {source === "gtasks" && (
        <form className="dv2-compose" onSubmit={(e) => { e.preventDefault(); const t = draft.trim(); if (t) add.mutate({ day, t }); }}>
          <select aria-label="Tag" value={day} onChange={(e) => setDay(e.target.value)}>{DAYS.map(([d, l]) => <option key={d} value={d}>{l}</option>)}</select>
          <input aria-label="Neuer Hit" placeholder="Neuer Hit …" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button type="submit" disabled={!draft.trim() || add.isPending}>Add</button>
        </form>
      )}
      <State q={q} empty={none ? (source === "gtasks" ? "Keine Hits diese Woche. Oben einen anlegen." : "Kein Daily-Plan. Erst einen War Stack im Plan anlegen.") : null}>
        <div className="dv2-grid">
          {DAYS.map(([d, label]) => {
            const items = days[d] || [];
            return (
              <div key={d} className="dv2-day">
                <h4>{label}</h4>
                {items.length === 0 && <span className="dv2-none">–</span>}
                {items.map((it) => (
                  <button key={it.id} type="button" className={`dv2-hit${it.done ? " done" : ""}${it.kind === "big" ? " big" : ""}`} aria-pressed={!!it.done} disabled={tog.isPending} onClick={() => tog.mutate(it.id)}>
                    <i>{it.done ? "✓" : ""}</i>
                    <span>{it.label || it.fact || "— leer —"}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </State>
    </>
  );
}

/* ── Profit: Auswertung (nur lesen) ── */
export function ProfitPanel({ uid, source = "backend" }) {
  return source === "gtasks" || source === "taskwarrior" ? <ProfitGtasks uid={uid} source={source} /> : <ProfitBackend uid={uid} source={source} />;
}

/* Quelle Google Tasks: Wochen-Auswertung aus erledigten Tasks, keine Reflexionen */
function ProfitGtasks({ uid, source }) {
  const q = useQuery({ queryKey: ["dv2-profit-gt", uid, source], queryFn: source === "taskwarrior" ? fetchProfitTw : fetchProfitGtasks, staleTime: 15_000 });
  const weeks = q.data?.weeks || [];
  const doors = q.data?.doors || [];
  return (
    <State q={q}>
      <h4 className="dv2-sec">Erledigt pro Woche <span>{weeks.length}</span></h4>
      {weeks.map((w) => (
        <div key={w.week} className="dv2-row"><div className="dv2-text"><h3>{w.week}</h3><p>{w.potential} Potential · {w.hits} Hits</p></div></div>
      ))}
      <h4 className="dv2-sec">Erledigte Wochen-Doors <span>{doors.length}</span></h4>
      {doors.length === 0 ? <div className="dv2-empty">Noch keine erledigte Door.</div> : doors.map((x) => (
        <div key={x.id} className="dv2-row"><div className="dv2-text"><h3>{x.door_title}</h3><p>{x.week}</p></div></div>
      ))}
    </State>
  );
}

function ProfitBackend({ uid, source }) {
  const D = door(source);
  const w = useQuery({ queryKey: ["dv2-profit", uid, source], queryFn: () => D.fetchProfitWeek(), staleTime: 15_000 });
  const c = useQuery({ queryKey: ["dv2-profit-done", uid, source], queryFn: D.fetchCompletedWarstacks, staleTime: 15_000 });
  const r = useQuery({ queryKey: ["dv2-profit-refl", uid, source], queryFn: D.fetchReflections, staleTime: 15_000 });
  const ws = w.data?.warstack;
  const title = ws?.door_title || w.data?.selected?.title;
  const done = c.data || [];
  const refl = r.data || [];
  return (
    <>
      <State q={w}>
        <div className="dv2-sum">
          <b>{ws ? `${ws.hit_done_count}/${ws.hit_count}` : "–"}</b>
          <span>{title ? `Door: ${title}` : "Keine Door gewählt"}{ws?.opened ? " · geöffnet" : ""}{w.data?.week ? ` · ${w.data.week}` : ""}</span>
        </div>
        {ws ? (ws.hits || []).map((h) => (
          <div key={h.id} className="dv2-row">
            <span className={`dv2-check static${h.done ? " done" : ""}`}><i>{h.done ? "✓" : ""}</i></span>
            <div className="dv2-text"><h3>{h.fact || "— leer —"}</h3></div>
          </div>
        )) : <div className="dv2-empty">Noch kein War Stack für diese Woche.</div>}
      </State>
      <h4 className="dv2-sec">Abgeschlossene War Stacks <span>{done.length}</span></h4>
      {c.isError ? <div className="dv2-empty" role="alert">{msg(c.error)}</div>
        : done.length === 0 ? <div className="dv2-empty">{c.isLoading ? "Lade …" : "Noch keine abgeschlossenen War Stacks."}</div>
        : done.map((x) => (
          <div key={x.id} className="dv2-row"><div className="dv2-text"><h3>{x.door_title}</h3><p>{x.week} · {x.hit_count} Hits</p></div></div>
        ))}
      <h4 className="dv2-sec">Reflexionen <span>{refl.length}</span></h4>
      {r.isError ? <div className="dv2-empty" role="alert">{msg(r.error)}</div>
        : refl.length === 0 ? <div className="dv2-empty">{r.isLoading ? "Lade …" : "Keine Reflexionen."}</div>
        : refl.map((x) => (
          <div key={x.id || x.path} className="dv2-row"><div className="dv2-text"><h3>{x.door_title || "—"}</h3><p>{x.reflection || ""}</p></div></div>
        ))}
    </>
  );
}
