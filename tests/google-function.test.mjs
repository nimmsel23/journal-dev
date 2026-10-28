import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const { createGoogleHandlers, REQUIRED_SCOPES } = createRequire(import.meta.url)("../functions/google.js");

class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
const SCOPE = REQUIRED_SCOPES.join(" ");
const json = (status, body) => ({ ok: status < 400, status, json: async () => body });

function setup({ responses = [], clientId = "cid", clientSecret = "sec", doc = null } = {}) {
  const sent = [];
  const rows = new Map(doc ? [["u1", doc]] : []);
  const h = createGoogleHandlers({
    fetchImpl: async (url, init) => { sent.push({ url, body: new URLSearchParams(init.body) }); const r = responses.shift(); if (r instanceof Error) throw r; return r; },
    store: { get: async (u) => rows.get(u) || null, set: async (u, v) => rows.set(u, v), delete: async (u) => rows.delete(u) },
    clientId, clientSecret, HttpsError, now: () => 5000,
  });
  return { h, sent, rows };
}

test("ohne Client-ID/Secret: google-not-configured", async () => {
  const { h } = setup({ clientId: "" });
  assert.throws(() => h.linkConfig(), { message: "google-not-configured" });
  await assert.rejects(h.accessToken("u1"), { message: "google-not-configured" });
});

test("link tauscht den Code, speichert den Refresh-Token, gibt nur den Access-Token zurück", async () => {
  const { h, sent, rows } = setup({ responses: [json(200, { access_token: "A", refresh_token: "R", expires_in: 3600, scope: SCOPE })] });
  const out = await h.link("u1", "code123");
  assert.deepEqual(out, { accessToken: "A", expiresAt: 5000 + 3600_000 });
  assert.equal(rows.get("u1").refreshToken, "R");
  assert.equal(sent[0].body.get("redirect_uri"), "postmessage");
  assert.equal(sent[0].body.get("grant_type"), "authorization_code");
  assert.equal(JSON.stringify(out).includes("R\""), false);
});

test("link ohne neuen Refresh-Token behält den vorhandenen; ganz ohne → Fehler", async () => {
  const a = setup({ doc: { refreshToken: "OLD" }, responses: [json(200, { access_token: "A", expires_in: 10, scope: SCOPE })] });
  await a.h.link("u1", "c");
  assert.equal(a.rows.get("u1").refreshToken, "OLD");
  const b = setup({ responses: [json(200, { access_token: "A", expires_in: 10, scope: SCOPE })] });
  await assert.rejects(b.h.link("u1", "c"), { message: "google-no-refresh-token" });
});

test("link: fehlender Scope, ungültiger Code, leerer Code", async () => {
  const a = setup({ responses: [json(200, { access_token: "A", refresh_token: "R", scope: REQUIRED_SCOPES[0] })] });
  await assert.rejects(a.h.link("u1", "c"), { message: "google-scope-missing" });
  assert.equal(a.rows.size, 0);
  const b = setup({ responses: [json(400, { error: "invalid_grant" })] });
  await assert.rejects(b.h.link("u1", "c"), /google-code: invalid_grant/);
  await assert.rejects(b.h.link("u1", ""), { message: "google-code-missing" });
});

test("accessToken: erneuert mit dem Refresh-Token", async () => {
  const { h, sent } = setup({ doc: { refreshToken: "R" }, responses: [json(200, { access_token: "A2", expires_in: 1800 })] });
  assert.deepEqual(await h.accessToken("u1"), { accessToken: "A2", expiresAt: 5000 + 1800_000 });
  assert.equal(sent[0].body.get("refresh_token"), "R");
  assert.equal(sent[0].body.get("grant_type"), "refresh_token");
});

test("accessToken: nicht verknüpft; invalid_grant löscht das Dokument; Netzfehler lässt es stehen", async () => {
  await assert.rejects(setup().h.accessToken("u1"), { message: "google-not-linked" });
  const a = setup({ doc: { refreshToken: "R" }, responses: [json(400, { error: "invalid_grant" })] });
  await assert.rejects(a.h.accessToken("u1"), { message: "google-not-linked" });
  assert.equal(a.rows.size, 0);
  const b = setup({ doc: { refreshToken: "R" }, responses: [new Error("down")] });
  await assert.rejects(b.h.accessToken("u1"), { message: "google-unreachable" });
  assert.equal(b.rows.size, 1);
  const c = setup({ doc: { refreshToken: "R" }, responses: [json(500, { error: "backend_error" })] });
  await assert.rejects(c.h.accessToken("u1"), { message: "google-unreachable" });
  assert.equal(c.rows.size, 1);
});

test("unlink widerruft bei Google (best effort) und löscht", async () => {
  const a = setup({ doc: { refreshToken: "R" }, responses: [json(200, {})] });
  await a.h.unlink("u1");
  assert.equal(a.sent[0].body.get("token"), "R");
  assert.equal(a.rows.size, 0);
  const b = setup({ doc: { refreshToken: "R" }, responses: [new Error("offline")] });
  await b.h.unlink("u1");
  assert.equal(b.rows.size, 0);
});
