import test from "node:test";
import assert from "node:assert/strict";
import { createGoogleTokens, KEY, SKEW_MS, POPUP_TTL_MS, isCancel, googleErrorText } from "../src/lib/google/tokens.js";

const mkStorage = () => {
  const m = new Map();
  return { m, getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
};
const H = 3600 * 1000;

function setup({ remote = {}, popup = {}, fetchImpl, allowPopupFallback = true } = {}) {
  const t = { now: 1_000_000 };
  const storage = mkStorage();
  const calls = { fetchToken: 0, link: 0, unlink: 0, popup: 0 };
  const svc = createGoogleTokens({
    storage,
    now: () => t.now,
    fetchImpl,
    remote: {
      fetchToken: async () => { calls.fetchToken++; return { accessToken: `srv${calls.fetchToken}`, expiresAt: t.now + H }; },
      link: async () => { calls.link++; return { accessToken: "linked", expiresAt: t.now + H }; },
      unlink: async () => { calls.unlink++; },
      ...remote,
    },
    popup: { connect: async () => { calls.popup++; return { accessToken: "pop" }; }, ...popup },
    allowPopupFallback,
  });
  return { t, storage, calls, svc };
}
const err = (message, code) => Object.assign(new Error(message), { code });

test("ohne Verbindung: google-expired, nicht verbunden", async () => {
  const { svc } = setup();
  assert.equal(svc.connected(), false);
  assert.equal(svc.snapshot(), "off");
  await assert.rejects(svc.getToken(), { message: "google-expired" });
});

test("connect über den Server: dauerhaft, Token wird nach Ablauf still erneuert", async () => {
  const { svc, t, calls } = setup();
  assert.equal(await svc.connect(), "server");
  assert.equal(svc.snapshot(), "server");
  assert.equal(await svc.getToken(), "linked");
  assert.equal(calls.fetchToken, 0); // noch gültig → kein Servercall
  t.now += H; // eine Stunde später
  assert.equal(svc.connected(), true); // bleibt verbunden
  assert.equal(await svc.getToken(), "srv1");
  assert.equal(calls.fetchToken, 1);
  t.now += H - SKEW_MS + 1; // knapp vor Ablauf → schon vorher erneuern
  assert.equal(await svc.getToken(), "srv2");
});

test("gleichzeitige Aufrufe teilen sich eine Erneuerung", async () => {
  const { svc, t, calls } = setup();
  await svc.connect();
  t.now += H;
  const out = await Promise.all([svc.getToken(), svc.getToken(), svc.getToken()]);
  assert.deepEqual(out, ["srv1", "srv1", "srv1"]);
  assert.equal(calls.fetchToken, 1);
});

test("Zustand überlebt einen Neustart (neue Instanz, gleicher Speicher)", async () => {
  const a = setup();
  await a.svc.connect();
  const b = createGoogleTokens({ storage: a.storage, now: () => a.t.now, remote: {}, popup: {} });
  assert.equal(b.connected(), true);
  assert.equal(await b.getToken(), "linked");
});

test("Server: not-linked → Verbindung verworfen, google-expired", async () => {
  const { svc, t, storage } = setup({ remote: { fetchToken: async () => { throw err("x", "not-linked"); } } });
  await svc.connect();
  t.now += H;
  await assert.rejects(svc.getToken(), { message: "google-expired" });
  assert.equal(svc.snapshot(), "off");
  assert.equal(storage.getItem(KEY), null);
});

test("Server nicht erreichbar: google-offline, Verbindung bleibt", async () => {
  const { svc, t } = setup({ remote: { fetchToken: async () => { throw new Error("network"); } } });
  await svc.connect();
  t.now += H;
  await assert.rejects(svc.getToken(), { message: "google-offline" });
  assert.equal(svc.snapshot(), "server");
  assert.equal(googleErrorText(new Error("google-offline")).includes("bleibt bestehen"), true);
});

test("Rückfall Popup, wenn Server nicht eingerichtet; Token nur ~55 min, dann expired", async () => {
  const { svc, t, calls } = setup({ remote: { link: async () => { throw err("x", "unavailable"); } } });
  assert.equal(await svc.connect(), "popup");
  assert.equal(calls.popup, 1);
  assert.equal(svc.mode(), "popup");
  assert.equal(await svc.getToken(), "pop");
  t.now += POPUP_TTL_MS;
  assert.equal(svc.connected(), false);
  await assert.rejects(svc.getToken(), { message: "google-expired" });
  assert.equal(svc.mode(), null); // aufgeräumt
});

test("Produktmodus verweigert kurzlebigen Popup-Rückfall, wenn der Token-Server fehlt", async () => {
  const { svc, calls } = setup({
    allowPopupFallback: false,
    remote: { link: async () => { throw err("x", "unavailable"); } },
  });
  await assert.rejects(svc.connect(), { message: "google-not-configured" });
  assert.equal(calls.popup, 0);
  assert.equal(svc.snapshot(), "off");
  assert.match(googleErrorText(new Error("google-not-configured")), /dauerhafte Google-Verbindung/);
});

test("Produktmodus verwirft gespeicherte kurzlebige Popup-Tokens", async () => {
  const storage = mkStorage();
  storage.setItem(KEY, JSON.stringify({ mode: "popup", token: "old-pop", exp: 1_000_000 + H }));
  const svc = createGoogleTokens({ storage, now: () => 1_000_000, allowPopupFallback: false, remote: {}, popup: {} });
  assert.equal(svc.connected(), false);
  assert.equal(svc.snapshot(), "off");
  await assert.rejects(svc.getToken(), { message: "google-not-configured" });
  assert.equal(storage.getItem(KEY), null);
});

test("andere Fehler beim Server-Verbinden brechen ab (kein stiller Popup-Rückfall)", async () => {
  const { svc, calls } = setup({ remote: { link: async () => { throw err("zu", "cancelled"); } } });
  await assert.rejects(svc.connect(), (e) => isCancel(e));
  assert.equal(calls.popup, 0);
  assert.equal(svc.snapshot(), "off");
});

test("authFetch: 401 → einmal mit frischem Token wiederholen", async () => {
  const seen = [];
  const fetchImpl = async (url, init) => {
    seen.push(init.headers.Authorization);
    return { status: seen.length === 1 ? 401 : 200 };
  };
  const { svc, calls } = setup({ fetchImpl });
  await svc.connect();
  const res = await svc.authFetch("https://x", { method: "GET" });
  assert.equal(res.status, 200);
  assert.deepEqual(seen, ["Bearer linked", "Bearer srv1"]);
  assert.equal(calls.fetchToken, 1);
});

test("authFetch: 401 trotz frischem Token → google-expired, Verbindung verworfen", async () => {
  const { svc } = setup({ fetchImpl: async () => ({ status: 401 }) });
  await svc.connect();
  await assert.rejects(svc.authFetch("https://x"), { message: "google-expired" });
  assert.equal(svc.snapshot(), "off");
});

test("authFetch im Popup-Modus: 401 → expired (kein Erneuern möglich)", async () => {
  const { svc } = setup({ remote: { link: async () => { throw err("x", "unavailable"); } }, fetchImpl: async () => ({ status: 401 }) });
  await svc.connect();
  await assert.rejects(svc.authFetch("https://x"), { message: "google-expired" });
});

test("authFetch reicht andere Statuswerte und Header durch", async () => {
  let got;
  const { svc } = setup({ fetchImpl: async (u, i) => { got = i; return { status: 404 }; } });
  await svc.connect();
  const res = await svc.authFetch("https://x", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  assert.equal(res.status, 404);
  assert.equal(got.headers["Content-Type"], "application/json");
  assert.equal(got.headers.Authorization, "Bearer linked");
});

test("disconnect: lokal sofort weg, Server-Widerruf best effort", async () => {
  const a = setup();
  await a.svc.connect();
  await a.svc.disconnect();
  assert.equal(a.svc.snapshot(), "off");
  assert.equal(a.calls.unlink, 1);
  const b = setup({ remote: { unlink: async () => { throw new Error("offline"); } } });
  await b.svc.connect();
  await assert.doesNotReject(b.svc.disconnect());
  assert.equal(b.svc.snapshot(), "off");
});

test("subscribe meldet Änderungen; kaputter oder gesperrter Speicher wirft nicht", async () => {
  const { svc, storage } = setup();
  let n = 0;
  const off = svc.subscribe(() => n++);
  await svc.connect();
  await svc.disconnect();
  assert.equal(n, 2);
  off();
  storage.setItem(KEY, "{kaputt");
  assert.equal(svc.connected(), false);
  const locked = createGoogleTokens({
    storage: { getItem() { throw new Error("gesperrt"); }, setItem() { throw new Error("gesperrt"); }, removeItem() { throw new Error("gesperrt"); } },
    remote: { link: async () => ({ accessToken: "t", expiresAt: Date.now() + H }) }, popup: {},
  });
  await locked.connect();
  assert.equal(await locked.getToken(), "t"); // hält wenigstens die Sitzung
});

test('Google access tokens and connection state are isolated by Firebase user', async () => {
  const storage = mkStorage();
  let owner = 'alice';
  const svc = createGoogleTokens({
    storage, now: () => 1_000_000, getOwner: () => owner,
    remote: { link: async () => ({ accessToken: `token-${owner}`, expiresAt: 1_000_000 + H }) }, popup: {},
  });
  await svc.connect();
  assert.equal(await svc.getToken(), 'token-alice');
  owner = 'bob';
  assert.equal(svc.connected(), false);
  await assert.rejects(svc.getToken(), { message: 'google-expired' });
  await svc.connect();
  assert.equal(await svc.getToken(), 'token-bob');
  owner = 'alice';
  assert.equal(await svc.getToken(), 'token-alice');
  owner = null;
  assert.equal(svc.connected(), false);
  await assert.rejects(svc.getToken(), { message: 'google-expired' });
});

test('account change during refresh does not cache or return the previous account token', async () => {
  const storage = mkStorage();
  let owner = 'alice';
  let resolveRefresh;
  const wait = new Promise((resolve) => { resolveRefresh = resolve; });
  const svc = createGoogleTokens({ storage, now: () => 1_000_000, getOwner: () => owner,
    remote: { link: async () => ({ accessToken: 'old', expiresAt: 1_000_000 + H }), fetchToken: () => wait }, popup: {} });
  await svc.connect();
  const request = svc.getToken({ force: true });
  owner = 'bob';
  resolveRefresh({ accessToken: 'alice-refresh', expiresAt: 1_000_000 + H });
  await assert.rejects(request, { message: 'google-account-changed' });
  assert.equal(svc.connected(), false);
  owner = 'alice';
  assert.equal(await svc.getToken(), 'old');
});

test('account change during a Google request suppresses its response', async () => {
  const storage = mkStorage();
  let owner = 'alice';
  let resolveResponse;
  const response = new Promise((resolve) => { resolveResponse = resolve; });
  const svc = createGoogleTokens({ storage, now: () => 1_000_000, getOwner: () => owner,
    remote: { link: async () => ({ accessToken: 'alice-token', expiresAt: 1_000_000 + H }) }, popup: {}, fetchImpl: () => response });
  await svc.connect();
  const request = svc.authFetch('https://example.invalid');
  await Promise.resolve();
  owner = 'bob';
  resolveResponse({ status: 200 });
  await assert.rejects(request, { message: 'google-account-changed' });
});

test('scoped token service never imports the old unowned token', async () => {
  const storage = mkStorage();
  storage.setItem(KEY, JSON.stringify({ mode: 'server', token: 'legacy-token', exp: 1_000_000 + H }));
  const svc = createGoogleTokens({ storage, now: () => 1_000_000, getOwner: () => 'bob', remote: {}, popup: {} });
  assert.equal(svc.connected(), false);
  await assert.rejects(svc.getToken(), { message: 'google-expired' });
});

test('disconnect in another tab removes the cached token from this tab too', async () => {
  const storage = mkStorage();
  const deps = { storage, now: () => 1_000_000, getOwner: () => 'alice',
    remote: { link: async () => ({ accessToken: 'token', expiresAt: 1_000_000 + H }), unlink: async () => {} }, popup: {} };
  const first = createGoogleTokens(deps);
  const second = createGoogleTokens(deps);
  await first.connect();
  assert.equal(await first.getToken(), 'token');
  await second.disconnect();
  assert.equal(first.connected(), false);
  await assert.rejects(first.getToken(), { message: 'google-expired' });
});

test('readable storage with blocked writes keeps the current session in memory', async () => {
  const storage = { getItem: () => null, setItem: () => { throw new Error('blocked'); }, removeItem: () => { throw new Error('blocked'); } };
  const svc = createGoogleTokens({ storage, now: () => 1_000_000,
    remote: { link: async () => ({ accessToken: 'memory-token', expiresAt: 1_000_000 + H }) }, popup: {} });
  await svc.connect();
  assert.equal(await svc.getToken(), 'memory-token');
});

test('a pending refresh cannot restore a connection disconnected in another tab', async () => {
  const storage = mkStorage();
  let finishRefresh;
  const pending = new Promise((resolve) => { finishRefresh = resolve; });
  const deps = { storage, now: () => 1_000_000, getOwner: () => 'alice',
    remote: { link: async () => ({ accessToken: 'old', expiresAt: 1_000_000 + H }),
      fetchToken: () => pending, unlink: async () => {} }, popup: {} };
  const first = createGoogleTokens(deps);
  const second = createGoogleTokens(deps);
  await first.connect();
  const refresh = first.getToken({ force: true });
  await second.disconnect();
  finishRefresh({ accessToken: 'new', expiresAt: 1_000_000 + H });
  await assert.rejects(refresh, { message: 'google-expired' });
  assert.equal(first.connected(), false);
  assert.equal(storage.getItem(`${KEY}:alice`), null);
});
