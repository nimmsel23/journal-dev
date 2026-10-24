# VOS Journal

Journal-PWA von VitalOS: Tages-Journal mit Habits, Smart Logger und Kalender, dazu Door, Game, Voice und Tent als
eigene Apps. Eine React-Codebase (Vite, Tailwind, TanStack Query), Daten in Firestore, offlinefähig über Service Worker.

Der Build ist **standalone**: kein VitalOS-Checkout und keine Nachbar-Repos nötig, siehe [`STANDALONE.md`](STANDALONE.md).

## Apps

Derselbe Code, sechs Builds (`VITE_APP_FLAVOR`/`VITE_DEFAULT_TAB`), je ein Hosting-Target:

| App | Adresse | Startansicht |
|---|---|---|
| Journal (v1 + v2) | journal-vos.web.app | Journal-Timeline |
| Journal v2 „Raster“ | vos-journal.web.app | `#v2` |
| Door | vos-door.web.app | `#door2` |
| Voice | vos-voice.web.app | `#voice` |
| Game | vos-game.web.app | `#fire` |
| Tent | vos-tent.web.app | `#tent2` |

Navigation ist der URL-Hash, zum Beispiel `#v2/woche/2026-10-17`, `#door2/plan`, `#focus`. Alle Hashes: [`JOURNAL-V2.md`](JOURNAL-V2.md).

## Entwickeln

```bash
pnpm install --frozen-lockfile
pnpm run dev       # http://127.0.0.1:9001
pnpm test
pnpm run build:cloud
```

Entwickelt wird auf `dev`. Ein Push auf `dev` baut in der CI einen 24-h-Preview-Channel, ein Push auf `master` deployt
`journal-vos.web.app`. Befehle, Targets und der Weg nach vitalos: [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Docs

| Datei | Inhalt |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Architektur und Arbeitsregeln für Claude Code |
| [`JOURNAL-V2.md`](JOURNAL-V2.md) | v2, Habits, Door, Game, Tent, Taskwarrior-Sync |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | CI, Hosting-Targets, Release nach vitalos |
| [`STANDALONE.md`](STANDALONE.md) | Standalone-Build und lokale Kopien |
| [`RESULTS.md`](RESULTS.md) | Session-Log |
| [`REPORT.md`](REPORT.md) | Fehler-Audit vom 2026-07-12 (historisch) |
