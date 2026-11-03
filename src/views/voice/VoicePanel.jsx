// VoicePanel — die VOICE-Session (STOP → SUBMIT → STRUGGLE → STRIKE) als Raster-Formular.
// Fragen stammen 1:1 aus voiceData.js (= ~/aos/voice/phases.py). Jede fertige Phase wird als
// Journal-Eintrag (#voice) im selben Markdown-Format gespeichert wie die Voice-CLI es anhängt.
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { saveJournal } from "../../lib/db/journal.js";
import { VOICE_STAGES } from "./voiceData.js";
import PauseViz, { VIZ } from "./PauseViz.jsx";
import { asBool, readSetting, useSetting, writeSetting } from "../../lib/useSetting.js";
import AuthDemoHelper from "../../components/AuthDemoHelper.jsx";
import { createSmartCalendarEvent } from "../../lib/google/smartCalendar.js";
import { useGoogle } from "../../lib/google/useGoogle.js";

const today = () => format(new Date(), "yyyy-MM-dd");
const key = (stage, suffix = "") => `gv2:voice:${today()}:${stage}${suffix}`;
const read = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
function newSessionId() {
  return globalThis.crypto?.randomUUID?.() || `voice_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
function readVoiceContext() {
  try {
    const value = JSON.parse(window.sessionStorage.getItem("vos:voice:context:v1") || "null");
    if (!value || typeof value.sessionId !== "string" || typeof value.sourceJournalId !== "string"
        || typeof value.sourceDate !== "string" || typeof value.sourceText !== "string") return null;
    return value;
  } catch { return null; }
}

function answerText(step, a) {
  if (step.kind === "pause") return a ? `✓ (${step.seconds}s)` : "—";
  if (step.kind === "confirm") return a ? "Ja" : "Nein";
  if (step.kind === "checkbox") return (a || []).map((x) => `- ${x}`).join("\n") || "—";
  return String(a || "—");
}
export function stageMarkdown(stage, answers) {
  const lines = ["", `## ${stage.heading}`, "", `*${stage.name}*`, "", ...stage.epigraph.map((l) => `> ${l}`), ""];
  let group = "";
  for (const s of stage.steps) {
    if (s.kind === "pause" && !answers[s.key]) continue;
    if (s.group && s.group !== group) lines.push(`### ${s.group}`, "");
    group = s.group;
    lines.push(`**${s.prompt}**`, "", answerText(s, answers[s.key]), "");
  }
  return lines.join("\n");
}

function Step({ s, value, onChange }) {
  const label = <><b className="gv2-q">{s.prompt}</b>{s.hint && <small className="gv2-hint">{s.hint}</small>}</>;
  if (s.kind === "text") return <label className="gv2-step">{label}<textarea rows={3} value={value || ""} onChange={(e) => onChange(e.target.value)} /></label>;
  if (s.kind === "select") return (
    <div className="gv2-step">{label}
      <div className="dv2-qs">{s.choices.map((c) => <button key={c} type="button" aria-pressed={value === c} onClick={() => onChange(c)}>{c}</button>)}</div>
    </div>
  );
  if (s.kind === "checkbox") {
    const set = new Set(value || []);
    return (
      <div className="gv2-step">{label}
        <div className="dv2-qs">{s.choices.map((c) => (
          <button key={c} type="button" aria-pressed={set.has(c)} onClick={() => { set.has(c) ? set.delete(c) : set.add(c); onChange([...set]); }}>{c}</button>
        ))}</div>
      </div>
    );
  }
  if (s.kind === "confirm") return (
    <div className="gv2-step">{label}
      <div className="dv2-qs">
        <button type="button" aria-pressed={value === true} onClick={() => onChange(true)}>Ja</button>
        <button type="button" aria-pressed={value === false} onClick={() => onChange(false)}>Nein</button>
      </div>
    </div>
  );
  // pause: Atem-Pause, danach bestätigen
  return <PauseStep s={s} label={label} value={value} onChange={onChange} />;
}
function PauseStep({ s, label, value, onChange }) {
  const [left, setLeft] = useState(null);
  const [show, setShow] = useState(true);
  // Auswahl gilt nur für heute: morgen startet sie wieder bei "Zufall" und man wählt neu.
  const pickKey = `gv2:voice:viz:${today()}`;
  const validViz = (v) => (v === "random" || VIZ.some((x) => x.id === v) ? v : undefined);
  const [pick, setPickState] = useState(() => readSetting(pickKey, "random", validViz));
  const setPick = (v) => { setPickState(v); writeSetting(pickKey, v); };
  const [ring, setRing] = useSetting("gv2:voice:ring", false, asBool);
  const [active, setActive] = useState("mandelbrot");
  const start = () => {
    // Zufall: nie dieselbe wie beim letzten Mal
    const last = readSetting("gv2:voice:viz:last", "", validViz);
    const pool = VIZ.filter((x) => x.id !== last);
    const id = pick === "random" ? pool[Math.floor(Math.random() * pool.length)].id : pick;
    writeSetting("gv2:voice:viz:last", id);
    setActive(id);
    setShow(true); setLeft(s.seconds);
  };
  useEffect(() => {
    if (left == null) return undefined;
    if (left <= 0) { setLeft(null); onChange(true); return undefined; }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="gv2-step">{label}
      <div className="dv2-qs">
        <button type="button" aria-pressed={!!value} disabled={left != null} onClick={() => (s.seconds ? start() : onChange(true))}>
          {value ? "✓ erledigt" : left != null ? `${left} s …` : s.seconds ? `Pause starten (${s.seconds} s)` : "Erledigt"}
        </button>
      </div>
      {s.seconds > 0 && left == null && (
        <div className="dv2-qs" role="group" aria-label="Visualisierung">
          {[{ id: "random", label: "Zufall" }, ...VIZ].map((x) => (
            <button key={x.id} type="button" aria-pressed={pick === x.id} onClick={() => setPick(x.id)}>{x.label}</button>
          ))}
          <button type="button" aria-pressed={ring} onClick={() => setRing(!ring)}>Atemring</button>
        </div>
      )}
      {left != null && show && <PauseViz viz={active} ring={ring} seconds={s.seconds} left={left} onClose={() => setShow(false)} />}
    </div>
  );
}

function StrikeFollowUp({ answers, sessionId }) {
  const google = useGoogle({ prepare: false });
  const [date, setDate] = useState(today());
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [busy, setBusy] = useState(false);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");

  const schedule = async () => {
    if (!answers.first_step?.trim() || !date || (time && (!duration || Number(duration) < 1))) return;
    setBusy(true); setError("");
    try {
      const sourceJournalId = `voice_${sessionId}_strike`;
      const result = await createSmartCalendarEvent({
        title: answers.first_step.trim(),
        date,
        time: time || null,
        duration_minutes: time ? Number(duration) : null,
        notes: `Gewählt in The Voice (Strike).\nNächster Schritt: ${answers.action || answers.first_step}`,
      }, { sourceJournalId, requestId: `voice_${sessionId}`, index: 0 });
      setEvent(result);
    } catch (cause) {
      setError(cause?.message || "Der Planner-Eintrag konnte nicht angelegt werden.");
    } finally { setBusy(false); }
  };

  return <aside className="gv2-step" aria-label="Strike-Folgehandlung planen">
    <b className="gv2-q">Diesen Strike-Schritt in den Planner übernehmen?</b>
    <p className="gv2-hint">{answers.first_step}</p>
    <label className="gv2-step">Datum<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
    <label className="gv2-step">Uhrzeit (optional)<input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
    {time && <label className="gv2-step">Dauer (Minuten)<input type="number" min="1" max="1440" value={duration} onChange={(e) => setDuration(e.target.value)} /></label>}
    {!google.connected && <button type="button" className="dv2-pick" disabled={google.busy} onClick={() => google.connect()}>{google.busy ? "Verbinde …" : "Google Kalender verbinden"}</button>}
    {(error || google.error) && <p role="alert" className="dv2-none">{error || google.error}</p>}
    <button type="button" className="dv2-pick" disabled={busy || !google.connected || !date || (time && !duration)} onClick={schedule}>{busy ? "Plane …" : event ? "Kalendereintrag erneut öffnen / prüfen" : "In Google Kalender planen"}</button>
    {event?.htmlLink && <a href={event.htmlLink} target="_blank" rel="noreferrer">Termin öffnen ↗</a>}
    {event?.existing && <small>Der idempotente Termineintrag war bereits vorhanden.</small>}
  </aside>;
}

export default function VoicePanel({ user }) {
  const [idx, setIdx] = useState(0);
  const stage = VOICE_STAGES[idx];
  const [voiceContext, setVoiceContext] = useState(readVoiceContext);
  const [sessionId] = useState(() => {
    const existing = voiceContext?.sessionId || read(key("session", "-id"), "");
    if (existing) return existing;
    const created = newSessionId();
    write(key("session", "-id"), created);
    return created;
  });
  const sessionKey = (phase, suffix = "") => `gv2:voice:${today()}:${sessionId}:${phase}${suffix}`;
  const [answers, setAnswers] = useState(() => read(sessionKey(stage.key), voiceContext ? {} : read(key(stage.key), {})));
  const [saved, setSaved] = useState(() => Object.fromEntries(VOICE_STAGES.map((s) => [s.key, read(sessionKey(s.key, ":saved"), voiceContext ? false : read(key(s.key, ":saved"), false))])));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { setAnswers(read(sessionKey(stage.key), voiceContext ? {} : read(key(stage.key), {}))); setErr(""); }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k, v) => setAnswers((a) => { const n = { ...a, [k]: v }; write(sessionKey(stage.key), n); return n; });
  const missing = stage.steps.filter((s) => s.required && s.kind !== "pause" && (answers[s.key] == null || answers[s.key] === "" || (Array.isArray(answers[s.key]) && !answers[s.key].length)));

  const save = async () => {
    setBusy(true); setErr("");
    try {
      const voiceSession = voiceContext ? {
        sessionId,
        stage: stage.key,
        sourceJournalId: voiceContext.sourceJournalId,
        sourceDate: voiceContext.sourceDate,
      } : { sessionId, stage: stage.key };
      await saveJournal(today(), stageMarkdown(stage, answers).trim(), {
        id: `voice_${sessionId}_${stage.key}`,
        tags: ["voice", stage.key],
        voiceSession,
      });
      write(sessionKey(stage.key, ":saved"), true);
      setSaved((s) => ({ ...s, [stage.key]: true }));
      if (idx < VOICE_STAGES.length - 1) setIdx(idx + 1);
      else if (voiceContext) {
        try { window.sessionStorage.removeItem("vos:voice:context:v1"); } catch {}
        setVoiceContext(null);
      }
    } catch (e) { setErr(e?.message || "Speichern fehlgeschlagen"); }
    setBusy(false);
  };

  return (
    <>
      {voiceContext && <aside className="gv2-step" aria-label="Auslösender Journaleintrag">
        <b className="gv2-q">Aus deinem Journal · {voiceContext.sourceDate}</b>
        <blockquote className="gv2-epi">{voiceContext.sourceText}</blockquote>
        <small className="gv2-hint">Diese Voice-Session bleibt über ihre Journal-Metadaten mit diesem Eintrag verknüpft.</small>
      </aside>}
      <div className="dv2-modes" role="tablist" aria-label="Phase">
        {VOICE_STAGES.map((s, i) => (
          <button key={s.key} type="button" role="tab" aria-selected={i === idx} onClick={() => setIdx(i)}>{saved[s.key] ? "✓ " : ""}{s.key}</button>
        ))}
      </div>
      <div className="dv2-sum"><b>{idx + 1}</b><span>{stage.name}</span></div>
      {stage.epigraph.map((l) => <p key={l} className="gv2-epi">{l}</p>)}
      {!user && <AuthDemoHelper>Deine Voice-Antworten bleiben lokal im Browser. Zum Speichern als Journal-Eintrag kannst du dich anmelden.</AuthDemoHelper>}
      {stage.steps.map((s, i) => (
        <section key={s.key}>
          {s.group && s.group !== stage.steps[i - 1]?.group && <h4 className="dv2-sec">{s.group}</h4>}
          <Step s={s} value={answers[s.key]} onChange={(v) => set(s.key, v)} />
        </section>
      ))}
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      <div className="dv2-qs gv2-save">
        <button type="button" className="dv2-pick" disabled={busy || !user || missing.length > 0} onClick={save}>
          {busy ? "Speichere …" : saved[stage.key] ? "Erneut speichern" : idx === VOICE_STAGES.length - 1 ? "Session abschließen" : "Phase speichern → weiter"}
        </button>
        {missing.length > 0 && <span className="dv2-none">Noch offen: {missing.length}</span>}
      </div>
      {stage.key === "strike" && saved.strike && <StrikeFollowUp answers={answers} sessionId={sessionId} />}
    </>
  );
}
