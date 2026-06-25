# Firestore Integration — Fuel Centre

Dieses Dokument beschreibt die Anbindung von **Firebase Firestore** als Cloud-Backend für Fuel Centre, um eine 24/7-Verfügbarkeit der PWA unabhängig vom lokalen Laptop zu gewährleisten.

## Architektur-Überblick

Fuel Centre nutzt eine **Proxy-First Architektur** für Daten:

1.  **Lokal (Laptop):** Die App spricht mit dem Node.js Backend (`:9000`), das JSON-Dateien in `data/` verwaltet.
2.  **Cloud (Firebase Hosting):** Die App erkennt die Umgebung (`*.web.app`) und leitet alle API-Aufrufe (`/nutrition/*`, `/supplements/*`) direkt an **Firestore** um.
3.  **Offline:** Der Service Worker cached Assets; Firestore-Daten werden über das lokale SDK-Caching gepuffert.

## Datenmodell in Firestore

Die Struktur spiegelt die lokale Datei-Hierarchie wider, um die Synchronisation zu vereinfachen.

### Collections

-   `nutrition/{uid}/logs/{YYYY-MM-DD}`
    -   Dokument-Inhalt: `{ date, meals: [], water_ml: 0, updated_at }`
-   `nutrition/{uid}/journal/{YYYY-MM-DD}`
    -   Dokument-Inhalt: `{ date, content: "", updated_at }`
-   `nutrition/{uid}/meta/catalog`
    -   Zentrales Dokument mit allen Meal-Katalogeinträgen: `{ items: [], updated_at }`
-   `supplements/{uid}/logs/{YYYY-MM-DD}`
    -   Dokument-Inhalt: `{ date, intakes: [], updated_at }`
-   `supplements/{uid}/meta/catalog`
    -   Zentrales Dokument mit allen Supplement-Katalogeinträgen: `{ items: [], updated_at }`

*Hinweis: `uid` ist im Cloud-Modus die Firebase Auth ID, lokal wird oft `"default"` verwendet.*

## Synchronisation (Sync-Pipeline)

Um die lokalen "Master-Kataloge" und Offline-Logs abzugleichen, gibt es zwei Mechanismen:

### 1. Node.js Sync-CLI (`scripts/firestore-sync.mjs`)
Primäres Tool für das Hochladen von Katalogen und Logs aus dem Projekt-Root.
-   `npm run sync:push` — Lokal → Firestore (Kataloge & Logs)
-   `npm run sync:pull` — Firestore → Lokal (Logs)
-   `npm run sync:watch` — Überwacht `knowledge_tasks` in Firestore (Enrichment)

### 2. Python Bridge Handler (`fuel-firestore.py`)
Teil der `aos-dev` Bridge. Dient als modularer Handler für den bidirektionalen Sync von User-Daten (Logs/Journal), wenn die Bridge als zentraler Router agiert.

## Cloud-Deployment (Vite → Firebase)

Die Pipeline für das Frontend ist jetzt vollständig im Root-Verzeichnis integriert:

1.  **Build:** `npm run build` (erzeugt `dist/`)
2.  **Deploy:** `firebase deploy` (lädt `dist/` hoch)

Die App in der Cloud benötigt keinen laufenden Node-Server, da sie via `src/lib/api.js` intelligent auf Firestore umschaltet.

## Authentication

In der Cloud-Version (`fuel-vos.web.app`) ist ein **Google Login** integriert.
-   Nur authentifizierte User können ihre eigenen Daten in Firestore lesen/schreiben.
-   Der Login-Status wird in den "Setup"-Einstellungen angezeigt.
-   Nicht eingeloggte User sehen leere Kataloge/Logs, bis sie sich anmelden.
