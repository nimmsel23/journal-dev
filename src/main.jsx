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
import { useHashRoute } from "./lib/useHashRoute.js";
import { watchAuth, signIn, signOut, getUid } from "@journal-db";
// Initialize Firebase (sets window.__firebaseAuth, window.__firebaseDb, etc.)
import { db as firestore } from "./lib/firebase.js";
import { startBackgroundSync, track } from "./lib/offline.js";
import { waitForPendingWrites } from "firebase/firestore";

// Schreibzugriffe aus früheren Sitzungen, die noch beim Server anstehen, zählen als „offen“;
// Taskwarrior-Outbox wird im Hintergrund geleert (Start, online, Tab sichtbar, alle 60 s).
track(waitForPendingWrites(firestore));
startBackgroundSync(async () => {
  const tc = await import("./lib/door/taskchampion.js");
  if (await tc.getConfig()) await tc.flush();
});

import UpdateManager from "./components/UpdateManager.jsx";

// offlineFirst: Queries laufen auch ohne Netz (lokaler Firestore-Cache/IndexedDB) statt zu pausieren
const qc = new QueryClient({ defaultOptions: { queries: { networkMode: "offlineFirst" }, mutations: { networkMode: "offlineFirst" } } });

if (typeof window !== "undefined") {
  window.journalDebug = {
    version: "3.0.0",
    getUid: () => getUid(),
    forceSync: () => qc.invalidateQueries(),
  };
}

function App() {
  const { tab: activeTab, mode, date, setDate, setMode, navigate } = useHashRoute();
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

  const tabCtx = { user, date, setDate, mode, setMode };

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
                onClick={() => navigate({ tab: key })}
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
