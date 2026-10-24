import test from "node:test";
import assert from "node:assert/strict";
import { makeRouter, localToday } from "../src/lib/hashRoute.js";

const TABS = ["journal", "journal-v2", "door-v2", "game-v2", "tent-v2", "ai-log", "door"];
const TODAY = "2026-10-24";
const router = makeRouter({ tabs: TABS, defaultTab: "journal", today: () => TODAY });

// ── Referenz: die bisherigen Funktionen aus main.jsx (unverändert übernommen) ──
const HASH_ALIASES = { v2: "journal-v2", door2: "door-v2", game2: "game-v2", tent2: "tent-v2" };
const V2_MODES = ["tag", "woche", "monat", "habits"];
const DOOR_MODES = ["potential", "plan", "production", "profit"];
const GAME_DEFAULT = "fire";
const GAME_MODES = ["fire", "focus", "freedom", "frame", "voice"];
const REVERSE = Object.fromEntries(Object.entries(HASH_ALIASES).map(([k, v]) => [v, k]));
const oldParse = (hash) => {
  const raw = hash.replace(/^#\/?/, "");
  if (!raw) return { tab: null, date: null };
  const parts = raw.split("/");
  if (GAME_MODES.includes(parts[0])) parts.unshift("game2");
  const rawTab = parts[0] || null;
  const tab = rawTab ? (HASH_ALIASES[rawTab] ?? rawTab) : null;
  let mode = null;
  if (tab === "journal-v2" && V2_MODES.includes(parts[1])) mode = parts.splice(1, 1)[0];
  if (tab === "door-v2" && DOOR_MODES.includes(parts[1])) mode = parts.splice(1, 1)[0];
  if (tab === "game-v2" && GAME_MODES.includes(parts[1])) mode = parts.splice(1, 1)[0];
  const rawDate = parts[1] ?? null;
  if (!tab) return { tab: null, date: null, mode };
  if (!rawDate) return { tab, date: null, mode };
  if (rawDate === "today") return { tab, date: TODAY, mode };
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return { tab, date: rawDate, mode };
  return { tab, date: null, mode };
};
const oldBuild = (rawTab, date, mode = "tag") => {
  const tab = REVERSE[rawTab] ?? rawTab;
  if (!tab) return "#";
  if (rawTab === "game-v2") return mode && mode !== GAME_DEFAULT ? `#${tab}/${mode}` : `#${tab}`;
  if (rawTab === "door-v2") return mode && mode !== "potential" ? `#${tab}/${mode}` : `#${tab}`;
  const prefix = rawTab === "journal-v2" && mode !== "tag" ? `${tab}/${mode}` : tab;
  if (!date) return `#${prefix}`;
  return `#${prefix}/${date === TODAY ? "today" : date}`;
};

const URLS = [
  "", "#", "#/", "#journal", "#journal/2026-10-17", "#journal/today", "#journal/quatsch",
  "#v2", "#v2/today", "#v2/2026-10-17", "#v2/woche", "#v2/monat/2026-10-17", "#v2/habits/today", "#v2/unbekannt",
  "#door2", "#door2/plan", "#door2/profit/2026-10-17", "#door2/quatsch",
  "#game2", "#game2/focus", "#game2/voice", "#fire", "#focus", "#frame/2026-10-17", "#game-v2/freedom",
  "#tent2", "#tent2/today", "#tent2/2026-10-17", "#tent-v2/2026-10-17",
  "#ai-log", "#door", "#journal-v2/woche",
];

test("parse entspricht dem bisherigen Verhalten für alle bekannten URLs", () => {
  for (const url of URLS) {
    const old = oldParse(url);
    const now = router.parse(url);
    if (old.tab && TABS.includes(old.tab)) {
      assert.equal(now.tab, old.tab, `Tab bei ${url}`);
      assert.equal(now.date, old.date, `Datum bei ${url}`);
      if (old.mode) assert.equal(now.mode, old.mode, `Modus bei ${url}`);
    } else {
      assert.equal(now.tab, "journal", `unbekannter/leerer Hash fällt auf Standard-Tab: ${url}`);
    }
  }
});

test("Standardmodus je Tab, wenn keiner im Hash steht", () => {
  assert.equal(router.parse("#v2").mode, "tag");
  assert.equal(router.parse("#door2").mode, "potential");
  assert.equal(router.parse("#game2").mode, "fire");
  assert.equal(router.parse("#tent2").mode, null);
  assert.equal(router.parse("#journal").mode, null);
});

test("build entspricht dem bisherigen Verhalten", () => {
  const dates = [null, "2026-10-17", TODAY];
  const cases = [
    ["journal", [undefined]], ["ai-log", [undefined]], ["tent-v2", [undefined]],
    ["journal-v2", V2_MODES], ["door-v2", DOOR_MODES], ["game-v2", GAME_MODES],
  ];
  for (const [tab, modes] of cases) {
    for (const mode of modes) for (const date of dates) {
      const expected = oldBuild(tab, date, mode);
      assert.equal(router.build({ tab, mode, date }), expected, `${tab} ${mode} ${date}`);
    }
  }
});

test("Round-Trip: build → parse liefert denselben Zustand", () => {
  for (const state of [
    { tab: "journal-v2", mode: "woche", date: "2026-10-17" },
    { tab: "journal-v2", mode: "tag", date: TODAY },
    { tab: "door-v2", mode: "plan", date: null },
    { tab: "game-v2", mode: "voice", date: null },
    { tab: "tent-v2", mode: null, date: "2026-10-17" },
    { tab: "journal", mode: null, date: "2026-10-17" },
  ]) {
    assert.deepEqual(router.parse(router.build(state)), state);
  }
});

test("gameDefault aus der Umgebung (Voice-Flavor) wird berücksichtigt", () => {
  const voice = makeRouter({ tabs: TABS, defaultTab: "game-v2", gameDefault: "voice", today: () => TODAY });
  assert.equal(voice.parse("").mode, "voice");
  assert.equal(voice.build({ tab: "game-v2", mode: "voice" }), "#game2");
  assert.equal(voice.build({ tab: "game-v2", mode: "fire" }), "#game2/fire");
});

test("localToday nutzt die lokale Zeit statt UTC", () => {
  // 00:30 Ortszeit am 25.10. wäre in UTC (bei Offsets > 0) noch der 24.
  assert.equal(localToday(new Date(2026, 9, 25, 0, 30)), "2026-10-25");
  assert.equal(localToday(new Date(2026, 9, 24, 23, 59)), "2026-10-24");
});
