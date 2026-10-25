// useLiveSnap — Firestore-Daten cache-first: der Listener liefert sofort den lokalen Stand (auch offline) und danach
// jede Änderung vom Server im Hintergrund. subscribe(onNext, onError) startet den Listener und gibt die Abmeldung zurück.
import { useEffect, useState } from "react";

export function useLiveSnap(enabled, subscribe, deps) {
  const [st, setSt] = useState({ data: undefined, error: null });
  useEffect(() => {
    if (!enabled) { setSt({ data: undefined, error: null }); return undefined; }
    return subscribe((data) => setSt({ data, error: null }), (error) => setSt((s) => ({ ...s, error })));
  }, [enabled, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
  return { ...st, ready: st.data !== undefined };
}
