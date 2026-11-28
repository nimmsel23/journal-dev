// VoiceAgent — VOICE-GPT hinter dem Voice-Formular.
// Spiegeln: eine zentrale Frage zur aktuellen Phase, Gespräch lokal pro Session (localStorage).
// STACK: strukturierter VOICE STACK, auf Wunsch als Journal-Eintrag (#voice #stack).
// Auto: Opt-in, Server spiegelt Journal-Einträge ab 250 Wörtern bzw. kürzere täglich 21:30.
import { useEffect, useState } from "react";
import { saveJournal } from "../../lib/db/journal.js";
import {
  markVoiceReflectionRead, setVoiceAuto, VOICE_AUTO_WORDS, voiceErrorText, voiceReflect,
  watchVoiceAuto, watchVoiceReflections,
} from "../../lib/voiceAgent.js";

const read = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const MAX_HISTORY = 28;

function Turn({ t }) {
  return (
    <div className="gv2-step" style={{ borderLeft: `3px solid ${t.role === "model" ? "currentColor" : "transparent"}`, paddingLeft: 10 }}>
      <small className="gv2-hint">{t.role === "model" ? (t.stack ? "VOICE STACK" : "VOICE-GPT") : "Ich"}</small>
      <div style={{ whiteSpace: "pre-wrap" }}>{t.text}</div>
    </div>
  );
}

export function VoiceAgentThread({ user, stage, date, sessionId, storageKey, buildContext }) {
  const [thread, setThread] = useState(() => read(storageKey, []));
  const [draft, setDraft] = useState(() => read(`${storageKey}:draft`, ""));
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [stackSaved, setStackSaved] = useState(false);
  useEffect(() => { setThread(read(storageKey, [])); setDraft(read(`${storageKey}:draft`, "")); setErr(""); setStackSaved(false); }, [storageKey]);

  const persist = (next) => { setThread(next); write(storageKey, next); };
  const ask = async (mode) => {
    if (!user) return;
    const reply = draft.trim();
    const base = reply ? [...thread, { role: "user", text: reply }] : thread;
    setBusy(mode); setErr("");
    if (reply) { persist(base); setDraft(""); write(`${storageKey}:draft`, ""); }
    try {
      const history = base.map(({ role, text }) => ({ role, text: text.slice(0, 4000) })).slice(-MAX_HISTORY);
      // Gemini erwartet abwechselnde Rollen; ein Folge-"Spiegeln" ohne eigene Antwort hängt einen Platzhalter an.
      if (mode === "reflect" && history.length && history[history.length - 1].role === "model") history.push({ role: "user", text: "Ich habe meine Antworten im Formular ergänzt. Spiegle bitte erneut." });
      const text = await voiceReflect({ mode, stage, date, context: buildContext(), history, expectedUid: user.uid });
      persist([...base, { role: "model", text, stack: mode === "stack" }]);
      if (mode === "stack") setStackSaved(false);
    } catch (e) { setErr(voiceErrorText(e)); }
    setBusy("");
  };
  const lastStack = [...thread].reverse().find((t) => t.stack);
  const saveStack = async () => {
    try {
      await saveJournal(date, lastStack.text, { id: `voice_${sessionId}_stack`, tags: ["voice", "stack"], voiceSession: { sessionId, stage: "stack" }, expectedUid: user.uid });
      setStackSaved(true);
    } catch (e) { setErr(e?.message || "Speichern fehlgeschlagen"); }
  };

  return (
    <section aria-label="VOICE-GPT" style={{ marginTop: 18 }}>
      <h4 className="dv2-sec">VOICE-GPT · Spiegel</h4>
      <small className="gv2-hint">Liest deine bisherigen Antworten dieser Session und stellt eine zentrale Frage. Zählt gegen dein tägliches KI-Kontingent.</small>
      {thread.map((t, i) => <Turn key={i} t={t} />)}
      {thread.length > 0 && (
        <label className="gv2-step">
          <b className="gv2-q">Deine Antwort</b>
          <textarea rows={3} value={draft} onChange={(e) => { setDraft(e.target.value); write(`${storageKey}:draft`, e.target.value); }} />
        </label>
      )}
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      <div className="dv2-qs">
        <button type="button" className="dv2-pick" disabled={!user || !!busy} onClick={() => ask("reflect")}>
          {busy === "reflect" ? "VOICE-GPT denkt …" : draft.trim() ? "Antworten" : thread.length ? "Erneut spiegeln" : "Spiegeln lassen"}
        </button>
        <button type="button" className="dv2-pick" disabled={!user || !!busy} onClick={() => ask("stack")}>{busy === "stack" ? "Erstelle STACK …" : "VOICE STACK erstellen"}</button>
        {lastStack && <button type="button" className="dv2-pick" disabled={!user || stackSaved} onClick={saveStack}>{stackSaved ? "✓ STACK im Journal" : "STACK ins Journal"}</button>}
        {thread.length > 0 && <button type="button" disabled={!!busy} onClick={() => { persist([]); setErr(""); }}>Gespräch leeren</button>}
      </div>
    </section>
  );
}

export function VoiceAutoReflections({ user, onStart }) {
  const [auto, setAuto] = useState(false);
  const [items, setItems] = useState([]);
  useEffect(() => (user ? watchVoiceAuto(user.uid, setAuto) : undefined), [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => (user && auto ? watchVoiceReflections(user.uid, setItems) : setItems([])), [user?.uid, auto]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!user) return null;
  const unread = items.filter((r) => !r.read);
  return (
    <aside className="gv2-step" aria-label="VOICE-GPT Auto-Impulse">
      <div className="dv2-qs">
        <button type="button" aria-pressed={auto} onClick={() => setVoiceAuto(user.uid, !auto)}>{auto ? "✓ " : ""}Journal automatisch spiegeln</button>
      </div>
      <small className="gv2-hint">
        {auto
          ? `Einträge ab ${VOICE_AUTO_WORDS} Wörtern spiegelt VOICE-GPT 30 Minuten nach dem letzten Speichern. Kürzere sammelt es und spiegelt sie täglich um 21:30.`
          : "Aus: Dein Journal wird nicht automatisch an die KI geschickt."}
      </small>
      {unread.map((r) => (
        <div key={r.id} className="gv2-step">
          <b className="gv2-q">{r.kind === "long" ? "Langer Eintrag" : "Tagessammlung"} · {(r.sourceDates || []).join(", ")}</b>
          <div style={{ whiteSpace: "pre-wrap" }}>{r.reply}</div>
          <div className="dv2-qs">
            <button type="button" className="dv2-pick" onClick={() => { markVoiceReflectionRead(user.uid, r.id); onStart(r); }}>Voice-Session daraus starten</button>
            <button type="button" onClick={() => markVoiceReflectionRead(user.uid, r.id)}>Gelesen</button>
          </div>
        </div>
      ))}
    </aside>
  );
}
