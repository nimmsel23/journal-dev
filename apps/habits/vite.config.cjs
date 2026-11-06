const { defineConfig, loadEnv } = require("vite");
const react = require("@vitejs/plugin-react");
const { VitePWA } = require("vite-plugin-pwa");
const path = require("path");
const { createRequire } = require("module");

// ../package.json existiert nur, wenn dieses Repo als vitalos-Submodule
// eingebunden ist (~/vitalos/habit-app). Standalone (~/dev/habits-dev, "../"
// = ~/) gibt es keine vitalos-Root — dann auf eigenes package.json/
// node_modules zurückfallen.
const fs = require("fs");
const VITALOS_ROOT_PKG = path.resolve(__dirname, "../package.json");
const requireFromRoot = createRequire(
  fs.existsSync(VITALOS_ROOT_PKG) ? VITALOS_ROOT_PKG : path.resolve(__dirname, "package.json")
);
const ROOT_FIREBASE = fs.existsSync(VITALOS_ROOT_PKG)
  ? path.resolve(__dirname, "../node_modules/firebase")
  : path.resolve(__dirname, "node_modules/firebase");

// Nachbar-Repos: die vitalos-Submodule-Checkouts (master = firebase-first,
// modulare Firestore-Layer). Die Home-Worktrees sind dev-Playgrounds.
function resolveSibling(nameApp, nameDev) {
  const pApp = path.resolve(__dirname, `../../../${nameApp}`);
  if (fs.existsSync(pApp)) return pApp;
  return path.resolve(__dirname, `../../../${nameDev}`);
}

const FITNESS = resolveSibling("fitness-app", "fitness-dev");
const VOS_FITNESS = fs.existsSync(path.resolve(__dirname, "../vitalos/fitness-app")) ? path.resolve(__dirname, "../vitalos/fitness-app") : FITNESS;
const FUEL = resolveSibling("fuel-app", "fuel-dev");
const RELAX = resolveSibling("relax-app", "relax-dev");
// Journal is owned by this repository; no nested submodule.
const JOURNAL = path.resolve(__dirname, "../..");
if (!fs.existsSync(path.join(JOURNAL, "src/routes.js"))) {
  throw new Error("Journal-Quellen fehlen im gemeinsamen Repo");
}

// Cross-App-Aliase, vollständig hier definiert (kein Paket mehr). Reihenfolge ist Absicht: Vite
// matcht Alias-Keys in Objekt-Reihenfolge, spezifischere Keys ('@fitness/hooks') müssen vor den
// kurzen ('@fitness') stehen. Alle Sibling-Pfade kommen aus resolveSibling()/JOURNAL oben und sind
// damit in jedem Kontext (~/dev, ~/vitalos/<x>-app, CI) dieselben, auch die des Mini-App-Resolvers
// (miniAppSubmodulePlugin(FITNESS)). Das frühere Paket @vos/cross-app-aliases zeigte immer auf
// ~/vitalos/fitness-app, der Resolver nur auf FITNESS: nach dem Umzug nach ~/dev passte das nicht mehr
// zusammen (PWA-Build: "Could not resolve ../../../views/SixPack/workoutDoc.js"), und der Lockfile
// kippte je nach Installationsort (link:../vitalos/… vs. workspace:*).
function resolveCrossAppAliases() {
  return {
    "@fitness/components": path.resolve(FITNESS, "src/components"),
    "@fitness/constants":  path.resolve(FITNESS, "src/constants"),
    "@fitness/lib":        path.resolve(FITNESS, "src/lib"),
    "@fitness/hooks":      path.resolve(FITNESS, "src/hooks"),
    "@fitness-db":         path.resolve(FITNESS, "src/lib/db"),
    "@fitness":            FITNESS,
    "@fuel-db":            path.resolve(FUEL, "src/client/lib/db"),
    "@fuel-views":         path.resolve(FUEL, "src/client/views"),
    "@fuel":               path.resolve(FUEL, "src/client"),
    "@journal-db":         path.resolve(JOURNAL, "src/db/index.js"),
    "@journal":            path.resolve(JOURNAL, "src"),
    "@habits-db":          path.resolve(__dirname, "src/db"),
    "@habits":             path.resolve(__dirname, "src"),
    "@relax-db":           path.resolve(RELAX, "src/lib/db"),
    "@relax":              path.resolve(RELAX, "src"),
  };
}

module.exports = defineConfig(async ({ mode }) => {
  const { miniAppSubmodulePlugin } = await import(path.join(FITNESS, "vite-miniapp-submodules.mjs"));
  const env = loadEnv(mode, process.cwd(), "");
  const appMode = process.env.VITE_APP_MODE || env.VITE_APP_MODE || "coach";
  const crossAppAliases = resolveCrossAppAliases();
  const { vosChangelog } = await import("./scripts/vos-changelog/vos-changelog-vite.mjs");

  // fitness-dev/src/firebase.js auf habits' eigene lib/firebase.js umleiten —
  // genau eine initializeApp im Bundle (Muster: vitalos
  // vitalos:subrepo-firebase-redirect). enforce:'pre' nötig, damit der Hook
  // vor vite:resolve läuft.
  const HABITS_FIREBASE = path.resolve(__dirname, "src/lib/firebase.js");
  const SUBREPO_FIREBASE = new Set([
    path.resolve(FITNESS, "src/firebase.js"),
    path.resolve(FUEL, "src/client/lib/firebase.js"),
    path.resolve(JOURNAL, "src/lib/firebase.js"),
    path.resolve(RELAX, "src/firebase.js"),
  ]);
  const firebaseRedirect = {
    name: "habits:subrepo-firebase-redirect",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer || !source.startsWith(".")) return null;
      const resolved = path.resolve(path.dirname(importer.split("?")[0]), source);
      if (SUBREPO_FIREBASE.has(resolved) || SUBREPO_FIREBASE.has(`${resolved}.js`)) {
        return HABITS_FIREBASE;
      }
      return null;
    },
  };

  const outDir = appMode === "client" ? "./dist-firebase" : "./dist";

  console.log(`🚀 Building for mode: ${mode}, APP_MODE: ${appMode} -> outDir: ${outDir}`);

  return {
    base: "./",
    define: {
      "import.meta.env.VITE_APP_MODE": JSON.stringify(appMode),
    },
    plugins: [
      vosChangelog({ appId: "habits", appName: "Habits", accent: "#fb923c" }),
      firebaseRedirect,
      miniAppSubmodulePlugin(FITNESS),
      // cross-app-aliases zeigen auf ~/vitalos/fitness-app; liegt FITNESS woanders (Home-Worktree
      // ~/dev/fitness-dev), braucht dieser Quellbaum denselben Resolver für views/{Plan,SixPack,Skills}.
      ...(VOS_FITNESS !== FITNESS ? [miniAppSubmodulePlugin(VOS_FITNESS)] : []),
      react(),
      VitePWA({
        base: "/",
        scope: "/",
        registerType: "autoUpdate",
        injectRegister: "auto",
        manifest: {
          name: "VOS Habits",
          short_name: "Habits",
          description: "Habits auf VitalOS-Stack",
          theme_color: "#fb923c",
          background_color: "#0f172a",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            { src: "/favicon.svg", sizes: "192x192 512x512", type: "image/svg+xml", purpose: "any maskable" }
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api/, /^\/nutrition/, /^\/supplements/, /^\/fuel/, /^\/health/],
          runtimeCaching: [
            {
              urlPattern: /^\/api\//,
              handler: "NetworkFirst",
              options: {
                cacheName: "habits-api",
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
        ...crossAppAliases,
        "@journal-db": path.resolve(JOURNAL, "src/db/index.js"),
        "@journal": path.resolve(JOURNAL, "src"),
        "@habits-db": path.resolve(__dirname, "./src/db/index.js"),
        "@db":      path.resolve(__dirname, "./src/db/index.js"),
        "@utils":   path.resolve(__dirname, "./src/db/index.js"),
        "@habits":  path.resolve(__dirname, "./src"),
        "@constants": path.resolve(FITNESS, "src/constants"),
        "@api": path.resolve(FUEL, appMode === "client" ? "src/client/lib/api.cloud.js" : "src/client/lib/api.local.js"),
        // Eigene Kopie statt ../firebase.config.js (galt nur im vitalos-
        // Submodule-Checkout) — gleicher Firebase-Projekt-Wert, aber ohne
        // Abhängigkeit vom Nachbarverzeichnis (Standalone-Bug-Klasse s.o.).
        "@firebase-config": path.resolve(__dirname, "src/lib/firebase.config.js"),
        "firebase": ROOT_FIREBASE,
        "firebase/app": requireFromRoot.resolve("firebase/app"),
        "firebase/auth": requireFromRoot.resolve("firebase/auth"),
        "firebase/firestore": requireFromRoot.resolve("firebase/firestore"),
        "firebase/vertexai": requireFromRoot.resolve("firebase/vertexai"),
        "firebase/ai": requireFromRoot.resolve("firebase/ai"),
      },
      // "firebase" hier zwingend: fitness-dev/fuel-dev importieren firebase/auth
      // und firebase/firestore auch direkt (nicht nur über firebase.js), und
      // haben dort eine andere Firebase-Version im eigenen node_modules.
      // Ohne dedupe entstehen zwei SDK-Instanzen -> "Component auth has not
      // been registered yet".
      dedupe: [
        "react", "react-dom", "@tanstack/react-query",
        "firebase", "firebase/app", "firebase/firestore", "firebase/auth",
        "firebase/ai", "firebase/vertexai",
      ],
    },
    build: {
      manifest: true,
      outDir,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react":    ["react", "react-dom"],
            "vendor-query":    ["@tanstack/react-query"],
            "vendor-firebase": ["firebase/app", "firebase/firestore", "firebase/auth"],
          },
        },
      },
    },
    server: {
      host: "127.0.0.1",
      port: 9002,
      hmr: {
        host: "127.0.0.1",
        port: 9002,
      },
      proxy: {
        "/api":    "http://127.0.0.1:9080",
        "/health": "http://127.0.0.1:9080",
      },
    },
  };
});
