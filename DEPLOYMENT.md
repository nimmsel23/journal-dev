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
