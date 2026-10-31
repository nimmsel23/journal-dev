# CLAUDE.md

Hinweise für Claude Code (claude.ai/code) in diesem Repository.

## Worum es geht

**journal-dev** (`@vos/journal`) ist das Journal-PWA von VitalOS: Journal-Timeline (v1), das Raster-Journal **v2**
mit Habits, Smart Logger und Kalender, dazu die Flavor-Apps **Door, Game (Fire/Focus/Freedom/Frame), Voice und Tent**.
Alles ist **eine React-Codebase**, die als sechs Hosting-Targets gebaut wird. Daten liegen in Firestore
(Projekt `fitness-aos`), das Repo ist ein Client ohne eigenen Server.

Das Repo stammt aus einem Fork von fuel-dev. Fastify, SQLite, wger und `fuelctl` gibt es hier **nicht** mehr;
steht davon noch etwas irgendwo, ist es ein Rest und kann weg.

**Muss offline funktionieren** (Service Worker + Firestore-Persistenz). Neue Features dürfen keinen Netzwerkzugriff
beim Start oder für die Navigation voraussetzen; Routing läuft deshalb rein über den URL-Hash.

**Offline-first ist Grundanforderung** (alle Apps/Targets): Die Oberfläche liest und schreibt nur lokal, der Abgleich läuft still im
Hintergrund, es gibt keine Warnhinweise und keine Wartezeiten wegen Netz. Door-Daten aus Google Tasks: lokaler Store + Outbox in
`localStorage` (`src/lib/door/gtasks.{store,model,sync,local}.js`, Details in `JOURNAL-V2.md` → „Door v2 · Offline-first“); die
Ansichten rufen Google nie direkt auf. Firestore-Schreibzugriffe nie awaiten (`track()`).
Textfelder: Entwurf je Tastendruck in `localStorage` + entprelltes Autosave (`src/lib/draftStore.js`, `useAutosaveField.js`, Komponente `views/game/AutosaveArea.jsx`), kein Speichern nur bei `onBlur`; Lesen cache-first (`src/lib/db/fastDocs.js`).

**v1 bleibt unverändert** (`src/components/Journal/`, `src/views/JournalVosView.jsx`, `public/index.html`).
Umbauten betreffen v2, Door, Game, Tent und die gemeinsame Infrastruktur.

## Befehle

```bash
pnpm run dev            # Vite auf 127.0.0.1:9001 (VITE_APP_MODE=client)
pnpm test               # node --test tests/*.test.mjs
pnpm run build:cloud    # Build nach dist-firebase/ (Target journal)
pnpm run build:firebase # wie build:cloud, mode firebase (nimmt die Preview-CI)
```

Es gibt **pnpm**, kein npm (`packageManager: pnpm@11.3.0`). `pnpm-lock.yaml` ist getrackt; beide CIs installieren mit
`--frozen-lockfile`. Wer `package.json` ändert, aktualisiert das Lock im selben Commit (`pnpm install --lockfile-only`).

**node_modules** ist hier lokal ein Symlink auf `~/vitalos/node_modules` (der vitalos-Workspace hält denselben Stack).
Darin **kein `pnpm install` ausführen**; neue Pakete über den vitalos-Root installieren. Direkt bauen mit
`VITE_APP_MODE=client npx --no-install vite build --mode firebase --config vite.config.cjs`, denn `pnpm run …` stößt
einen Install-Check an, der den Symlink anfassen will. Reproduzierbar ist der Stand nur über das Lock in der CI.

## Architektur

```
src/
├── main.jsx               App-Shell (Auth, Header, Tab-Rendering)
├── routes.js              TAB_CONFIG: Tabs, lazy Views, getProps(ctx)
├── lib/
│   ├── hashRoute.js       Parser/Builder des URL-Hash (rein, getestet)
│   ├── useHashRoute.js    Hook: { tab, mode, date, setDate, setMode, navigate }
│   ├── useSetting.js      useState mit localStorage-Persistenz (JSON, normalize)
│   ├── firebase.js        Firebase-Init + Auth
│   ├── google/            gemeinsamer Google-Token-Dienst (Tasks + Calendar): tokens.js (rein), auth.js, useGoogle.js
│   ├── db/                Firestore-Zugriff (core.js, journal.js, firestore/*)
│   └── door/              Door-Datenquellen (Backend/Google Tasks/Taskwarrior)
├── db/index.js            @journal-db: Journal-eigene DB-Fassade
├── views/
│   ├── v2/                Journal v2 (Raster)
│   ├── door/v2/           Door v2   ·  views/door/ = v1-Ansichten
│   ├── game/              Game v2 (Maps, Fire, Voice)
│   └── tent/              Tent v2
└── components/            Updater, Install-Hinweise, TabContent, v1-Timeline (Journal/)
```

**Alias** (`vite.config.cjs`): `@journal-db` und `@db` → `src/db/index.js`, `@utils` → `src/lib/db/core.js`,
`@journal` → `src`. v2 importiert Journal-CRUD direkt aus `lib/db/journal.js`, nicht über `@journal-db`.

**Routing**: Die URL ist die einzige Quelle für Tab, Modus und Datum.
`#v2[/woche|monat|habits][/<datum|today>]`, `#door2[/plan|production|profit]`, `#game2/<fire|focus|freedom|frame|voice>`
(Kurzform `#fire` …), `#tent2[/<datum>]`. Tab-Metadaten (Alias, Modi, ob das Datum im Hash steht) stehen als Tabelle
in `hashRoute.js`; ein neuer Tab mit Modus ist ein Eintrag dort plus einer in `routes.js`. Der Start-Tab eines Builds
kommt aus `VITE_DEFAULT_TAB`, der Standard-Game-Modus aus `VITE_DEFAULT_GAME_MODE`. Views bekommen `mode`, `date`,
`onModeChange`, `onDateChange` aus `getProps`; `navigate()` liest den Hash zum Aufrufzeitpunkt, mehrere Aufrufe im selben
Tick sind also sicher.

**Einstellungen pro Browser**: `useSetting(key, initial, normalize)` statt eigener `try { localStorage … }`-Blöcke.
Alte Flags `"1"`/`"0"` liest `asBool` weiter.

**Firestore** (Auszug): Journal `fitness/{uid}/journal` (ein Dokument pro Eintrag, Auto-ID), Habits
`fitness/{uid}/habits` + `habitRecords`, Einstellungen/Maps/Profit `journal/{uid}/…` (Rule `journal/{uid}/**`,
als Fragment in `firestore.rules.part`; vitalos bettet es in seine `firestore.rules` ein).

**Flavors**: `VITE_APP_FLAVOR` (door/voice/game/tent) setzt Manifest, Icons (`public/icons-*`), Titel und Splash.
Details zu v2, Door, Game, Tent und Taskwarrior-Sync: [`JOURNAL-V2.md`](JOURNAL-V2.md).

## CI und Deploy

- **Preview-CI** (`preview-dev.yml`): Push auf `dev` oder PR → `pnpm install --frozen-lockfile`, `pnpm test`,
  `build:firebase`, Preview-Channel (24 h) mit Link per Telegram.
- **Live-CI** (`deploy-master.yml`): Push auf `master` → Test, `build:cloud`, Deploy auf `journal-vos.web.app`.
- **Lokaler Hook** `.githooks/post-commit`: ein Commit **auf `master`** mit Änderungen unter `src/`, `public/`,
  `index.html`, `vite.config*`, `package.json` oder `firebase.json` löst `npm run deploy` aus. Auf `dev` passiert nichts.
- Sechs Hosting-Targets (`journal`, `v2`, `door`, `voice`, `game`, `tent`); Befehle in [`DEPLOYMENT.md`](DEPLOYMENT.md).
- **Nach vitalos:** `journal-release` bzw. `pnpm run deploy:vos` (`vos-release journal`).

**Regeln**: Kein `firebase deploy`, kein `deploy:*`, kein Prod-Restart und kein Commit auf `master` ohne ausdrückliches
OK. Entwickelt wird auf `dev`; nach jeder fertigen Änderung committen. Tests (`pnpm test`) und ein Build müssen vorher
grün sein.

## Google Tasks / Calendar

Eine gemeinsame Verbindung (`src/lib/google/`, Hook `useGoogle`) für Door v2 (Google Tasks), Journal v2 und Game → Fire
(Kalender). Dauerhaft nur mit der Cloud Function `functions/google.js` (Refresh-Token serverseitig, `googleTokens/{uid}`
ohne Rule); ohne sie Rückfall auf das Firebase-Popup (~1 h). Einrichtung und Begründung: `JOURNAL-V2.md` → „Google dauerhaft
verbinden“. Neue Google-Aufrufe immer über `google.authFetch`, nie eigene Tokens halten.

## Tests

`tests/*.test.mjs` (Node-Testrunner, kein Browser): `habits-v2` (Serien/Quoten), `hash-route` (Parser gegen das alte
Verhalten), `use-setting` (Speicher, Abwärtskompatibilität), `standalone` (keine Symlinks/Imports außerhalb des Repos,
keine undeklarierten Abhängigkeiten), `journal-push-startup`, `google-tokens` (Token-Ablauf/Erneuerung/401-Retry/Modi),
`google-function` (`functions/google.js`: Code-Tausch, Refresh, Widerruf, mit gefälschtem fetch/Speicher), `gtasks-store`/`gtasks-model`/`gtasks-sync`/`gtasks-lists` (Door-Offline-first: Outbox, Rebase, zwei Clients, Listenauflösung). UI-Verhalten ist nicht automatisiert getestet.

## Weitere Doku

[`README.md`](README.md) · [`JOURNAL-V2.md`](JOURNAL-V2.md) (v2, Door, Game, Tent, Habits) · [`DEPLOYMENT.md`](DEPLOYMENT.md) ·
[`STANDALONE.md`](STANDALONE.md) (Standalone-Build, lokale Kopien) · [`RESULTS.md`](RESULTS.md) (Session-Log) ·
[`REPORT.md`](REPORT.md) (Audit vom 2026-07-12, historisch).
