// VoicePanel — die VOICE-Session (STOP → SUBMIT → STRUGGLE → STRIKE) als Raster-Formular.
// Fragen stammen 1:1 aus voiceData.js (= ~/aos/voice/phases.py). Jede fertige Phase wird als
// Journal-Eintrag (#voice) im selben Markdown-Format gespeichert wie die Voice-CLI es anhängt.
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { saveJournal } from "../../lib/db/journal.js";
import { VOICE_STAGES } from "./voiceData.js";
import Mandelbrot from "./Mandelbrot.jsx";

const today = () => format(new Date(), "yyyy-MM-dd");
const key = (stage, suffix = "") => `gv2:voice:${today()}:${stage}${suffix}`;
const read = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

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
  useEffect(() => {
    if (left == null) return undefined;
    if (left <= 0) { setLeft(null); onChange(true); return undefined; }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="gv2-step">{label}
      <div className="dv2-qs">
        <button type="button" aria-pressed={!!value} disabled={left != null} onClick={() => (s.seconds ? setLeft(s.seconds) : onChange(true))}>
          {value ? "✓ erledigt" : left != null ? `${left} s …` : s.seconds ? `Pause starten (${s.seconds} s)` : "Erledigt"}
        </button>
      </div>
      {left != null && <Mandelbrot seconds={s.seconds} />}
    </div>
  );
}

export default function VoicePanel({ user }) {
  const [idx, setIdx] = useState(0);
  const stage = VOICE_STAGES[idx];
  const [answers, setAnswers] = useState(() => read(key(stage.key), {}));
  const [saved, setSaved] = useState(() => Object.fromEntries(VOICE_STAGES.map((s) => [s.key, read(key(s.key, ":saved"), false)])));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { setAnswers(read(key(stage.key), {})); setErr(""); }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k, v) => setAnswers((a) => { const n = { ...a, [k]: v }; write(key(stage.key), n); return n; });
  const missing = stage.steps.filter((s) => s.required && s.kind !== "pause" && (answers[s.key] == null || answers[s.key] === "" || (Array.isArray(answers[s.key]) && !answers[s.key].length)));

  const save = async () => {
    setBusy(true); setErr("");
    try {
      await saveJournal(today(), stageMarkdown(stage, answers).trim(), { tags: ["voice", stage.key] });
      write(key(stage.key, ":saved"), true);
      setSaved((s) => ({ ...s, [stage.key]: true }));
      if (idx < VOICE_STAGES.length - 1) setIdx(idx + 1);
    } catch (e) { setErr(e?.message || "Speichern fehlgeschlagen"); }
    setBusy(false);
  };

  return (
    <>
      <div className="dv2-modes" role="tablist" aria-label="Phase">
        {VOICE_STAGES.map((s, i) => (
          <button key={s.key} type="button" role="tab" aria-selected={i === idx} onClick={() => setIdx(i)}>{saved[s.key] ? "✓ " : ""}{s.key}</button>
        ))}
      </div>
      <div className="dv2-sum"><b>{idx + 1}</b><span>{stage.name}</span></div>
      {stage.epigraph.map((l) => <p key={l} className="gv2-epi">{l}</p>)}
      {!user && <div className="dv2-empty">Nicht angemeldet – Speichern braucht den Cloud-Login.</div>}
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
    </>
  );
}
