// Solo-Flavor: VITE_SOLO_TABS=door-v2 → nur dieser Tab in routes.js (===-Vergleich für DCE).
// Leer = Hub-Build (journal / v2) mit allen Tabs. Komma-Listen sind dokumentiert, Builds nutzen einen Key.

export function parseSoloTabs(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function keepTab(key, soloKeys) {
  return soloKeys.length === 0 || soloKeys.includes(key);
}

/** Entspricht der routes.js-Logik: Hub oder exakter Solo-Key. */
export function keepSoloKey(key, soloRaw) {
  const solo = String(soloRaw || "");
  return !solo || solo === key;
}
