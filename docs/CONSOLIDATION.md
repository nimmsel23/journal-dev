# Quellzuständigkeit seit 2026-11-06

`habits` gehört zu `journal-dev`. Live-Hosting kommt aus dem Journal-Hub
(`pnpm run deploy:v2:build` → `dist-v2/mini/habits/`, Default `#v2/habits`).
`habit-vos` leitet auf diese Mini-Route um. `apps/habits` bleibt als Legacy-Shell
im Tree (Quellen/Tests), ist aber seit 2026-11-13 weder Workspace-Paket noch
Dependabot-Ziel. Installationen und Dependency-Updates betreffen nur den
Journal-Root; das Root-Lockfile enthält keinen Legacy-Habits-Importer mehr.

Der Node-Backend-Quellstand liegt in `~/dev/backend/`: Hono-Server am Repo-Root, Cloud Functions unter `functions/fitness` und `functions/journal`, TaskChampion-CORS-Proxy unter `scripts/`. Der bisherige Hono-Startpfad bleibt bis zum gemeinsamen Backend-Release kompatibel. Functions-Quellen und Paket-Manifeste liegen ausschließlich im Backend; die alten Frontend-Ordner behalten nur unbearbeitete Konfigurations-/Lockfile-Reste. Neue Backend-Änderungen ausschließlich dort. Die Functions-Deployment-Blöcke wurden aus den Frontend-Manifesten entfernt.

Beim ursprünglichen Backend-Umzug wurden Lockfiles auf ausdrücklichen Nutzerwunsch nicht bearbeitet. Die damaligen Standalone-Workflows verwendeten deshalb `--no-frozen-lockfile`; die aktuelle Journal-CI verwendet `--frozen-lockfile`. Backend-Tests werden in diesem Schritt nicht ausgeführt. Die Frontend-CI führt nur Frontend-Tests aus; Functions-Testdateien gehören zum gemeinsamen Backend. Backend-CI folgt mit dessen Release.

Alte Learn-/Habits-Repos und Shell-Gitlinks bleiben bis zum expliziten Release erhalten. Die Entwicklung erfolgt nur noch im jeweiligen neuen Owner. Keine Services neu starten oder Produktionscheckouts direkt bearbeiten.

## Dependency-Entkopplung

`nodemon` gehört ausschließlich zum gemeinsamen Backend. Fitness delegiert den API-Dev-Start an dessen eigenes npm-Script. Die drei Journal-Functions-Testdateien liegen unter `~/dev/backend/tests/journal`; die Frontend-CI installiert keine Functions-Abhängigkeiten mehr. Die alten Functions-Verzeichnisse enthalten keine ausführbaren Quellen oder Paket-Manifeste mehr und sind nicht Teil der Frontend-Workspace-Installation oder Dependabot-Konfiguration. Lockfiles bleiben unverändert.
