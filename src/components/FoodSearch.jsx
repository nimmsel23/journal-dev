import { useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { fetchJson } from "../lib/api.js";

export const PORTIONS = [
  { key: "s",  label: "S",  g: 100 },
  { key: "m",  label: "M",  g: 200 },
  { key: "l",  label: "L",  g: 300 },
  { key: "xl", label: "XL", g: 450 },
];

export default function FoodSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [portion, setPortion] = useState("m");
  const [selected, setSelected] = useState(null);
  const debounce = useRef(null);

  function search(q) {
    clearTimeout(debounce.current);
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchJson(`/nutrition/search?q=${encodeURIComponent(q)}&limit=15`);
        setResults(data.results || []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
  }

  function applyPortion(food, p) {
    const g = PORTIONS.find(x => x.key === p)?.g ?? 200;
    const f = g / 100;
    onSelect({
      name: food.name,
      brand: food.brand || "",
      description: food.brand ? `${food.name} (${food.brand})` : food.name,
      grams: g,
      source: food._src || "off",
      kcal:    Math.round(food.kcal * f),
      protein: Math.round(food.ew   * f * 10) / 10,
      carbs:   Math.round(food.kh   * f * 10) / 10,
      fat:     Math.round(food.fett * f * 10) / 10,
    });
  }

  function pick(food) {
    setSelected(food);
    setOpen(false);
    setQuery(food.name);
    applyPortion(food, portion);
  }

  function changePortion(p) {
    setPortion(p);
    if (selected) applyPortion(selected, p);
  }

  return (
    <div className="rounded-2xl border border-orange-400/20 bg-orange-400/5 p-4 mb-4">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-orange-300">
        <Sparkles className="h-3.5 w-3.5" />
        Food Search · Open Food Facts
      </div>

      <div className="relative">
        <input
          className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder-slate-500"
          placeholder="Lebensmittel suchen…"
          value={query}
          onChange={e => { setQuery(e.target.value); search(e.target.value); }}
          onFocus={() => results.length && setOpen(true)}
        />
        {loading && (
          <span className="absolute right-4 top-3.5 text-xs text-slate-400 animate-pulse">suche…</span>
        )}
        {open && results.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-auto rounded-xl border border-white/10 bg-slate-900 shadow-xl max-h-64">
            {results.map((f, i) => (
              <li key={i}>
                <button type="button" onClick={() => pick(f)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-800 transition">
                  <div className="font-medium text-slate-100 truncate">{f.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {f.brand && <span className="mr-2">{f.brand}</span>}
                    <span className="text-orange-300">{f.kcal} kcal</span>
                    {" · "}{f.ew}g P · {f.kh}g C · {f.fett}g F
                    <span className="text-slate-600 ml-1">/ 100g</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">Portion:</span>
          {PORTIONS.map(p => (
            <button key={p.key} type="button" onClick={() => changePortion(p.key)}
              className={twMerge(
                "rounded-full px-3 py-1 text-xs font-semibold transition border",
                portion === p.key
                  ? "bg-orange-400 text-slate-950 border-orange-400"
                  : "border-white/10 text-slate-300 hover:bg-white/5"
              )}>
              {p.label} · {p.g}g
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
