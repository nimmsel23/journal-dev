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

## 3. Git & Deployment-Workflow (Dev vs. Master)

Um eine stabile PWA-Erfahrung zu garantieren, haben wir einen klaren Git-basierten Workflow für Deployments etabliert. Wir trennen dabei zwischen den Home-Verzeichnissen (Entwicklung) und den VitalOS-Verzeichnissen (Produktion).

### Architektur & Branches
- **Home Repos (z. B. `~/journal-dev`)**: Hier läuft die Entwicklung auf dem **`dev`** Branch. Änderungen werden hier entwickelt und committet.
- **VitalOS Shell Apps (z. B. in `~/vitalos/...`)**: Hier läuft der **`master`** Branch, aus dem das tatsächliche finale Produktions-Setup gespeist wird.

### 24h Preview Workflow (Der Sicherheits-Check)
Bevor Commits aus dem `dev` Branch in den `master` Branch fließen, wird ein temporärer Preview-Link generiert:
1. **Entwickeln im `dev` Branch:** Änderungen werden in `~/journal-dev` gebaut (`npm run dev`).
2. **Preview Deploy (24h):** Mit dem Befehl `npm run deploy:preview` wird ein Build für Firebase erstellt und ein Preview Channel gestartet. Man erhält einen Link, der 24 Stunden gültig ist.
3. **Testen:** Der Preview-Link wird auf verschiedenen Geräten geprüft.
4. **Merge & Live-Deploy:** Wenn alles passt, werden die Änderungen in den `master` Branch gemerged (ggf. in der VitalOS-Shell gezogen) und final mit `npm run deploy:cloud` live geschaltet.

### Befehle für Firebase Hosting
- **Live Deploy:** `npm run deploy` oder `npm run deploy:cloud`
- **Preview Deploy:** `npm run deploy:preview` (Erstellt den zeitlich begrenzten 24h-Link)

*Hinweis: Firebase ist so konfiguriert, dass es ausschließlich aus dem Verzeichnis `dist-firebase/` veröffentlicht.*

---

## 4. System-Steuerung (`fuelctl`)

Das Tool `fuelctl` dient als Master-Controller für die lokale Umgebung.

- **`fuelctl status`**: Zeigt den Zustand von Dev (9000), V2 (7000) und dem Sync-Watcher an.
- **`fuelctl dev up`**: Startet das lokale Entwicklungslabor (Port 9000).
- **`fuelctl sync`**: Manueller Datenabgleich zwischen V2 (Lokal) und V3 (Cloud).
