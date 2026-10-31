// useAutosaveField — React-Anbindung für draftStore.js: kontrolliertes Textfeld mit Entwurf (localStorage),
// entprelltem Autosave und stabilem Feld (kein Neuaufbau per key, kein Cursor-Springen).
//   const f = useAutosaveField({ storageKey, remote, ready, save });
//   <textarea value={f.value} onChange={f.onChange} onBlur={f.onBlur} />
// `remote` = gespeicherter Stand (Cache/Server), `ready` = Stand ist geladen (vorher wird nichts gespeichert),
// `save(text)` schreibt lokal und gleicht im Hintergrund ab (nie awaiten).
// Zusätzlich: usePersistedText für einfache Eingabezeilen („Neuer Eintrag …“), die nur einen Entwurf brauchen.
import { useCallback, useEffect, useRef, useState } from "react";
import { createAutosaver, draftStore } from "./draftStore.js";

export function useAutosaveField({ storageKey, remote, ready = true, save, delay }) {
  const store = draftStore();
  const [value, setValue] = useState(() => store.get(storageKey) ?? remote ?? "");
  const saveRef = useRef(save);
  saveRef.current = save;
  const remoteRef = useRef(remote);
  remoteRef.current = remote;
  const auto = useRef(null);

  // Autosaver je Feld/Schlüssel; beim Wechsel oder Unmount wird Ausstehendes noch gespeichert
  useEffect(() => {
    const a = createAutosaver({ store, key: storageKey, save: (v) => saveRef.current?.(v), delay });
    auto.current = a;
    setValue(store.get(storageKey) ?? remoteRef.current ?? ""); // Schlüsselwechsel: nicht den Text des alten Feldes zeigen
    return () => { a.dispose(); if (auto.current === a) auto.current = null; };
  }, [storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stand bekannt bzw. geändert: einmal initialisieren, danach nur übernehmen, wenn nichts Ungesendetes getippt ist
  useEffect(() => {
    const a = auto.current;
    if (!a || !ready) return;
    if (!a.isReady()) setValue(a.init(remote ?? ""));
    else { const next = a.remote(remote ?? ""); if (next != null) setValue(next); }
  }, [ready, remote, storageKey]);

  // Seite verlassen/verstecken (PWA in den Hintergrund, Tab schließen): sofort speichern
  useEffect(() => {
    const flush = () => auto.current?.flush();
    const hidden = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
    };
  }, []);

  const onChange = useCallback((e) => {
    const v = typeof e === "string" ? e : e.target.value;
    setValue(v);
    auto.current?.change(v);
  }, []);
  const onBlur = useCallback(() => { auto.current?.flush(); }, []);
  return { value, onChange, onBlur };
}

/** Eingabezeile mit Entwurf im localStorage (kein Autosave in eine Datenquelle): [text, setText]. */
export function usePersistedText(storageKey) {
  const store = draftStore();
  const [text, setText] = useState(() => store.get(storageKey) ?? "");
  const keyRef = useRef(storageKey);
  useEffect(() => {
    keyRef.current = storageKey;
    setText(store.get(storageKey) ?? "");
  }, [storageKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = useCallback((next) => {
    setText((prev) => {
      const v = typeof next === "function" ? next(prev) : next;
      if (v) store.set(keyRef.current, v); else store.remove(keyRef.current);
      return v;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return [text, set];
}
