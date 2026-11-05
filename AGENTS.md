# AGENTS.md — Journal

<!-- release-weg:start -->
## Release-Weg und Branches (Journal)

Stand 2026-10-29. Ausführlich: `~/vitalos/docs/DEPLOYMENT.md` (GitHub: nimmsel23/vitalos, `docs/DEPLOYMENT.md`).

**dev → master → vitalos**

| Branch | Rolle | Lokal |
|---|---|---|
| `dev` | Edits und Previews (Preview-Channel `dev`, PR-Channel je PR) | ja — dieser Klon steht fest auf `dev` |
| `master` | **Standalone-Prod** (Hosting-Targets `journal`, `v2`, `door`, `voice`, `game`, `tent` (journal-vos, vos-journal, vos-door, vos-voice, vos-game, vos-tent)); deployt nur per CI (`Live Deploy (Journal master)`) | nein, muss nicht existieren |
| `vitalos` | Stand für die Shell (`~/vitalos/journal-app`); darf hinter `master` liegen | nur als `-app`-Checkout im Meta-Repo |

- Release: `vos-release-pr journal` öffnet den PR `dev → master`. `Check (Journal)` läuft, bei Grün mergt der Auto-Merge
  (Merge-Commit) und startet den Live-Deploy per Dispatch. Nie von Hand auf `master` pushen, außer Hotfix.
- Shell: `vos-release journal` merged `origin/master` nach `vitalos` und bumpt den Pointer im Meta-Repo (deployt die Shell).
  Vorher `vos-overview`.
- `master` wird nie lokal ausgecheckt; `git fetch` genügt. Das Meta-Repo `vitalos` deployt nur noch die Shell.
- Nicht auf `dev` im Hauptordner arbeiten, wenn ein Agent-/Feature-Branch nötig ist: Worktree
  (`git worktree add .worktrees/<name> <branch>`).
- Default-Branch des Repos ist `master`; die `.github/workflows/*.yml` auf `master` bestimmen das Live-Verhalten.
<!-- release-weg:end -->

<!-- sync-infra:start -->
## TaskChampion-Sync-Infrastruktur (Stand 2026-11-05)

Dieses Repo besitzt den Browser-Zugang auf den Taskwarrior-Sync, den Cors-Proxy
und die browserseitigen Sync-Clients (Door v2, TcSetup im Game):

```
vos-door / vos-game / vos-voice / vos-tent / vos-journal / journal-vos / vitalos.web.app
        │  Browser-Clients: src/lib/door/taskchampion.js, src/lib/door/taskwarrior.door.js
        ▼
https://ideapad.tail7a15d6.ts.net/   ← Tailscale-Funnel-Root (internetöffentlich)
        │  tailscale serve → 127.0.0.1:53590
        ▼
tc-cors-proxy.service → scripts/tc-cors-proxy.mjs (:53590, ergänzt nur CORS-Header)
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
