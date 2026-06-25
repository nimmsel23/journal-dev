# Fuel Centre — Architektur

Stand: 2026-05-29

---

## Überblick

Hybrid-Architektur für maximale Flexibilität:
- **Lokal:** Fastify-Backend (Port 9000), JSON-Speicher in `data/`, SQLite Caches.
- **Cloud:** Firebase Hosting & Firestore. Ermöglicht 24/7 Nutzung der PWA unabhängig vom Laptop.
- **Sync:** Bidirektionaler Abgleich zwischen lokalem Dateisystem und Firestore.

---

## Daten-Layer & API-Routing

Die App nutzt in `src/lib/api.js` eine intelligente Weiche:

1.  **Detection:** Läuft die App auf `*.web.app` oder `*.firebaseapp.com`?
2.  **Routing:**
    -   **Lokal:** Requests gehen an den Node-Server (`/nutrition/...`).
    -   **Cloud:** Requests werden auf Firestore-Calls umgeleitet (`src/lib/firestore-db.js`).
    -   **Fallback:** Wenn der lokale Server nicht erreichbar ist, kann auch lokal auf Firestore ausgewichen werden.

---

## Backend (`src/app.mjs`)

**Fastify** mit `@fastify/cors`. Plugins in `src/routes/`.
Path-Normalisierung per `preHandler`-Hook: `/c/<clientId>/...` → bare path.

### Routing

```
GET  /health

# Nutrition
GET  /nutrition/search?q=&limit=       Open Food Facts proxy
GET  /nutrition/log?date=              Tages-Logs (YYYY-MM-DD.json)
POST /nutrition/log                    {meal: {description, catalog_id?, kcal, protein, carbs, fat}}
GET  /nutrition/catalog                Alle Meals aus catalogs/nutrition/meals/
POST /nutrition/catalog                Meal als {id}.json speichern
GET  /nutrition/daily/:date            Aggregierte Makros + Mikros für einen Tag
GET  /nutrition/weekly/:year/:week     Wochen-Mikros vs. DACH-Referenz
POST /nutrition/compose                wger + Gemini → Gericht komponieren, optional speichern
POST /nutrition/estimate               Gemini Makro-Schätzung ohne Save
GET  /nutrition/journal?date=
POST /nutrition/journal

# Supplements
GET  /supplements/catalog
POST /supplements/catalog
GET  /supplements/log?date=
POST /supplements/log
GET  /supplements/stats?days=&anchor=

# Legacy
GET|POST /fuel/log
```

---

## Datenspeicherung

### Laufzeit-Daten (`data/catalogs/`)

```
~/.aos/fuel/
├── nutrition/
│   ├── YYYY-MM-DD.json     Tages-Mahlzeiten
│   └── nutrition.db        SQLite (ingredients + meal_micros)
├── nutrition_journal/
│   └── YYYY-MM-DD.md
└── supplements/
    └── logs/
        └── YYYY-MM-DD.json
```

### Repo-Kataloge (`catalogs/`, git-tracked)

```
catalogs/
├── nutrition/
│   └── meals/
│       └── {id}.json       Ein File pro Gericht
└── supplements/
    └── catalog.json
```

Catalogs sind im Repo versioniert — portabel, backup-frei, direkt editierbar.

### SQLite (`nutrition.db`)

**`ingredients`** — wger API Cache, per 100g:
```sql
wger_id, name, brand, kcal, protein, carbs, fat, fiber, sodium_mg
```
Befüllt automatisch beim Compose.

**`meal_micros`** — Gemini-geschätztes Mikronährstoffprofil:
```sql
meal_name TEXT UNIQUE,
vitamin_b12_ug, calcium_mg, iron_mg, vitamin_d_ug, vitamin_e_mg,
folate_ug, magnesium_mg, zinc_mg, sodium_mg, potassium_mg,
source TEXT  -- 'gemini'
```
Lookup: `SELECT * FROM meal_micros WHERE meal_name = ? COLLATE NOCASE`

---

## Meal Catalog

Individuelle JSON-Files in `catalogs/nutrition/meals/`:

```json
{
  "id": "meal_eierspeise_freiland",
  "kind": "recipe",
  "category": "meal",
  "name": "Eierspeise Freiland",
  "meal_type": "meal",
  "description": "...",
  "kcal": 168, "protein": 15.1, "carbs": 0.6, "fat": 11.8,
  "components": [],
  "addons": [
    { "id": "freiland_2er", "label": "2 große Freiland-Eier", "grams": 120, "kcal": 168, ... }
  ],
  "default_addon_ids": ["freiland_2er"]
}
```

`nutrition-catalog.mjs` liest beim Start alle `*.json` aus dem Meals-Dir.
Neues Meal: `saveMeal(item)` → schreibt `{id}.json`.

---

## Mikronährstoff-Pipeline

```
User loggt Mahlzeit (via UI oder /nutrition/compose)
    │
    ├─ Makros: aus Meal-Katalog oder manuell eingegeben
    │
    └─ Mikros (async, beim Compose):
           gemini-micros "Mahlzeit-Beschreibung"
               → Gemini schätzt absolute Mikrowerte für die Portion wie gegessen
               → upsertMealMicros(mealName, micros) → SQLite meal_micros
```

**Aggregation** (weekly/daily):
1. Meal-Log laden → für jede Mahlzeit `getMealMicros(name)` aus SQLite
2. Mikros summieren → Tages-/Wochen-Totals
3. Vergleich mit DACH-Referenz (`src/config/dach.mjs`)

**Wochenheatmap** (`MicrosView.jsx`):
- 8 Wochen × 10 Mikronährstoffe
- Farbe: ≥90% grün, 50–89% amber, <50% rot, keine Daten grau
- Daten: `GET /nutrition/weekly/:year/:week` → `rda_comparison`

---

## Gemini Integration

Alle drei Scripts sind eigenständige Python-Executables im Repo-Root:

| Script | Input | Output |
|--------|-------|--------|
| `gemini-compose` | Mahlzeit-Beschreibung | `{kcal, protein, carbs, fat, components[]}` |
| `gemini-estimate` | Mahlzeit-Beschreibung | `{kcal, protein, carbs, fat}` |
| `gemini-micros` | Mahlzeit-Beschreibung | `{vitamin_b12_ug, calcium_mg, ...}` (absolute Werte) |

Config: `~/.env/fuel.env` (`GEMINI_API_KEY`, `GEMINI_MODEL=gemini-2.5-flash`)

---

## Frontend

### V1 / Fuel Classic (`public/index.html`)
- Vanilla HTML PWA, kein Build
- SW cache-first für Assets, network-first für API
- Kein Offline-Write-Through

### V2 / Fuel Studio (`src/main.jsx`)
- React 18, TailwindCSS 3, TanStack Query, FullCalendar, Recharts, Zod, Zustand
- **Tabs:** Dashboard · Food · Big Calendar · Journal · Supplements · Mikros · Setup
- **NutritionHeatmap** (Header): Wochennavigation mit Kcal-Level-Visualisierung
- **MicrosView**: DACH-Wochenheatmap (letzter 8 Kalenderwochen)

---

## Services-Übersicht

| Service | Was |
|---------|-----|
| `nutrition-db.mjs` | better-sqlite3: `ingredients` + `meal_micros` |
| `nutrition-catalog.mjs` | Meal-Files lesen/schreiben |
| `nutrition-micros.mjs` | Thin wrapper: `getMicrosForMeal`, `saveMicrosForMeal` |
| `nutrition-compose.mjs` | `gemini-compose` execFile wrapper |
| `nutrition-estimate.mjs` | `gemini-estimate` execFile wrapper |
| `nutrition-estimate-micros.mjs` | `gemini-micros` execFile wrapper |
| `nutrition-search.mjs` | Open Food Facts HTTPS proxy |
| `nutrition-log.mjs` | Tages-Log lesen/schreiben |
| `supplements-catalog.mjs` | `catalogs/supplements/catalog.json` |
| `supplements-log.mjs` | Supplement-Logs + Stats |
| `wger-search.mjs` | wger API Ingredient-Suche |

---

## Open

- Offline Write-Through POST-Queue (Vorbild: `~/core4-dev/public/offline-queue.js`)
- `fuel meal` CLI → schreibt via `/nutrition/log`
- Export-Endpoint: `GET /nutrition/export?from=&to=` → CSV
- Klienten-Auth für `/c/<id>/nutrition/…`
