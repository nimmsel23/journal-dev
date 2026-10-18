// War-Stack-Wizard für den Plan (Quelle „Backend“): startet mit der Door der Woche und
// führt die 11 Schritte aus WARSTACK_STEPS durch (Hits als 4×4 Felder).
// Logik/Speicherung liegen in lib/door/plan.* (REST lokal, Firestore in der Cloud).
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as backendPlan from "../../../lib/door/plan.js";
import { WARSTACK_STEPS } from "../../../lib/door/warstack.js";

const DOMAINS = ["Power", "Production", "Process", "Protection"];
const HIT_FIELDS = [["fact", "Fact"], ["obstacle", "Obstacle"], ["strike", "Strike"], ["responsibility", "Responsibility"]];
const emptyHits = () => Array.from({ length: 4 }, () => ({ id: crypto.randomUUID(), fact: "", obstacle: "", strike: "", responsibility: "", done: false, completed_at: null }));
const errText = (e) => ({ answer_required: "Bitte eine Antwort eingeben.", hits_required: "Es müssen 4 Hits angegeben werden.", door_required: "Erst eine Door der Woche wählen." }[e?.message] || e?.message || "Fehler");

export default function WarstackWizard({ uid, door, onDone, api = backendPlan, scope = "backend", autoStart = false }) {
  const plan = api;
  const qc = useQueryClient();
  const [s, setS] = useState(null); // {id, step, question, hits}
  const [value, setValue] = useState("");
  const [hits, setHits] = useState(emptyHits);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const sessions = useQuery({ queryKey: ["dv2-ws-sessions", uid, scope], queryFn: plan.fetchWarstackSessions, staleTime: 15_000 });

  const show = (next) => {
    setS(next); setValue(""); setErr("");
    if (next?.hits?.length === 4) setHits(next.hits);
  };
  const run = async (fn) => {
    setBusy(true); setErr("");
    try { await fn(); } catch (e) { setErr(errText(e)); }
    setBusy(false);
  };
  const start = () => run(async () => {
    const r = await plan.startWarstack(door?.title || "Door", door?.id || "");
    show({ id: r.sessionId, step: r.step, question: r.question });
    qc.invalidateQueries({ queryKey: ["dv2-ws-sessions", uid, scope] });
  });
  // direkt starten (z. B. aus Potential): bestehende Session derselben Door fortsetzen, sonst neu
  useEffect(() => {
    if (!autoStart || !door || s) return;
    if (sessions.isLoading) return;
    const existing = (sessions.data || []).find((x) => x.id === door.id || x.source_selector === door.id);
    if (existing && (existing.step_index || 0) < WARSTACK_STEPS.length) resume(existing); else start();
  }, [autoStart, sessions.isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const resume = (sess) => {
    const st = WARSTACK_STEPS[sess.step_index || 0];
    if (st) show({ id: sess.id, step: st.key, question: st.question, hits: sess.hits });
  };
  const submit = (e) => {
    e.preventDefault();
    run(async () => {
      const payload = s.step === "hits" ? { hits } : { answer: value.trim() };
      const r = await plan.answerWarstack(s.id, s.step, payload);
      qc.invalidateQueries({ queryKey: ["dv2-ws-sessions", uid, scope] });
      qc.invalidateQueries({ queryKey: ["dv2-ws-done", uid, scope] });
      if (r.done) { setS(null); onDone?.(r.warstack); }
      else show({ id: s.id, step: r.step, question: r.question, hits: r.hits });
    });
  };

  const idx = s ? WARSTACK_STEPS.findIndex((x) => x.key === s.step) : -1;
  const open = (sessions.data || []).filter((x) => (x.step_index || 0) < WARSTACK_STEPS.length);

  if (!s) {
    return (
      <div className="dv2-ws">
        <div className="dv2-qs">
          <button type="button" className="dv2-pick" disabled={busy || !door} onClick={start}>War Stack starten{door ? `: ${door.title}` : ""}</button>
          {!door && <span className="dv2-none">Erst eine Door der Woche wählen.</span>}
        </div>
        {open.map((x) => (
          <div key={x.id} className="dv2-qs">
            <button type="button" disabled={busy} onClick={() => resume(x)}>Weiter: {x.door_title} · Schritt {(x.step_index || 0) + 1}/{WARSTACK_STEPS.length}</button>
          </div>
        ))}
        {err && <div className="dv2-empty" role="alert">{err}</div>}
      </div>
    );
  }
  return (
    <form className="dv2-ws dv2-wsform" onSubmit={submit}>
      <h4 className="dv2-sec">War Stack <span>{idx + 1} / {WARSTACK_STEPS.length}</span></h4>
      <p className="dv2-wsq">{s.question}</p>
      {s.step === "hits" ? (
        hits.map((h, i) => (
          <fieldset key={h.id} className="dv2-hit4">
            <legend>Hit {i + 1}</legend>
            {HIT_FIELDS.map(([f, label]) => (
              <input key={f} aria-label={`Hit ${i + 1} ${label}`} placeholder={label} value={h[f] || ""}
                onChange={(e) => setHits(hits.map((x, j) => (j === i ? { ...x, [f]: e.target.value } : x)))} />
            ))}
          </fieldset>
        ))
      ) : (
        <>
          {s.step === "domain" && (
            <div className="dv2-qs">{DOMAINS.map((d) => <button key={d} type="button" aria-pressed={value === d} onClick={() => setValue(d)}>{d}</button>)}</div>
          )}
          <textarea aria-label={s.question} rows={3} value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
        </>
      )}
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      <div className="dv2-qs">
        <button type="submit" className="dv2-pick" disabled={busy || (s.step !== "hits" && !value.trim())}>{idx === WARSTACK_STEPS.length - 1 ? "Abschließen" : "Weiter"}</button>
        <button type="button" disabled={busy} onClick={() => setS(null)}>Später fortsetzen</button>
      </div>
    </form>
  );
}
