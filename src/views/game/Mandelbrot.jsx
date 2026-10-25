// Mandelbrot — Zoom in das Seepferdchental, solange die Atem-Pause läuft (Dauer = seconds).
// Rendert klein (RES x RES) mit ~12 fps und wird per CSS skaliert; kein Netzwerk, keine Abhängigkeit.
import { useEffect, useRef } from "react";

const RES = 160;
const CX = -0.743643887037151;
const CY = 0.13182590420533;
const START_SCALE = 3;
const END_SCALE = 0.0005;

function palette(t) {
  const a = 6.2832 * t;
  return [127 + 127 * Math.sin(a), 127 + 127 * Math.sin(a + 2.1), 127 + 127 * Math.sin(a + 4.2)];
}

function draw(ctx, img, progress) {
  const scale = START_SCALE * Math.pow(END_SCALE / START_SCALE, progress);
  const maxIter = Math.round(60 + 140 * progress);
  const d = img.data;
  for (let py = 0; py < RES; py++) {
    const y0 = CY + (py / RES - 0.5) * scale;
    for (let px = 0; px < RES; px++) {
      const x0 = CX + (px / RES - 0.5) * scale;
      let x = 0, y = 0, i = 0;
      while (i < maxIter && x * x + y * y <= 4) { const xt = x * x - y * y + x0; y = 2 * x * y + y0; x = xt; i++; }
      const o = (py * RES + px) * 4;
      if (i === maxIter) { d[o] = d[o + 1] = d[o + 2] = 0; }
      else { const [r, g, b] = palette((i + 1 - Math.log2(Math.log2(x * x + y * y + 1) / 2 + 1)) / 40); d[o] = r; d[o + 1] = g; d[o + 2] = b; }
      d[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

export default function Mandelbrot({ seconds }) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return undefined;
    const img = ctx.createImageData(RES, RES);
    const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0, last = 0;
    const frame = (now) => {
      if (now - last >= 80) { last = now; draw(ctx, img, still ? 0 : Math.min(1, (now - t0) / (seconds * 1000))); }
      if (!still) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [seconds]);
  return <canvas ref={ref} width={RES} height={RES} className="gv2-mandel" role="img" aria-label="Mandelbrot-Zoom während der Pause" />;
}
