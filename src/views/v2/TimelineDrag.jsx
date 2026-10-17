// Versteckte Tages-Timeline für Journal v2: erscheint erst, wenn ein Eintrag
// an seiner Uhrzeit gezogen wird. Vertikal = Stunde, horizontal in der Zeile =
// Viertel-/Halbstunde (je nach Raster). Raster 60/30/15 lässt sich beim Ziehen
// durch Darüberfahren der Rasterknöpfe umstellen. Pointer Events statt HTML5-
// Drag-and-drop, damit es auf iPad/Touch zuverlässig läuft.
import { useRef, useState } from "react";

export const GRAINS = [60, 30, 15];
const pad = (n) => String(n).padStart(2, "0");
export const hhmm = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

export function useTimelineDrag({ grain, setGrain, onMove, minutesOf }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(null); // { entry, x, y }
  const [hover, setHover] = useState(null); // Minuten seit 0:00 oder null

  const probe = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const g = el?.closest?.("[data-grain]");
    if (g) setGrain(Number(g.dataset.grain));
    const slot = el?.closest?.("[data-slot]");
    return slot ? Number(slot.dataset.slot) : null;
  };

  const reset = () => {
    ref.current = null;
    setDrag(null);
    setHover(null);
  };

  const handleProps = (entry) => ({
    onPointerDown: (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      ref.current = { entry, x0: e.clientX, y0: e.clientY, active: false };
    },
    onPointerMove: (e) => {
      const r = ref.current;
      if (!r) return;
      if (!r.active) {
        if (Math.hypot(e.clientX - r.x0, e.clientY - r.y0) < 6) return;
        r.active = true;
      }
      setDrag({ entry: r.entry, x: e.clientX, y: e.clientY });
      setHover(probe(e));
    },
    onPointerUp: (e) => {
      const r = ref.current;
      if (r?.active) {
        const minutes = probe(e);
        if (minutes != null) onMove(r.entry, minutes);
      }
      reset();
    },
    onPointerCancel: reset,
    onKeyDown: (e) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      const next = minutesOf(entry) + (e.key === "ArrowUp" ? -grain : grain);
      onMove(entry, Math.min(1439, Math.max(0, next)));
    },
  });

  return { drag, hover, handleProps };
}

export function TimelineOverlay({ drag, hover, grain, entries, minutesOf, title }) {
  if (!drag) return null;
  const cells = 60 / grain;
  const perHour = new Map();
  entries.forEach((e) => {
    if (e.id === drag.entry.id) return;
    const h = Math.floor(minutesOf(e) / 60);
    perHour.set(h, (perHour.get(h) || 0) + 1);
  });
  const own = minutesOf(drag.entry);

  return (
    <>
      <aside className="jv2-tl" aria-hidden="true">
        <div className="jv2-tl-head">
          {GRAINS.map((g) => (
            <span key={g} data-grain={g} className={g === grain ? "on" : ""}>{g === 60 ? "1 h" : `${g} min`}</span>
          ))}
        </div>
        <div className="jv2-tl-rows">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="jv2-tl-row">
              <span className="jv2-tl-h">{pad(h)}</span>
              <span className="jv2-tl-mark">
                {Array.from({ length: perHour.get(h) || 0 }, (_, i) => <i key={i} />)}
              </span>
              {Array.from({ length: cells }, (_, c) => {
                const minutes = h * 60 + c * grain;
                const cls = ["jv2-tl-cell", hover === minutes ? "hot" : "", own === minutes ? "own" : ""].join(" ");
                return <span key={c} data-slot={minutes} className={cls}>{grain < 60 ? pad(c * grain) : ""}</span>;
              })}
            </div>
          ))}
        </div>
      </aside>
      <div className="jv2-ghost" style={{ left: drag.x, top: drag.y }}>
        <b>{hover != null ? hhmm(hover) : "—"}</b> {title}
      </div>
    </>
  );
}
