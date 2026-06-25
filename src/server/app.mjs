import Fastify from "fastify";
import cors from "@fastify/cors";
import { PORT, HOST } from "../shared/config/constants.mjs";
import { initializePaths, getPaths } from "./config/paths.mjs";
import { normalizeRoutedPath } from "../shared/utils/validation.mjs";
import { getUidForClient } from "./lib/client-manager.mjs";

// Import all route handlers
import healthRoute from "./routes/health.mjs";
import nutritionRoute from "./routes/nutrition/index.mjs";
import supplementsRoute from "./routes/supplements.mjs";
import supplementEstimateRoute from "./routes/supplement-estimate.mjs";
import fuelRoute from "./routes/fuel.mjs";
import staticRoute from "./routes/static.mjs";


export function createApp() {
  // Initialize data directories
  initializePaths();

  const app = Fastify({ logger: true });

  // CORS
  app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: false,
  });

  // Path normalization hook (handles /c/<clientId>/ prefixes)
  app.addHook("preHandler", (req, _reply, done) => {
    req.routedPath = normalizeRoutedPath(req.url.split("?")[0], req);
    req.paths = getPaths(req.clientId);
    req.uid = getUidForClient(req.clientId);
    done();
  });

  // Register routes explicitly (ignoring fuel_routes.yaml for Node.js stability)
  app.register(healthRoute);
  app.register(nutritionRoute);
  app.register(supplementsRoute);
  app.register(supplementEstimateRoute);
  app.register(fuelRoute);
  app.register(staticRoute); // staticRoute handles catch-all, must be last

  // Error handler
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    reply.status(500).send({ ok: false, error: "Internal server error" });
  });

  return app;
}

const SYNC_PULL_URL = process.env.FUEL_FIRESTORE_PING_URL || "http://127.0.0.1:9080/api/fuel-firestore/ping";

async function pullFromFirestoreOnStart() {
  try {
    const uid = process.env.FUEL_CLOUD_UID || "default";
    const headers = { "Content-Type": "application/json", "X-Fuel-UID": uid };
    
    const r = await fetch(SYNC_PULL_URL, { 
      method: "POST", 
      headers,
      signal: AbortSignal.timeout(5000) 
    });
    const body = await r.json();
    if (body.ok) {
      console.log("[fuel-firestore] startup pull ok:", JSON.stringify(body));
    } else {
      console.warn("[fuel-firestore] startup pull warn:", body.error);
    }
  } catch (e) {
    console.warn("[fuel-firestore] startup pull unreachable:", e.message);
  }
}


export async function startServer() {
  const app = createApp();
  await app.listen({ port: PORT, host: HOST });
  console.log(`🍽️  Fuel Centre running on http://${HOST}:${PORT}`);
  pullFromFirestoreOnStart();
}
