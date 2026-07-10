const { defineConfig, loadEnv } = require("vite");
const react = require("@vitejs/plugin-react");
const { VitePWA } = require("vite-plugin-pwa");
const path = require("path");

// Nachbar-Repos: die vitalos-Submodule-Checkouts (master = firebase-first,
// modulare Firestore-Layer). Die Home-Worktrees (~/fitness-dev, ~/fuel-dev)
// sind dev-Playgrounds — fuel-dev dev hat den modularen Layer (noch) nicht.
const FITNESS = "/home/alpha/vitalos/fitness-dev";
const FUEL = "/home/alpha/vitalos/fuel-dev";

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
          navigateFallbackDenylist: [/^\/api/, /^\/nutrition/, /^\/supplements/, /^\/fuel/, /^\/health/],
          runtimeCaching: [
            {
              urlPattern: /^\/nutrition\//,
              handler: "NetworkFirst",
              options: {
                cacheName: "nutrition-api",
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 },
                networkTimeoutSeconds: 5,
              },
            },
            {
              urlPattern: /^\/supplements\//,
              handler: "NetworkFirst",
              options: {
                cacheName: "supplements-api",
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 },
                networkTimeoutSeconds: 5,
              },
            },
          ],
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
        "@habits":  path.resolve("/home/alpha/habits-dev/src"),
        "@fitness/constants": path.resolve(FITNESS, "src/constants"),
        "@fitness/components": path.resolve(FITNESS, "src/components"),
        "@api": path.resolve(FUEL, appMode === "client" ? "src/client/lib/api.cloud.js" : "src/client/lib/api.local.js"),
      },
      // fullcalendar in dedupe: fuel-Views werden aus ~/vitalos/fuel-dev
      // importiert und würden sonst in vitalos/node_modules auflösen, wo
      // @fullcalendar/core fehlt.
      dedupe: [
        "react", "react-dom", "@tanstack/react-query",
        "@fullcalendar/core", "@fullcalendar/react", "@fullcalendar/daygrid",
        "@fullcalendar/timegrid", "@fullcalendar/interaction",
      ],
    },
    build: {
      outDir,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-query": ["@tanstack/react-query"],
            "vendor-firebase": ["firebase/app", "firebase/firestore", "firebase/auth"],
            "vendor-calendar": ["@fullcalendar/react", "@fullcalendar/daygrid", "@fullcalendar/timegrid", "@fullcalendar/interaction"],
            "vendor-charts": ["recharts"],
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
