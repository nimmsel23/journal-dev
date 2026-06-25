import { z } from "zod";
import { isISODate, todayISO } from "../../../shared/utils/validation.mjs";
import path from "path";
import fs from "fs";
import { loadCatalog } from "../../services/nutrition-catalog.mjs";

const logPostSchema = z.object({
  date: z.string().optional(),
  meal: z.object({
    type: z.string().optional(),
    description: z.string().min(1),
    notes: z.string().optional(),
    catalog_id: z.string().optional(),
    kcal: z.coerce.number().min(0).optional(),
    protein: z.coerce.number().min(0).optional(),
    carbs: z.coerce.number().min(0).optional(),
    fat: z.coerce.number().min(0).optional(),
  }).optional(),
  // Quicklog from catalog: resolve macros server-side
  catalog_item_id: z.string().optional(),
  catalog_addon_ids: z.array(z.string()).optional(),
  delete_meal_id: z.string().optional(),
  water_ml: z.coerce.number().optional(),
});

function loadLog(date, nutritionDir) {
  const filePath = path.join(nutritionDir, `${date}.json`);
  if (fs.existsSync(filePath)) {
    try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch { /* fall through */ }
  }
  return { date, meals: [], water_ml: 0 };
}

function saveLog(log, nutritionDir) {
  fs.writeFileSync(path.join(nutritionDir, `${log.date}.json`), JSON.stringify(log, null, 2), "utf-8");
}

function resolveCatalogItem(catalog, catalogItemId, addonIds = []) {
  const item = catalog.items.find((i) => i.id === catalogItemId);
  if (!item) return null;

  const addonSet = new Set(addonIds.length > 0 ? addonIds : (item.default_addon_ids || []));
  const selectedAddons = (item.addons || []).filter((a) => addonSet.has(a.id));

  const base = { kcal: item.kcal || 0, protein: item.protein || 0, carbs: item.carbs || 0, fat: item.fat || 0 };
  const totals = selectedAddons.reduce(
    (acc, a) => ({
      kcal:    acc.kcal    + (a.kcal    || 0),
      protein: acc.protein + (a.protein || 0),
      carbs:   acc.carbs   + (a.carbs   || 0),
      fat:     acc.fat     + (a.fat     || 0),
    }),
    base
  );

  const addonLabel = selectedAddons.map((a) => a.label).join(", ");
  const description = addonLabel ? `${item.name} (${addonLabel})` : item.name;

  return {
    catalog_id: item.id,
    type: item.meal_type || "meal",
    description,
    notes: item.notes || "",
    kcal:    Math.round(totals.kcal    * 10) / 10,
    protein: Math.round(totals.protein * 10) / 10,
    carbs:   Math.round(totals.carbs   * 10) / 10,
    fat:     Math.round(totals.fat     * 10) / 10,
  };
}

const logPatchSchema = z.object({
  date: z.string().optional(),
  meal_id: z.string().min(1),
  new_date: z.string().optional(),
  meal: z.object({
    type: z.string().optional(),
    description: z.string().min(1).optional(),
    notes: z.string().optional(),
    kcal: z.coerce.number().min(0).optional(),
    protein: z.coerce.number().min(0).optional(),
    carbs: z.coerce.number().min(0).optional(),
    fat: z.coerce.number().min(0).optional(),
  }).optional(),
});

const SYNC_PING_URL = process.env.FUEL_FIRESTORE_PING_URL || "http://127.0.0.1:9080/api/fuel-firestore/ping";

function fireSyncPing(uid) {
  const headers = { "Content-Type": "application/json", "X-Fuel-UID": uid };
  fetch(SYNC_PING_URL, { method: "POST", headers, signal: AbortSignal.timeout(3000) })
    .then((r) => r.json())
    .then((body) => { if (!body.ok) console.warn(`[fuel-firestore] sync warn (${uid}):`, body.error); })
    .catch((e) => console.warn(`[fuel-firestore] sync unreachable (${uid}):`, e.message));
}

export default async function logRoute(app) {
  app.get("/nutrition/log", async (req, reply) => {
    const date = (req.query.date || todayISO()).toString();
    if (!isISODate(date)) return reply.status(400).send({ ok: false, error: "Invalid date" });
    return reply.send({ ok: true, data: loadLog(date, req.paths.nutrition) });
  });

  app.patch("/nutrition/log", async (req, reply) => {
    try {
      const parsed = logPatchSchema.safeParse(req.body || {});
      if (!parsed.success) return reply.status(400).send({ ok: false, error: "Invalid data" });

      const { meal_id, meal: updates, new_date } = parsed.data;
      const date = (parsed.data.date || todayISO()).toString();
      if (!isISODate(date)) return reply.status(400).send({ ok: false, error: "Invalid date" });
      if (new_date && !isISODate(new_date)) return reply.status(400).send({ ok: false, error: "Invalid new_date" });

      const sourceLog = loadLog(date, req.paths.nutrition);
      const mealIndex = sourceLog.meals.findIndex((m) => m.id === meal_id);
      if (mealIndex === -1) return reply.status(404).send({ ok: false, error: "Meal not found" });

      const meal = { ...sourceLog.meals[mealIndex] };

      if (updates) {
        Object.assign(meal, Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined)));
      }

      if (new_date && new_date !== date) {
        sourceLog.meals.splice(mealIndex, 1);
        saveLog(sourceLog, req.paths.nutrition);
        const targetLog = loadLog(new_date, req.paths.nutrition);
        targetLog.meals.push({ ...meal, id: `meal_${Date.now()}` });
        saveLog(targetLog, req.paths.nutrition);
        fireSyncPing(req.uid);
        return reply.send({ ok: true, data: targetLog });
      } else {
        sourceLog.meals[mealIndex] = meal;
        saveLog(sourceLog, req.paths.nutrition);
        fireSyncPing(req.uid);
        return reply.send({ ok: true, data: sourceLog });
      }
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ ok: false, error: "Internal server error" });
    }
  });

  app.post("/nutrition/log", async (req, reply) => {
    try {
      const parsed = logPostSchema.safeParse(req.body || {});
      if (!parsed.success) return reply.status(400).send({ ok: false, error: "Invalid data" });

      const date = (parsed.data.date || todayISO()).toString();
      if (!isISODate(date)) return reply.status(400).send({ ok: false, error: "Invalid date" });

      const log = loadLog(date, req.paths.nutrition);

      if (parsed.data.catalog_item_id) {
        const catalog = loadCatalog();
        const resolved = resolveCatalogItem(catalog, parsed.data.catalog_item_id, parsed.data.catalog_addon_ids);
        if (!resolved) return reply.status(404).send({ ok: false, error: "Catalog item not found" });
        log.meals.push({ id: `meal_${Date.now()}`, ...resolved, time: new Date().toISOString() });
      } else if (parsed.data.meal) {
        const m = parsed.data.meal;
        log.meals.push({
          id: `meal_${Date.now()}`,
          catalog_id: m.catalog_id || null,
          type: m.type || "meal",
          description: m.description,
          notes: m.notes || "",
          kcal: m.kcal || 0, protein: m.protein || 0, carbs: m.carbs || 0, fat: m.fat || 0,
          time: new Date().toISOString(),
        });
      }

      if (parsed.data.delete_meal_id) {
        log.meals = log.meals.filter((m) => m.id !== parsed.data.delete_meal_id);
      }
      if (parsed.data.water_ml !== undefined) {
        log.water_ml = parsed.data.water_ml;
      }

      saveLog(log, req.paths.nutrition);
      fireSyncPing(req.uid);
      return reply.send({ ok: true, data: log });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ ok: false, error: "Internal server error" });
    }
  });
}
