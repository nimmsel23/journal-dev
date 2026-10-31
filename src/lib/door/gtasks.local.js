// gtasks.local.js — Verdrahtung des Offline-first-Kerns von Door v2 "Quelle: Google Tasks":
// lokaler Store (localStorage, je Firebase-uid) + Door-Modell + Hintergrund-Abgleich mit Google Tasks.
// Die reinen Teile (gtasks.store/model/sync.js) sind getestet; hier hängt nur das Browser-/Firebase-/Google-Umfeld dran.
//
// Der Abgleich läuft beim ersten Zugriff an (Start, online, Sichtbarwerden, Intervall über startBackgroundSync)
// und nach dem Verbinden. Ohne Verbindung/Netz passiert still nichts; die Outbox wartet.
// Pro Origin (journal, v2, door, vitalos-Shell …) gibt es einen eigenen Store mit eigener Outbox — sie syncen
// unabhängig gegen dieselben Google-Listen (siehe gtasks.sync.js).
import { auth } from "../firebase.js";
import { google } from "../google/auth.js";
import { startBackgroundSync } from "../offline.js";
import { createStore } from "./gtasks.store.js";
import { createDoorModel } from "./gtasks.model.js";
import { createSync } from "./gtasks.sync.js";
import { listTasks, insertTask, patchTask, deleteTask, moveTask } from "./gtasks.js";

const LAST_UID = "dv2:lf:lastuid";
const api = { listTasks, insertTask, patchTask, deleteTask, moveTask };

const memory = new Map(); // Rückfall, falls localStorage gesperrt ist (privates Fenster)
const storage = {
  getItem: (k) => { try { return localStorage.getItem(k); } catch { return memory.get(k) ?? null; } },
  setItem: (k, v) => { memory.set(k, v); try { localStorage.setItem(k, v); } catch { /* gesperrt/voll */ } },
  removeItem: (k) => { memory.delete(k); try { localStorage.removeItem(k); } catch { /* gesperrt */ } },
};

/** uid des angemeldeten Nutzers; vor der Wiederherstellung der Anmeldung (Start ohne Netz) die zuletzt bekannte. */
function currentUid() {
  const uid = auth?.currentUser?.uid;
  if (uid) { try { localStorage.setItem(LAST_UID, uid); } catch { /* optional */ } return uid; }
  try { return localStorage.getItem(LAST_UID) || ""; } catch { return ""; }
}

const withLock = (name) => (fn) => {
  const locks = typeof navigator !== "undefined" ? navigator.locks : null;
  if (!locks?.request) return fn();
  // ifAvailable: läuft in einem anderen Tab schon ein Abgleich, ist dieser Durchgang unnötig
  return locks.request(name, { ifAvailable: true }, (lock) => (lock ? fn() : undefined));
};

let cur = null; // { uid, store, model, sync }
const listeners = new Set();

export function getLocal() {
  const uid = currentUid() || "anon";
  if (cur?.uid === uid) return cur;
  const store = createStore({ storage, uid });
  const sync = createSync({
    store,
    api,
    canRun: () => (typeof navigator === "undefined" || navigator.onLine !== false) && google.snapshot() !== "off" && uid !== "anon",
    withLock: withLock(`dv2-gtasks-${uid}`),
  });
  const model = createDoorModel(store, { kick: sync.kick });
  store.subscribe((origin) => listeners.forEach((fn) => { try { fn(origin); } catch { /* Zuhörer dürfen den Abgleich nicht stören */ } }));
  cur = { uid, store, model, sync };
  start();
  return cur;
}

let started = false;
function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  // online: Backoff zurücksetzen, bevor startBackgroundSync den Durchgang startet (Listener-Reihenfolge)
  window.addEventListener("online", () => cur?.sync.resetBackoff());
  startBackgroundSync(() => cur?.sync.run(), 60_000);
  // Verbunden/Token wieder da → sofort abgleichen
  google.subscribe(() => { if (google.snapshot() !== "off") cur?.sync.run({ force: true }); });
  // Änderungen eines anderen Tabs derselben Origin (gleicher localStorage)
  window.addEventListener("storage", (e) => { if (cur && (e.key === cur.store.key || e.key === null)) cur.store.reload(); });
}

export const getModel = () => getLocal().model;
export const hasLocalData = () => getLocal().store.hasData();
export const pendingCount = () => getLocal().store.pending();
/** Zuhörer für Änderungen am Store: origin "local" (Schreiben/Ack) oder "remote" (Pull, id-Mapping, anderer Tab). */
export function subscribeLocal(fn) { listeners.add(fn); return () => listeners.delete(fn); }
/** Sofort abgleichen (z. B. nach dem Verbinden). */
export const syncNow = () => getLocal().sync.run({ force: true });
