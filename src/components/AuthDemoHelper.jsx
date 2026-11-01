import { useState } from "react";
import * as db from "@journal-db";

/** Optional Google sign-in; callers remain usable in their existing local mode. */
export default function AuthDemoHelper({ children = "Deine Eingaben bleiben lokal in diesem Browser." }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const login = async () => {
    setBusy(true); setError("");
    try { await db.signIn(); }
    catch (e) { setError(e?.message || "Google-Anmeldung fehlgeschlagen."); }
    finally { setBusy(false); }
  };
  return (
    <div className="dv2-empty" aria-label="Lokaler Demo-Modus">
      <strong>Demo-Modus · ohne Konto</strong>
      <div>{children}</div>
      <button type="button" className="dv2-link" disabled={busy} onClick={login}>
        {busy ? "Google-Anmeldung läuft …" : "Optional mit Google anmelden"}
      </button>
      {error && <div role="alert">{error}</div>}
    </div>
  );
}
