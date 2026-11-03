import { createRequire } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const { analyze, weekKey } = require("../functions/smart-log.js");

function fakeDb() {
  const docs = new Map();
  const pathOf = (parts) => parts.join("/");
  const ref = (...parts) => ({ path: pathOf(parts), collection(name) { return ref(...parts, name); }, doc(name) { return ref(...parts, name); } });
  const snapshot = (value) => ({ exists: value !== undefined, get: (key) => value?.[key], data: () => value });
  const root = { collection(name) { return ref(name); } };
  root.runTransaction = (fn) => fn({
    get: async (document) => snapshot(docs.get(document.path)),
    set: (document, value, options = {}) => docs.set(document.path, options.merge ? { ...(docs.get(document.path) || {}), ...value } : value),
  });
  return root;
}

const baseInput = { request_id: "1234567890abcdef", text: "Um 08:30 Haferflocken gegessen.", habits: [], tags: [] };
const response = { candidates: [{ content: { parts: [{ text: JSON.stringify({ journal_entry: "Frühstück.", water_ml: 0, meals: [{ description: "Haferflocken", type: "breakfast", time: "08:30" }], habits_done: [] }) }] } }] };

test("uses ISO weeks in Vienna, including year boundaries", () => {
  assert.equal(weekKey(new Date("2026-12-31T12:00:00Z")), "2026-W53");
  assert.equal(weekKey(new Date("2027-01-04T12:00:00Z")), "2027-W01");
});

test("successful requests consume one quota unit and replay from cache", async () => {
  const db = fakeDb();
  let providerCalls = 0;
  const options = { db, uid: "u1", data: baseInput, apiKey: "test", now: new Date("2026-11-03T12:00:00Z"),
    fetchImpl: async () => { providerCalls += 1; return { ok: true, json: async () => response }; } };
  const first = await analyze(options);
  const again = await analyze(options);
  assert.deepEqual(again, first);
  assert.equal(providerCalls, 1);
  assert.equal(first.original_text, baseInput.text);
});

test("failed model calls release reservation without consuming free quota", async () => {
  const db = fakeDb();
  const options = { db, uid: "u2", data: baseInput, apiKey: "test", now: new Date("2026-11-03T12:00:00Z"),
    fetchImpl: async () => ({ ok: false, status: 503 }) };
  await assert.rejects(analyze(options), /provider_http_503/);
  assert.equal(await analyze({ ...options, fetchImpl: async () => ({ ok: true, json: async () => response }) }).then((result) => result.journal_entry), "Frühstück.");
});
