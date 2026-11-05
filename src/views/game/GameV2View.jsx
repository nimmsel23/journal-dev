// GameV2View — Raster-Oberflächen für Fire / Focus / Freedom / Frame (Taskwarrior via TaskChampion).
// Hash: #game2/<fire|focus|freedom|frame>, Kurzformen #fire, #focus, #freedom, #frame.
import { useEffect } from "react";
import GameMapPanel, { MAPS } from "./GameMapPanel.jsx";
import SyncBadge from "../../components/SyncBadge.jsx";
import AuthDemoHelper from "../../components/AuthDemoHelper.jsx";
import "../door/v2/door-v2.css";
import "./game-v2.css";

const MODES = [["fire", "Fire"], ["focus", "Focus"], ["freedom", "Freedom"], ["frame", "Frame"]];
// Mini-App je Map (vos-game.web.app/<map>/): VITE_GAME_SOLO fixiert die Map, keine Map-Leiste, keine Links zu anderen Apps.
const SOLO_MAP = import.meta.env.VITE_GAME_SOLO || "";
const SUB = Object.fromEntries(Object.entries(MAPS).map(([k, v]) => [k, v.sub]));

// embedded: in der VitalOS-Shell – kein Papier-Vollbild auf html/body, keine Journal-/Door-Links.
export default function GameV2View({ user, mode = "fire", onModeChange = () => {}, embedded = false }) {
  if (SOLO_MAP && SUB[SOLO_MAP]) mode = SOLO_MAP;
  const solo = Boolean(SOLO_MAP && SUB[SOLO_MAP]);
  useEffect(() => {
    if (embedded) return undefined;
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
  }, [embedded]);
  const current = SUB[mode] ? mode : "fire";
  const idx = MODES.findIndex(([k]) => k === current);
  return (
    <div className="dv2-page">
      <article className="dv2" aria-label="Game v2">
        {!solo && (
          <div className="dv2-modes gv2-modes5" role="tablist" aria-label="Map">
            {MODES.map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={current === key} onClick={() => onModeChange(key)}>{label}</button>
            ))}
          </div>
        )}
        <div className="dv2-top">
          <div className="dv2-no">{idx + 1}</div>
          <div className="dv2-meta">
            <span className="dv2-kw">Game</span>
            <span><b>{MODES[idx][1]}</b><br />{SUB[current]}</span>
          </div>
        </div>
        <SyncBadge />
        {!user && <AuthDemoHelper>Lokale Taskwarrior-Daten bleiben nutzbar. Für deine Cloud-Maps und geräteübergreifende Speicherung kannst du dich anmelden.</AuthDemoHelper>}
        <GameMapPanel key={current} map={current} uid={user?.uid ?? null} />
        {!embedded && !solo && (
          <div className="dv2-foot">
            <a href="#door2">Door →</a>
            <a href="#v2">← Journal</a>
          </div>
        )}
      </article>
    </div>
  );
}
