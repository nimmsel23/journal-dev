export function sumMetric(meals, key) {
  return meals.reduce((sum, meal) => sum + (Number(meal[key]) || 0), 0);
}

export function formatMetric(value, unit = "") {
  const rounded = Math.round((Number(value) || 0) * 10) / 10;
  const output = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return unit ? `${output}${unit}` : output;
}

export function normalizeSupplementUnit(unit) {
  const value = String(unit || "").trim();
  if (!value) return "mg";
  const parts = value.split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : value;
}
