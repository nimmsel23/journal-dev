import { z } from "zod";
import { loadCatalog, saveCatalog, addOrUpdateSupplement } from "../services/supplements-catalog.mjs";
import { loadLog, saveLog, addIntake, deleteIntake } from "../services/supplements-log.mjs";
import { isISODate, todayISO } from "../../shared/utils/validation.mjs";
import { SUPPLEMENTS_LOG_DIR } from "../config/paths.mjs";
import fs from "fs";
import path from "path";

const SYNC_PING_URL = process.env.FUEL_FIRESTORE_PING_URL || "http://127.0.0.1:9080/api/fuel-firestore/ping";
function fireSyncPing() {
  fetch(SYNC_PING_URL, { method: "POST", signal: AbortSignal.timeout(3000) })
    .then((r) => r.json())
    .then((body) => { if (!body.ok) console.warn("[fuel-firestore] sync warn:", body.error); })
    .catch((e) => console.warn("[fuel-firestore] sync unreachable:", e.message));
}

const catalogPostSchema = z.object({
  name: z.string().min(1),
  unit: z.string().optional(),
  default_dose: z.coerce.number().optional(),
  default_time_of_day: z.string().optional(),
});

const logPostSchema = z.object({
  date: z.string().optional(),
  intake: z.object({
    supplement_id: z.string().min(1),
    name: z.string().optional(),
    dose: z.coerce.number().optional(),
    unit: z.string().optional(),
    time_of_day: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  delete_id: z.string().optional(),
});

const statsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
  anchor: z.string().optional(),
});

export default async function supplementsRoute(app) {
  // GET /supplements/catalog
  app.get("/supplements/catalog", async (_req, reply) => {
    const catalog = loadCatalog();
    return reply.send({ ok: true, items: catalog.items || [] });
  });

  // POST /supplements/catalog
  app.post("/supplements/catalog", async (req, reply) => {
    try {
      const parsed = catalogPostSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return reply.status(400).send({ ok: false, error: "Invalid data" });
      }

      const catalog = loadCatalog();
      const item = addOrUpdateSupplement(catalog, parsed.data);

      if (!item) {
        return reply.status(400).send({ ok: false, error: "Name required" });
      }

      saveCatalog(catalog);
      return reply.send({ ok: true, item });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ ok: false, error: "Internal server error" });
    }
  });

  // GET /supplements/log?date=YYYY-MM-DD
  app.get("/supplements/log", async (req, reply) => {
    const date = (req.query.date || todayISO()).toString();
    if (!isISODate(date)) {
      return reply.status(400).send({ ok: false, error: "Invalid date" });
    }
    const log = loadLog(date);
    return reply.send({ ok: true, data: log });
  });

  // POST /supplements/log
  app.post("/supplements/log", async (req, reply) => {
    try {
      const parsed = logPostSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return reply.status(400).send({ ok: false, error: "Invalid data" });
      }

      const date = (parsed.data.date || todayISO()).toString();
      if (!isISODate(date)) {
        return reply.status(400).send({ ok: false, error: "Invalid date" });
      }

      const log = loadLog(date);

      if (parsed.data.intake) {
        const intake = addIntake(log, parsed.data.intake);
        if (!intake) {
          return reply.status(400).send({ ok: false, error: "Invalid intake" });
        }
      }

      if (parsed.data.delete_id) {
        deleteIntake(log, parsed.data.delete_id);
      }

      saveLog(log);
      fireSyncPing();
      return reply.send({ ok: true, data: log });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ ok: false, error: "Internal server error" });
    }
  });

  // GET /supplements/stats?days=30&anchor=YYYY-MM-DD
  app.get("/supplements/stats", async (req, reply) => {
    try {
      const parsed = statsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return reply.status(400).send({ ok: false, error: "Invalid query" });
      }

      const { days, anchor } = parsed.data;
      const anchorDate = anchor && isISODate(anchor) ? anchor : todayISO();
      const startDate = new Date(anchorDate);
      startDate.setDate(startDate.getDate() - days + 1);

      const stats = {};
      const catalog = loadCatalog();

      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        const logPath = path.join(SUPPLEMENTS_LOG_DIR, `${dateStr}.json`);

        if (fs.existsSync(logPath)) {
          const log = loadLog(dateStr);
          for (const intake of log.intakes || []) {
            const suppId = intake.supplement_id;
            if (!stats[suppId]) {
              const catalogItem = catalog.items.find((i) => i.id === suppId);
              stats[suppId] = {
                supplement: catalogItem || { id: suppId, name: intake.name },
                days_taken: 0,
                current_streak: 0,
              };
            }
            stats[suppId].days_taken += 1;
          }
        }
      }

      // Calculate streaks: backwards from anchor, skip today if not yet logged
      const todayStr = todayISO();
      for (const suppId in stats) {
        let streak = 0;
        for (let i = 0; i < days; i++) {
          const d = new Date(anchorDate);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          const logPath = path.join(SUPPLEMENTS_LOG_DIR, `${dateStr}.json`);
          const hasIntake = fs.existsSync(logPath) &&
            loadLog(dateStr).intakes.some((intake) => intake.supplement_id === suppId);
          if (hasIntake) { streak += 1; }
          else if (dateStr === todayStr) { continue; } // heute noch nicht geloggt → nicht brechen
          else { break; }
        }
        stats[suppId].current_streak = streak;
      }

      return reply.send({ ok: true, anchor: anchorDate, days, stats: Object.values(stats) });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ ok: false, error: "Internal server error" });
    }
  });
}
