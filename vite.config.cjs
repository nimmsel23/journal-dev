const { defineConfig, loadEnv } = require("vite");
const react = require("@vitejs/plugin-react");
const { VitePWA } = require("vite-plugin-pwa");

module.exports = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appMode = process.env.VITE_APP_MODE || env.VITE_APP_MODE || "coach";

  // coach builds to dist/ (local server), client builds to dist-firebase/ (for firebase deploy)
  const outDir = appMode === "client" ? "./dist-firebase" : "./dist";

  console.log(`🚀 Building for mode: ${mode}, APP_MODE: ${appMode} -> outDir: ${outDir}`);

  return {
    base: "/",
    define: {
      "import.meta.env.VITE_APP_MODE": JSON.stringify(appMode),
    },
    plugins: [
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
      alias: {
        "@db":    require("path").resolve(__dirname, "./src/db.js"),
        "@utils": require("path").resolve(__dirname, "./src/lib/db/core.js"),
        "@fuel":  require("path").resolve("/home/alpha/fuel-dev/src/client"),
      },
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
