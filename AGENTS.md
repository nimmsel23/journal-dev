## Zusammenführung seit 2026-11-06

Habits-Hosting (`habit-vos`) ist ein Journal-Flavor-Build (`deploy:habits`, Default `#v2/habits`).
`apps/habits` ist Legacy-Shell (nicht mehr Live-Deploy-Quelle). Node-Backend gehört
ausschließlich nach `~/dev/backend/`. Siehe `docs/CONSOLIDATION.md`.

# AGENTS.md — Journal

<!-- release-weg:start -->
## Release-Weg und Branches (Journal)

Stand 2026-11-09. Ausführlich: `~/vitalos/docs/DEPLOYMENT.md`.

**dev → master** (+ Shell-Pin auf `origin/master`)

| Branch | Rolle | Lokal |
|---|---|---|
| `dev` | Edits und Previews (Preview-Channel `dev`, PR-Channel je PR) | ja — dieser Klon steht fest auf `dev` |
| `master` | **Standalone-Prod** — Kanon **`vos-journal`** (+ `/mini/{door,voice,game,tent,habits}`); Legacy-Sites nur 301. Deploy nur per CI | nein, lokal nicht nötig |
| `vitalos` | **Legacy** (darf remote noch existieren) — kein Pin-Ziel mehr | nicht für Shell nutzen |

- Release (automatisch): `dev` committen und pushen. Nach grünem Check promotet `automerge.yml` nach `master` und startet den Live-Deploy. Direkte Pushes auf `master` vermeiden; Hotfixes über `dev`.
- Shell: `vos-release` / `vos-ship` pinnt `origin/master` (detached im `*-app`) und bumpt den Meta-Pointer → `deploy-shell.yml`. Vorher `vos-overview`.
- `.gitmodules` im Meta-Repo: `branch = master`. Kein Auto-Vorspulen eines App-Branches `vitalos` mehr.
- Parallel-Branches/Worktrees nur mit Owner-Ausnahme.
- Default-Branch des Repos ist `master`; die Workflows auf `master` bestimmen das Live-Verhalten.
<!-- release-weg:end -->

## Vite 8 / Rolldown

`vite.config.cjs` enthält `fixRolldownPreloadMarker`. Rolldown 1.3.0 hängt sonst
an `__VITE_PRELOAD__` einen Hash; Vite ersetzt nur die Marke und lässt `[]<hash>`
im Bundle (SyntaxError → Blackscreen, wie bei `vos-6pack.web.app` /
`vos-coach.web.app`). Override pinnt `rolldown@1.2.16`; Post-Build-Scrub
`scripts/fix-vite-preload-markers.mjs` ist Defense-in-depth. Plugin/Pin nicht
entfernen — Journal-Flavor-Builds nutzen `React.lazy`-Routen.

Solo-Flavors setzen `VITE_SOLO_TABS` (ein Tab-Key), damit ungenutzte
`lazy()`-Imports aus dem Bundle fallen. Hub-Builds (journal / v2) ohne Flag.

<!-- sync-infra:start -->
## TaskChampion-Sync-Infrastruktur (Stand 2026-11-05)

Dieses Repo besitzt den Browser-Zugang auf den Taskwarrior-Sync und die
browserseitigen Sync-Clients; der CORS-Proxy gehört zu `~/dev/backend/`. Die Clients (Door v2, TcSetup im Game) verwenden folgenden Weg:

```
vos-journal (+ /mini/*) / Legacy-Redirects / vitalos.web.app
        │  Browser-Clients: src/lib/door/taskchampion.js, src/lib/door/taskwarrior.door.js
        ▼
https://ideapad.tail7a15d6.ts.net/   ← Tailscale-Funnel-Root (internetöffentlich)
        │  tailscale serve → 127.0.0.1:53590
        ▼
tc-cors-proxy.service → ../backend/scripts/tc-cors-proxy.mjs (:53590, ergänzt nur CORS-Header)
        ▼
taskchampion-sync-server :53589 (Systemdienst, 0.0.0.0, /usr/bin, Daten /var/lib/taskchampion-sync-server)
```

Regeln:

- Die Origin-Whitelist im Proxy entspricht genau den Hosting-Targets dieses
  Repos. Bei neuen/umbenannten Firebase-Origins das Skript hier anpassen und
  `systemctl --user restart tc-cors-proxy` ausführen.
- Der Proxy fasst nur Header an; Nutzdaten bleiben E2E-verschlüsselt
  (`sync.encryption_secret`, client_id). Die Whitelist ist **keine**
  Zugangskontrolle — Nicht-Browser-Clients (task CLI, Claw Warrior) laufen
  ohne Origin durch.
- Der Funnel-**Root** gehört dem Sync. Andere Dienste (z.B. Coach-Pfade
  `/fitness`, `/6pack`, `/6pack-apk`) bekommen eigene `tailscale serve`-Pfade
  und niemals den Root.
- Ausführliche Beschreibung: `JOURNAL-V2.md` (Abschnitt Taskwarrior-Sync bzw.
  Door v2 · Sync). Übergeordnete Netz-/Funnel-Sicht: `~/COACH.md` (Abschnitt
  „Coach-API-Dienst").
<!-- sync-infra:end -->

## Org-Taskwarrior (global) — gilt fuer alle Agenten der VitalOS-Org

Verbindlich fuer alle Agenten (Vibe, Claude, Codex, Gemini) in Org-Kontexten
(Owner-Weisung 2026-11-07):

1. EINE globale Org-Task-DB — KEINE eigenen Rollen- oder Repo-DBs mehr:
   `TASKRC=~/.local/state/vitalos-org/taskrc` (DB liegt daneben in `task/`).
   Alte Repo-DBs sind archiviert unter `~/.local/state/vitalos-org/archive-repodb/`.
2. Daniels private Taskwarrior-DB (`~/.task`, u. a. Hotlist `+hot`) bleibt
   TABU fuer Schreibzugriffe — nur lesend (CEO-Runde: Task `status:pending +hot`).
3. Rolle = Tag: Jeder Agent taggt seine eigenen Aufgaben mit seiner Rolle:
   `+ceo`, `+cto`, `+al`, `+pm`, `+alpha`, `+betta` …
4. Abteilung/Repo = project: `project:fitness-dev`, `project:journal-dev`,
   `project:vitalos-prod`, `project:dotfiles`, `project:aos` …
5. Prio-Encoder (in der Org-taskrc verankert):
   - `+hit` und `+br` sind EIN Tier (Hits = Big Rocks, Koeffizient 8.0) —
     hoechste Dringlichkeit, `+hit` = `+br`.
   - `+lr` 2.0 (Little Rocks).
   - `+hot` 1.0 — NUR Potential/Sichtbarkeit, wird NIE automatisch ausgefuehrt;
     ob ein Potential jetzt anfaellt, entscheidet der Door War (Sonntagsrunde).
   - `+s` -1.0 (Sand, Zeitverschwendungsroutine).
   - `+go` ist KEINE Prioritaet und bewirkt nichts — Freigaben laufen ueber
     die Rollen (CTO-Freigabeprozess), nicht ueber Urgency.
6. Aufgaben IMMER per UUID anfassen (`task <uuid> modify|done|info`), NIE per
   ID — IDs renummerieren sich nach jedem `done` (Fehltreffer-Gefahr).
7. Guard: orgsh und die Runner verweigern den Lauf, wenn die Org-taskrc fehlt —
   kein stiller Rueckfall auf die Privat-DB.
8. Uebersicht/Rang: `TASKRC=~/.local/state/vitalos-org/taskrc \
   ~/.org/venv/bin/python ~/aos/bin/aos door plan quadrants --json`
   (Eisenhower-Sicht Q1–Q4).
