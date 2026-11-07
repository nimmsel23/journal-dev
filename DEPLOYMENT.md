# Journal — Deployment

Entwicklung auf `dev`, Live auf `master`. Gebaut und deployt wird standalone (kein VitalOS-Checkout nötig, siehe
[`STANDALONE.md`](STANDALONE.md)); Hosting liegt im Firebase-Projekt `fitness-aos`.

## Ablauf

1. **Entwickeln auf `dev`** (`pnpm run dev`, `pnpm test`, `pnpm run build:cloud`). Nach jeder fertigen Änderung committen.
2. **Push auf `dev`** startet die Preview-CI: Test → `build:firebase` → Preview-Channel `dev`, 24 h gültig, Link per
   Telegram. Gleiches gilt für Pull Requests gegen `dev`/`master` (eigener Channel pro PR).
3. **Prüfen** auf Handy/iPad mit dem Preview-Link.
4. **Merge nach `master`** und Push startet die Live-CI: Test → `build:cloud` → Deploy auf **journal-vos.web.app**
   (Target `journal`), danach Telegram-Nachricht.
5. **Nach vitalos übernehmen** (siehe unten).

Beide Workflows (`.github/workflows/preview-dev.yml`, `deploy-master.yml`) laufen nur bei Änderungen an `src/`,
`public/`, `tests/`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `vite.config.cjs`, `index.html`,
`firebase.json`, `.firebaserc` oder am Workflow selbst. Beide installieren mit `pnpm install --frozen-lockfile`:
**`package.json` und `pnpm-lock.yaml` immer zusammen committen**, sonst bricht die CI ab.

## Hosting-Targets

Sechs Einträge in `firebase.json`/`.firebaserc`, alle aus demselben Code mit eigenem Start-Tab, Namen, Icons und Farben:

| Target | Site | Build-Ordner | Befehl |
|---|---|---|---|
| `journal` | journal-vos.web.app | `dist-firebase` | `pnpm run deploy:cloud` (`deploy`, `release`) |
| `v2` | vos-journal.web.app | `dist-v2` | `pnpm run deploy:v2` |
| `door` | vos-door.web.app | `dist-door` | `pnpm run deploy:door` |
| `voice` | vos-voice.web.app | `dist-voice` | `pnpm run deploy:voice` |
| `game` | vos-game.web.app | `dist-game` | `pnpm run deploy:game` |
| `tent` | vos-tent.web.app | `dist-tent` | `pnpm run deploy:tent` |

- Nur bauen: `deploy:<name>:build` (z. B. `deploy:door:build`).
- Alle sechs bauen und mit einem `firebase deploy` ausrollen: `pnpm run deploy:all` (`deploy:all:build` nur bauen).
- `pnpm run release` erhöht zusätzlich die Version in `package.json`.
- Lokale Vorschau über einen 24-h-Channel `preview` (Link per Telegram, Zugangsdaten aus `~/.env/fitness.env`):
  `pnpm run deploy:preview` (`scripts/deploy-preview.mjs`).
- CI und `deploy:cloud` deployen nur das Target `journal`; die anderen fünf nur über die Befehle oben.
- Firebase veröffentlicht ausschließlich aus dem jeweiligen Build-Ordner. Ein `firebase deploy` kann im Aufräumschritt
  mit „Timed out“ enden (Exit 2), obwohl das Release schon live ist.

## Lokale Hooks

`.githooks/post-commit` löst bei einem Commit **auf `master`** (mit Änderungen unter `src/`, `public/`, `index.html`,
`vite.config*`, `package.json`, `firebase.json`) `npm run deploy` aus. Auf `dev` passiert nichts. Commits auf `master`
also nur bewusst und nur mit OK.

## Desktop-Prod

`./deploy.sh [--pull] [--dry-run]` baut das Repo und kopiert nur `dist-firebase/` nach `/opt/journal`
(`journal.service`), ohne Backups. Der Kopfkommentar im Skript nennt noch Nachbar-Repos (fitness/fuel/relax) aus der
Zeit vor dem Standalone-Build; ob diese Logik noch gebraucht wird, ist ungeprüft.

## VitalOS-Release

Nach dem Committen: `pnpm run deploy:vos` (oder `journal-release` aus `~/vitalos/bin`). Der Befehl nutzt
`vos-release journal --yes`: `dev` pushen, in `vitalos/journal-app` nach `vitalos` mergen, den Branch pushen und den
Journal-Gitlink in VitalOS committen und pushen. Der Parent-Push stößt das CI-Deployment an.

Der VitalOS-Checkout mit `bin/vos-release` muss neben `journal-dev` liegen oder über `PATH` erreichbar sein. Der Helper
prüft Branches und Arbeitsverzeichnisse und fragt nicht erneut nach Bestätigung. `pnpm run deploy:vos -- --dry-run` zeigt
die geplanten Schritte; der Preflight kann dabei Remote-Refs und Git-Objekte aktualisieren. Ein erfolgreicher Aufruf
bestätigt die Git-Übergabe, das Deploy-Ergebnis in der CI bleibt zu prüfen. Stolpersteine beim manuellen Merge nach
vitalos (`package.json`, Lockfile): [`JOURNAL-V2.md`](JOURNAL-V2.md), Abschnitt „Nach vitalos übernehmen“.

Details zu v2, Door, Game, Tent, Service Worker und Updater: [`JOURNAL-V2.md`](JOURNAL-V2.md).

## Destillat aus der RESULTS.md (2026-11-07)

Kurzfassung dauerhaft relevanten Wissens aus dem früheren Arbeitslog, thematisch einsortiert vom thin-results-Dienst.

## Release-Weg

- **Standard:** `dev` → `master` per `vos-release-pr journal` (erstellt PR, z. B. [#4](https://github.com/nimmsel23/journal-dev/pull/4), [#11](https://github.com/nimmsel23/journal-dev/pull/11)) → Merge → Live-Deploy per CI
- **Live-Deploy:** `journal-release --yes` (ohne `--yes` bricht Skript ab, da `gum confirm` kein TTY hat)
  - Aktionen: dev pushen, nach `journal-app/vitalos` mergen, **Release-Branch** sowie **VitalOS-Pointer** pushen
  - CI: `deploy-master.yml` (z. B. Run 40894437472)
- **npm-Befehl:** `npm run deploy:vos` führt `vos-release journal --yes` aus (Weitergabe von `--dry-run` unterstützt; Fehlercodes unverändert)
- **Standalone vs. Eingebettet:** Standalone mit eigener Bestätigung; eingebettet unterdrückt zugunsten des **zentralen Shell-Dialogs** (universalisierter VitalOS-Release-Dialog über vendorte Vite-Module)

---

### Wichtige Commits & Releases

| Datum | Commit | Beschreibung |
|-------|--------|--------------|
| 2026-10-25 | `855e2c6` | Voice-Pause-Visualisierungen gemerged |
| 2026-10-26 | `3813407` | Door v2 Rechtsklick-Menüs, Journal v2 Jahr-Ansicht |
| 2026-10-29 | `a0b7bac` | Door v2 Potential Notizfeld CSS-Fix |
| 2026-10-31 | `fde6b31` | Door v2 `selectWeeklyDoor` Fix |
| 2026-10-31 | `1643ebe` | Google Auth `functions/internal` Rückfall |
| 2026-11-01 | — | Tent-Push Live-Deploy `41299163327` |
| 2026-11-03 | — | Smart-Log Features |

---

## Push-Benachrichtigungen

### Getrennter Push-Sender

- **Function:** `scheduledJournalPushReminders` in **eigener Firebase-Codebase `journal`**
- **Deployment:** gezielt über VitalOS `deploy-push-functions.yml` → andere App-Sender werden **nicht überschrieben oder gelöscht**
- **Token-Lanes:**
  - Journal: `apps.journal` (Reminder-Einstellungen in shared push settings document)
  - Tent: `apps.tent` (eigene Lane)
- **Worker:** Journal registriert `/journal-messaging-sw.js` unter `/journal-push/`; Tent registriert `/tent-messaging-sw.js` unter `/tent-push/`
- **Tagging:** Outgoing messages tagged mit `app: journal` bzw. `app: tent`

---

### Tent-Push

- **Prüfung:** Sonntags zur gespeicherten Zeit (Standard **14:00, Europe/Vienna**) prüft die Journal-Cloud-Function, ob diese Woche ein **Journal-Eintrag mit `tent` und ISO-Wochen-Tag** vorliegt
- **Aktion:** Bei offenem Tent → Sendet Link nach `/#tent2`
- **Trennung:** Journal-/Door-Payloads bleiben **getrennt**
- **Deployment:**
  - Functions: manuell per Firebase CLI für `fitness-aos` (`firebase functions:list` bestätigt `scheduled` in `europe-west1`, `v1`, Node.js 22)
  - **CI-Blocker:** `deploy-push-functions.yml` scheitert am fehlenden `secretmanager.secrets.get` des CI-Serviceaccounts
  - Hosting: Live-Deploy `41299163327` veröffentlichte Hosting-Targets inkl. `tent` erfolgreich
- **Prüfung:** `vos-tent.web.app/` liefert HTTP 200; `/tent-messaging-sw.js` liefert HTTP 200 mit `Cache-Control: no-cache`

---

## Hosting-Konfiguration

- **`firebase.json`:** `no-cache` für:
  - `/index.html`
  - `/manifest.webmanifest`
  - `/journal-messaging-sw.js` (fiel sonst unter 1-Jahr-immutable-Regel für `*.js`)
- **Door-Build:**
  - Precache: 60 Einträge/~1,5 MiB
  - Alle 39 JS-Chunks
  - `index.html`, Fallback `/index.html`
  - Door-Icons

---

## Journal Push Reminders

- **Lane:** `apps.journal` in shared push settings document
- **Worker:** `/journal-messaging-sw.js` unter `/journal-push/`
- **Function:** prüft nur **aktivierte Journal-Einstellungen** und taggt Messages mit `app: journal`
- **Legacy:** Alte shared Tokens werden **nicht** als Journal-Tokens übernommen

---

## Build-Ziele & Versionen

- **Versionierung:** Im Update-Dialog wird die **Paketversion mit der gebauten Git-Revision** angezeigt (nicht dauerhaft `v0.1.1`)
- **Build-Befehle:**
  - `npx vite build --mode firebase` (fallback, wenn `pnpm run build:firebase` scheitert)
  - `pnpm run build:firebase` (kann an `ERR_PNPM_STORE_DIR_OPEN_OPERATION_LOCK` scheitern → Store-Zugriff ermöglichen)
  - `pnpm run build:cloud` (3.009–3.010 Module, PWA-Service-Worker)
- **CI:**
  - `CI=true pnpm test` (z. B. 135/135)
  - `CI=true pnpm run build:firebase`
  - `--frozen-lockfile` für `pnpm-lock.yaml`
- **Validierung:** `git diff --check` sauber

## Destillat aus der RESULTS.md (2026-11-07)

Kurzfassung dauerhaft relevanten Wissens aus dem früheren Arbeitslog, thematisch einsortiert vom thin-results-Dienst.

# Journal — Deployment

## Ablauf

### Release-Weg
- **Standard:** `dev` → `master` via `vos-release-pr journal` (erstellt PR, z. B. [#4](https://github.com/nimmsel23/journal-dev/pull/4), [#11](https://github.com/nimmsel23/journal-dev/pull/11))
- **Merge:** PR wird gemergt → **Live-Deploy per CI** (`deploy-master.yml`, z. B. Run 40894437472)
- **Final:** `journal-release --yes` (ohne `--yes` bricht Skript ab, da `gum confirm` kein TTY hat)
  - Aktionen: dev pushen → nach `journal-app/vitalos` mergen → **Release-Branch** sowie **VitalOS-Pointer** pushen
- **npm-Shortcut:** `npm run deploy:vos` = `vos-release journal --yes` (unterstützt `--dry-run`)

---

### Standalone vs. Eingebettet
- **Standalone:** Eigene Bestätigung für Release-Dialog
- **Eingebettet:** Unterdrückt zugunsten des **zentralen Shell-Dialogs** (universalisierter VitalOS-Release-Dialog über vendorte Vite-Module)

---

## Hosting-Targets

- **Journal PWA:** `journal.web.app`
- **Tent PWA:** `vos-tent.web.app`
- **VitalOS Shell:** `vitalos.web.app` (integriert Journal als Submodul)

---

## Lokale Hooks

- **`firebase.json`:** `no-cache` für `/index.html`, `/manifest.webmanifest`, `/journal-messaging-sw.js`
- **Service Worker:** Dienst nicht gecached (1-Jahr-immutable-Regel für `*.js` umgehen)
- **Door-Build:** Precache 60 Einträge (~1,5 MiB), alle 39 JS-Chunks, `index.html`, Fallback `/index.html`

---

## Desktop-Prod

- **Build:** `npx vite build --mode firebase` (fallback, wenn `pnpm run build:firebase` scheitert)
- **Validierung:** `CI=true pnpm run build:firebase` in CI
- **CI-Blocker:** `ERR_PNPM_STORE_DIR_OPEN_OPERATION_LOCK` → Store-Zugriff ermöglichen

---

## VitalOS-Release

- **Pointer-Bump:** VitalOS-Pointer wird bei `journal-release` automatisch gebumpt (z. B. `1697008` auf `master`)
- **Shell-Integration:** Journal als Submodul in VitalOS-Shell integriert
- **Achtung:** `vitalos` nutzt **gemeinsames `pnpm-lock.yaml`** im Root → bei App-Änderungen Lockfile aktualisieren

---

## Push-Sender

- **Getrennt:** `scheduledJournalPushReminders` in **eigener Firebase-Codebase `journal`**
- **Deployment:** Gezielt über VitalOS `deploy-push-functions.yml` → **andere App-Sender bleiben unberührt**
- **Lane:** `apps.journal` in shared push settings document
- **Service Worker:** `/journal-messaging-sw.js` unter `/journal-push/`
- **Tent:** Eigene Lane `apps.tent` mit `/tent-messaging-sw.js` unter `/tent-push/`

---

## Build-Versionen

- **Anzeige:** Im Update-Dialog wird die **Paketversion mit der gebauten Git-Revision** angezeigt (nicht dauerhaft `v0.1.1`)
- **Release-Prozess:** `pnpm release` startet den vorgesehenen `dev → master`-PR-Releaseweg (nicht lokal Patch-Version ändern)

---

## Validierung

- **Tests:** `CI=true pnpm test` (z. B. 135/135)
- **Build:** `CI=true pnpm run build:firebase`
- **Lockfile:** `git diff --check` sauber; `--frozen-lockfile` in CI
- **Browser:** Headless-Thorium mit gemockten Daten als Fallback (echte Browser-Tests oft nicht durchgeführt)

---

## Bekannte Probleme

1. **pnpm build:firebase:** Kann an `ERR_PNPM_STORE_DIR_OPEN_OPERATION_LOCK` scheitern → Store-Zugriff ermöglichen
2. **CI-Serviceaccount:** `deploy-push-functions.yml` scheitert an fehlendem `secretmanager.secrets.get`
3. **Google Functions:** Nicht deployte Functions (`googleLink`, `googleAccessToken`, etc.) → 404 ohne CORS → Browser blockiert
4. **Tent-Push:** Empfang auf mobilem Gerät noch nicht getestet
5. **Service Worker Cache:** Ohne `no-cache` für `*-messaging-sw.js` → 1-Jahr-immutable-Problem
