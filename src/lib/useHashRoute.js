// useHashRoute — Tab/Modus/Datum aus dem URL-Hash (Quelle: window.location.hash, kein eigener State).
// navigate() liest den aktuellen Hash zum Aufrufzeitpunkt: zwei Aufrufe im selben Tick
// (z. B. navigate({ date }) und navigate({ mode })) überschreiben sich nicht.
import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { TAB_CONFIG } from "../routes.js";
import { localToday, makeRouter } from "./hashRoute.js";

export const router = makeRouter({
  tabs: TAB_CONFIG.map((t) => t.key),
  defaultTab: import.meta.env.VITE_DEFAULT_TAB || "journal",
  gameDefault: import.meta.env.VITE_DEFAULT_GAME_MODE || "fire",
});

// Das Datum bleibt beim Tab-Wechsel erhalten, auch über Tabs hinweg, die keins im Hash führen (Door, Game).
let lastDate = null;

const subscribe = (cb) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const getHash = () => window.location.hash;

const withDate = (route) => ({ ...route, date: route.date ?? lastDate ?? localToday() });

export function navigate(patch) {
  const cur = withDate(router.parse(getHash()));
  const next = { ...cur, ...patch };
  // Der Modus gehört zum Tab: beim Tab-Wechsel ohne expliziten Modus gilt der Standard des Ziel-Tabs.
  if (patch.tab && patch.tab !== cur.tab && patch.mode === undefined) next.mode = router.parse(router.build({ tab: patch.tab })).mode;
  if (next.date) lastDate = next.date;
  const hash = router.build(next);
  if (getHash() !== hash) window.location.hash = hash;
}

export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, getHash, () => "");
  const parsed = useMemo(() => router.parse(hash), [hash]);

  useEffect(() => {
    if (parsed.date) lastDate = parsed.date;
  }, [parsed.date]);

  // Beim Start den Hash kanonisch schreiben (z. B. "" → #journal/today), ohne neuen History-Eintrag.
  useEffect(() => {
    const want = router.build(withDate(router.parse(getHash())));
    if (getHash() !== want) {
      window.history.replaceState(null, "", want);
      window.dispatchEvent(new Event("hashchange"));
    }
  }, []);

  const { tab, mode } = parsed;
  const date = parsed.date ?? lastDate ?? localToday();
  const setDate = useCallback((d) => navigate({ date: d }), []);
  const setMode = useCallback((m) => navigate({ mode: m }), []);
  return { tab, mode, date, setDate, setMode, navigate };
}
