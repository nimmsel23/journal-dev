// auth.js — Browser-Anbindung des gemeinsamen Google-Token-Dienstes (tokens.js):
// Cloud-Function-Aufrufe (googleLinkConfig / googleLink / googleAccessToken / googleUnlink in
// functions/google.js), Google Identity Services (Code-Popup) und der Firebase-Popup-Rückfall.
// Beim App-Start passiert hier nichts im Netz; erst Verbinden bzw. ein API-Aufruf braucht es.
import { GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, auth } from "../firebase.js";
import { createGoogleTokens, KEY } from "./tokens.js";

/** Beide Scopes in einer Einwilligung: Kalender (lesen) und Google Tasks. */
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/tasks",
];
const REGION = "europe-west1";
const GIS_SRC = "https://accounts.google.com/gsi/client";

const fail = (message, code) => Object.assign(new Error(message), code ? { code } : {});

async function call(name, data) {
  try {
    return (await httpsCallable(getFunctions(app, REGION), name)(data || {})).data;
  } catch (e) {
    const msg = String(e?.message || "");
    // Function nicht deployt oder Secrets fehlen → Rückfall auf das Popup
    if (["functions/not-found", "functions/unimplemented"].includes(e?.code) || msg === "google-not-configured") {
      throw fail("google-not-configured", "unavailable");
    }
    // Refresh-Token fehlt/widerrufen
    if (e?.code === "functions/failed-precondition" && msg === "google-not-linked") throw fail("google-not-linked", "not-linked");
    throw e;
  }
}

// ── Vorbereitung: Client-ID holen und das Google-Skript laden, BEVOR der Nutzer klickt ──
// Das Verbinden-Fenster muss direkt aus dem Klick geöffnet werden (Popup-Blocker); Netz-Wartezeit
// davor würde das verhindern. Reine Best-Effort-Funktion: Fehler/Offline bleiben folgenlos.
let prep = null; // { status: "ready", clientId } | { status: "unavailable" }
let prepPromise = null;

function loadGis() {
  if (globalThis.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = GIS_SRC;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => { el.remove(); reject(fail("google-offline")); };
    document.head.appendChild(el);
  });
}

export function prepareGoogleConnect() {
  if (prep || prepPromise || typeof navigator === "undefined" || navigator.onLine === false) return prepPromise;
  prepPromise = (async () => {
    try {
      const cfg = await call("googleLinkConfig");
      if (!cfg?.clientId) throw fail("google-not-configured", "unavailable");
      await loadGis();
      prep = { status: "ready", clientId: cfg.clientId };
    } catch (e) {
      if (e?.code === "unavailable") prep = { status: "unavailable" };
      // sonst (offline, Skript blockiert): später erneut versuchen
    } finally {
      prepPromise = null;
    }
  })();
  return prepPromise;
}

function requestCode(clientId) {
  return new Promise((resolve, reject) => {
    const client = globalThis.google.accounts.oauth2.initCodeClient({
      client_id: clientId,
      scope: GOOGLE_SCOPES.join(" "),
      ux_mode: "popup",
      callback: (r) => (r?.code ? resolve(r.code) : reject(fail(r?.error || "google-no-code"))),
      error_callback: (e) => reject(e?.type === "popup_closed" ? fail("cancelled", "cancelled") : fail(e?.type === "popup_failed_to_open" ? "Popup blockiert – bitte erneut klicken." : e?.type || "google-popup")),
    });
    client.requestCode();
  });
}

const remote = {
  async fetchToken() {
    const r = await call("googleAccessToken");
    return { accessToken: r.accessToken, expiresAt: r.expiresAt };
  },
  async link() {
    if (!prep) await prepareGoogleConnect();
    if (!prep) throw fail("google-offline"); // offline oder Google-Skript nicht ladbar
    if (prep.status === "unavailable") throw fail("google-not-configured", "unavailable");
    const code = await requestCode(prep.clientId);
    const r = await call("googleLink", { code });
    return { accessToken: r.accessToken, expiresAt: r.expiresAt };
  },
  async unlink() {
    await call("googleUnlink");
  },
};

const popup = {
  async connect() {
    if (!auth?.currentUser) throw new Error("not authenticated");
    const provider = new GoogleAuthProvider();
    GOOGLE_SCOPES.forEach((s) => provider.addScope(s));
    const result = await reauthenticateWithPopup(auth.currentUser, provider);
    const accessToken = GoogleAuthProvider.credentialFromResult(result)?.accessToken;
    if (!accessToken) throw new Error("kein Google-Token erhalten");
    return { accessToken };
  },
};

const storage = typeof localStorage !== "undefined" ? localStorage : { getItem: () => null, setItem() {}, removeItem() {} };
export const google = createGoogleTokens({ storage, remote, popup });

// Änderungen aus einem anderen Tab/Fenster (gleicher localStorage) an die Oberfläche melden
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => { if (e.key === KEY || e.key === null) google.notify(); });
}
