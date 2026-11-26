// VoiceSettings — versteckter Tab #voice/settings: eigener Gemini-API-Key (BYOK) für VOICE-GPT.
// Der Key liegt in journal/{uid}/settings/ai (nur der Besitzer); die Cloud Function nutzt ihn statt des Server-Keys.
import { useEffect, useState } from "react";
import { maskKey, pingOwnKey, setOwnKey, voiceErrorText, watchOwnKey } from "../../lib/voiceAgent.js";

const KEY_PATTERN = /^[A-Za-z0-9_-]{30,80}$/;

export default function VoiceSettings({ user }) {
  const [current, setCurrent] = useState("");
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => (user ? watchOwnKey(user.uid, setCurrent) : undefined), [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return <p className="gv2-hint">Zum Hinterlegen eines eigenen Keys bitte anmelden.</p>;
  const valid = KEY_PATTERN.test(draft.trim());
  const run = async (fn) => { setBusy(true); setStatus(""); try { await fn(); } catch (e) { setStatus(voiceErrorText(e)); } setBusy(false); };
  const save = () => run(async () => { await setOwnKey(user.uid, draft.trim()); setDraft(""); setStatus("Gespeichert. Jetzt testen."); });
  const remove = () => run(async () => { await setOwnKey(user.uid, ""); setStatus("Eigener Key entfernt. VOICE-GPT nutzt wieder das Standard-Kontingent."); });
  const test = () => run(async () => { const r = await pingOwnKey(user.uid); setStatus(r?.reply ? `✓ Key funktioniert (Antwort: ${r.reply.trim()})` : "Keine Antwort."); });

  return (
    <section aria-label="VOICE-GPT Einstellungen">
      <div className="dv2-sum"><b>⚙</b><span>VOICE-GPT · eigener API-Key</span></div>
      <p className="gv2-epi">Mit eigenem Gemini-Key entfällt das Tageslimit. Abgerechnet wird über dein Google-Konto.</p>
      <div className="gv2-step">
        <b className="gv2-q">Aktueller Key</b>
        <span>{current ? maskKey(current) : "keiner – Standard-Kontingent aktiv"}</span>
      </div>
      <label className="gv2-step">
        <b className="gv2-q">Neuer Gemini-API-Key</b>
        <small className="gv2-hint">Erstellen unter aistudio.google.com/apikey. Er wird in deinem Konto gespeichert und nur vom VOICE-GPT-Server gelesen.</small>
        <input type="password" autoComplete="off" spellCheck={false} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="AIza…" />
      </label>
      {status && <div className="dv2-empty" role="status">{status}</div>}
      <div className="dv2-qs gv2-save">
        <button type="button" className="dv2-pick" disabled={busy || !valid} onClick={save}>Speichern</button>
        <button type="button" className="dv2-pick" disabled={busy || !current} onClick={test}>{busy ? "…" : "Testen"}</button>
        {current && <button type="button" disabled={busy} onClick={remove}>Entfernen</button>}
      </div>
      <div className="dv2-foot"><a href="#voice">← Voice</a></div>
    </section>
  );
}
