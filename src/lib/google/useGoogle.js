// useGoogle — Verbindungsstatus + Verbinden/Trennen für alle Stellen, die Google nutzen
// (Journal v2 Kalender, Game → Fire, Door v2 Google Tasks). Eine Verbindung gilt überall.
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { google, prepareGoogleConnect } from "./auth.js";
import { googleErrorText, isCancel } from "./tokens.js";

export function useGoogle({ prepare = true } = {}) {
  const snap = useSyncExternalStore(google.subscribe, google.snapshot, () => "off");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const connected = snap !== "off";

  // Client-ID und Google-Skript vorladen, solange nichts verbunden ist und die Stelle Google
  // überhaupt braucht (`prepare`; Best Effort, siehe auth.js)
  useEffect(() => { if (prepare && !connected) prepareGoogleConnect(); }, [prepare, connected]);

  const connect = useCallback(async () => {
    setError("");
    setBusy(true);
    try { await google.connect(); } catch (e) { if (!isCancel(e)) setError(googleErrorText(e)); }
    setBusy(false);
  }, []);
  const disconnect = useCallback(() => { setError(""); return google.disconnect(); }, []);

  return { connected, mode: connected ? snap : null, busy, error, setError, connect, disconnect };
}
