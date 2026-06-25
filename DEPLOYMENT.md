# Fuel Centre — Deployment & App-Architektur

Dieses Dokument beschreibt die Trennung zwischen der **Firebase PWA (V3)** und der **Desktop Produktion (V2)**.

## 1. Die zwei Welten

Fuel Centre operiert in zwei getrennten Umgebungen mit unterschiedlichen Schwerpunkten.

### Firebase PWA (V3)
- **Status:** Die moderne, AI-gestützte Version für das Handy (Cloud).
- **Umgebung:** Firebase Hosting (`fuel-aos.web.app`)
- **Daten:** Google Firestore (Cloud-Schnittstelle).
- **Features:** Schnelles AI-Logging, Heatmap, Dashboard.
- **Build-Befehl:** `fuelctl dev build v3` (Erzeugt `dist-firebase/`)

### Desktop Produktion (V2)
- **Status:** Die komplette Backend-Version mit Katalog-Management (Enhancement).
- **Umgebung:** Lokaler Node.js Server (Port 7000), Pfad: `/opt/fuel`
- **Daten:** Lokale JSON-Dateien (`data/`) & SQLite.
- **Features:** Vollständiges Backend, Inhaltsstoff-Suche, lokaler Katalog-Master.
- **Start:** `npm run prod` im Ordner `/opt/fuel`.

---

## 2. Automatisierung & Daemons

### Firestore Sync Watcher
Ein Daemon-Prozess überwacht lokale Änderungen und gleicht sie mit der Cloud ab.
- **Service:** `fuel-sync-watcher.service`
- **Script:** `scripts/firestore-sync.mjs watch`

### Inbox (Geplant)
Eine Inbox-Funktion für die schnelle Erfassung von Rohdaten zur späteren Katalogisierung.

---

## 3. Deployment-Prozess (V3)

Das Deployment nach Firebase erfolgt automatisch bei Änderungen am Frontend (via Git-Hook).

1.  **Manueller Build:** `fuelctl dev build v3`
2.  **Manueller Deploy:** `firebase deploy --only hosting`

*Hinweis: Firebase ist so konfiguriert, dass es ausschließlich aus dem Verzeichnis `dist-firebase/` veröffentlicht.*

---

## 4. System-Steuerung (`fuelctl`)

Das Tool `fuelctl` dient als Master-Controller für die lokale Umgebung.

- **`fuelctl status`**: Zeigt den Zustand von Dev (9000), V2 (7000) und dem Sync-Watcher an.
- **`fuelctl dev up`**: Startet das lokale Entwicklungslabor (Port 9000).
- **`fuelctl sync`**: Manueller Datenabgleich zwischen V2 (Lokal) und V3 (Cloud).
