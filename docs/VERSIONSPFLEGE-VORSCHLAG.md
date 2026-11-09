# Versionspflege Journal — Vorschlag für CEO-Entscheid

Stand: 2026-11-09 · Org-Task `9545df26-ce6b-4755-a542-e6c98d9a82f3` · nur Dokumentation, keine Versionsänderung.

## Ist

- `package.json` steht seit Längerem auf `0.1.1`.
- Build setzt `__APP_VERSION__` = ``${version}+${sha7}`` (`vite.config.cjs`); Update-Dialog und Header zeigen das.
- Release-Weg: `dev` → Auto-Promote → `master` → Live Deploy (Hosting-Targets journal/v2/door/voice/game/tent). Kein automatischer Versionsbump, kein Git-Tag aus der CI.
- `pnpm release` = `vos-release-pr journal` (PR-Weg), nicht lokaler Patch-Bump + Deploy.

Symptom: Nutzer sehen dauerhaft `v0.1.1+……`; die Revision ändert sich, die Semver-Zahl nicht.

## Ziel

Eine nachvollziehbare Semver-Zahl, die bei Live-Deployen mitläuft, ohne den Offline-first-Client oder den Auto-Promote zu sprengen. Eine Versionslinie für alle sechs Journal-Hosting-Targets (eine Codebase).

## Schema (Empfehlung)

Klassisches Semver `MAJOR.MINOR.PATCH` in `package.json`:

| Stufe | Wann |
| --- | --- |
| PATCH | Fix, Docs, CI, Dependabot, reine Härtung ohne sichtbare Produktänderung |
| MINOR | sichtbares Feature / neues Tab-Verhalten / neue Offline-Fähigkeit |
| MAJOR | Breaking für gespeicherte Client-Daten, Hash-Routing-Vertrag oder Pflicht-Migration |

Anzeige bleibt `MAJOR.MINOR.PATCH+sha7` (Build-Revision unverändert als Build-Metadaten nach Semver-`+`).

## Kopplung an Auto-Promote / Live-Deploy — Optionen

### Option A — Patch bei jedem Live-Deploy (einfachst)

- In `deploy-master.yml` vor dem Build: `package.json` Patch +1, Commit auf `master` **oder** nur Build-Env ohne Git-Commit (dann driftet Repo-Version).
- **Pro:** Nutzer sehen Bewegung. **Contra:** Jeder Dependabot-Promote zählt als Release; Git-Commit auf `master` kollidiert mit Fast-Forward-Promote (Divergenz-Risiko).

### Option B — Bump nur auf `dev`, Promote trägt mit (empfohlen)

- Vor Push auf `dev` (oder als letzter Commit eines Feature-Pakets): Mensch/AL setzt Semver bewusst.
- Optional CI-Check: warnt, wenn seit letztem `master`-Tag `package.json`-version unverändert und Diff nicht nur docs/chore ist (kein Autowrite).
- Live-Deploy baut wie heute aus `master`; Tag `journal-vX.Y.Z` am Promote-Commit (annotated, nach Fast-Forward).
- **Pro:** keine Schreib-Race auf `master`; passt zu Fast-Forward-Automerge. **Contra:** Disziplin nötig, sonst wieder Stuck.

### Option C — CalVer `YYYY.MM.PATCH`

- z. B. `2026.11.0` beim ersten Deploy im Monat, dann Patch.
- **Pro:** klarer Zeitbezug. **Contra:** bricht mit bestehendem `0.1.1`-Feld und üblichen npm-Semver-Erwartungen; Migration einmalig hässlicher.

**Empfehlung an CEO:** Option B + erster bewusster Sprung (siehe Migration). Kein Autobump auf `master`.

## Kleiner Migrationsweg (nach CEO-Wahl)

1. CEO wählt Option A/B/C und Baseline:
   - konservativ: `0.2.0` (Signal „Versionspflege startet“), oder
   - produktreif: `1.0.0` (Standalone-PWAs live, Vertrag stabil).
2. Ein Commit auf `dev`: nur `package.json` `version` + Kurznotiz in `RESULTS.md` — **kein** Deploy-Sonderweg.
3. Auto-Promote / Live-Deploy wie bisher; optional Workflow-Schritt „tag if package.json version newer than latest `journal-v*`“.
4. Danach: Version nur noch mit Feature-/Fix-Commits mitbumpen (Checkliste in AL-Anleitung oder `DEPLOYMENT.md` eine Zeile).
5. Shell/`vos-release journal` unverändert; Meta-Repo bekommt die Zahl indirekt über den App-Stand.

Nicht Teil dieses Vorschlags: Store-VersionCodes, native Apps, getrennte Flavor-Versionen.

## Entscheidung (CEO 2026-11-09)

- [x] Option **B** (Bump auf `dev`, Promote trägt mit; kein Autobump auf `master`)
- [x] Baseline **`1.0.0`** (Owner: „0.1.1 suckte“; Standalone-PWAs live → produktreifer Start)
- [x] Git-Tag `journal-v*`: **später optional** (nicht Teil des Erstsprungs)
- [x] Umsetzung: `package.json` → `1.0.0` auf `dev` (Commit mit RESULTS/DEPLOYMENT-Notiz)

Danach: bei Feature-Paketen MINOR, bei Fixes PATCH bewusst mitbumpen — eine Zeile in `DEPLOYMENT.md`.
