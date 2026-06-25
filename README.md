# Fuel Centre

Offlinefähiges Nutrition Journal als mobile PWA plus Node-Server plus CLI-Backend.

Ziel:
- Ernährungstagebuch für die Ausbildung zum Ernährungstrainer
- privates Tracking ohne Abhängigkeit von TickTick, Zero, HabitShare, AwesomeHabits, FitBit oder ähnlichen Fremd-Apps
- lokal nutzbar, offlinefähig, später leicht in weitere Systeme integrierbar
- Klienten-Feature in `~/vital` geplant

## Schichten

- `v1 / Fuel Classic` - das Vanilla-HTML in `public/index.html`, stabiler Fallback und sofort nutzbar
- `v2 / Fuel Studio` - das neue Vite/Tailwind-Frontend in `index.html` + `src/`
- `/v2` - sichtbarer Einstieg zur neuen UI-Schicht
- CLI-Backend - `~/Nutrition/bin/wger-food` + `wger-generate` (unabhängig vom Server)

## Was hier drin ist

- `public/index.html` - mobile PWA für Mahlzeiten, Journal und Supplements
- `public/index.html` bleibt als `v1 / Fuel Classic` erhalten
- `index.html` + `src/` - `v2 / Fuel Studio` mit Vite/Tailwind
- `public/sw.js` - Service Worker für Offline-Caching
- `public/manifest.json` - Installationsmanifest für die PWA
- `server.mjs` - lokaler Node-Server mit JSON-Speicher
- `fuel-log.zsh` - einfache CLI zum schnellen Erfassen von Mahlzeiten
- `fuelctx.zsh` - kleines TUI/Shell-Wrapper-Skript für den Dev-Server
- `data/` - lokaler, dateibasierter Speicher für Logs und Kataloge
- `NUTRITION.md` - Doku für CLI-Backend und Ausbildungskontext
- `ARCHITECTURE.md` - technische Architektur, implementiert vs. geplant
- `HOT.md` - Open Source Nährstoff-/Supplement-DBs + nützliche Node Module
- `OFFEN.md` - offene technische Punkte + bekannte Bugs
- `AGENT.md` - nutrition-agent Rollenbeschreibung + Ticketing-Workflow

## CLI-Backend: wger-food

Schnelles Erfassen ohne UI — Open Food Facts → fzf → Makros skalieren → Markdown-Log.

```bash
wger-food haferflocken     # Suche → fzf-Auswahl → S/M/L/XL Portion → Log-Zeile
wger-generate              # 14-Tage-Protokoll für Ausbildung (~2800 kcal/Tag)
wger-generate --days 7     # 7 Tage (Ernährungstrainer-Pflichtaufgabe)
wger-generate --preview    # nur anzeigen, nichts schreiben
```

Vollständige Doku: [NUTRITION.md](NUTRITION.md)

## Laufzeit

- Node.js als Server- und Tooling-Basis
- `web-push` bleibt für Push-/VAPID-Workflows drin
- das neue Frontend nutzt React, Tailwind, FullCalendar, React Query, Recharts, Zustand, Zod und React Hook Form
- das alte Vanilla-Frontend bleibt als fallbackfähige Einzeldatei bestehen

## Datenmodell

Der Server legt Daten lokal unter `data/` ab:

- `data/nutrition/` - Tagesprotokolle mit Mahlzeiten und Wasser
- `data/nutrition/catalog.json` - wiederverwendbare Mahlzeiten und Gerichte
- `data/nutrition_journal/` - freie Journal-Einträge als Markdown
- `data/supplements/` - Katalog und Einnahmelogs
- `data/fuel/` - älteres Fuel-Logging, falls noch genutzte Alt-Daten vorhanden sind

CLI-Logs landen separat unter `~/Nutrition/logs/YYYY-MM-DD.md` (Markdown, Ausbildungsformat).

## Endpunkte

- `GET /health`
- `GET /nutrition/search?q=<query>&limit=<n>` — **Open Food Facts Proxy** (neu)
- `GET /nutrition/log?date=YYYY-MM-DD`
- `POST /nutrition/log`
- `GET /nutrition/catalog`
- `POST /nutrition/catalog`
- `GET /nutrition/journal?date=YYYY-MM-DD`
- `POST /nutrition/journal`
- `GET /nutrition/journal/list`
- `GET /supplements/catalog`
- `POST /supplements/catalog`
- `GET /supplements/log?date=YYYY-MM-DD`
- `POST /supplements/log`
- `GET /supplements/stats?days=30&anchor=YYYY-MM-DD`
- `GET /fuel/progress` (legacy)
- `POST /fuel/log` (legacy)

### `/nutrition/search` — Open Food Facts Proxy

```bash
http :9000/nutrition/search q==haferflocken limit==10
```

Gibt `name, brand, kcal, kh, fett, ew` pro 100 g zurück. Kein API-Key, kein Account.

## V2 Food Search (Journal-Tab)

Über dem Meal Logger im Journal-Tab:

1. Suchbegriff tippen → debounced 350 ms → `/nutrition/search`
2. Dropdown mit Nährwerten pro 100 g
3. Auswahl → Portionsgröße: **S** 100 g / **M** 200 g / **L** 300 g / **XL** 450 g
4. Makro-Felder (kcal, protein, carbs, fat) werden automatisch befüllt
5. Save meal → schreibt nach `data/nutrition/YYYY-MM-DD.json`
6. "Als Gericht speichern" → schreibt nach `data/nutrition/catalog.json`
7. Der neue "Gericht bauen"-Block speichert zusammengesetzte Menüs mit Komponentenliste
8. Katalog-Gerichte können Add-ons wie Jausenspeck direkt beim Loggen mitnehmen

## Nutzung

### Lokal (Entwicklung)

```bash
npm install
npm run dev
```

Danach läuft die App auf `http://127.0.0.1:9000`. Der Supervisor startet Backend und Frontend zusammen.

### Cloud (Firebase Deployment)

Die App ist für Firebase Hosting optimiert und funktioniert in der Cloud ohne eigenen Server (via Firestore).

1.  **Build:** `npm run build`
2.  **Deployment:** `firebase deploy` (im Hauptverzeichnis)

Die App erkennt automatisch, ob sie auf `*.web.app` läuft, und nutzt dann Firestore statt der lokalen API.

### Daten-Synchronisation

Um lokale Kataloge und Logs mit der Cloud abzugleichen:

```bash
npm run sync:push   # Lokal -> Firestore
npm run sync:pull   # Firestore -> Lokal
```

Detaillierte Infos zur Cloud-Anbindung findest du in [FIRESTORE.md](FIRESTORE.md).

## PWA-Status


- installierbar über das Manifest
- Offline-Basis über Service Worker
- mobile Darstellung ohne externe UI-Bibliothek
- neue Tailwind-/React-Schicht als `v2 / Fuel Studio` zusätzlich verfügbar
- kein Offline-Write-Through für POSTs (geplant, siehe ARCHITECTURE.md)

## Integration

Für später sind zwei Docker-nahe Ergänzungen vorgesehen:

- `wger` als Referenz für strukturierte Ernährungs- und Gesundheitsdaten (läuft lokal auf :8000)
- `habitsync` als möglicher Sync-/Habit-Layer

Die Idee ist nicht, diese Tools blind zu übernehmen, sondern deren Stärken als Vergleichs- und Integrationspunkte zu behalten.

## Build-Plan

Der naheliegende nächste Schritt ist ein Vite-Frontend mit statischem Build-Output nach `/opt/fuel`.

Zielbild:
- Source bleibt in diesem Repo
- Vite baut die PWA als statische Assets
- Deploy-/Sync-Ziel ist `/opt/fuel`
- der Node-Server bleibt als lokaler API- und CLI-Host bestehen

Das ist sinnvoll, wenn das Frontend später stärker modularisiert wird oder wenn ein sauberer Produktions-Deploy vom jetzigen Einzel-HTML weg soll.

## Modul-Stack

Der aktuelle Vite-Stack ist absichtlich breit angelegt:

- `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction` für die große Kalenderansicht
- `@tanstack/react-query` für Daten-Fetching und Cache-Schicht
- `recharts` für Trend- und Verlaufsgrafen
- `react-hook-form` und `zod` für robuste Formvalidierung
- `zustand` für lokale UI-State-Verwaltung
- `lucide-react` für konsistente Icons
- `clsx` und `tailwind-merge` für Klassenlogik

## CLI-Tools & Logging

### Meal Logging

**Interaktiv via `fuel meal`:**
```bash
fuel meal                           # fzf Catalog-Durchsuche → auswählen → loggen
```

**Mit manuellen Makros:**
```bash
fuel meal "Nussschnecke Billa" --kcal 250 --protein 5 --carbs 40 --fat 12
```

**Mit Catalog-Save (für Wiederverwendung):**
```bash
fuel meal "Nussschnecke Billa" --kcal 250 --protein 5 --carbs 40 --fat 12 --save-catalog
```

**Mit Gemini Auto-Schätzung (keine Makros angeben):**
```bash
fuel meal "Wiener Schnitzel mit Kartoffeln"  # → Gemini schätzt alle Makros automatisch
```

**Features**:
- **fzf Integration**: Interaktives Menu zum Durchsuchen des Catalogs
- **Gemini API**: Automatische Makro-Schätzung wenn keine Werte angegeben
  - Lädt API-Key aus `~/.env/gemini.env`
  - Graceful Fallback wenn API nicht verfügbar
- **Catalog Save**: `--save-catalog` speichert Meal für schnelle Wiederverwendung
- **Flexible Input**: Manuell oder AI-generiert

### Supplements Logging

**Direktes Logging via `fuel` CLI:**
```bash
fuel log melatonin --yesterday          # default dose aus catalog
fuel log melatonin 2 --time morning     # custom dose
fuel log melatonin kollagen zink        # mehrere auf einmal
fuel today --day 2026-05-14             # tagesübersicht
fuel list                               # alle supplements
fuel week                               # wochenreport + CSV
```

**Universal Dispatcher `hab`** (in `~/.dotfiles/logger/hab`):
```bash
hab melatonin --yesterday           # auto-detects → fuel log melatonin
hab apple 100g                      # auto-detects → fuel nutrition apple 100g
hab barbell_bench 5x5 100kg         # auto-detects → fitness log barbell_bench ...
```

`hab` kategorisiert automatisch und routet zu:
- `fuel log` für Supplements
- `fuel nutrition` für Nutrition-Items (wenn implementiert)
- `fitness log` für Workouts (wenn implementiert)

### Katalog-Struktur

Supplements + Nutrition Items + Workouts werden in JSON-Katalogen definiert:

```
~/.aos/fuel/
├── supplements/
│   ├── catalog.json     (melatonin, kollagen, zink, tongkat_ali, mulungu, ...)
│   └── logs/            (YYYY-MM-DD.json mit intakes)
└── nutrition/
    ├── catalog.json     (nicht implementiert, future)
    └── logs/            (future)
```

Jedes Item hat:
```json
{
  "id": "melatonin",
  "name": "Melatonin",
  "unit": "mg",
  "default_dose": 1,
  "default_time_of_day": "night"
}
```

### CLI Tooling-Stack

- **fuel** (`~/fuel-dev/fuel`) — Python/Typer CLI für Supplement-Logging
  - Typer + loguru für saubere Fehlerbehandlung
  - Dynamic help mit Catalog-Auflistung
  - Automatische zsh-Completions

- **hab** (`~/.dotfiles/logger/hab`) — Universal Dispatcher
  - Auto-detects Kontext (Supplements, Nutrition, Fitness)
  - Routes zu korrekter CLI
  - Supports mehrere Items auf einmal
  - loguru + gum für schöne Output

## Nächste sinnvolle Ausbauten

- echten Offline-Write-Through mit Queue/Retry ergänzen (Vorbild: `~/core4-dev/public/offline-queue.js`)
- CLI und PWA auf ein gemeinsames Datenschema ziehen (`wger-food --api` schreibt direkt nach `/nutrition/log`)
- Nutrition Catalog mit wger/OFF Integration (siehe `NUTRITION_FITNESS_ARCHITECTURE.md`)
- Fitness Catalog mit wger Exercise DB Integration
- Import-/Exportpfade für Backup, Vault und mögliche Docker-Services definieren
- Changelog/Architektur-Doku für Ernährungscoach-Ausbildung und Privatnutzung ergänzen
- Klienten-Auth für `~/vital`-Integration (Pfad-Normalisierung ist bereits vorbereitet)
