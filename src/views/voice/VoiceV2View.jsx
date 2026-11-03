import { useEffect } from "react";
import VoicePanel from "./VoicePanel.jsx";
import "../door/v2/door-v2.css";
import "../game/game-v2.css";

export default function VoiceV2View({ user, embedded = false }) {
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

  return (
    <div className="dv2-page">
      <article className="dv2" aria-label="Voice">
        <div className="dv2-top">
          <div className="dv2-no">V</div>
          <div className="dv2-meta"><span className="dv2-kw">Voice</span><span><b>Voice Session</b><br />Stop · Submit · Struggle · Strike</span></div>
        </div>
        <VoicePanel key={user?.uid || "guest"} user={user} />
        {!embedded && <div className="dv2-foot"><a href="#game2">Game →</a><a href="#v2">← Journal</a></div>}
      </article>
    </div>
  );
}
