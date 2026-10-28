// tokens.js — gemeinsamer Google-Token-Dienst für Google Tasks (Door v2) und Google Calendar
// (Journal v2, Game v2 → Fire). Rein (kein Firebase, kein DOM, kein Netz außer den injizierten
// Funktionen) und deshalb in tests/google-tokens.test.mjs ohne Browser getestet.
//
// Warum die alte Verbindung ablief: `reauthenticateWithPopup` liefert nur einen Access-Token
// (~1 h) und nie einen Refresh-Token; er lag in sessionStorage (weg beim Schließen des Tabs/der
// PWA) und wurde nach 55 min verworfen. Danach half nur ein neues Popup.
//
// Zwei Betriebsarten, die der Dienst selbst verwaltet:
//   "server" – dauerhaft. Eine Cloud Function (functions/google.js) hält den Refresh-Token
//              (Firestore `googleTokens/{uid}`, vom Browser nicht lesbar) und liefert bei Bedarf
//              einen frischen Access-Token. Der Browser sieht nie einen Refresh-Token.
//   "popup"  – Rückfall, wenn die Function nicht eingerichtet ist: Firebase-Popup, Token ~1 h,
//              danach „neu verbinden“. Das ist das bisherige Verhalten, nur mit Token im
//              localStorage (übersteht Reload und PWA-Neustart innerhalb der Stunde).
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
    case "google-expired": return "Google-Verbindung abgelaufen – bitte neu verbinden.";
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
export function createGoogleTokens({ storage, now = Date.now, fetchImpl = (...a) => fetch(...a), remote, popup }) {
  let mem = {}; // Rückfall, falls der Speicher gesperrt ist (privates Fenster): hält wenigstens die Sitzung
  const listeners = new Set();
  let inflight = null;

  const read = () => {
    try {
      const raw = storage.getItem(KEY);
      if (raw !== null && raw !== undefined) {
        const s = JSON.parse(raw);
        if (s && typeof s === "object") return s;
      }
    } catch { /* gesperrt/kaputtes JSON → Rückfall */ }
    return mem;
  };
  const write = (s) => {
    mem = s;
    try { if (Object.keys(s).length) storage.setItem(KEY, JSON.stringify(s)); else storage.removeItem(KEY); } catch { /* gesperrt */ }
  };
  const notify = () => listeners.forEach((fn) => { try { fn(); } catch { /* Zuhörer dürfen den Dienst nicht stören */ } });
  const clear = () => { write({}); notify(); };

  const cached = () => {
    const s = read();
    return s.token && Number(s.exp) - SKEW_MS > now() ? s.token : null;
  };
  const mode = () => {
    const m = read().mode;
    return m === "server" || m === "popup" ? m : null;
  };
  /** server: dauerhaft verbunden; popup: nur, solange der Token noch gilt. */
  const connected = () => {
    const m = mode();
    return m === "server" || (m === "popup" && !!cached());
  };
  /** Stabiler Wert für useSyncExternalStore: "server" | "popup" | "off". */
  const snapshot = () => (connected() ? mode() : "off");

  const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

  async function refresh() {
    try {
      const { accessToken, expiresAt } = await remote.fetchToken();
      if (!accessToken) throw fail("kein Token", "empty");
      write({ mode: "server", token: accessToken, exp: Number(expiresAt) || now() + POPUP_TTL_MS });
      return accessToken;
    } catch (e) {
      if (e?.code === "not-linked") { clear(); throw fail("google-expired"); }
      throw Object.assign(fail("google-offline"), { cause: e });
    }
  }

  /** Gültiger Access-Token; mehrere gleichzeitige Aufrufe teilen sich eine Erneuerung. */
  async function getToken({ force = false } = {}) {
    if (!force) {
      const t = cached();
      if (t) return t;
    }
    const m = mode();
    if (m === "server") {
      inflight ??= refresh().finally(() => { inflight = null; });
      return inflight;
    }
    if (m === "popup") clear(); // Popup-Token abgelaufen: nichts zum Erneuern
    throw fail("google-expired");
  }

  /** fetch mit Bearer-Token; bei 401 einmal mit frischem Token wiederholen, sonst „expired“. */
  async function authFetch(url, init = {}) {
    const go = (token) => fetchImpl(url, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` } });
    let res = await go(await getToken());
    if (res.status !== 401) return res;
    res = await go(await getToken({ force: true }));
    if (res.status === 401) { clear(); throw fail("google-expired"); }
    return res;
  }

  /** Nach Nutzerklick: bevorzugt Server-Verknüpfung (dauerhaft), sonst Popup (~1 h). */
  async function connect() {
    let viaServer = true;
    let res;
    try {
      res = await remote.link();
    } catch (e) {
      if (e?.code !== "unavailable") throw e;
      viaServer = false;
    }
    if (viaServer) {
      write({ mode: "server", token: res.accessToken, exp: Number(res.expiresAt) || now() + POPUP_TTL_MS });
    } else {
      res = await popup.connect();
      write({ mode: "popup", token: res.accessToken, exp: now() + POPUP_TTL_MS });
    }
    notify();
    return viaServer ? "server" : "popup";
  }

  async function disconnect() {
    const wasServer = mode() === "server";
    clear();
    if (wasServer) { try { await remote.unlink(); } catch { /* offline: lokal getrennt, Server-Verknüpfung bleibt bis zum nächsten Trennen */ } }
  }

  return { getToken, authFetch, connect, disconnect, connected, mode, snapshot, subscribe, notify };
}
