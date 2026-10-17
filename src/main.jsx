import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

import "./styles.css";
import { TAB_CONFIG } from "./routes.js";
import TabContent from "./components/TabContent.jsx";
import { IosInstallHint } from "./components/IosInstallHint.jsx";
import { InstallPromptHandler } from "./components/InstallPromptHandler.jsx";
import { useApp } from "./store.js";
import { watchAuth, signIn, signOut, getUid } from "@journal-db";
// Initialize Firebase (sets window.__firebaseAuth, window.__firebaseDb, etc.)
import "./lib/firebase.js";

import UpdateManager from "./components/UpdateManager.jsx";

const qc = new QueryClient();

function localToday() {
  return new Date().toISOString().slice(0, 10);
}

// Kurze Hash-Präfixe → Tab-Key (#v2, #v2/today, #v2/2026-10-17)
const HASH_ALIASES = { v2: "journal-v2" };
const V2_MODES = ["tag", "woche", "monat"];
const HASH_ALIASES_REVERSE = Object.fromEntries(Object.entries(HASH_ALIASES).map(([k, v]) => [v, k]));

function parseHashState() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  if (!raw) return { tab: null, date: null };
  const parts = raw.split("/");
  const rawTab = parts[0] || null;
  const tab = rawTab ? (HASH_ALIASES[rawTab] ?? rawTab) : null;
  // v2 hat einen optionalen Modus-Teil: #v2/woche/2026-10-17
  let mode = null;
  if (tab === "journal-v2" && V2_MODES.includes(parts[1])) mode = parts.splice(1, 1)[0];
  const rawDate = parts[1] ?? null;
  if (!tab) return { tab: null, date: null, mode };
  if (!rawDate) return { tab, date: null, mode };
  if (rawDate === "today") return { tab, date: localToday(), mode };
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return { tab, date: rawDate, mode };
  return { tab, date: null, mode };
}

function buildHashState(rawTab, date, mode = "tag") {
  const tab = HASH_ALIASES_REVERSE[rawTab] ?? rawTab;
  if (!tab) return "#";
  const prefix = rawTab === "journal-v2" && mode !== "tag" ? `${tab}/${mode}` : tab;
  if (!date) return `#${prefix}`;
  return `#${prefix}/${date === localToday() ? "today" : date}`;
}

if (typeof window !== "undefined") {
  window.journalDebug = {
    version: "3.0.0",
    getUid: () => getUid(),
    forceSync: () => qc.invalidateQueries(),
  };
}

function App() {
  const { activeTab, setActiveTab, activeDate, setActiveDate, v2Mode, setV2Mode } = useApp();
  const [user, setUser] = React.useState(null);

  // Auth-Status bekannt → Splash (index.html) ausblenden; Fallback nach 2,5 s
  React.useEffect(() => {
    const hide = () => window.__hideSplash?.();
    const t = setTimeout(hide, 2500);
    const off = watchAuth((u) => {
      setUser(u);
      hide();
    });
    return () => {
      clearTimeout(t);
      off?.();
    };
  }, []);

  // URL Hashing for Tab + Datum
  React.useEffect(() => {
    const handleHashChange = () => {
      const { tab, date, mode } = parseHashState();
      if (tab && TAB_CONFIG.some((t) => t.key === tab)) {
        setActiveTab(tab);
      }
      if (tab === "journal-v2") setV2Mode(mode ?? "tag");
      if (date) {
        setActiveDate(date);
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [setActiveDate, setActiveTab, setV2Mode]);

  React.useEffect(() => {
    if (activeTab) {
      const nextHash = buildHashState(activeTab, activeDate, v2Mode);
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash;
      }
    }
  }, [activeDate, activeTab, v2Mode]);

  const isCloud = window.location.hostname.includes("web.app") || window.location.hostname.includes("firebaseapp.com");

  const activeTabConfig = TAB_CONFIG.find((t) => t.key === activeTab);
  const activeTitle = activeTabConfig?.title ?? "Journal";

  React.useEffect(() => {
    document.title = `${activeTitle} — VOS Journal`;
  }, [activeTitle]);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Sign in error:", error);
      alert(`Cloud Login failed: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      alert(`Logout failed: ${error.message}`);
    }
  };

  const tabCtx = { activeDate, setActiveDate, setActiveTab, user, v2Mode, setV2Mode };

  // "bare"-Tabs (z.B. Journal v2) bringen ihr eigenes Layout mit: kein App-Header.
  if (activeTabConfig?.bare) {
    return <TabContent activeTab={activeTab} ctx={tabCtx} />;
  }

  return (
    <>
      <InstallPromptHandler />
      <IosInstallHint />
      <div className="min-h-screen text-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <header className="mb-6 grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-orange-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  VOS Journal
                </p>
                <span className="text-[10px] tracking-widest text-slate-500">v{__APP_VERSION__}</span>
                {isCloud && (
                  user ? (
                    <button onClick={handleSignOut} className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest">
                      Logout ({user.displayName?.split(" ")[0]})
                    </button>
                  ) : (
                    <button onClick={handleSignIn} className="text-[10px] text-orange-400 hover:text-orange-300 font-bold uppercase tracking-widest">
                      Cloud Login
                    </button>
                  )
                )}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{activeTitle}</h1>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {TAB_CONFIG.map(({ key, label, Icon }) => (
              <motion.button
                whileTap={{ scale: 0.96 }}
                key={key}
                onClick={() => setActiveTab(key)}
                className={twMerge(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                  activeTab === key
                    ? "border-orange-400/40 bg-orange-400 text-slate-950"
                    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </motion.button>
            ))}
          </nav>
        </header>

        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              <TabContent activeTab={activeTab} ctx={tabCtx} />
            </motion.div>
          </AnimatePresence>
        </main>
        </div>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <App />
      <UpdateManager />
    </QueryClientProvider>
  </React.StrictMode>,
);
