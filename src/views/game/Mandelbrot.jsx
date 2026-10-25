// Mandelbrot — Vollbild-Zoom in das Seepferdchental, solange die Atem-Pause läuft (Dauer = seconds).
// Rendert klein (kurze Seite = RES px, Seitenverhältnis wie der Bildschirm) mit ~12 fps und wird per CSS
// auf den ganzen Viewport skaliert; kein Netzwerk, keine Abhängigkeit. Tippen schließt (Pause läuft weiter).
import { useEffect, useRef } from "react";

const RES = 140;
const CX = -0.743643887037151;
const CY = 0.13182590420533;
const START_SCALE = 3;
const END_SCALE = 0.0005;

function palette(t) {
  const a = 6.2832 * t;
  return [127 + 127 * Math.sin(a), 127 + 127 * Math.sin(a + 2.1), 127 + 127 * Math.sin(a + 4.2)];
}

function draw(ctx, img, w, h, progress) {
  const scale = START_SCALE * Math.pow(END_SCALE / START_SCALE, progress);
  const maxIter = Math.round(60 + 140 * progress);
  const d = img.data;
  const unit = scale / Math.min(w, h);
  for (let py = 0; py < h; py++) {
    const y0 = CY + (py - h / 2) * unit;
    for (let px = 0; px < w; px++) {
      const x0 = CX + (px - w / 2) * unit;
      let x = 0, y = 0, i = 0;
      while (i < maxIter && x * x + y * y <= 4) { const xt = x * x - y * y + x0; y = 2 * x * y + y0; x = xt; i++; }
      const o = (py * w + px) * 4;
      if (i === maxIter) { d[o] = d[o + 1] = d[o + 2] = 0; }
      else { const [r, g, b] = palette((i + 1 - Math.log2(Math.log2(x * x + y * y + 1) / 2 + 1)) / 40); d[o] = r; d[o + 1] = g; d[o + 2] = b; }
      d[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

export default function Mandelbrot({ seconds, left, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return undefined;
    const vw = window.innerWidth || 1, vh = window.innerHeight || 1;
    const k = RES / Math.min(vw, vh);
    const w = Math.max(2, Math.round(vw * k)), h = Math.max(2, Math.round(vh * k));
    canvas.width = w; canvas.height = h;
    const img = ctx.createImageData(w, h);
    const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0, last = 0;
    const frame = (now) => {
      if (now - last >= 80) { last = now; draw(ctx, img, w, h, still ? 0 : Math.min(1, (now - t0) / (seconds * 1000))); }
      if (!still) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [seconds]);
  return (
    <div className="gv2-mandel" role="dialog" aria-label="Atem-Pause" onClick={onClose}>
      <canvas ref={ref} />
      <div className="gv2-mandel-t" aria-live="off">{left} s</div>
      <button type="button" className="gv2-mandel-x" aria-label="Schließen" onClick={onClose}>✕</button>
    </div>
  );
}
