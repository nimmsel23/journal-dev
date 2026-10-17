// DoorV2View — Door-Framework (Potential → Plan → Production → Profit) im
// Design "Raster" (siehe views/v2/journal-v2.css). Hash: #door2 bzw. #door2/<modus>.
// Datenquellen: bestehende src/lib/door/* (REST lokal, Firestore in der Cloud).
import { useEffect } from "react";
import * as db from "@journal-db";
import { PotentialPanel, PlanPanel, ProductionPanel, ProfitPanel } from "./DoorV2Panels.jsx";
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
        {uid ? <Panel uid={uid} /> : (
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
