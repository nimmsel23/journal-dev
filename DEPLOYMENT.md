# Journal — Deployment

Entwicklung auf `dev`, Live auf `master`. Gebaut und deployt wird standalone (kein VitalOS-Checkout nötig, siehe
[`STANDALONE.md`](STANDALONE.md)); Hosting liegt im Firebase-Projekt `fitness-aos`.

## Ablauf

1. **Entwickeln auf `dev`** (`pnpm run dev`, `pnpm test`, `pnpm run build:cloud`). Nach jeder fertigen Änderung committen.
2. **Push auf `dev`** startet die Preview-CI: Test → `build:firebase` → Preview-Channel `dev`, 24 h gültig, Link per
   Telegram. Gleiches gilt für Pull Requests gegen `dev`/`master` (eigener Channel pro PR).
3. **Prüfen** auf Handy/iPad mit dem Preview-Link.
4. **Merge nach `master`** und Push startet die Live-CI: Test → Flavor-Builds → Deploy;
   **kanonisch `vos-journal.web.app`** (Target `v2`). `journal-vos.web.app` ist nur noch
   301-Redirect auf `vos-journal`. Danach Telegram-Nachricht.
5. **Nach vitalos übernehmen** (siehe unten).

Beide Workflows (`.github/workflows/preview-dev.yml`, `deploy-master.yml`) laufen nur bei Änderungen an `src/`,
`public/`, `tests/`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `vite.config.cjs`, `index.html`,
`firebase.json`, `.firebaserc` oder am Workflow selbst. Beide installieren mit `pnpm install --frozen-lockfile`:
**`package.json` und `pnpm-lock.yaml` immer zusammen committen**, sonst bricht die CI ab.

## Hosting-Targets

Kanon (Owner 2026-11-11): **`vos-journal.web.app`**. `journal-vos.web.app` ist Legacy-Alias
(301). Flavor-Sites (`vos-door` …) bleiben vorerst eigene Origins; langfristig können sie als
Manifest-/Pfad-Icons unter `vos-journal` (gleiche Origin, eine OAuth-URI) laufen — siehe
`~/vitalos/docs/HOSTING-TARGETS.md`.

| Target | Site | Build-Ordner | Befehl |
|---|---|---|---|
| `v2` | **vos-journal.web.app** (kanonisch) | `dist-v2` | `pnpm run deploy:v2` (`deploy`, `deploy:cloud`, `firebase`) |
| `journal` | journal-vos.web.app → 301 vos-journal | `hosting/journal-vos-redirect` | `pnpm run deploy:journal-vos-redirect` |
| `door` | vos-door.web.app | `dist-door` | `pnpm run deploy:door` |
| `voice` | vos-voice.web.app | `dist-voice` | `pnpm run deploy:voice` |
| `game` | vos-game.web.app | `dist-game` | `pnpm run deploy:game` |
| `tent` | vos-tent.web.app | `dist-tent` | `pnpm run deploy:tent` |

- Nur bauen: `deploy:<name>:build` (z. B. `deploy:door:build`).
- Alle Targets ausrollen: `pnpm run deploy:all` (`deploy:all:build` nur bauen; inkl. Redirect-Site).
- `pnpm run release` = `vos-release-pr journal` (Alt-Gen-PR-Weg), **kein** Versionsbump.
- **Semver (CEO C-012, Option B):** Anzeige = `package.json` `version` + Build-SHA
  (`vite` → `__APP_VERSION__`). Baseline `0.2.0` (`1.0.0` erst beim Play-Store-Produktionsrelease;
  die Zwischenstände `1.0.0`/`1.0.1` sind abgelöst). Version **nur auf `dev`**
  bewusst mitbumpen (PATCH = Fix/CI/Docs, MINOR = sichtbares Feature, MAJOR = Breaking
  Client-Daten/Routing). Auto-Promote trägt die Zahl nach `master` — kein Autobump.
  Dabei setzt `automerge.yml` den annotated Tag `journal-v<version>` auf den Promote-Commit;
  existiert der Tag, bleibt er liegen.
- Lokale Vorschau über einen 24-h-Channel `preview` (Link per Telegram, Zugangsdaten aus `~/.env/fitness.env`):
  `pnpm run deploy:preview` (`scripts/deploy-preview.mjs`).
- CI (`deploy-master.yml`) deployt Redirect + `v2` + Flavors. Lokal `deploy`/`deploy:cloud` = nur kanonisches `v2`.
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
