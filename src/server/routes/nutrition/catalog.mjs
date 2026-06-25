import { z } from "zod";
import { loadCatalog, saveCatalog, addOrUpdateItem, deleteMeal } from "../../services/nutrition-catalog.mjs";

const catalogPostSchema = z.object({
  item: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    kcal: z.coerce.number().optional(),
    protein: z.coerce.number().optional(),
    carbs: z.coerce.number().optional(),
    fat: z.coerce.number().optional(),
  }).optional(),
});

export default async function catalogRoute(app) {
  // GET /nutrition/catalog
  app.get("/nutrition/catalog", async (req, reply) => {
    const catalog = loadCatalog();
    return reply.send({ ok: true, items: catalog.items || [] });
  });

  // POST /nutrition/catalog
  app.post("/nutrition/catalog", async (req, reply) => {
    try {
      const parsed = catalogPostSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return reply.status(400).send({ ok: false, error: "Invalid data" });
      }
      const catalog = loadCatalog();
      const item = addOrUpdateItem(catalog, parsed.data.item || {});
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

  // DELETE /nutrition/catalog/:id
  app.delete("/nutrition/catalog/:id", async (req, reply) => {
    try {
      const { id } = req.params;
      if (!id) return reply.status(400).send({ ok: false, error: "ID required" });
      deleteMeal(id);
      return reply.send({ ok: true });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ ok: false, error: "Internal server error" });
    }
  });
}
