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
- **Start:** `pnpm run prod` im Ordner `/opt/fuel`.

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
1. **Entwickeln im `dev` Branch:** Änderungen werden in `~/journal-dev` gebaut (`pnpm run dev`).
2. **Preview Deploy (24h):** Mit dem Befehl `pnpm run deploy:preview` wird ein Build für Firebase erstellt und ein Preview Channel gestartet. Man erhält einen Link, der 24 Stunden gültig ist — er wird zusätzlich per Telegram verschickt (`scripts/deploy-preview.mjs`, Creds aus `~/.env/fitness.env`).
3. **Testen:** Der Preview-Link wird auf verschiedenen Geräten geprüft.

> **Warum lokal und nicht als GitHub Action?** Die Crossover-Aliase in `vite.config.cjs`
> (`@fuel`, `@habits`, `@fitness/*`, `@db`) zeigen absolut auf die Nachbar-Repos unter
> `/home/alpha/` — journal importiert Komponenten direkt aus fuel-dev, habits-dev und
> fitness-dev. Auf einem GitHub-Runner existieren diese Repos nicht (und ihre `dev`-Stände
> sind lokal oft weiter als auf GitHub), deshalb kann CI diesen Build nicht bauen.
> Die ursprünglichen Actions liegen deaktiviert in `.github/workflows.disabled/`.
4. **Merge & Live-Deploy:** Wenn alles passt, werden die Änderungen in den `master` Branch gemerged (ggf. in der VitalOS-Shell gezogen) und final mit `pnpm run deploy:cloud` live geschaltet.

### Befehle für Firebase Hosting
- **Live Deploy (mit Versions-Bump):** `pnpm run release` (Erhöht die Version in `package.json` und pusht live)
- **Live Deploy (ohne Bump):** `pnpm run deploy` oder `pnpm run deploy:cloud`
- **Preview Deploy:** `pnpm run deploy:preview` (Erstellt den zeitlich begrenzten 24h-Link)
- **Nur Journal v2:** `pnpm run deploy:v2` (Build nach `dist-v2`, startet in der v2-Ansicht, Deploy auf `vos-journal.web.app`, Hosting-Target `v2`)
- **Alles:** `pnpm run deploy:all` (baut alle sechs Varianten, ein `firebase deploy` für alle Targets)
- **Nur Voice/Game/Tent:** `pnpm run deploy:voice` / `deploy:game` / `deploy:tent`
- **Nur Door:** `pnpm run deploy:door` (Build nach `dist-door` mit Door-Icons/-Namen, startet in Door v2, Deploy auf `vos-door.web.app`, Target `door`)
- **Desktop-Prod:** `./deploy.sh` baut im Repo (dort liegen fitness/fuel/relax als Nachbarn) und kopiert nur `dist-firebase/` nach `/opt/journal`, ohne Backups. Optionen `--pull`, `--dry-run`.

Sechs Hosting-Targets in `firebase.json`/`.firebaserc`: `journal` → `journal-vos`, `v2` → `vos-journal`, `door` → `vos-door`, `voice` → `vos-voice`, `game` → `vos-game`, `tent` → `vos-tent`. `deploy:cloud` deployt nur `hosting:journal`.
Details zu v2, Smart Logger, Kalender, Service Worker und dem Merge nach vitalos: [`JOURNAL-V2.md`](JOURNAL-V2.md).

*Hinweis: Firebase ist so konfiguriert, dass es ausschließlich aus dem Verzeichnis `dist-firebase/` veröffentlicht.*

---

## 4. System-Steuerung (`fuelctl`)

Das Tool `fuelctl` dient als Master-Controller für die lokale Umgebung.

- **`fuelctl status`**: Zeigt den Zustand von Dev (9000), V2 (7000) und dem Sync-Watcher an.
- **`fuelctl dev up`**: Startet das lokale Entwicklungslabor (Port 9000).
- **`fuelctl sync`**: Manueller Datenabgleich zwischen V2 (Lokal) und V3 (Cloud).

## VitalOS-Release

Nach dem Committen: `npm run deploy:vos`. Der Befehl nutzt
`vos-release journal --yes`: `dev` pushen, in `vitalos/journal-app` nach
`vitalos` mergen, den Branch pushen und den Journal-Gitlink in VitalOS
committen/pushen. Der Parent-Push stößt das CI-Deployment an.

Der lokale VitalOS-Checkout mit `bin/vos-release` muss neben `journal-dev`
liegen oder über PATH erreichbar sein. Der Helper prüft Branches und
Arbeitsverzeichnisse. Der Aufruf fragt nicht erneut nach Bestätigung.
`npm run deploy:vos -- --dry-run` zeigt die geplanten Schritte; der bestehende
Preflight kann dabei Remote-Refs und Git-Objekte aktualisieren. Ein erfolgreicher
Aufruf bestätigt die Git-Übergabe; das Deployment-Ergebnis in der CI prüfen.
