const { defineConfig, loadEnv } = require("vite");
const react = require("@vitejs/plugin-react");
const { VitePWA } = require("vite-plugin-pwa");
const path = require("path");

// Nachbar-Repos: die vitalos-Submodule-Checkouts (master = firebase-first,
// modulare Firestore-Layer). Die Home-Worktrees (~/fitness-dev, ~/fuel-dev)
// sind dev-Playgrounds — fuel-dev dev hat den modularen Layer (noch) nicht.
const FITNESS = path.resolve(__dirname, "../fitness-app");
const FUEL = path.resolve(__dirname, "../fuel-app");
const RELAX = path.resolve(__dirname, "../relax-app");

module.exports = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appMode = process.env.VITE_APP_MODE || env.VITE_APP_MODE || "coach";

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
        "@db":      path.resolve(__dirname, "./src/db/index.js"),
        "@fitness-db": path.resolve(FITNESS, "src/lib/db"),
        "@utils":   path.resolve(__dirname, "./src/lib/db/core.js"),
        "@journal": path.resolve(__dirname, "./src"),
        "@fuel":    path.resolve(FUEL, "src/client"),
        "@relax":   path.resolve(RELAX, "src"),
        "@habits":  path.resolve(__dirname, "../habit-app/src"),
        "@fitness/constants": path.resolve(FITNESS, "src/constants"),
        "@fitness/components": path.resolve(FITNESS, "src/components"),
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
