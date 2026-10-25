// offline.js — Offline-first-Grundlage: lokal schreiben, im Hintergrund synchronisieren.
//  - track(promise): Firestore-Schreibzugriffe NICHT awaiten (die Promise löst erst nach Server-Bestätigung auf und
//    hängt offline ewig). track() zählt sie als „offen“, schluckt Fehler und meldet sie über den Sync-Status.
//  - setOutbox(n): Anzahl lokal gespeicherter, noch nicht gesendeter Taskwarrior-Operationen (taskchampion.js).
//  - startBackgroundSync(fn): fn beim Start, bei „online“, beim Sichtbarwerden und alle 60 s.
//  - useSyncState(): { online, pending, outbox, error } für die SyncBadge.
import { useSyncExternalStore } from "react";

const hasWindow = typeof window !== "undefined";
const state = { online: typeof navigator === "undefined" ? true : navigator.onLine !== false, pending: 0, outbox: 0, error: "" };
let snap = { ...state };
const subs = new Set();
const emit = () => { snap = { ...state }; subs.forEach((f) => f()); };

if (hasWindow) {
  window.addEventListener("online", () => { state.online = true; emit(); });
  window.addEventListener("offline", () => { state.online = false; emit(); });
}

const message = (e) => (e?.code === "permission-denied"
  ? "Keine Berechtigung für journal/… – Firestore-Rules prüfen."
  : e?.message || "Synchronisieren fehlgeschlagen");

/** Schreib-Promise beobachten. Gibt eine Promise zurück, die nie ablehnt: true = vom Server bestätigt, false = Fehler. */
export function track(promise) {
  state.pending += 1;
  emit();
  return Promise.resolve(promise).then(
    () => { state.pending -= 1; if (!state.pending) state.error = ""; emit(); return true; },
    (e) => { state.pending -= 1; state.error = message(e); console.warn("[offline] Schreiben fehlgeschlagen:", e); emit(); return false; },
  );
}

export function setOutbox(n) {
  if (state.outbox === n) return;
  state.outbox = n;
  emit();
}

export function clearSyncError() {
  if (!state.error) return;
  state.error = "";
  emit();
}

export const getSyncState = () => snap;
export function subscribeSync(fn) { subs.add(fn); return () => subs.delete(fn); }
export const useSyncState = () => useSyncExternalStore(subscribeSync, getSyncState, getSyncState);

const started = new WeakSet();
/** fn läuft im Hintergrund; Fehler (offline, Server down) werden verschluckt und beim nächsten Anlass erneut versucht. */
export function startBackgroundSync(fn, intervalMs = 60_000) {
  if (!hasWindow || started.has(fn)) return;
  started.add(fn);
  const run = () => { if (navigator.onLine !== false) Promise.resolve().then(fn).catch(() => {}); };
  run();
  window.addEventListener("online", run);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") run(); });
  setInterval(run, intervalMs);
}
