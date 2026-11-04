import { createRequire } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const { analyze, weekKey, assertExpectedUid } = require("../functions/smart-log.js");

test("Smart Log rejects an account mismatch before processing", () => {
  assert.doesNotThrow(() => assertExpectedUid("alice", "alice"));
  assert.throws(() => assertExpectedUid("bob", "alice"), /smart_account_changed/);
  assert.throws(() => assertExpectedUid("alice", null), /smart_account_changed/);
});

function fakeDb() {
  const docs = new Map();
  let transactionTail = Promise.resolve();
  const pathOf = (parts) => parts.join("/");
  const ref = (...parts) => ({ path: pathOf(parts), collection(name) { return ref(...parts, name); }, doc(name) { return ref(...parts, name); } });
  const snapshot = (value) => ({ exists: value !== undefined, get: (key) => value?.[key], data: () => value });
  const root = { collection(name) { return ref(name); } };
  root.runTransaction = (fn) => {
    const operation = transactionTail.then(() => fn({
      get: async (document) => snapshot(docs.get(document.path)),
      set: (document, value, options = {}) => docs.set(document.path, options.merge ? { ...(docs.get(document.path) || {}), ...value } : value),
    }));
    transactionTail = operation.then(() => undefined, () => undefined);
    return operation;
  };
  root.peek = (path) => docs.get(path);
  root.seed = (path, value) => docs.set(path, value);
  return root;
}

const baseInput = { request_id: "1234567890abcdef", text: "Um 08:30 Haferflocken gegessen.", date: "2026-11-03", habits: [], tags: [] };
const response = { candidates: [{ content: { parts: [{ text: JSON.stringify({ journal_entry: "Frühstück.", water_ml: 0, meals: [{ description: "Haferflocken", type: "breakfast", time: "08:30" }], habits_done: [], fitness_sessions: [], relax_sessions: [], planner_tasks: [] }) }] } }] };

test("uses ISO weeks in Vienna, including year boundaries", () => {
  assert.equal(weekKey(new Date("2026-12-31T12:00:00Z")), "2026-W53");
  assert.equal(weekKey(new Date("2027-01-04T12:00:00Z")), "2027-W01");
});

test("quota week rolls over at Monday midnight in Vienna, not UTC", () => {
  assert.equal(weekKey(new Date("2026-11-01T22:59:59Z")), "2026-W44");
  assert.equal(weekKey(new Date("2026-11-01T23:00:00Z")), "2026-W45");
});

test("successful requests consume one quota unit and replay from cache", async () => {
  const db = fakeDb();
  let providerCalls = 0;
  const options = { db, uid: "u1", data: baseInput, apiKey: "test", now: new Date("2026-11-03T12:00:00Z"),
    fetchImpl: async () => { providerCalls += 1; return { ok: true, json: async () => response }; } };
  const first = await analyze(options);
  const again = await analyze(options);
  assert.deepEqual(again, first);
  const replayWithoutProvider = await analyze({ ...options, apiKey: "" });
  assert.deepEqual(replayWithoutProvider, first);
  assert.equal(providerCalls, 1);
  assert.equal(first.original_text, baseInput.text);
});

test("rejects reusing a request ID for different input", async () => {
  const db = fakeDb();
  let providerCalls = 0;
  const options = { db, uid: "u3", data: baseInput, apiKey: "test", now: new Date("2026-11-03T12:00:00Z"),
    fetchImpl: async () => { providerCalls += 1; return { ok: true, json: async () => response }; } };
  await analyze(options);
  await assert.rejects(
    analyze({ ...options, data: { ...baseInput, text: "Ein anderer Eintrag." } }),
    (error) => error.code === "failed-precondition" && error.message === "smart_log_request_id_conflict",
  );
  assert.equal(providerCalls, 1);
});

test("Observe permits one successful analysis per week, then rejects AI only", async () => {
  const db = fakeDb();
  let providerCalls = 0;
  const options = { db, uid: "u4", data: baseInput, apiKey: "test", now: new Date("2026-11-03T12:00:00Z"),
    fetchImpl: async () => { providerCalls += 1; return { ok: true, json: async () => response }; } };
  await analyze(options);
  await assert.rejects(
    analyze({ ...options, data: { ...baseInput, request_id: "abcdef1234567890" } }),
    (error) => error.code === "resource-exhausted" && error.message === "smart_log_weekly_quota_reached",
  );
  assert.equal(providerCalls, 1);
});

test("Operate entitlement uses its configured weekly limit", async () => {
  const db = fakeDb();
  db.seed("smartLoggingEntitlements/u7", { tier: "operate", active: true, weeklyLimit: 2 });
  let providerCalls = 0;
  const baseOptions = { db, uid: "u7", apiKey: "test", now: new Date("2026-11-03T12:00:00Z"),
    fetchImpl: async () => { providerCalls += 1; return { ok: true, json: async () => response }; } };
  await analyze({ ...baseOptions, data: baseInput });
  await analyze({ ...baseOptions, data: { ...baseInput, request_id: "abcdef1234567890" } });
  await assert.rejects(
    analyze({ ...baseOptions, data: { ...baseInput, request_id: "fedcba0987654321" } }),
    (error) => error.code === "resource-exhausted" && error.message === "smart_log_weekly_quota_reached" && error.details.limit === 2,
  );
  assert.equal(providerCalls, 2);
  assert.equal(db.peek("smartLoggingQuotas/u7/weeks/2026-W45").tier, "operate");
});

test("concurrent Observe requests reserve quota atomically before either model call", async () => {
  const db = fakeDb();
  let providerCalls = 0;
  let markStarted;
  let finishProvider;
  const started = new Promise((resolve) => { markStarted = resolve; });
  const provider = new Promise((resolve) => { finishProvider = resolve; });
  const firstOptions = { db, uid: "u6", data: baseInput, apiKey: "test", now: new Date("2026-11-03T12:00:00Z"),
    fetchImpl: async () => { providerCalls += 1; markStarted(); return provider; } };
  const first = analyze(firstOptions);
  await started;
  await assert.rejects(
    analyze({ ...firstOptions, data: { ...baseInput, request_id: "fedcba0987654321" }, fetchImpl: async () => { providerCalls += 1; return { ok: true, json: async () => response }; } }),
    (error) => error.code === "resource-exhausted" && error.message === "smart_log_weekly_quota_reached",
  );
  finishProvider({ ok: true, json: async () => response });
  await first;
  assert.equal(providerCalls, 1);
});

test("unknown provider results stay locked and are never sent to Gemini twice", async () => {
  const db = fakeDb();
  let providerCalls = 0;
  const options = { db, uid: "u2", data: baseInput, apiKey: "test", now: new Date("2026-11-03T12:00:00Z"),
    fetchImpl: async () => { providerCalls += 1; return { ok: false, status: 503 }; } };
  await assert.rejects(analyze(options), /provider_http_503/);
  await assert.rejects(
    analyze({ ...options, fetchImpl: async () => { providerCalls += 1; return { ok: true, json: async () => response }; } }),
    (error) => error.code === "aborted" && error.message === "smart_log_request_locked",
  );
  assert.equal(providerCalls, 1);
  assert.equal(db.peek("smartLoggingRequests/u2/requests/1234567890abcdef").status, "locked");
  assert.equal(db.peek("smartLoggingQuotas/u2/weeks/2026-W45").reserved, 1);
  await assert.rejects(
    analyze({ ...options, data: { ...baseInput, request_id: "abcdef1234567890" }, fetchImpl: async () => { providerCalls += 1; return { ok: true, json: async () => response }; } }),
    (error) => error.code === "resource-exhausted" && error.message === "smart_log_weekly_quota_reached",
  );
  assert.equal(providerCalls, 1);
});

test("an orphaned processing reservation from a hard abort stays locked", async () => {
  const db = fakeDb();
  db.seed("smartLoggingRequests/u5/requests/1234567890abcdef", { status: "processing", week: "2026-W45" });
  db.seed("smartLoggingQuotas/u5/weeks/2026-W45", { used: 0, reserved: 1 });
  let providerCalls = 0;
  await assert.rejects(
    analyze({ db, uid: "u5", data: baseInput, apiKey: "test", now: new Date("2026-11-03T12:00:00Z"),
      fetchImpl: async () => { providerCalls += 1; return { ok: true, json: async () => response }; } }),
    (error) => error.code === "aborted" && error.message === "smart_log_request_locked",
  );
  assert.equal(providerCalls, 0);
  assert.equal(db.peek("smartLoggingQuotas/u5/weeks/2026-W45").reserved, 1);
});
