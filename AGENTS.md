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
