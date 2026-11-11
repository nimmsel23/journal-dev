// firebase-headers.test.mjs — Header-Reihenfolge in firebase.json: bei gleichem Schlüssel gewinnt die LETZTE passende Regel.
// Die Wildcard-Regel für js/css/woff2 (immutable) muss deshalb VOR den no-cache-Regeln für sw.js stehen,
// sonst liefert Hosting den Service Worker ein Jahr „immutable“ aus (Offline-App würde Updates verpassen).
// Redirect-only Targets (Legacy-Sites) haben keine headers — nur 301 auf vos-journal.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync(new URL("../firebase.json", import.meta.url), "utf8"));
const WILDCARD = "**/*.@(js|css|woff2)";
const REDIRECT_TARGETS = new Set(["journal", "door", "voice", "game", "tent", "habits"]);

for (const h of cfg.hosting) {
  if (REDIRECT_TARGETS.has(h.target)) {
    test(`${h.target}: Legacy-Redirect ohne Asset-Headers`, () => {
      assert.ok(Array.isArray(h.redirects) && h.redirects.length > 0, "Redirect fehlt");
      assert.ok(!h.headers || h.headers.length === 0, "Redirect-Sites brauchen keine Cache-Headers");
      const dest = h.redirects[h.redirects.length - 1]?.destination ?? "";
      assert.match(dest, /vos-journal\.web\.app/, "Redirect muss auf vos-journal zeigen");
    });
    continue;
  }

  test(`${h.target}: sw.js ist no-cache und steht nach der js-Wildcard-Regel`, () => {
    assert.ok(Array.isArray(h.headers), "headers fehlen");
    const src = h.headers.map((x) => x.source);
    const wild = src.indexOf(WILDCARD);
    const sw = src.indexOf("/sw.js");
    assert.ok(sw >= 0, "Regel für /sw.js fehlt");
    assert.ok(wild >= 0, "js-Wildcard-Regel fehlt");
    assert.ok(sw > wild, "/sw.js muss hinter der js-Wildcard-Regel stehen (letzte Regel gewinnt)");
    const cc = h.headers[sw].headers.find((x) => x.key === "Cache-Control");
    assert.equal(cc?.value, "no-cache");
  });

  if (h.target === "v2") {
    test("v2: /mini/**/sw.js ist no-cache", () => {
      const rule = h.headers.find((x) => x.source === "/mini/**/sw.js");
      assert.ok(rule, "Regel für /mini/**/sw.js fehlt");
      const cc = rule.headers.find((x) => x.key === "Cache-Control");
      assert.equal(cc?.value, "no-cache");
    });
  }
}
