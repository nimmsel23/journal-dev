// PauseViz — Vollbild-Visualisierung für die 30-s-Atem-Pause der Voice-Session.
// Fünf Modi (Mandelbrot, Julia, Flow, Mandelbrot-Baum, Atemkreis) plus optionaler Atemring als Ebene darüber.
// Alles Canvas, kein Netzwerk, keine Abhängigkeit. Fraktale rendern klein und werden per CSS skaliert,
// Flow/Baum/Atemkreis in Bildschirmauflösung. Tippen schließt (die Pause läuft weiter).
import { useEffect, useRef } from "react";

export const VIZ = [
  { id: "mandelbrot", label: "Mandelbrot" },
  { id: "julia", label: "Julia" },
  { id: "flow", label: "Flow" },
  { id: "tree", label: "Baum" },
  { id: "breath", label: "Atemkreis" },
];

const RES = 140;
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x) => x * x * (3 - 2 * x);

// ---- Pixel-Fraktale (kurze Seite = RES px) ------------------------------------------------------
function put(d, o, i, maxIter, x, y) {
  if (i === maxIter) { d[o] = d[o + 1] = d[o + 2] = 0; }
  else {
    const a = 3.6 + TAU * ((i + 1 - Math.log2(Math.log2(x * x + y * y + 1) / 2 + 1)) / 40);
    d[o] = 70 + 70 * Math.sin(a); d[o + 1] = 60 + 70 * Math.sin(a + 2.1); d[o + 2] = 130 + 110 * Math.sin(a + 4.2);
  }
  d[o + 3] = 255;
}

// Zoom ins Seepferdchental
function mandelbrot(p, w, h, d) {
  const scale = 3 * Math.pow(0.0005 / 3, p);
  const maxIter = Math.round(60 + 100 * p);
  const unit = scale / Math.min(w, h);
  for (let py = 0; py < h; py++) {
    const y0 = 0.13182590420533 + (py - h / 2) * unit;
    for (let px = 0; px < w; px++) {
      const x0 = -0.743643887037151 + (px - w / 2) * unit;
      let x = 0, y = 0, i = 0;
      while (i < maxIter && x * x + y * y <= 4) { const xt = x * x - y * y + x0; y = 2 * x * y + y0; x = xt; i++; }
      put(d, (py * w + px) * 4, i, maxIter, x, y);
    }
  }
}

// Julia-Menge, deren Parameter einmal um den Kreis |c| = 0.7885 wandert
function julia(p, w, h, d) {
  const a = TAU * p;
  const cx = 0.7885 * Math.cos(a), cy = 0.7885 * Math.sin(a);
  const maxIter = 70;
  const unit = 3.2 / Math.min(w, h);
  for (let py = 0; py < h; py++) {
    const y0 = (py - h / 2) * unit;
    for (let px = 0; px < w; px++) {
      let x = (px - w / 2) * unit, y = y0, i = 0;
      while (i < maxIter && x * x + y * y <= 4) { const xt = x * x - y * y + cx; y = 2 * x * y + cy; x = xt; i++; }
      put(d, (py * w + px) * 4, i, maxIter, x, y);
    }
  }
}

function lowRes(fn) {
  return (canvas, vw, vh) => {
    const k = RES / Math.min(vw, vh);
    const w = Math.max(2, Math.round(vw * k)), h = Math.max(2, Math.round(vh * k));
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(w, h);
    return { interval: 80, frame: (p) => { fn(p, w, h, img.data); ctx.putImageData(img, 0, 0); } };
  };
}

// ---- Vollauflösung -----------------------------------------------------------------------------
function fullRes(canvas, vw, vh) {
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (vw * vh * dpr * dpr > 2.5e6) dpr = Math.sqrt(2.5e6 / (vw * vh));
  const w = Math.round(vw * dpr), h = Math.round(vh * dpr);
  canvas.width = w; canvas.height = h;
  return { ctx: canvas.getContext("2d"), w, h, u: Math.min(w, h) / 400 };
}

// Atemring: Box Breathing 4-4-4-4
const PHASES = ["Einatmen", "Halten", "Ausatmen", "Halten"];
function drawRing(ctx, w, h, t) {
  const ph = Math.floor(t / 4) % 4, f = (t % 4) / 4;
  const e = ph === 0 ? ease(f) : ph === 1 ? 1 : ph === 2 ? 1 - ease(f) : 0;
  const m = Math.min(w, h), r = m * (0.1 + 0.22 * e);
  const g = ctx.createRadialGradient(w / 2, h / 2, r * 0.2, w / 2, h / 2, r * 1.8);
  g.addColorStop(0, "rgba(255,255,255,0.35)"); g.addColorStop(0.55, "rgba(140,200,255,0.18)"); g.addColorStop(1, "rgba(140,200,255,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(w / 2, h / 2, r * 1.8, 0, TAU); ctx.fill();
  ctx.lineWidth = Math.max(2, m * 0.008); ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, TAU); ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = `600 ${Math.round(m * 0.045)}px system-ui, sans-serif`;
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = m * 0.02;
  ctx.fillText(PHASES[ph], w / 2, h / 2 - m * 0.012);
  ctx.font = `400 ${Math.round(m * 0.03)}px system-ui, sans-serif`;
  ctx.fillText(String(4 - Math.floor(f * 4)), w / 2, h / 2 + m * 0.03);
  ctx.shadowBlur = 0;
}

function setupBreath(canvas, vw, vh) {
  const { ctx, w, h } = fullRes(canvas, vw, vh);
  return { interval: 33, ring: true, frame: (p, t) => {
    const hue = 215 + 40 * Math.sin(t * 0.15);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, `hsl(${hue},45%,12%)`); g.addColorStop(1, `hsl(${hue + 30},50%,22%)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    drawRing(ctx, w, h, t);
  } };
}

// Flow Field: Partikel treiben durch ein sich langsam änderndes Strömungsfeld
function setupFlow(canvas, vw, vh) {
  const { ctx, w, h, u } = fullRes(canvas, vw, vh);
  const N = 900;
  const px = new Float32Array(N), py = new Float32Array(N);
  for (let i = 0; i < N; i++) { px[i] = Math.random() * w; py[i] = Math.random() * h; }
  ctx.fillStyle = "#070a14"; ctx.fillRect(0, 0, w, h);
  return { interval: 33, frame: (p, t) => {
    ctx.fillStyle = "rgba(7,10,20,0.07)"; ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = Math.max(1, 1.2 * u); ctx.strokeStyle = `hsla(${190 + 130 * p},75%,68%,0.55)`;
    ctx.beginPath();
    const f = 1 / (150 * u);
    for (let i = 0; i < N; i++) {
      const x = px[i], y = py[i];
      const a = (Math.sin(x * f + t * 0.3) + Math.cos(y * f * 1.3 - t * 0.2) + Math.sin((x + y) * f * 0.6 + t * 0.1)) * 1.4;
      const nx = x + Math.cos(a) * 2 * u, ny = y + Math.sin(a) * 2 * u;
      ctx.moveTo(x, y); ctx.lineTo(nx, ny);
      if (nx < 0 || nx > w || ny < 0 || ny > h) { px[i] = Math.random() * w; py[i] = Math.random() * h; }
      else { px[i] = nx; py[i] = ny; }
    }
    ctx.stroke();
  } };
}

// Mandelbrot-Baum (Benoît Mandelbrot, "Fractal Geometry of Nature"): jede Gabelung hat links und rechts
// eigenen Winkel und eigenes Streckenverhältnis -> schief, luftig, windgeformt statt symmetrischer Dom.
// Er wächst über die Dauer der Pause von der Wurzel bis in die Spitzen.
const rnd = (s) => { const v = Math.sin(s * 12.9898) * 43758.5453; return v - Math.floor(v); };
const TREE = { depth: 12, left: { ang: -0.6, ratio: 0.62 }, right: { ang: 0.15, ratio: 0.8 } };
function setupTree(canvas, vw, vh) {
  const { ctx, w, h, u } = fullRes(canvas, vw, vh);
  const { depth: DEPTH, left: L, right: R } = TREE;
  return { interval: 33, frame: (p, t) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0b1226"); g.addColorStop(1, "#1d2a3f");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.lineCap = "round";
    const grow = clamp(p * 1.1) * (DEPTH + 1);
    const branch = (x, y, len, ang, depth, seed) => {
      const lv = clamp(grow - depth);
      if (lv <= 0) return;
      const sway = Math.sin(t * 0.7 + depth * 0.5 + seed) * 0.02 * (depth / DEPTH);
      const a = ang + sway, l = len * lv;
      const x2 = x + Math.sin(a) * l, y2 = y - Math.cos(a) * l;
      const k = depth / DEPTH;
      ctx.strokeStyle = `rgb(${Math.round(150 - 70 * k)},${Math.round(105 + 85 * k)},${Math.round(75 + 10 * k)})`;
      ctx.lineWidth = Math.max(0.8 * u, (DEPTH - depth) * 1.1 * u);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
      if (depth >= DEPTH || len * L.ratio < 1.2 * u) {
        if (lv >= 1) { ctx.fillStyle = `hsla(${335 + 25 * rnd(seed)},70%,75%,0.7)`; ctx.beginPath(); ctx.arc(x2, y2, 2.2 * u, 0, TAU); ctx.fill(); }
        return;
      }
      const j = (n) => (rnd(seed + n) - 0.5) * 0.12;
      branch(x2, y2, len * L.ratio, a + L.ang + j(1), depth + 1, seed * 2 + 1);
      branch(x2, y2, len * R.ratio, a + R.ang + j(2), depth + 1, seed * 2 + 2);
    };
    branch(w * 0.55, h - 10 * u, Math.min(h * 0.2, w * 0.25), 0, 0, 1);
  } };
}

const SETUP = { mandelbrot: lowRes(mandelbrot), julia: lowRes(julia), flow: setupFlow, tree: setupTree, breath: setupBreath };

export default function PauseViz({ viz = "mandelbrot", ring = false, seconds, left, onClose }) {
  const ref = useRef(null);
  const ringRef = useRef(null);
  const showRing = ring && viz !== "breath";
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !canvas.getContext) return undefined;
    const vw = window.innerWidth || 1, vh = window.innerHeight || 1;
    const v = (SETUP[viz] || SETUP.mandelbrot)(canvas, vw, vh);
    let rc = null, rw = 0, rh = 0;
    if (showRing && ringRef.current) { const r = fullRes(ringRef.current, vw, vh); rc = r.ctx; rw = r.w; rh = r.h; }
    const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0, last = -1e9;
    const draw = (t) => {
      v.frame(clamp(t / seconds), t);
      if (rc) { rc.clearRect(0, 0, rw, rh); drawRing(rc, rw, rh, t); }
    };
    if (still) {
      // Standbild: Flow bekommt vorab ein paar Schritte, damit Spuren sichtbar sind
      for (let i = 0; i < (viz === "flow" ? 120 : 1); i++) draw(0.8 * seconds + i / 30);
      return undefined;
    }
    const loop = (now) => {
      if (now - last >= v.interval) { last = now; draw((now - t0) / 1000); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [viz, showRing, seconds]);
  return (
    <div className="gv2-mandel" role="dialog" aria-label="Atem-Pause" onClick={onClose}>
      <canvas ref={ref} />
      {showRing && <canvas ref={ringRef} className="gv2-mandel-ring" />}
      <div className="gv2-mandel-t" aria-live="off">{left} s</div>
      <button type="button" className="gv2-mandel-x" aria-label="Schließen" onClick={onClose}>✕</button>
    </div>
  );
}
