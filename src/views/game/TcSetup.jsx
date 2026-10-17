// TcSetup — Taskwarrior-/TaskChampion-Verbindung für die Game-v2-Ansichten (gleiche IndexedDB wie Door v2).
import { useState } from "react";
import * as tc from "../../lib/door/taskchampion.js";

const ERR = { "tc-decrypt": "Entschlüsselung fehlgeschlagen – Client-ID oder Secret falsch.", "tc-network": "Sync-Server nicht erreichbar (offline, CORS oder Proxy)." };
export const tcError = (e) => ERR[e?.message] || e?.message || "Sync fehlgeschlagen";

export default function TcSetup({ onDone }) {
  const [form, setForm] = useState({ url: "", clientId: "", secret: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { await tc.saveConfig(form); await tc.sync(); onDone?.(); } catch (x) { setErr(tcError(x)); }
    setBusy(false);
  };
  return (
    <>
      <div className="dv2-empty">Taskwarrior ist in diesem Browser noch nicht verbunden (Server-URL, <code>sync.server.client_id</code>, <code>sync.encryption_secret</code>).</div>
      <form className="dv2-compose" onSubmit={submit} style={{ flexWrap: "wrap" }}>
        <input aria-label="Server-URL" placeholder="Server-URL (https://…)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        <input aria-label="Client-ID" placeholder="sync.server.client_id" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} />
        <input aria-label="Secret" type="password" autoComplete="off" placeholder="sync.encryption_secret" value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} />
        <button type="submit" disabled={busy || !form.url || !form.clientId || !form.secret}>{busy ? "Prüfe …" : "Verbinden"}</button>
      </form>
      {err && <div className="dv2-empty" role="alert">{err}</div>}
    </>
  );
}
