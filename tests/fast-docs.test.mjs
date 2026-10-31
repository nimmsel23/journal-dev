// fast-docs.test.mjs — getDocsFast (src/lib/db/fastDocs.js): Server schnell → Serverstand; langsam/offline → lokaler Stand,
// Serverstand kommt über onLate nach; leerer Cache + Netz → auf den Server warten. Quelltext wird mit gefälschtem Firestore
// ausgewertet (kein Firebase im Test).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const src = readFileSync(new URL("../src/lib/db/fastDocs.js", import.meta.url), "utf8")
  .replace(/^import .*;\n/gm, "").replace("export async function", "async function");

const snap = (name, empty = false) => ({ name, empty });
function load({ server, cache, online = true }) {
  const ctx = {
    getDocs: server, getDocsFromCache: cache, setTimeout, clearTimeout, Promise, Symbol,
    navigator: { onLine: online },
  };
  return runInNewContext(`${src}\n(getDocsFast)`, ctx);
}
const later = (ms, v, reject) => new Promise((res, rej) => setTimeout(() => (reject ? rej(v) : res(v)), ms));

test("Server antwortet rasch → Serverstand", async () => {
  const f = load({ server: () => later(5, snap("server")), cache: async () => snap("cache") });
  assert.equal((await f({}, null, 200)).name, "server");
});

test("Server langsam, Cache hat Daten → sofort lokaler Stand, Serverstand kommt über onLate", async () => {
  const f = load({ server: () => later(120, snap("server")), cache: async () => snap("cache") });
  let late = null;
  const t0 = Date.now();
  const got = await f({}, (s) => { late = s; }, 30);
  assert.equal(got.name, "cache");
  assert.ok(Date.now() - t0 < 100, "kein Warten auf den Server");
  await later(150);
  assert.equal(late.name, "server");
});

test("Server-Fehler (offline) → lokaler Stand, auch wenn er leer ist", async () => {
  const f = load({ server: () => Promise.reject(new Error("unavailable")), cache: async () => snap("cache", true) });
  assert.equal((await f({}, null, 200)).name, "cache");
});

test("offline + langsam + leerer Cache → leerer lokaler Stand statt zu hängen", async () => {
  const f = load({ server: () => new Promise(() => {}), cache: async () => snap("cache", true), online: false });
  assert.equal((await f({}, null, 20)).name, "cache");
});

test("online + langsam + leerer Cache → auf den Server warten (nicht fälschlich „leer“)", async () => {
  const f = load({ server: () => later(80, snap("server")), cache: async () => snap("cache", true) });
  assert.equal((await f({}, null, 20)).name, "server");
});

test("kein lokaler Stand und Server-Fehler → lehnt ab (Aufrufer fängt ab)", async () => {
  const f = load({ server: () => Promise.reject(new Error("unavailable")), cache: async () => { throw new Error("kein Cache"); } });
  await assert.rejects(() => f({}, null, 50), /unavailable/);
});
