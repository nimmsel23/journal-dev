import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sparkles, RotateCcw } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

import "./styles.css";
import { TAB_CONFIG } from "./routes.js";
import TabContent from "./components/TabContent.jsx";
import { useApp } from "./store.js";
import { watchAuth, signIn, signOut, getUid } from "@db";
// Initialize Firebase (sets window.__firebaseAuth, window.__firebaseDb, etc.)
import "./lib/firebase.js";

import { useRegisterSW } from "virtual:pwa-register/react";

const qc = new QueryClient();

if (typeof window !== "undefined") {
  window.journalDebug = {
    version: "3.0.0",
    getUid: () => getUid(),
    forceSync: () => qc.invalidateQueries(),
  };
}

function App() {
  const { activeTab, setActiveTab, activeDate, setActiveDate } = useApp();
  const [user, setUser] = React.useState(null);

  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      if (!r) return;
      // Check for updates every 10 minutes
      setInterval(() => r.update(), 10 * 60 * 1000);
      // Also check when app regains focus
      window.addEventListener('focus', () => r.update());
    },
  });

  // Auto-update immediately when new version available
  React.useEffect(() => {
    if (needRefresh) {
      setTimeout(() => updateServiceWorker(true), 500);
    }
  }, [needRefresh, updateServiceWorker]);

  React.useEffect(() => watchAuth((u) => setUser(u)), []);

  // URL Hashing for Tabs
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && TAB_CONFIG.some((t) => t.key === hash)) {
        setActiveTab(hash);
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [setActiveTab]);

  React.useEffect(() => {
    if (activeTab) {
      window.location.hash = activeTab;
    }
  }, [activeTab]);

  const isCloud = window.location.hostname.includes("web.app") || window.location.hostname.includes("firebaseapp.com");

  const activeTabConfig = TAB_CONFIG.find((t) => t.key === activeTab);
  const activeTitle = activeTabConfig?.title ?? "Journal";

  React.useEffect(() => {
    document.title = `${activeTitle} — VOS Journal`;
  }, [activeTitle]);

  const tabCtx = { activeDate, setActiveDate, setActiveTab, user };

  return (
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
                {needRefresh && (
                  <button
                    onClick={() => updateServiceWorker(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-amber-200 hover:border-amber-400/60 hover:bg-amber-400/20 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                    Update
                  </button>
                )}
                {isCloud && (
                  user ? (
                    <button onClick={signOut} className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest">
                      Logout ({user.displayName?.split(" ")[0]})
                    </button>
                  ) : (
                    <button onClick={signIn} className="text-[10px] text-orange-400 hover:text-orange-300 font-bold uppercase tracking-widest">
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
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
