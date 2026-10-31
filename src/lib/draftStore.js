// draftStore.js — Entwürfe und Autosave für Textfelder, rein (kein React, kein DOM; Speicher/Timer werden injiziert)
// und deshalb in tests/draft-store.test.mjs ohne Browser getestet.
//
// Ablauf pro Feld (createAutosaver):
//  - Jede Eingabe landet sofort als Entwurf im localStorage (übersteht Reload, PWA-Kill, Absturz) und stößt ein
//    entprelltes Speichern an. Gespeichert wird lokal (Firestore-Cache, `track()`), der Abgleich läuft im Hintergrund.
//  - Sofort speichern (`flush`) bei Blur, Seite verlassen/verstecken und Unmount.
//  - Eingehende Stände (Cache/Server) überschreiben das Feld nur, wenn der Nutzer nichts Ungesendetes tippt
//    („dirty“ = aktueller Text ≠ Stand, den das Feld zuletzt kannte/gesendet hat). Kein Cursor-Springen.
//  - Der Entwurf wird erst gelöscht, wenn Stand und Text übereinstimmen (Echo des lokalen Schreibens).
//  - Beim Start: gespeicherter Entwurf, der vom Stand abweicht, wird angezeigt und sofort nachgespeichert.

const PREFIX = "draft:v1:";

/** Vergleichs-/Speicherform: wie bisher getrimmt. */
export const norm = (s) => String(s ?? "").trim();

/** Entwurfsspeicher; der Speicher kann gesperrt sein (privates Fenster) → Rückfall auf den Arbeitsspeicher. */
export function createDraftStore(storage = typeof localStorage !== "undefined" ? localStorage : null) {
  const mem = new Map();
  return {
    get(key) {
      if (mem.has(key)) return mem.get(key);
      try {
        const raw = storage.getItem(PREFIX + key);
        if (raw != null) {
          const o = JSON.parse(raw);
          if (o && typeof o.v === "string") return o.v;
        }
      } catch { /* gesperrt/kaputtes JSON */ }
      return null;
    },
    set(key, value) {
      mem.set(key, value);
      try { storage.setItem(PREFIX + key, JSON.stringify({ v: value, t: Date.now() })); } catch { /* voll/gesperrt */ }
    },
    remove(key) {
      mem.delete(key);
      try { storage.removeItem(PREFIX + key); } catch { /* gesperrt */ }
    },
  };
}

let shared = null;
/** Gemeinsamer Speicher der App (lazy, damit Importe ohne Browser nichts anfassen). */
export const draftStore = () => (shared ??= createDraftStore());

const realTimers = { set: (fn, ms) => setTimeout(fn, ms), clear: (t) => clearTimeout(t) };

/**
 * @param {object} o
 * @param {ReturnType<typeof createDraftStore>} o.store
 * @param {string} o.key        Schlüssel des Entwurfs (uid + Pfad/Feld)
 * @param {(value: string) => void} o.save   lokal speichern (nie awaiten; `track()` im Aufrufer)
 * @param {number} [o.delay]    Entprellzeit in ms
 * @param {{set: Function, clear: Function}} [o.timers]
 */
export function createAutosaver({ store, key, save, delay = 700, timers = realTimers }) {
  let ready = false;
  let base = "";     // Stand, den das Feld zuletzt kannte: eingehender Stand oder zuletzt gesendeter Text
  let current = "";  // Text im Feld
  let timer = null;

  const cancel = () => { if (timer != null) { timers.clear(timer); timer = null; } };

  /** Sofort speichern, wenn der Text vom bekannten Stand abweicht. → true, wenn gesendet. */
  function flush() {
    cancel();
    if (!ready) return false;
    const v = norm(current);
    if (v === base) return false;
    const prev = base;
    base = v;
    try { save(v); } catch { base = prev; return false; } // Entwurf bleibt erhalten, nächster Anlass versucht es erneut
    return true;
  }

  return {
    /** Start, sobald der gespeicherte Stand bekannt ist. → Text, der im Feld stehen soll. */
    init(remote) {
      ready = true;
      base = norm(remote);
      const draft = store.get(key);
      if (draft != null && norm(draft) !== base) {
        current = draft;
        flush(); // Wiederherstellung nach Absturz/Reload: Entwurf gehört in den Speicher
        return draft;
      }
      if (draft != null) store.remove(key);
      current = String(remote ?? "");
      return current;
    },
    isReady: () => ready,
    /** Eingabe. */
    change(value) {
      current = String(value ?? "");
      if (ready && norm(current) === base) { store.remove(key); cancel(); return; }
      store.set(key, current);
      cancel();
      if (ready) timer = timers.set(flush, delay);
    },
    flush,
    /** Eingehender Stand (Cache/Server/Echo). → neuer Feldtext oder null (Feld unverändert lassen). */
    remote(value) {
      if (!ready) return null;
      const v = norm(value);
      if (v === norm(current)) { base = v; store.remove(key); return null; }
      if (norm(current) === base) { // nichts Ungesendetes → fremde Änderung übernehmen
        base = v;
        current = String(value ?? "");
        store.remove(key);
        return current;
      }
      return null; // Nutzer tippt gerade → lokaler Text gewinnt, wird mit dem nächsten Speichern gesendet
    },
    /** Aufräumen (Unmount, Schlüsselwechsel): ausstehendes Speichern nicht verlieren. */
    dispose() { flush(); cancel(); },
    peek: () => ({ base, current, pending: timer != null }),
  };
}
