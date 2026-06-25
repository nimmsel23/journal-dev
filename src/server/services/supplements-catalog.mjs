import { readYamlFile, writeYamlFile } from "../lib/file-io.mjs";
import { slugifyId } from "../../shared/utils/ids.mjs";
import { SUPPLEMENTS_CATALOG_PATH } from "../config/paths.mjs";

const CATALOG_DEFAULTS = {
  version: 1,
  updated_at: new Date().toISOString(),
  items: [],
};

export function loadCatalog() {
  const catalog = readYamlFile(SUPPLEMENTS_CATALOG_PATH, CATALOG_DEFAULTS);
  if (!catalog.items) catalog.items = [];
  return catalog;
}

export function saveCatalog(catalog) {
  catalog.updated_at = new Date().toISOString();
  writeYamlFile(SUPPLEMENTS_CATALOG_PATH, catalog);
}

export function addOrUpdateSupplement(catalog, input) {
  const name = (input.name || "").toString().trim();
  if (!name) return null;

  const id = input.id || slugifyId(name, "supp");
  const unit = (input.unit || "mg").toString().trim() || "mg";
  const defaultDose = input.default_dose == null ? null : Number(input.default_dose);
  const defaultTime = (input.default_time_of_day || "any").toString().trim() || "any";

  const item = {
    id,
    name,
    unit,
    default_dose: defaultDose,
    default_time_of_day: defaultTime,
  };

  const idx = catalog.items.findIndex((i) => i.id === id);
  if (idx >= 0) {
    catalog.items[idx] = item;
  } else {
    catalog.items.push(item);
  }

  return item;
}
