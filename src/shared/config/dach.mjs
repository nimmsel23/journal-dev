// DACH Reference Values for adults
// Source: DGE (Deutsche Gesellschaft für Ernährung), ÖGE (Österreichische Gesellschaft für Ernährung)
// Standard für Deutschland, Österreich, Schweiz

export const DACH = {
  // Fettlösliche Vitamine
  vitamin_a_ug:   { value: 900,  unit: "µg" },
  vitamin_d_ug:   { value: 20,   unit: "µg" },
  vitamin_e_mg:   { value: 14,   unit: "mg" },
  vitamin_k_ug:   { value: 70,   unit: "µg" },
  // Wasserlösliche Vitamine — Personalisiert: Nikotin erhöht C (+40mg) + B6 (+0.5mg)
  vitamin_c_mg:   { value: 155,  unit: "mg" },
  vitamin_b1_mg:  { value: 1.2,  unit: "mg" },
  vitamin_b2_mg:  { value: 1.4,  unit: "mg" },
  vitamin_b3_mg:  { value: 16,   unit: "mg" },
  vitamin_b5_mg:  { value: 6,    unit: "mg" },
  vitamin_b6_mg:  { value: 2.0,  unit: "mg" },
  vitamin_b7_ug:  { value: 40,   unit: "µg" },
  folate_ug:      { value: 400,  unit: "µg" },
  vitamin_b12_ug: { value: 4,    unit: "µg" },
  // Mineralstoffe
  calcium_mg:     { value: 1000, unit: "mg" },
  phosphorus_mg:  { value: 700,  unit: "mg" },
  magnesium_mg:   { value: 375,  unit: "mg" },
  iron_mg:        { value: 10,   unit: "mg" },
  zinc_mg:        { value: 10,   unit: "mg" },
  selenium_ug:    { value: 70,   unit: "µg" },
  iodine_ug:      { value: 200,  unit: "µg" },
  potassium_mg:   { value: 4000, unit: "mg" },
  sodium_mg:      { value: 550,  unit: "mg" },
  // Fettsäuren
  omega3_mg:      { value: 250,  unit: "mg" },
};

export function getStatus(value, reference) {
  if (value >= reference * 0.9) return "ok"; // 90%+
  if (value >= reference * 0.5) return "warning"; // 50-90%
  return "critical"; // <50%
}
