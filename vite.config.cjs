const { defineConfig, loadEnv } = require("vite");
const react = require("@vitejs/plugin-react");
const { VitePWA } = require("vite-plugin-pwa");
const path = require("path");
const { existsSync } = require("fs");

// Sibling-Repos existieren unter zwei Namensschemata, je nach Checkout:
// ~/journal-dev (dev-Branch, Home-Root)     → Siblings heißen *-dev (fitness-dev, fuel-dev, relax-dev, habits-dev)
// ~/vitalos/journal-app (master, Submodule) → Siblings heißen *-app (fitness-app, fuel-app, relax-app, habit-app)
// Übernommen 1:1 aus fuel-dev/vite.config.js (dort seit dem ersten Auftreten
// dieses Problems die SSOT-Lösung) — journal-dev hatte vorher gar keinen
// Fallback und brach in jedem Checkout, der nicht zufällig *-app hieß.
function resolveSibling(candidates, label) {
  for (const rel of candidates) {
    const abs = path.resolve(__dirname, rel);
    if (existsSync(abs)) return abs;
  }
  throw new Error(`[vite.config.cjs] Kein Sibling-Pfad gefunden für ${label}: ${candidates.join(", ")}`);
}

// SSOT für Cross-App-Aliase ist @vos/cross-app-aliases (~/vitalos/packages/
// cross-app-aliases) — nur erreichbar, wenn dieses Repo als vitalos-Submodule
// genestet ist (npm Workspace-Symlink). Standalone-Checkout (~/journal-dev
// ohne vitalos-Parent) fällt auf resolveSibling() zurück.
//
// WARNUNG (2026-08-01, nach echtem Vorfall): der catch-Zweig MUSS über
// resolveSibling() mit BEIDEN Kandidaten (-app UND -dev) auflösen. Ein
// früherer Refactor (d4dd2f3) hat hier nur das Try/Catch-Gerüst kopiert,
// im catch-Zweig aber die alten hartcodierten -app-only-Pfade
// wiederverwendet — der Fallback sah aus wie eine Lösung, war aber
// funktionslos, sobald das Repo nicht zufällig neben *-app-Ordnern lag.
async function resolveCrossAppAliases() {
  try {
    const { crossAppAliases } = await import("@vos/cross-app-aliases");
    return crossAppAliases();
  } catch {
    return {
      "@fitness-db": resolveSibling(["../fitness-app/src/lib/db", "../fitness-dev/src/lib/db"], "@fitness-db"),
      "@fitness/constants": resolveSibling(["../fitness-app/src/constants", "../fitness-dev/src/constants"], "@fitness/constants"),
      "@fitness/components": resolveSibling(["../fitness-app/src/components", "../fitness-dev/src/components"], "@fitness/components"),
      "@fuel": resolveSibling(["../fuel-app/src/client", "../fuel-dev/src/client"], "@fuel"),
      "@relax": resolveSibling(["../relax-app/src", "../relax-dev/src"], "@relax"),
      "@habits": resolveSibling(["../habit-app/src", "../habits-dev/src"], "@habits"),
    };
  }
}

const FITNESS = resolveSibling(["../fitness-app", "../fitness-dev"], "FITNESS");
const FUEL = resolveSibling(["../fuel-app", "../fuel-dev"], "FUEL");
const RELAX = resolveSibling(["../relax-app", "../relax-dev"], "RELAX");

module.exports = defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appMode = process.env.VITE_APP_MODE || env.VITE_APP_MODE || "coach";
  const crossAppAliases = await resolveCrossAppAliases();

  // Firebase-Init der Nachbar-Repos auf journals eigene lib/firebase.js
  // umleiten — genau eine initializeApp im Bundle (Muster: vitalos
  // vitalos:subrepo-firebase-redirect). enforce:'pre' nötig, damit der Hook
  // vor vite:resolve läuft.
  const JOURNAL_FIREBASE = path.resolve(__dirname, "src/lib/firebase.js");
  const SUBREPO_FIREBASE = new Set([
    path.resolve(FITNESS, "src/firebase.js"),
    path.resolve(FUEL, "src/client/lib/firebase.js"),
    path.resolve(RELAX, "src/firebase.js"),
  ]);
  const firebaseRedirect = {
    name: "journal:subrepo-firebase-redirect",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer || !source.startsWith(".")) return null;
      const resolved = path.resolve(path.dirname(importer.split("?")[0]), source);
      if (SUBREPO_FIREBASE.has(resolved) || SUBREPO_FIREBASE.has(`${resolved}.js`)) {
        return JOURNAL_FIREBASE;
      }
      return null;
    },
  };

  // coach builds to dist/ (local server), client builds to dist-firebase/ (for firebase deploy)
  const outDir = appMode === "client" ? "./dist-firebase" : "./dist";

  console.log(`🚀 Building for mode: ${mode}, APP_MODE: ${appMode} -> outDir: ${outDir}`);

  return {
    base: "/",
    define: {
      "import.meta.env.VITE_APP_MODE": JSON.stringify(appMode),
    },
    plugins: [
      firebaseRedirect,
      react(),
      VitePWA({
        base: "/",
        scope: "/",
        registerType: "autoUpdate",
        injectRegister: "auto",
        manifest: {
          name: "Vital-Journal",
          short_name: "Vital-Journal",
          description: "Journal + Habits auf VitalOS-Stack",
          theme_color: "#f59e0b",
          background_color: "#0f172a",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
            { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api/],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        ...crossAppAliases,
        "@firebase-config": path.resolve(__dirname, "../firebase.config.js"),
        // Lokale Selbstreferenzen zuletzt — überschreiben bewusst etwaige
        // @journal/@journal-db-Einträge aus @vos/cross-app-aliases (die
        // wären für journal-dev selbst sowieso identisch, aber explizit
        // ist sicherer als sich auf Zufallsgleichheit zu verlassen).
        "@journal-db": path.resolve(__dirname, "./src/db/index.js"),
        "@db":      path.resolve(__dirname, "./src/db/index.js"),
        "@utils":   path.resolve(__dirname, "./src/lib/db/core.js"),
        "@journal": path.resolve(__dirname, "./src"),
      },
      // dedupe: der @fuel-DB-Layer (und @fitness/@habits-Module) wird aus
      // Nachbar-Repos importiert und würde sonst in deren node_modules
      // auflösen (z.B. recharts 3.x in vitalos = Major-Bruch zu journals
      // 2.15.4). dedupe zwingt alles auf journal-devs Kopie.
      // "firebase" fehlte hier: @fuel/lib/db/firestore/supplements.js (und
      // jetzt @relax/lib/db/firestore/sessions.js) importieren "firebase/firestore"
      // aus ihrem eigenen node_modules (fuel-dev/relax-dev laufen auch standalone) —
      // ohne dedupe entsteht eine zweite Firestore-SDK-Instanz neben journals
      // eigener (aus firebaseRedirect), und Firestore wirft beim Übergeben von
      // journals `db`-Objekt an die fremde SDK-Kopie einen Typfehler.
      dedupe: [
        "react", "react-dom", "@tanstack/react-query",
        "recharts", "lucide-react", "framer-motion",
        "firebase", "firebase/app", "firebase/firestore", "firebase/auth",
      ],
    },
    build: {
      outDir,
      emptyOutDir: true,
      // 500er-Default schlägt nur noch bei vendor-firebase an (Firestore-SDK
      // mit persistentLocalCache ist als Ganzes so groß, s. manualChunks).
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Funktion statt Objekt-Keys: die fuel-Views lösen ihre Dependencies
          // in fremden node_modules auf (vitalos/fuel-dev) — Objekt-Keys matchen
          // nur journal-devs eigene Auflösung und ließen vendor-react/-charts
          // als leere Stubs zurück (recharts steckte im DashboardView-Chunk).
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            if (/node_modules\/(recharts|recharts-scale|victory-vendor|d3-[^/]+|decimal\.js-light|fast-equals)\//.test(id)) return "vendor-charts";
            // Firestore NICHT separat splitten: @firebase/firestore ↔ @firebase/app
            // importieren sich wechselseitig → "Circular chunk"-Warnung + riskante
            // Init-Reihenfolge. Ein Chunk (~960 kB, gzip ~230) ist SDK-Realität.
            if (/node_modules\/(firebase|@firebase|idb)\//.test(id)) return "vendor-firebase";
            if (id.includes("node_modules/@tanstack/")) return "vendor-query";
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "vendor-react";
            return undefined;
          },
        },
      },
    },
    server: {
      host: "127.0.0.1",
      port: 9001,
      hmr: {
        host: "127.0.0.1",
        port: 9001,
      },
      proxy: {
        "/nutrition": "http://127.0.0.1:9000",
        "/supplements": "http://127.0.0.1:9000",
        "/fuel": "http://127.0.0.1:9000",
        "/health": "http://127.0.0.1:9000",
        "/api": "http://127.0.0.1:9080",
      },
    },
  };
});
