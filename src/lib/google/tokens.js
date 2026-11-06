// tokens.js — gemeinsamer Google-Token-Dienst für Google Tasks (Door v2) und Google Calendar
// (Journal v2, Game v2 → Fire). Rein (kein Firebase, kein DOM, kein Netz außer den injizierten
// Funktionen) und deshalb in tests/google-tokens.test.mjs ohne Browser getestet.
//
// Warum die alte Verbindung ablief: `reauthenticateWithPopup` liefert nur einen Access-Token
// (~1 h) und nie einen Refresh-Token; er lag in sessionStorage (weg beim Schließen des Tabs/der
// PWA) und wurde nach 55 min verworfen. Danach half nur ein neues Popup.
//
// Zwei Betriebsarten, die der Dienst selbst verwaltet:
//   "server" – dauerhaft. Eine Cloud Function (backend/functions/journal/google.js) hält den Refresh-Token
//              (Firestore `googleTokens/{uid}`, vom Browser nicht lesbar) und liefert bei Bedarf
//              einen frischen Access-Token. Der Browser sieht nie einen Refresh-Token.
//   "popup"  – kurzlebiger Rückfall außerhalb des offiziellen VitalOS-Produktbuilds, wenn die
//              Function nicht eingerichtet ist: Firebase-Popup, Token ~1 h, danach neu verbinden.
//              Produktbuilds setzen allowPopupFallback=false und verlangen den Servermodus.
//
// Fehlermeldungen (Error.message), auf die die Oberfläche reagiert:
//   "google-expired" – Verbindung ist weg (Refresh-Token widerrufen, 401 trotz frischem Token,
//                      Popup-Token abgelaufen) → „neu verbinden“.
//   "google-offline" – Token konnte gerade nicht erneuert werden (offline/Function nicht
//                      erreichbar). Die Verbindung bleibt bestehen, nichts wird gelöscht.

export const KEY = "gtok:v1";
export const SKEW_MS = 2 * 60 * 1000; // Token gilt als abgelaufen, sobald weniger als 2 min bleiben
export const POPUP_TTL_MS = 55 * 60 * 1000; // Google-Access-Tokens halten 3600 s; 5 min Puffer

const CANCEL_CODES = ["auth/popup-closed-by-user", "auth/cancelled-popup-request", "cancelled"];
/** true, wenn der Nutzer das Verbinden-Fenster selbst geschlossen hat (keine Fehlermeldung zeigen). */
export const isCancel = (e) => CANCEL_CODES.includes(e?.code);

/** Lesbarer Text für die Oberfläche. */
export function googleErrorText(e) {
  switch (e?.message) {
    case "google-not-configured": return "Die dauerhafte Google-Verbindung ist für dieses Produkt noch nicht eingerichtet.";
    case "google-expired": return "Google-Verbindung abgelaufen – bitte neu verbinden.";
    case "google-account-changed": return "Das angemeldete Konto hat sich geändert. Bitte starte den Vorgang erneut.";
    case "google-offline": return "Google gerade nicht erreichbar (offline?). Die Verbindung bleibt bestehen.";
    default: return e?.message || "Fehler";
  }
}

const fail = (message, code) => Object.assign(new Error(message), code ? { code } : {});

/**
 * @param {object} deps
 * @param {Storage-like} deps.storage       getItem/setItem/removeItem (localStorage)
 * @param {() => number} [deps.now]
 * @param {typeof fetch} [deps.fetchImpl]
 * @param {object} deps.remote   Server-Anbindung:
 *     fetchToken() → {accessToken, expiresAt}   wirft Error{code:"not-linked"} wenn nichts (mehr) verknüpft ist
 *     link()       → {accessToken, expiresAt}   wirft Error{code:"unavailable"}, wenn die Function nicht eingerichtet ist
 *     unlink()     → void
 * @param {object} deps.popup    popup.connect() → {accessToken}
 */
export function createGoogleTokens({ storage, now = Date.now, fetchImpl = (...a) => fetch(...a), remote, popup, allowPopupFallback = true, getOwner }) {
  const scoped = typeof getOwner === "function";
  const ownerNow = () => scoped ? (getOwner() || null) : "legacy";
  const storageKey = (owner) => scoped ? `${KEY}:${encodeURIComponent(owner)}` : KEY;
  const mem = new Map();
  const memoryOnly = new Set();
  const listeners = new Set();
  const inflight = new Map();
  const requireOwner = () => {
    const owner = ownerNow();
    if (!owner) throw fail("google-expired");
    return owner;
  };
  const assertOwner = (owner) => {
    if (ownerNow() !== owner) throw fail("google-account-changed");
  };
  const read = (owner = ownerNow()) => {
    if (!owner) return {};
    if (memoryOnly.has(owner)) return mem.get(owner) || {};
    try {
      const raw = storage.getItem(storageKey(owner));
      if (raw !== null && raw !== undefined) {
        const state = JSON.parse(raw);
        if (state && typeof state === "object") return state;
      }
      return {};
    } catch { /* blocked storage falls back to memory */ }
    return mem.get(owner) || {};
  };
  const write = (state, owner = ownerNow()) => {
    if (!owner) return;
    mem.set(owner, state);
    try {
      if (Object.keys(state).length) storage.setItem(storageKey(owner), JSON.stringify(state));
      else storage.removeItem(storageKey(owner));
      memoryOnly.delete(owner);
    } catch { memoryOnly.add(owner); /* blocked storage falls back to memory */ }
  };
  const notify = () => listeners.forEach((fn) => { try { fn(); } catch {} });
  const clear = (owner = ownerNow()) => { write({}, owner); notify(); };
  const cached = (owner) => {
    const state = read(owner);
    return state.token && Number(state.exp) - SKEW_MS > now() ? state.token : null;
  };
  const mode = () => {
    const value = read().mode;
    return value === "server" || value === "popup" ? value : null;
  };
  const connected = () => {
    const value = mode();
    return value === "server" || (allowPopupFallback && value === "popup" && !!cached(ownerNow()));
  };
  const snapshot = () => (connected() ? mode() : "off");
  const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

  async function refresh(owner) {
    try {
      assertOwner(owner);
      const { accessToken, expiresAt } = await remote.fetchToken();
      assertOwner(owner);
      // Another tab may have disconnected while the refresh was in flight.
      // Do not recreate a connection that the user explicitly removed.
      if (read(owner).mode !== "server") throw fail("google-expired");
      if (!accessToken) throw fail("kein Token", "empty");
      write({ mode: "server", token: accessToken, exp: Number(expiresAt) || now() + POPUP_TTL_MS }, owner);
      return accessToken;
    } catch (error) {
      assertOwner(owner);
      if (error?.code === "not-linked") { clear(owner); throw fail("google-expired"); }
      if (error?.message === "google-expired") throw error;
      if (error?.message === "google-account-changed") throw error;
      throw Object.assign(fail("google-offline"), { cause: error });
    }
  }

  async function getToken({ force = false } = {}) {
    const owner = requireOwner();
    const value = read(owner).mode;
    if (value === "popup" && !allowPopupFallback) {
      clear(owner);
      throw fail("google-not-configured");
    }
    if (!force) {
      const token = cached(owner);
      if (token) return token;
    }
    if (value === "server") {
      if (!inflight.has(owner)) inflight.set(owner, refresh(owner).finally(() => inflight.delete(owner)));
      const token = await inflight.get(owner);
      assertOwner(owner);
      return token;
    }
    if (value === "popup") clear(owner);
    throw fail("google-expired");
  }

  async function authFetch(url, init = {}) {
    const owner = requireOwner();
    const go = async (token) => {
      assertOwner(owner);
      const response = await fetchImpl(url, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` } });
      assertOwner(owner);
      return response;
    };
    let response = await go(await getToken());
    if (response.status !== 401) return response;
    response = await go(await getToken({ force: true }));
    if (response.status === 401) { clear(owner); throw fail("google-expired"); }
    return response;
  }

  async function connect() {
    const owner = requireOwner();
    let viaServer = true;
    let result;
    try {
      result = await remote.link();
      assertOwner(owner);
    } catch (error) {
      assertOwner(owner);
      if (error?.code !== "unavailable") throw error;
      if (!allowPopupFallback) throw fail("google-not-configured");
      viaServer = false;
    }
    if (!viaServer) {
      result = await popup.connect();
      assertOwner(owner);
    }
    write({ mode: viaServer ? "server" : "popup", token: result.accessToken, exp: viaServer ? (Number(result.expiresAt) || now() + POPUP_TTL_MS) : now() + POPUP_TTL_MS }, owner);
    notify();
    return viaServer ? "server" : "popup";
  }

  async function disconnect() {
    const owner = requireOwner();
    const wasServer = read(owner).mode === "server";
    clear(owner);
    if (wasServer) {
      try { assertOwner(owner); await remote.unlink(); } catch { /* server connection may remain if offline */ }
    }
  }

  return { getToken, authFetch, connect, disconnect, connected, mode, snapshot, subscribe, notify };
}
