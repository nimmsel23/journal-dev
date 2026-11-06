function hasRelaxDetails(item) {
  return Boolean(item && (
    String(item.technique || "").trim() || Number(item.minutes) > 0 || String(item.note || "").trim()
      || String(item.reflection || "").trim() || String(item.focus || "").trim()
  ));
}

export function dailyNutritionRecordOption(date, log) {
  if (!log || (log.date && log.date !== date)) return null;
  const meals = Array.isArray(log.meals) ? log.meals : [];
  const water = Number(log.water_ml) || 0;
  if (!meals.length && water <= 0) return null;
  const descriptions = meals.slice(0, 3).map((meal) => String(meal?.description || "Mahlzeit").slice(0, 80));
  const detail = [meals.length ? `${meals.length} Mahlzeit${meals.length === 1 ? "" : "en"}` : null,
    water > 0 ? `${water} ml Wasser` : null].filter(Boolean).join(" · ");
  return { recordId: date, date, title: descriptions.join(", ") || "Ernährungseintrag", detail };
}

export function dailyRelaxSessionOption(date, record) {
  if (!record || (record.date && record.date !== date)) return null;
  const items = Array.isArray(record.items) ? record.items.filter(hasRelaxDetails) : [];
  if (!items.length) return null;
  return {
    recordId: date,
    date,
    title: items.slice(0, 2).map((item) => String(item.technique || "Relax-Praxis").slice(0, 80)).join(", "),
    detail: `${items.length} ${items.length === 1 ? "Praxis" : "Praxen"}${items.some((item) => Number(item.minutes) > 0)
      ? ` · ${items.reduce((sum, item) => sum + (Number(item.minutes) > 0 ? Number(item.minutes) : 0), 0)} Min.` : ""}`,
  };
}

export function hasDailySkillRecordData(skill, record) {
  if (skill === "nutrition") {
    return (Array.isArray(record?.meals) && record.meals.length > 0) || Number(record?.water_ml) > 0;
  }
  if (skill === "relax") return Array.isArray(record?.items) && record.items.some(hasRelaxDetails);
  return false;
}
