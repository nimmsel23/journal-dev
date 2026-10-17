# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Philosophy: Ernährung als Religion im Vitaltraining

```
VITALTRAINING (Der eine Gott — The Ultimate Authority)
│
└─ ERNÄHRUNG (Die Religion — Nutrition Philosophy & Practice)
   │
   ├─ DU (Lernender/Coach)
   │  └─ Focus: Ausbildung, Weisheit, Ernährungsprinzipien
   │
   ├─ nutrition-agent (Der Prophet — Technical Guardian)
   │  ├─ Kernaufgabe: Deine Ausbildung unterstützen
   │  │  (Protokolle, Daily Logging, Reporting, Analysis)
   │  └─ Technische Verantwortung: fuel-dev
   │     → Erkennt: "fuel-dev braucht Feature X"
   │     → Schreibt Tickets für fuel-dev-coding-agent
   │     → Du machst dich NICHT um Technisches Gedanken
   │
   └─ fuel-dev (Der Tempel — Where It Happens)
      ├─ Zwei Channels: **local** (Fastify, /opt/fuel) + **cloud** (Firebase PWA)
      ├─ Fastify API + SQLite + File-based Data (local channel, VITE_APP_MODE=coach)
      ├─ Firebase/Firestore (cloud channel, VITE_APP_MODE=client — fuel-vos.web.app)
      └─ Komponenten
         ├─ Meal Catalog (individuelle JSON-Files lokal / Firestore cloud)
         ├─ Supplements Catalog (catalog.yaml im Repo / Firestore cloud)
         ├─ Food Search (Open Food Facts Proxy lokal / Catalog-Suche cloud)
         ├─ Micros Tracking (DACH-Referenzwerte, Wochenheatmap)
         ├─ Journal (Freitext-Notizen)
         └─ Gemini Integration (Makro- + Mikroschätzung, nur lokal)
```

**The Model: Clear Separation of Concerns**

| Wer | Was | Fokus |
|-----|-----|-------|
| **Du** | Lernst Ernährung, machst Protokolle, ißt bewusst | Ausbildung & Weisheit |
| **nutrition-agent** | Unterstützt deine Ausbildung, erkennt technische Lücken, schreibt Tickets | Technische Probleme lösen |
| **fuel-dev-coding-agent** | Implementiert Tickets, baut Features | Code & Funktionalität |

---

## Project Overview

**Fuel Centre** (`fuelctx`) ist ein Nutrition-Tracking-PWA für Coaches — mit zwei Channels:

| Channel | Stack | Build-Mode | Deployment | Daten |
|---------|-------|------------|------------|-------|
| **local** | Fastify + SQLite + File-JSON | `VITE_APP_MODE=coach` | Port 9000 Dev / 7000 Prod (`/opt/fuel`) | `~/.aos/fuel/` |
| **cloud** | Firebase Hosting + Firestore | `VITE_APP_MODE=client` | [fuel-vos.web.app](https://fuel-vos.web.app) | Firestore (per User) |

Beide Channels teilen sich **dieselbe React-Codebase** in `src/client/` — Unterschied liegt nur im Build-Mode + Runtime-Detection via `isCloud()` in `src/client/lib/api.js`.

**Ports:**
- Dev: 9000 (`server.mjs` → `src/server/app.mjs`)
- Vite dev: 5173
- local Prod: 7000 (static, `fuel-v2.service` — Unit-Name historisch, channel ist "local")
- cloud: `https://fuel-vos.web.app`

**Data location (local):** `~/.aos/fuel/` (via `AOS_FUEL_DATA_DIR`)
**Data location (cloud):** Firestore — Collections `nutrition/{uid}/logs`, `supplements/{uid}/logs`, `users/{uid}/meta`
**Catalogs:** Im Repo unter `catalogs/` (git-tracked, local); Firestore `nutrition/{uid}/meta/catalog` (cloud)
**Build output local:** `/opt/fuel` (via `FUEL_BUILD_DIR`)
**Build output cloud:** `./dist-firebase/` → Firebase Hosting

---

## Quick Start

```bash
npm install
npm run dev          # nodemon + vite dev (Port 9000 + 5173)
npm run build:local  # Vite build → coach mode (für /opt/fuel)
npm run build:cloud  # Vite build → client mode → dist-firebase/
npm run prod         # static server port 7000
npm start            # bare server port 9000
npm run ui:dev       # Vite dev only (kein Backend)

# Deploy
npm run deploy:local # ./deploy.sh — rsync + build + systemctl restart
npm run deploy:cloud # build:cloud + firebase deploy --only hosting
./deploy.sh          # direkt (= deploy:local)

# Sync
npm run sync:push    # lokale Katalog-Daten → Firestore
npm run sync:pull    # Firestore → lokale Dateien
```

Der `post-commit`-Hook triggert `build:cloud` + Firebase-Deploy automatisch, sobald Dateien unter `src/client/`, `src/shared/`, `index.html`, `vite.config.js` oder `package.json` geändert werden.

---

## Architecture

### Backend (`server.mjs` → `src/app.mjs`)

**Fastify** mit `@fastify/cors`. Routes als Plugins in `src/routes/`.
Path-Normalisierung per `preHandler`-Hook: `/c/<clientId>/nutrition/…` → `/nutrition/…`.

**Endpoints:**
```
GET  /health
GET  /nutrition/search?q=&limit=      Open Food Facts proxy
GET  /nutrition/log?date=             Tages-Mahlzeiten
POST /nutrition/log                   Mahlzeit loggen {description, catalog_id?, kcal, protein, carbs, fat}
GET  /nutrition/catalog               Alle Meals (aus catalogs/nutrition/meals/)
POST /nutrition/catalog               Meal speichern
GET  /nutrition/daily/:date           Tages-Makros + Mikros aggregiert
GET  /nutrition/weekly/:year/:week    Wochen-Mikros vs. DACH-Referenz
POST /nutrition/compose               Gericht via wger + Gemini komponieren
POST /nutrition/estimate              Gemini Makro-Schätzung (kein Save)
GET  /nutrition/journal?date=
POST /nutrition/journal
GET  /supplements/catalog
POST /supplements/catalog
GET  /supplements/log?date=
POST /supplements/log
GET  /supplements/stats?days=&anchor=
GET  /fuel/log, POST /fuel/log        legacy
```

**Datenpfade (runtime, auto-created):**
```
~/.aos/fuel/
├── nutrition/
│   ├── YYYY-MM-DD.json     tägliche Mahlzeit-Logs
│   └── nutrition.db        SQLite: ingredients + meal_micros
├── nutrition_journal/
│   └── YYYY-MM-DD.md
└── supplements/
    ├── logs/YYYY-MM-DD.json
    └── (catalog in Repo)
```

**Catalogs (repo-basiert, git-tracked):**
```
catalogs/
├── nutrition/
│   └── meals/
│       └── {id}.json       ein File pro Gericht
└── supplements/
    └── catalog.yaml
```

### SQLite (`nutrition.db`)

Zwei Tabellen:

**`ingredients`** — wger-Ingredient-Cache, per 100g:
- `wger_id`, `name`, `brand`, Makros (`kcal`, `protein`, `carbs`, `fat`, `fiber`, `sodium_mg`)
- Befüllt beim Compose via `/nutrition/compose`

**`meal_micros`** — Gemini-geschätztes Mikronährstoffprofil pro Mahlzeit:
- `meal_name` (Mahlzeit-Bezeichnung), alle DACH-Mikros als absolute Werte für die Portion wie gegessen
- `source`: `gemini`
- Lookup per Name (case-insensitive)

### Micros / DACH

Referenzwerte: `src/config/dach.mjs` — DGE/ÖGE Werte für D/A/CH.
Mikronährstoffe werden **nicht** täglich eingetragen — Gemini schätzt sie beim Compose für die ganze Mahlzeit.
Wochenheatmap (Mikros-Tab) aggregiert meal_micros-Werte pro Woche vs. DACH.

### Frontend

**Classic** (`public/index.html`) — Legacy, weiter mitserved
- Vanilla HTML PWA, kein Build-Schritt
- SW: cache-first für Assets, network-first für API
- Kein Offline-Write-Through

**local channel** (`src/client/main.jsx` + Vite, `VITE_APP_MODE=coach`)
- React 18, TailwindCSS 3, TanStack Query, FullCalendar, Recharts, Zod, Zustand
- Tabs: **Dashboard · Food · Big Calendar · Journal · Supplements · Mikros · Setup**
- `Mikros`-Tab: Wochenheatmap (letzte 8 KW, Zeilen = Mikronährstoffe, Farbe = % DACH)
- Ruft direkt lokales Fastify-Backend an (Port 9000 dev / 7000 prod)

**cloud channel** (`src/client/main.jsx` + Vite, `VITE_APP_MODE=client`)
- Gleiche React-Codebase wie local channel — Deployment-Modus wird per `isCloud()` erkannt
- `src/client/lib/api.js` — Cloud-Aware-Abstraction: leitet alle Reads/Writes je nach Hostname zu Fastify-Backend oder Firestore-SDK
- `src/client/lib/firestore-db.js` — Firestore Data Layer (Multi-User, per UID)
- `src/client/lib/firebase.js` — Firebase Init + Auth (Google Sign-In)
- Firestore Collections: `nutrition/{uid}/logs`, `nutrition/{uid}/meta/catalog`, `nutrition/{uid}/journal`, `supplements/{uid}/logs`, `supplements/{uid}/meta/catalog`, `users/{uid}/meta/settings`
- AI Logger (lokales Gemini-Backend) → nur im local channel sichtbar (kein Backend in cloud)
- `dist-firebase/` → Firebase Hosting (fuel-vos.web.app)

### Gemini Scripts (Python)

| Script | Was |
|--------|-----|
| `gemini-compose` | Gericht aus wger-Zutaten zusammensetzen + Makros |
| `gemini-estimate` | Makros für Freitextbeschreibung schätzen |
| `gemini-micros` | Mikronährstoffprofil für Mahlzeit schätzen (→ `meal_micros`) |

API-Key: `~/.env/fuel.env` (`GEMINI_API_KEY`, `GEMINI_MODEL=gemini-2.5-flash`)

### CLI Tools

**`./fuel`** (Python/Typer)
- `fuel log melatonin`, `fuel today`, `fuel week`
- Supplement-Logs nach `~/.aos/fuel/supplements/logs/YYYY-MM-DD.json`
- Supplement-Catalog: `catalogs/supplements/catalog.yaml`

**`./fuel-log.zsh`** — Quick TUI für Meal-Eingabe

---

## Build & Deploy

### local channel (Fastify + SQLite → /opt/fuel)
```bash
npm run dev          # nodemon + vite, watches src/ + server.mjs
npm run build:local  # Vite → ./opt-fuel target (VITE_APP_MODE=coach)
npm run prod         # PORT=7000 HOST=0.0.0.0 FUEL_STATIC_DIR=/opt/fuel
npm run deploy:local # = ./deploy.sh — versioned backup → rsync → build → systemctl restart
./deploy.sh          # Bash deploy script (siehe unten)
fuelctl local deploy # Python-Wrapper, ruft deploy.sh
```

**`deploy.sh`** macht: versionierten Backup nach `/opt/fuel_backups/fuel_<ts>`, rsync von Repo-Root nach `/opt/fuel`, `npm install + build`, `systemctl restart fuel-v2.service`. Excludes: `.git`, `node_modules`, `data`, `dist-firebase`, `.firebase`, `.claude`.

**Environment Variables (local):**
- `PORT` (default 9000)
- `HOST` (default 127.0.0.1)
- `AOS_FUEL_DATA_DIR` (default `~/.aos/fuel`)
- `FUEL_STATIC_DIR` (default `./public`)
- `FUEL_BUILD_DIR` (default `/opt/fuel`)
- `FUEL_VITE_ORIGIN` (für Vite-Proxy in dev)

### cloud channel (Firebase PWA)
```bash
npm run build:cloud  # VITE_APP_MODE=client → dist-firebase/
npm run deploy:cloud # build:cloud + firebase deploy --only hosting
npm run sync:push    # Lokale Katalog-JSONs → Firestore (scripts/firestore-sync.mjs)
npm run sync:pull    # Firestore → lokale Dateien
```

**Firebase Config:** `src/client/lib/firebase.config.js` — Project: `fuel-aos`
**Auto-Deploy:** `post-commit`-Hook in `.git/hooks/post-commit` triggert `build:cloud` + `firebase deploy --only hosting --project fuel-aos`, wenn Dateien unter `src/client/`, `src/shared/`, `index.html`, `vite.config.js` oder `package.json` im Commit waren.

---

## Code Structure

```
fuel-dev/
├── server.mjs                    Entrypoint → src/server/app.mjs
├── src/
│   ├── client/                   ─── Frontend (React, Vite) ───────────────────
│   │   ├── main.jsx              React entry, Tabs, Layout, Auth
│   │   ├── store.js              Zustand: activeTab, activeDate
│   │   ├── styles.css
│   │   ├── views/
│   │   │   ├── DashboardView.jsx  Makro-Summary, Trend-Charts
│   │   │   ├── FoodView.jsx       Logging-Form, Food-Search, Katalog, Rezept-Builder
│   │   │   ├── MicrosView.jsx     Wochenheatmap DACH
│   │   │   ├── CalendarView.jsx   FullCalendar Monatsansicht
│   │   │   ├── JournalView.jsx    Freitext-Notizen
│   │   │   ├── SupplementsView.jsx
│   │   │   └── SettingsView.jsx
│   │   ├── components/
│   │   │   ├── FoodSearch.jsx     Open Food Facts / Catalog-Suche
│   │   │   ├── NutritionHeatmap.jsx Wochennavigation (Header)
│   │   │   ├── GeminiCatalogModal.jsx
│   │   │   └── ui.jsx             Shared MealRow etc.
│   │   ├── hooks/
│   │   │   ├── useNutrition.js    useNutritionData / useMacroTrend / useJournal
│   │   │   ├── useSupplements.js
│   │   │   └── weekLogs.js
│   │   └── lib/
│   │       ├── api.js             ⭐ Cloud-Aware Abstraction (lokal→Fastify / cloud→Firestore)
│   │       ├── firebase.js        Firebase Init + Auth
│   │       ├── firebase.config.js Firebase Project: fuel-aos
│   │       └── firestore-db.js    Firestore Data Layer (Multi-User, per UID)
│   ├── server/                   ─── Backend (Fastify, Node) ─────────────────
│   │   ├── app.mjs               Fastify setup, Plugin-Registration
│   │   ├── config/
│   │   │   └── paths.mjs         Alle Server-Pfad-Konstanten
│   │   ├── routes/
│   │   │   ├── nutrition/
│   │   │   │   ├── index.mjs     Plugin-Wrapper für alle Nutrition-Routes
│   │   │   │   ├── log.mjs       GET+POST+PATCH /nutrition/log
│   │   │   │   ├── catalog.mjs   GET+POST /nutrition/catalog
│   │   │   │   ├── daily.mjs     GET /nutrition/search + /nutrition/daily/:date
│   │   │   │   ├── weekly.mjs    GET /nutrition/weekly/:year/:week
│   │   │   │   ├── journal.mjs   GET+POST /nutrition/journal
│   │   │   │   ├── compose.mjs   POST /nutrition/compose + /nutrition/estimate
│   │   │   │   ├── estimate.mjs  POST /nutrition/estimate (standalone)
│   │   │   │   └── ai-log.mjs    POST /nutrition/ai-log (Gemini dispatcher)
│   │   │   ├── supplements.mjs
│   │   │   ├── supplement-estimate.mjs
│   │   │   ├── fuel.mjs          legacy
│   │   │   ├── health.mjs
│   │   │   └── static.mjs
│   │   ├── services/
│   │   │   ├── nutrition-db.mjs  better-sqlite3: ingredients + meal_micros
│   │   │   ├── nutrition-catalog.mjs Meal-Catalog (individuelle Files)
│   │   │   ├── nutrition-micros.mjs  getMicrosForMeal / saveMicrosForMeal
│   │   │   ├── nutrition-compose.mjs gemini-compose wrapper
│   │   │   ├── nutrition-estimate.mjs gemini-estimate wrapper
│   │   │   ├── nutrition-estimate-micros.mjs gemini-micros wrapper
│   │   │   ├── nutrition-log.mjs
│   │   │   ├── nutrition-journal.mjs
│   │   │   ├── nutrition-search.mjs  Open Food Facts proxy
│   │   │   ├── gemini.mjs        Gemini-SDK Wrapper
│   │   │   ├── supplements-catalog.mjs
│   │   │   ├── supplements-log.mjs
│   │   │   └── wger-search.mjs
│   │   └── lib/
│   │       └── file-io.mjs
│   └── shared/                  ─── Geteilter Code (client + server) ──────────
│       ├── config/
│       │   ├── constants.mjs    PORT, HOST
│       │   └── dach.mjs         DACH Referenzwerte + getStatus()
│       └── utils/
│           ├── ids.mjs
│           ├── validation.mjs
│           └── utils.js
├── catalogs/
│   ├── nutrition/
│   │   └── meals/               {id}.json pro Gericht (lokal git-tracked)
│   └── supplements/
│       └── catalog.yaml
├── public/                      Classic vanilla PWA (legacy)
├── bin/
│   └── fuel-food-search         CLI food search
├── gemini-compose               Python script (Makro-Schätzung via wger)
├── gemini-estimate              Python script (freie Beschreibung → Makros)
├── gemini-micros                Python script (Mahlzeit → Mikronährstoffprofil)
├── fuel                         Python/Typer CLI (Supplements)
├── dist-firebase/               cloud channel Build → Firebase Hosting (git-ignored)
├── deploy.sh                    local channel deploy → /opt/fuel
├── scripts/
│   ├── dev-runner.mjs           Dev-Runner (nodemon wrapper)
│   └── firestore-sync.mjs       Lokale Kataloge ↔ Firestore sync
└── vite.config.js
```

---

## Common Tasks

**Neues Meal in Katalog:**
```bash
# Via API (speichert als catalogs/nutrition/meals/{id}.json)
http POST :9000/nutrition/catalog item[name]="Mein Gericht" item[kcal]:=500 ...

# Via compose (wger + Gemini)
http POST :9000/nutrition/compose description="Hähnchen mit Reis" save_catalog:=true
```

**Mahlzeit loggen:**
```bash
http POST :9000/nutrition/log meal[description]="Eierspeise Freiland" \
  meal[catalog_id]=meal_eierspeise_freiland meal[kcal]:=627 meal[protein]:=44 \
  meal[carbs]:=2.2 meal[fat]:=49.4
```

**Neues Supplement:**
```bash
http POST :9000/supplements/catalog name=Magnesium dose=400 unit=mg
fuel log magnesium
```

**DACH-Referenzwerte anpassen:** `src/config/dach.mjs`

**Neuen Nutrition-Endpoint:**
1. Route in `src/routes/nutrition/` als eigenes Plugin
2. In `src/routes/nutrition/index.mjs` registrieren
3. Service in `src/services/`

---

## Nutrition Agent Skill

**Invoke with:** `/nutrition-agent`

- Protokolle generieren (7-Tage / 14-Tage)
- Daily Logging koordinieren
- Weekly Mikro-Reports lesen
- Tickets für fuel-dev schreiben wenn Feature fehlt

See `~/.claude/agents/nutrition-agent.md` for full definition.

---

## Open / Planned

- **Tab-Modularisierung:** `main.jsx` ist zu groß — Tabs als eigene Lazy-geladene Module, Tab-Config als Array of `{ key, label, icon, component }`
- **Chunk-Splitting:** Build-Warning "Some chunks are larger than 500 kB" — dynamische Imports für FullCalendar, Recharts, etc.
- **Offline write-through (cloud):** POST-Queue via IndexedDB (Vorbild: `~/core4-dev/public/offline-queue.js`) für Firebase-Mode
- **systemd-Unit umbenennen:** `fuel-v2.service` → `fuel-local.service` (sudo-Op, bisher nicht angefasst — Unit-Name historisch, funktional egal)
- **`v2/` archiviert:** liegt in `~/.archive/fuel-dev-v2-2026-06-17/` für ggf. Referenz
- **CLI `fuel meal`:** schreibt via `/nutrition/log` (statt nur Supplements)
- **Export-Endpoint:** `GET /nutrition/export?from=&to=` → CSV (lokal)
- **Firestore-Sicherheitsregeln:** Production-ready Rules für `nutrition/{uid}` und `supplements/{uid}`
- **Klienten-Auth Multi-User (lokal):** `/c/<id>/nutrition/…` Route bereits vorbereitet

---

## Journal v2 (Raster)

Zweite Journal-Oberfläche unter `src/views/v2/` (Hash `#v2`, `#v2/woche|monat|habits/<datum>`), mit versteckter Timeline per Drag, Smart Logger, Google-Calendar-Lesezugriff, Splash/Auto-Updater, eigenem Hosting `vos-journal.web.app` und pnpm. Doku: [`JOURNAL-V2.md`](JOURNAL-V2.md).
