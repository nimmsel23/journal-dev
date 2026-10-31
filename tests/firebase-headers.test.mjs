// firebase-headers.test.mjs — Header-Reihenfolge in firebase.json: bei gleichem Schlüssel gewinnt die LETZTE passende Regel.
// Die Wildcard-Regel für js/css/woff2 (immutable) muss deshalb VOR den no-cache-Regeln für sw.js stehen,
// sonst liefert Hosting den Service Worker ein Jahr „immutable“ aus (Offline-App würde Updates verpassen).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync(new URL("../firebase.json", import.meta.url), "utf8"));
const WILDCARD = "**/*.@(js|css|woff2)";

for (const h of cfg.hosting) {
  test(`${h.target}: sw.js ist no-cache und steht nach der js-Wildcard-Regel`, () => {
    const src = h.headers.map((x) => x.source);
    const wild = src.indexOf(WILDCARD);
    const sw = src.indexOf("/sw.js");
    assert.ok(sw >= 0, "Regel für /sw.js fehlt");
    assert.ok(wild >= 0, "js-Wildcard-Regel fehlt");
    assert.ok(sw > wild, "/sw.js muss hinter der js-Wildcard-Regel stehen (letzte Regel gewinnt)");
    const cc = h.headers[sw].headers.find((x) => x.key === "Cache-Control");
    assert.equal(cc?.value, "no-cache");
  });
}
