// UpdateManager — Auto-Updater für die PWA (vite-plugin-pwa, registerType "prompt").
//
// Neue Version erkannt → Hinweis mit 8-s-Countdown, danach wird automatisch
// aktualisiert. Der Countdown pausiert, solange ein Eingabefeld Fokus hat
// (Journal-Entwurf geht nicht verloren). "Später" schiebt um 10 Minuten.
// Nach dem Reload zeigt ein kurzer Hinweis die neue Version.
// Update-Checks: alle 10 Minuten, beim Fokus und beim Sichtbarwerden des Tabs.
import { useEffect, useState } from "react";
import { RotateCcw, Check } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

const COUNTDOWN = 8;
const SNOOZE_MS = 10 * 60 * 1000;
const FLAG = "journal:just-updated";

function isTyping() {
  const el = document.activeElement;
  if (!el) return false;
  return el.isContentEditable || el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && !["checkbox", "radio", "button", "submit"].includes(el.type));
}

export default function UpdateManager() {
  const [secs, setSecs] = useState(COUNTDOWN);
  const [snoozedUntil, setSnoozedUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [done, setDone] = useState(false);

  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      if (!reg) return;
      const check = () => reg.update().catch(() => {});
      setInterval(check, 10 * 60 * 1000);
      window.addEventListener("focus", check);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") check();
      });
    },
  });

  // Hinweis nach erfolgreichem Update
  useEffect(() => {
    try {
      if (localStorage.getItem(FLAG)) {
        localStorage.removeItem(FLAG);
        setDone(true);
        const t = setTimeout(() => setDone(false), 3500);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const apply = () => {
    try { localStorage.setItem(FLAG, "1"); } catch {}
    updateServiceWorker(true);
  };

  const snoozed = now < snoozedUntil;
  const active = needRefresh && !snoozed;

  // Sekundentakt nur, solange etwas zu tun ist
  useEffect(() => {
    if (!needRefresh) return undefined;
    const id = setInterval(() => {
      setNow(Date.now());
      setSecs((s) => (isTyping() || Date.now() < snoozedUntil ? COUNTDOWN : Math.max(0, s - 1)));
    }, 1000);
    return () => clearInterval(id);
  }, [needRefresh, snoozedUntil]);

  useEffect(() => {
    if (active && secs === 0) apply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, secs]);

  if (!active && !done) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
    >
      <div className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-3 text-sm text-slate-100 shadow-2xl backdrop-blur">
        {active ? (
          <>
            <RotateCcw className="h-4 w-4 shrink-0 text-amber-300" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold">Neue Version verfügbar</div>
              <div className="text-xs text-slate-400">
                {isTyping() ? "Wartet, bis du fertig getippt hast." : `Wird in ${secs} s installiert.`}
              </div>
            </div>
            <button type="button" onClick={() => setSnoozedUntil(Date.now() + SNOOZE_MS)} className="text-xs text-slate-400 hover:text-white">
              Später
            </button>
            <button type="button" onClick={apply} className="rounded-full bg-orange-400 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-orange-300">
              Jetzt
            </button>
          </>
        ) : (
          <>
            <Check className="h-4 w-4 shrink-0 text-emerald-300" />
            <div className="font-semibold">Aktualisiert auf v{__APP_VERSION__}</div>
          </>
        )}
      </div>
    </div>
  );
}
