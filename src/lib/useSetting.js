// useSetting — Einstellung mit localStorage-Persistenz (pro Browser).
// Wie useState; Speicher kann gesperrt/leer sein (Privatmodus), dann bleibt der Wert nur im State.
// `normalize` bekommt den gelesenen (JSON-)Wert und liefert den gültigen Wert, sonst `undefined` → initial.
import { useCallback, useState } from "react";

export const readSetting = (key, initial, normalize = (v) => v) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return initial;
    let value;
    try { value = JSON.parse(raw); } catch { value = raw; }
    return normalize(value) ?? initial;
  } catch {
    return initial;
  }
};

export const writeSetting = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Speicher gesperrt */ }
};

// Alte Flags wurden als "1"/"0" gespeichert (JSON: 1/0), neue als true/false.
export const asBool = (v) => (v === true || v === 1 ? true : v === false || v === 0 ? false : undefined);

export function useSetting(key, initial, normalize) {
  const [value, setValue] = useState(() => readSetting(key, initial, normalize));
  const set = useCallback((next) => {
    setValue((prev) => {
      const v = typeof next === "function" ? next(prev) : next;
      writeSetting(key, v);
      return v;
    });
  }, [key]);
  return [value, set];
}
