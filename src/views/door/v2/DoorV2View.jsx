// DoorV2View — Door-Framework (Potential → Plan → Production → Profit) im
// Design "Raster" (siehe views/v2/journal-v2.css). Hash: #door2 bzw. #door2/<modus>.
// Datenquellen: bestehende src/lib/door/* (REST lokal, Firestore in der Cloud).
import { useEffect, useState } from "react";
import * as db from "@journal-db";
import { PotentialPanel, PlanPanel, ProductionPanel, ProfitPanel } from "./DoorV2Panels.jsx";
import { SOURCES, getSource, setSource, loadRemoteSource } from "../../../lib/door/source.js";
import * as gtasks from "../../../lib/door/gtasks.js";
import * as tc from "../../../lib/door/taskchampion.js";
import { useQueryClient } from "@tanstack/react-query";
import "./door-v2.css";

const MODES = [["potential", "Potential"], ["plan", "Plan"], ["production", "Production"], ["profit", "Profit"]];
const PANELS = { potential: PotentialPanel, plan: PlanPanel, production: ProductionPanel, profit: ProfitPanel };

export default function DoorV2View({ user, mode = "potential", onModeChange = () => {} }) {
  // Vollbild: Seitenhintergrund + Statusleiste papierfarben, solange Door v2 offen ist
  useEffect(() => {
    const paper = "#f6f6f2";
    const meta = document.querySelector('meta[name="theme-color"]');
    const prev = { meta: meta?.getAttribute("content"), html: document.documentElement.style.background, body: document.body.style.background };
    meta?.setAttribute("content", paper);
    document.documentElement.style.background = paper;
    document.body.style.background = paper;
    return () => {
      if (meta && prev.meta) meta.setAttribute("content", prev.meta);
      document.documentElement.style.background = prev.html;
      document.body.style.background = prev.body;
    };
  }, []);

  const [source, setSrc] = useState(getSource);
  const [, bump] = useState(0);
  const [gerr, setGerr] = useState("");
  const pick = (s) => { setSource(s, user?.uid); setSrc(s); setGerr(""); };
  // Quelle ist nutzerspezifisch: gespeicherte Wahl aus Firestore übernehmen
  useEffect(() => {
    if (user?.uid) loadRemoteSource(user.uid).then((s) => s && setSrc(s));
  }, [user?.uid]);
  const isG = source === "gtasks";
  const isConn = isG && gtasks.connected();
  const connect = async () => {
    setGerr("");
    try { await gtasks.connect(); } catch (e) { setGerr(e?.message || "Verbinden fehlgeschlagen"); }
    bump((n) => n + 1);
  };
  // Taskwarrior (TaskChampion-Sync): Konfiguration liegt nur in der IndexedDB dieses Browsers
  const qc = useQueryClient();
  const isT = source === "taskwarrior";
  const [tcCfg, setTcCfg] = useState(undefined); // undefined = lädt, null = nicht eingerichtet
  const [form, setForm] = useState({ url: "", clientId: "", secret: "" });
  const [tcBusy, setTcBusy] = useState(false);
  const [tcInfo, setTcInfo] = useState("");
  useEffect(() => { if (isT) tc.getConfig().then((c) => setTcCfg(c || null)); }, [isT]);
  const tcRun = async (fn) => {
    setGerr(""); setTcBusy(true);
    try { await fn(); qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("dv2-") }); }
    catch (e) { setGerr({ "tc-body": "Antwort des Sync-Servers brach ab oder war nicht lesbar (Netz/Proxy).", "tc-format": "Unerwartetes Datenformat vom Sync-Server.", "tc-decrypt": "Entschlüsselung fehlgeschlagen – Client-ID oder Secret falsch.", "tc-network": "Sync-Server nicht erreichbar (offline, CORS oder Proxy)." }[e?.message] || e?.message || "Sync fehlgeschlagen"); }
    setTcBusy(false);
  };
  const tcSave = (e) => { e.preventDefault(); tcRun(async () => { setTcCfg(await tc.saveConfig(form)); await tc.sync(); setForm({ url: "", clientId: "", secret: "" }); }); };
  const tcSync = () => tcRun(async () => { await tc.sync(); setTcInfo(new Date().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" })); });
  const uid = user?.uid ?? null;
  const current = PANELS[mode] ? mode : "potential";
  const Panel = PANELS[current];
  const idx = MODES.findIndex(([k]) => k === current);

  return (
    <div className="dv2-page">
      <article className="dv2" aria-label="Door v2">
        <div className="dv2-modes" role="tablist" aria-label="Phase">
          {MODES.map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={current === key} onClick={() => onModeChange(key)}>{label}</button>
          ))}
        </div>
        <div className="dv2-top">
          <div className="dv2-no">{idx + 1}</div>
          <div className="dv2-meta">
            <span className="dv2-kw">Door</span>
            <span><b>{MODES[idx][1]}</b><br />Phase {idx + 1} / 4</span>
          </div>
        </div>
        <div className="dv2-src">
          <label>Quelle <select value={source} onChange={(e) => pick(e.target.value)}>
            {SOURCES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select></label>
          {isG && <button type="button" className="dv2-link" onClick={connect}>{isConn ? "Neu verbinden" : "Google Tasks verbinden"}</button>}
          {isConn && <button type="button" className="dv2-link" onClick={() => { gtasks.disconnect(); bump((n) => n + 1); }}>Trennen</button>}
        </div>
        {isT && tcCfg && (
          <div className="dv2-src">
            <button type="button" className="dv2-link" disabled={tcBusy} onClick={tcSync}>{tcBusy ? "Sync …" : "Sync"}</button>
            {tcInfo && <span>Stand {tcInfo}</span>}
            <button type="button" className="dv2-link" onClick={async () => { await tc.clearConfig(); setTcCfg(null); }}>Trennen</button>
          </div>
        )}
        {gerr && <div className="dv2-empty" role="alert">{gerr}</div>}
        {isT && tcCfg === null ? (
          <form className="dv2-compose" onSubmit={tcSave} style={{ flexWrap: "wrap" }}>
            <input aria-label="Server-URL" placeholder="Server-URL (https://…)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            <input aria-label="Client-ID" placeholder="sync.server.client_id" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} />
            <input aria-label="Secret" type="password" placeholder="sync.encryption_secret" autoComplete="off" value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} />
            <button type="submit" disabled={tcBusy || !form.url || !form.clientId || !form.secret}>{tcBusy ? "Prüfe …" : "Verbinden"}</button>
          </form>
        ) : isT && tcCfg === undefined ? null : isG && !isConn ? (
          <div className="dv2-empty">Google Tasks ist nicht verbunden (oder die Sitzung ist abgelaufen). Oben „Google Tasks verbinden“ wählen.</div>
        ) : uid ? <Panel key={source} uid={uid} source={source} /> : (
          <div className="dv2-empty">
            Nicht angemeldet. <button type="button" className="dv2-link" onClick={() => db.signIn()}>Cloud Login</button>
          </div>
        )}
        <div className="dv2-foot">
          <a href="#v2">← Journal</a>
          <span>Door v2 · Raster</span>
        </div>
      </article>
    </div>
  );
}
