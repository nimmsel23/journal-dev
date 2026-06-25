import React from "react";
import { useQueries } from "@tanstack/react-query";
import { fetchJson } from "../lib/api.js";

const NUTRIENTS = [
  // Fettlöslich
  { key: "vitamin_a_ug",   label: "Vit. A",    unit: "µg" },
  { key: "vitamin_d_ug",   label: "Vit. D",    unit: "µg" },
  { key: "vitamin_e_mg",   label: "Vit. E",    unit: "mg" },
  { key: "vitamin_k_ug",   label: "Vit. K",    unit: "µg" },
  // Wasserlöslich
  { key: "vitamin_c_mg",   label: "Vit. C",    unit: "mg" },
  { key: "vitamin_b1_mg",  label: "B1",        unit: "mg" },
  { key: "vitamin_b2_mg",  label: "B2",        unit: "mg" },
  { key: "vitamin_b3_mg",  label: "B3",        unit: "mg" },
  { key: "vitamin_b5_mg",  label: "B5",        unit: "mg" },
  { key: "vitamin_b6_mg",  label: "B6",        unit: "mg" },
  { key: "vitamin_b7_ug",  label: "B7",        unit: "µg" },
  { key: "folate_ug",      label: "Folat",     unit: "µg" },
  { key: "vitamin_b12_ug", label: "B12",       unit: "µg" },
  // Mineralstoffe
  { key: "calcium_mg",     label: "Calcium",   unit: "mg" },
  { key: "phosphorus_mg",  label: "Phosphor",  unit: "mg" },
  { key: "magnesium_mg",   label: "Mg",        unit: "mg" },
  { key: "iron_mg",        label: "Eisen",     unit: "mg" },
  { key: "zinc_mg",        label: "Zink",      unit: "mg" },
  { key: "selenium_ug",    label: "Selen",     unit: "µg" },
  { key: "iodine_ug",      label: "Jod",       unit: "µg" },
  { key: "potassium_mg",   label: "Kalium",    unit: "mg" },
  { key: "sodium_mg",      label: "Natrium",   unit: "mg" },
  // Fettsäuren
  { key: "omega3_mg",      label: "Omega-3",   unit: "mg" },
];

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return {
    year: d.getFullYear(),
    week: 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7),
  };
}

function lastNWeeks(n) {
  const weeks = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    weeks.push(getISOWeek(d));
  }
  return weeks;
}

function pctColor(pct) {
  if (pct == null) return { bg: "rgba(30,41,59,0.4)", text: "#475569" };
  if (pct >= 90)   return { bg: "#16a34a",            text: "#fff" };
  if (pct >= 50)   return { bg: "#d97706",            text: "#fff" };
  return               { bg: "#dc2626",            text: "#fff" };
}

function Cell({ pct, dach, unit, avg }) {
  const { bg, text } = pctColor(pct);
  const title = pct != null
    ? `${avg} ${unit} / ${dach} ${unit} DACH (${pct}%)`
    : "Keine Daten";

  return (
    <div
      title={title}
      className="flex h-9 w-full items-center justify-center rounded text-[10px] font-semibold transition-opacity"
      style={{ background: bg, color: text }}
    >
      {pct != null ? `${pct}%` : "—"}
    </div>
  );
}

export default function MicrosView() {
  const weeks = lastNWeeks(8);

  const results = useQueries({
    queries: weeks.map(({ year, week }) => ({
      queryKey: ["nutrition-weekly", year, week],
      queryFn: () =>
        fetchJson(`/nutrition/weekly/${year}/${week}`)
          .then((d) => (d.ok ? d : null)),
      staleTime: 5 * 60 * 1000,
    })),
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Mikronährstoffe</h2>
        <p className="text-sm text-slate-400">Ø täglich vs. DACH-Referenzwerte · letzte 8 Wochen</p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded" style={{ background: "#16a34a" }} /> ≥ 90%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded" style={{ background: "#d97706" }} /> 50–89%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded" style={{ background: "#dc2626" }} /> &lt; 50%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded" style={{ background: "rgba(30,41,59,0.4)", border: "1px solid #334155" }} /> keine Daten
        </span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[640px] gap-1"
          style={{ gridTemplateColumns: `7rem repeat(${weeks.length}, 1fr)` }}
        >
          {/* Header row */}
          <div />
          {weeks.map(({ year, week }, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-slate-500">
              KW{week}
            </div>
          ))}

          {/* Nutrient rows */}
          {NUTRIENTS.map(({ key, label, unit }) => (
            <React.Fragment key={key}>
              <div className="flex items-center pr-2 text-sm font-medium text-slate-300">
                {label}
                <span className="ml-1 text-[10px] text-slate-500">{unit}</span>
              </div>
              {results.map((res, wi) => {
                const d = res.data?.rda_comparison?.[key];
                return (
                  <Cell
                    key={`${key}-${wi}`}
                    pct={d?.percent_of_dach ?? null}
                    dach={d?.dach ?? null}
                    unit={unit}
                    avg={d?.avg_daily ?? null}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-slate-600">
        Mikronährstoffe werden aus dem Micros-Katalog geschätzt. Mahlzeiten ohne Eintrag zählen als 0.
      </p>
    </div>
  );
}
