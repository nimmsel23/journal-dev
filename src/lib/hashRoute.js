// hashRoute — URL-Hash als einzige Quelle für Tab, Modus und Datum (rein, ohne React/DOM).
//   #v2 · #v2/woche · #v2/jahr · #v2/woche/2026-10-17 · #v2/today · #door2/plan · #game2/focus (Kurzform #focus) · #tent2/2026-10-17
// Funktioniert offline: der Hash wird ausschließlich im Browser ausgewertet.

// Pro Tab: Kurz-Alias, Modi (erster Eintrag = Standard, sofern kein defaultMode) und ob das Datum im Hash steht.
export function routeMeta({ gameDefault = "fire" } = {}) {
  return {
    "journal-v2": { alias: "v2", modes: ["tag", "woche", "monat", "jahr", "habits"], defaultMode: "tag", hasDate: true },
    "door-v2": { alias: "door2", modes: ["potential", "plan", "production", "profit"], defaultMode: "potential", hasDate: false },
    "game-v2": { alias: "game2", modes: ["fire", "focus", "freedom", "frame", "voice"], defaultMode: gameDefault, hasDate: false, shortForm: true },
    "tent-v2": { alias: "tent2", modes: [], hasDate: true },
  };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function localToday(now = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

export function makeRouter({ tabs, defaultTab, gameDefault = "fire", today = localToday } = {}) {
  const meta = routeMeta({ gameDefault });
  const byAlias = Object.fromEntries(Object.entries(meta).map(([key, m]) => [m.alias, key]));
  const shortModes = Object.entries(meta).filter(([, m]) => m.shortForm).flatMap(([key, m]) => m.modes.map((mode) => [mode, key]));
  const info = (tab) => meta[tab] ?? { modes: [], hasDate: true };
  const known = (tab) => tabs.includes(tab);

  // → { tab, mode, date }; tab fällt auf defaultTab, mode auf den Standard des Tabs (sonst null), date auf null (= unverändert/heute)
  function parse(hash) {
    const parts = String(hash || "").replace(/^#\/?/, "").split("/");
    const short = shortModes.find(([mode]) => mode === parts[0]);
    if (short) parts.unshift(meta[short[1]].alias); // #focus → #game2/focus
    const head = parts[0] ? (byAlias[parts[0]] ?? parts[0]) : null;
    const tab = head && known(head) ? head : defaultTab;
    const m = info(tab);
    const given = head === tab && m.modes.includes(parts[1]) ? parts.splice(1, 1)[0] : null;
    const mode = given ?? m.defaultMode ?? null;
    const raw = head === tab ? parts[1] : null;
    const date = raw === "today" ? today() : ISO_DATE.test(raw ?? "") ? raw : null;
    return { tab, mode, date };
  }

  // Kanonische Schreibweise: Alias statt Tab-Key, Standardmodus und "heute" werden weggelassen bzw. als "today" geschrieben.
  function build({ tab, mode, date }) {
    if (!tab) return "#";
    const m = info(tab);
    const name = m.alias ?? tab;
    const prefix = m.modes.length && mode && mode !== m.defaultMode ? `${name}/${mode}` : name;
    if (!m.hasDate || !date) return `#${prefix}`;
    return `#${prefix}/${date === today() ? "today" : date}`;
  }

  return { parse, build, meta };
}
