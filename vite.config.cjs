const { defineConfig, loadEnv } = require("vite");
const react = require("@vitejs/plugin-react");
const { VitePWA } = require("vite-plugin-pwa");
const path = require("path");
const APP_VERSION = require("./package.json").version;

module.exports = defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appMode = process.env.VITE_APP_MODE || env.VITE_APP_MODE || "coach";
  // Flavor (door/voice/game/tent): eigenes App-Icon-Paket (public/icons-<flavor>), Name, Farben, Splash
  // für das Hosting vos-door.web.app (pnpm run deploy:door). Default: Journal.
  // Weitere Flavors: voice / game / tent (Raster-Apps auf vos-voice / vos-game / vos-tent), je eigenes Icon-Paket.
  const FLAVORS = {
    door: { name: "The Door", short: "Door", dir: "icons-door" },
    voice: { name: "Voice", short: "Voice", dir: "icons-voice" },
    game: { name: "Game", short: "Game", dir: "icons-game" },
    tent: { name: "General's Tent", short: "Tent", dir: "icons-tent" },
  };
  const FL = FLAVORS[process.env.VITE_APP_FLAVOR || env.VITE_APP_FLAVOR];
  const DOOR = !!FL; // „Flavor-App“ (Name historisch von Door)
  const flavorHtml = {
    name: "journal:flavor-html",
    transformIndexHtml(html) {
      if (!DOOR) return html;
      return html
        .replace(/\/icons\/icon-192\.svg/g, `/${FL.dir}/icon.svg`)
        .replace(/\/icons\/icon-192\.png"( sizes="192x192")?/g, (m, sz) => `/${FL.dir}/icon-192.png"${sz || ""}`)
        .replace(`<link rel="apple-touch-icon" href="/${FL.dir}/icon-192.png"`, `<link rel="apple-touch-icon" href="/${FL.dir}/apple-touch-icon.png"`)
        .replace('href="/favicon.ico"', `href="/${FL.dir}/favicon.ico"`)
        .replace(/Vital-Journal/g, FL.name)
        .replace('content="Journal"', `content="${FL.short}"`)
        .replace('content="#f59e0b"', 'content="#f6f6f2"')
        .replace("</head>", `<style>
      #splash { background: #f6f6f2; color: #0d0d0d; }
      #splash img { box-shadow: none; border-radius: 0; }
      #splash .s-name { color: #0d0d0d; }
      #splash .s-bar { background: rgba(13,13,13,.12); }
      #splash .s-bar i { background: #1738ff; }
    </style>
  </head>`);
    },
  };

  // coach builds to dist/ (local server), client builds to dist-firebase/ (for firebase deploy)
  const outDir = appMode === "client" ? "./dist-firebase" : "./dist";

  console.log(`🚀 Building for mode: ${mode}, APP_MODE: ${appMode} -> outDir: ${outDir}`);

  return {
    base: "/",
    define: {
      "import.meta.env.VITE_APP_MODE": JSON.stringify(appMode),
      __APP_VERSION__: JSON.stringify(APP_VERSION),
    },
    plugins: [
      flavorHtml,
      react(),
      VitePWA({
        base: "/",
        scope: "/",
        // "prompt": Update-Zeitpunkt steuert components/UpdateManager.jsx (kein Reload mitten im Tippen)
        registerType: "prompt",
        injectRegister: "auto",
        manifest: {
          name: FL ? FL.name : "Vital-Journal",
          short_name: FL ? FL.short : "Vital-Journal",
          description: "Journal + Habits auf VitalOS-Stack",
          theme_color: DOOR ? "#f6f6f2" : "#f59e0b",
          background_color: DOOR ? "#f6f6f2" : "#0b1018", // = Splash in index.html, kein Farbsprung
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: DOOR
            ? [
                { src: `/${FL.dir}/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
                { src: `/${FL.dir}/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
                { src: `/${FL.dir}/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
              ]
            : [
                { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
                { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
                { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
                { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
              ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api/, /^\/__\//],
          globIgnores: ["**/*.map", ...["icons", "icons-door", "icons-voice", "icons-game", "icons-tent"].filter((d) => d !== (FL ? FL.dir : "icons")).map((d) => `${d}/**`)],
          // Nur Google Fonts cachen; Firebase/Auth/Firestore/Vertex bewusst ohne Route (immer Netzwerk)
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "google-fonts-css",
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-files",
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
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
        "@journal-db": path.resolve(__dirname, "./src/db/index.js"),
        "@db":      path.resolve(__dirname, "./src/db/index.js"),
        "@utils":   path.resolve(__dirname, "./src/lib/db/core.js"),
        "@journal": path.resolve(__dirname, "./src"),
      },
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
        // Door Framework (aos/door):
        // - Potential/Hot List → aos server :7001, kanonischer Bridge-Endpoint
        //   /api/hotlist (server/routers/hotlist.py), Taskwarrior-SOT.
        // - Plan/Production/Profit → Door-Node-Server :6400 (prod; :9400 dev,
        //   aktuell nicht laufend), kanonischer Prefix /api/door laut
        //   ~/aos/lib/door_routes.yaml. Muss vor dem generischen "/api"-Eintrag
        //   stehen (Prefix-Match), ebenso /api/door vor /api/hotlist würde
        //   nicht überlappen, aber Reihenfolge trotzdem von spezifisch zu
        //   generisch halten.
        "/api/hotlist": "http://127.0.0.1:7001",
        "/api/hot": "http://127.0.0.1:7001",
        "/api/door": "http://127.0.0.1:6400",
        "/api": "http://127.0.0.1:9080",
      },
    },
  };
});

