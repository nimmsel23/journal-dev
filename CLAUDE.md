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
│   ├── game/              Game v2 (Fire, Focus, Freedom, Frame)
│   ├── voice/             Eigenständiger Voice-Pillar (Stop, Submit, Struggle, Strike)
│   └── tent/              Tent v2
└── components/            Updater, Install-Hinweise, TabContent, v1-Timeline (Journal/)
```

**Alias** (`vite.config.cjs`): `@journal-db` und `@db` → `src/db/index.js`, `@utils` → `src/lib/db/core.js`,
`@journal` → `src`. v2 importiert Journal-CRUD direkt aus `lib/db/journal.js`, nicht über `@journal-db`.

**Routing**: Die URL ist die einzige Quelle für Tab, Modus und Datum.
`#v2[/woche|monat|habits][/<datum|today>]`, `#door2[/plan|production|profit]`, `#game2/<fire|focus|freedom|frame>`, `#voice`
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

## Destillat aus der RESULTS.md (2026-11-07)

Kurzfassung dauerhaft relevanten Wissens aus dem früheren Arbeitslog, thematisch einsortiert vom thin-results-Dienst.

## Worum es geht

Journal-App als zentrales Submodul im VitalOS-Meta-Repo mit Fokus auf **Journal v2**, **Door v2**, **Voice**, **Game v2**, **Habits v2** und **Tent v2**.

---

## Architektur

### Offline-First Prinzip

- **Anforderung:** Apps müssen offline-first sein — lokale Daten sind die Wahrheit, Abgleich still im Hintergrund
- **Implementierung:** lokaler Store (localStorage) + Outbox + Sync-Engine (Pull → Rebase → Outbox)
- **UI:** Keine "Lade…"-Zustände; Daten immer aus lokalem Store; dezente Hinweise ("↻ n") für offene Änderungen
- **Backend:** Optimistisches Schreiben (`track()`) ohne Server-Bestätigung; Firestore-Listener cache-first

---

### Hash-Routing

- **Single Source of Truth:** URL-Hash ist einzige Quelle für Tab/Modus/Datum
- **Hooks:** `hashRoute.js` + `useHashRoute`
- **Vorteile:** Vereinheitlichte Navigation; alle bestehenden URLs bleiben gültig; Reduktion von `main.jsx` (234 → 159 Zeilen)

---

### Gemeinsame Komponenten

- **Google-Integration:**
  - `src/lib/google/{tokens,auth,useGoogle}.js` — Token-Speicher (`localStorage`), Erneuerung 2 min vor Ablauf, geteilte parallele Aufrufe, 401-Retry
  - Fehlercodes: `google-expired`, `google-offline`
  - `useGoogle` Hook für alle Oberflächen
- **Autosave:** `draftStore.js` (Entwurf, Entprellen, Dirty-Regel, Wiederherstellung) + `useAutosaveField.js` + `AutosaveArea.jsx`
- **Cache-First:** `fastDocs.js` für cache-first Lesen

---

## Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `vos-release-pr journal` | Erstellt Release-PR von `dev` → `master` |
| `journal-release --yes` | Führt Release aus (dev pushen, mergen, Pointer bumpen) |
| `npm run deploy:vos` | `vos-release journal --yes` (Weitergabe von `--dry-run` unterstützt) |
| `npx vite build --mode firebase` | Build für Firebase Hosting (fallback) |
| `pnpm run build:firebase` | Standard-Build (kann an Store-Locks scheitern) |
| `pnpm run build:cloud` | Build mit PWA-Service-Worker (3.009+ Module) |

---

## CI und Deploy

### GitHub Actions

- **Deploy:** `deploy-master.yml` (z. B. Run 40894437472) für Live-Deploy nach Merge
- **Push-Functions:** `deploy-push-functions.yml` — **Blocker:** fehlendes `secretmanager.secrets.get` für CI-Serviceaccount
- **Test:** `CI=true pnpm test` (z. B. 135/135)
- **Lockfile:** `--frozen-lockfile` für `pnpm-lock.yaml`

---

### Dependabot

- **Aktiviert:** Security Updates und Alerts
- **Schedule:** Wöchentlich
- **Targets:** `dev` Branch
- **Gruppierung:** Minor/Patch Updates gruppiert
- **Vendored:** mini-app-shell Kopien bleiben an Quelle gepflegt

---

### Validierung

- **Node-Tests:** Immer vor Commit (z. B. 27/27, 51/51, 84/84, 119/119, 135/135)
- **Build-Checks:** `vite build --mode firebase` nach jedem Commit
- **Browser-Tests:** Oft nicht durchgeführt (headless Thorium mit gemockten Daten als Fallback)
- **Echte Daten:** Selten gegen echte Firestore-/Backend-Daten getestet
- **Service Worker:** Kann Reload erfordern (` localToday()`-Bug durch UTC vs. Ortszeit)

---

## Google Tasks / Calendar

### Token-Management

- **Problem:** `reauthenticateWithPopup` liefert nur ~1-h-Access-Token **ohne** Refresh-Token, gespeichert in `sessionStorage` (Tasks und Kalender getrennt)
- **Lösung:** Gemeinsamer Dienst mit **serverseitigem Refresh-Token** (Cloud Function) + Popup-Rückfall
- **Token-Speicher:** `localStorage` (früher `sessionStorage`)
- **Erneuerung:** 2 min vor Ablauf; 401 → einmal mit frischem Token wiederholen

---

### OAuth-Konfiguration (OFFEN)

- **Fehlend:**
  - OAuth-Client mit **Ursprüngen**
  - Zustimmungsbildschirm auf **"In Produktion"** (sonst Refresh-Token nach 7 Tagen weg)
  - Secret: `firebase functions:secrets:set GOOGLE_OAUTH_CLIENT_SECRET`
  - Client-ID: `GOOGLE_OAUTH_CLIENT_ID`
  - Deploy: Codebase `journal` (`functions:journal`)
- **Prüfen:** Ob `deploy-push-functions.yml` Google-Functions mitnimmt

---

### REST-Adapter

- `gcal.js`, `gtasks.js`: nur noch REST über `google.authFetch`
- **door:** `DoorV2View.jsx`, `DoorV2Panels.jsx`
- **journal:** `JournalV2View.jsx`, `GameMapPanel.jsx` (Fire)
- **firebase:** `firebase.js` (`app` exportiert)
- **Fire:** Zeigt "Heute" und hat Umschalter "Alle Kalender" (`jv2:cal-all`)

---

## TaskChampion-Sync

- **CORS-Proxy:** `journal-dev/scripts/tc-cors-proxy.mjs` erlaubt `https://vitalos.web.app` (für Game/Fire in VitalOS-Shell)
- **Sync:** Game/Fire innerhalb der Shell nutzen denselben Proxy für TaskChampion-Sync
- **Door v2:** `selectWeeklyDoor` (`src/lib/door/taskwarrior.door.js`) mit `+door`-Tag und ISO-Woche (`kw<NN>`)
- **Limitierung:** Keine Test-Attrappe für `tasks()`/`commit()` gegen TaskChampion-Replik

---

## Tests

- **Node-Tests:** Immer grün vor Commit (z. B. 8/8, 16/16, 18/18, 27/27, 51/51, 84/84, 119/119, 135/135)
- **Test-Files:** `tests/minimumLog.test.mjs`, `tests/tracker-habits.test.mjs`, `tests/draft-store.test.mjs`, `tests/fast-docs.test.mjs`, `tests/gtasks-store.test.mjs`, `tests/gtasks-model.test.mjs`, `tests/gtasks-sync.test.mjs`, `tests/gtasks-lists.test.mjs`, `tests/google-tokens.test.mjs`, `tests/google-function.test.mjs`, `tests/hash-route.test.mjs`
- **Browser:** Selten im Browser getestet; oft headless Thorium mit gemockten Daten
- **Echte Nutzerdaten:** Nie gegen echte Firestore-Daten geschrieben (außer explizit erwähnt)

---

## Weitere Doku

- [README.md](./README.md) — Apps, Entwickeln, Docs
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Release-Weg, Push, Hosting
- [JOURNAL-V2.md](./JOURNAL-V2.md) — Journal v2 Design, Features, Door v2
- [AGENTS.md](./AGENTS.md) — Zusammenführung, Release-Weg, TaskChampion-Sync
