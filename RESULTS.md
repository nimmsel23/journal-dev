- 2026-11-11: Submodul-Pin `aos-game` → `c8b9d0e` (Hub Chapter-Texte via v-html; live game-aos).
- 2026-11-11: Submodule `aos-core4` + `aos-voice` (Pfad Root `aos-*/`, Branch `master`) — vier AOS-Pillars komplett; bewusst **nicht** unter `src/` (Journal-Frontend).
- 2026-11-11: Submodul `aos-door` → `git@github.com:nimmsel23/aos-door.git` (Pfad `aos-door/`, Branch `master`); zusammen mit `aos-game` lokal + `origin/dev`.
- 2026-11-11: Submodul `aos-game` → `git@github.com:nimmsel23/aos-game.git` (Pfad `aos-game/`, Branch `master`, Pin `620f4df`); lokal + `origin/dev`.
- 2026-11-11: Solo-Icons auf **vos-journal/mini/{door,voice,game,tent,habits}/** (`build-journal-minis.mjs`); Legacy-Sites vos-door/voice/game/tent + habit-vos → 301. Game-Maps unter `/mini/game/<map>/`.
- 2026-11-11: Kanon-Hosting **vos-journal.web.app** (Target `v2`); `journal-vos` → 301-Redirect.
- 2026-11-11: Org `d48d852d` Semver-Live journal-vos — Header/Update `0.2.0+031a78c` (Live Deploy 42803023456); Tag `journal-v0.2.0`; Task done.
- 2026-11-10: Org `eeb9d722` — smartLogErrorText fail-closed (`src/lib/smartLogErrorText.js`, Tests; INTERNAL/[0] → Nutzertext „Smart Logging ist gerade nicht verfügbar“; Server-Reasons aus `5f2f694`).
- 2026-11-10: C-012 Semver Baseline 0.2.0 + Promote-Tag `journal-v*` (PR #51).
- 2026-11-10: fix(git): accidental `.worktrees/*` gitlinks entfernt + `.gitignore` — Gemini CI Agent Checkout (`No url found for submodule path .worktrees/…`) war die Rot-Ursache; Commit `c2bf199` auf `dev`.

- 2026-11-10: fix(build): Flavor-Solo via `VITE_SOLO_TABS` — tote `lazy()`-Tabs aus Door/Voice/Game/Tent/Habits-Builds; Hub journal/v2 bleibt voll.
- 2026-11-10: feat(habits): Hosting als Journal-Flavor — `deploy:habits` (`VITE_APP_FLAVOR=habits`, Default `#v2/habits`), `dist-habits` statt `apps/habits` Shell; Live-Deploy ohne Fitness/Fuel/6pack/Plan/KB-Nachbarn; `VITE_DEFAULT_MODE` für journal-v2.
- 2026-11-10: fix(build): Rolldown-Preload-Guard nachgezogen (fitness/6pack/fuel/relax) — `rolldown@1.2.16` Pin, `fixRolldownPreloadMarker` in Root+habits Vite-Config, Post-Build-Scrub `scripts/fix-vite-preload-markers.mjs` an allen Hosting-Builds; viele `React.lazy`-Routen.
- 2026-11-10: fix(habits): Vite 8 `manualChunks` Funktionsform — Live Deploy 42725191840 Build Journal (habits) wieder grün; Semver PATCH `1.0.1`.
- 2026-11-10: chore(deps) major stack align — React 19 / Vite 8.3.6 / plugin-react 6.2.1 / Firebase 13 (age-safe pins, pnpm-workspace overrides).

## 2026-11-09 — deps: minor/patch Upgrades

- `npm-check-updates --target minor` + Lockfile; `packageManager` bleibt pnpm@11.3.0; `@firebase/util` ^1.12.1.

## 2026-11-09 — Live-Deploy: 6pack+plan+backend (Firebase 13/React 19 live)

- Live Deploy rot: habits → SixPack/`workoutDoc`, Plan/`planVersions`, dann fuel `src/shared` → `../../../../backend/fuel/...`.
- `deploy-master.yml`: Nachbarn `6pack-dev` + `plan-dev`; privates `backend@dev` via `SYNC_TOKEN`.
- Repo-Secret `SYNC_TOKEN` auf journal-dev gesetzt (wie fuel-dev).
- Ziel: Firebase 13 + React 19 (habits) auf Hosting nachziehen.

## 2026-11-09 — Node Tooling (Biome/knip/engines/smoke)

- `engines.node: >=22.13`, Scripts `tooling:biome|knip|check`.
- Check.yml: Biome format auf `scripts/`; knip report (continue-on-error).
- SSOT-Vorlagen: `~/vitalos/tooling/`.

## 2026-11-09 — Firebase 13 + React 19 (Dependabot #46/#49/#50)

- **CI:** Live-Deploy standalone — Nachbarn/Fitness-KB/`build:kb-data` entfernt (waren tot; Check/Preview schon standalone).
- Owner: keine PR-Sperre — rote Majors fixen und auf `dev` bringen.
- `firebase` ^13.1.0 (root + habits); `VertexAIBackend` → `AgentPlatformBackend`.
- habits: `react`/`react-dom` ^19.3.1; vite-Alias `firebase/vertexai` entfernt.
- Beleg lokal: `pnpm test` 182 ok, `build:firebase` + `build:habits` grün.
- Dependabot-PRs #46/#49/#50 werden als supersediert geschlossen.

## 2026-11-09 — Semver Baseline 1.0.0 (CEO: Option B)

- Owner/CEO: `0.1.1` verworfen; Entscheidung Option B + Baseline `1.0.0`.
- `package.json` `version`: `0.1.1` → `1.0.0` (Anzeige weiter `1.0.0+sha7` via vite).
- `docs/VERSIONSPFLEGE-VORSCHLAG.md` Entscheidungsbox abgehakt; `DEPLOYMENT.md` Pflege-Regel.
- Kein Autobump auf `master`, kein `journal-v*`-Tag im Erstsprung. Live folgt Auto-Promote.

## 2026-11-09 — Remote-vitalos gelöscht; Pre-Push ohne vitalos-Deploy

`origin/vitalos` entfernt. Pre-Push: kein lokaler Firebase-Deploy mehr auf Branch vitalos; Reminder/Build auf `dev`.

## 2026-11-09 — Shell-Pin auf origin/master (CI/AGENTS)

CI: kein Auto-Vorspulen von `vitalos` mehr; Merge-Agent nur `master`; PR-Checks
auf `[master, dev]`. AGENTS Release-Weg: `dev → master` + Shell-Pin.

## 2026-11-09 — C-003 4-Deposit-Lückenliste (Org `c46b3028`)

- `docs/C-003-4-DEPOSIT-LUECKENLISTE.md`: Ein Freitext ohne KI deckt Body/Business/Balance/Being **nicht** sichtbar ab; Deposits nur über `smartLog.applied.daily_deposits` (Belege `JournalV2View.jsx`, `journal.js`, `JournalV2Range.jsx`, Commit `b33f924`).
- DoD: max. 5 Lücken je S/M/L, kein Bau. Produktfrage an PM/CEO: manuelle Observe-Deposits vs. Smart-only.

## 2026-11-09 — Versionspflege-Vorschlag (Org-Task 9545df26)

- `docs/VERSIONSPFLEGE-VORSCHLAG.md`: Semver-Schema, Kopplung an Auto-Promote/Live-Deploy (Option A/B/C, Empfehlung B), Migrationsweg und CEO-Checkboxen.
- Keine `package.json`-Versionsänderung, kein Tag, kein Deploy. Home-/Repo-TODO abgehakt; Umsetzung wartet auf CEO-Entscheid.

## 2026-11-09 — Aufgabe 4: Composer-Zuklapp Vorschlag+Test

- `src/lib/journal/composerCollapse.js` + `tests/composer-collapse.test.mjs`: Legacy-Heuristik (wasSaving↓ + leerer Text) vs. Vorschlag `onSubmit → { ok }` belegt; 4 Node-Tests grün.
- `JournalForm.jsx` nicht umgebaut (Anleitung: nur Vorschlag mit Test). Wiring/Gerätetest erst nach Freigabe.

## 2026-11-07 — CI-Agent-Fix: gh pr list Feld korrigiert

- Journal-Run 42416606547 scheiterte vor Gemini: GitHub CLI meldete `Unknown JSON field: baseRepository`; `gh pr list` beendete den Analyse-Step mit Exit 1. Kein Gemini-API-Key-Fehler.
- `.github/ci-agent/repair.mjs` sucht PRs jetzt mit unterstützten JSON-Feldern und dem Head-Filter `nimmsel23:<branch>`. Fix auf `dev` in allen acht Modul-/Coach-Repos.
- CI-Checks der Reparaturcommits grün; Modul-Promotion/Live-Deploy grün, Journals Live-Deploy war beim Eintrag noch in Arbeit. Ein echter roter Gemini-Reparaturlauf bleibt als Abnahme offen.

## 2026-11-07 — GitHub-Pages-Doku vorbereitet

- `docs/README.md` als Jekyll-Landingpage ergänzt. Die Datei ist auf `/index.html` geroutet; GitHub-Pages-Quelle `dev /docs` muss noch in den Repository-Einstellungen geprüft bzw. aktiviert werden.

## 2026-11-07 — Wochenrückblick zeigt Bereichsspur

- Journal-Wochenansicht lädt zusätzlich die Vorwoche und zeigt je Bereich
  eingetragene Tage als kompakte Spur mit aktuellem und vorherigem Wochenwert.
  Darstellung bleibt eine Auswertung vorhandener Smart-Log-Deposits; sie
  verändert weder Daten noch den Core4-Punktestand.
- Core4 heute 0 geloggt und Woche 1,5/28 sind die vom Nutzer bestätigten
  Referenzwerte. Die bestehende Habit-Core4-Ansicht hat eine andere Score-Logik;
  eine echte Anbindung an die maßgebliche Core4-Datenquelle bleibt offen.
- Kein Browser-/Konto-Check, Test oder Build ausgeführt.

## 2026-11-07 — Start-Habits fuer neue Konten

- Habits legt beim ersten Laden zwei editierbare tägliche Starter an: „10.000
  Steps or 1 hr Workout everyday“ (Body) und „Meditate or pray everyday“
  (Being). Definitionen und Namen stehen zentral in
  `apps/habits/src/views/Habits/defaultHabits.js`.
- Bestehende eigene Habit-Dokumente — auch soft-geloeschte — verhindern das
  Seeding. Versteckte System-Tracker allein verhindern es nicht. Feste
  Dokument-IDs machen parallele Erstaufrufe idempotent; Reload erzeugt keine
  Duplikate.
- Nicht im Browser gegen ein echtes Konto abgenommen; keine Tests oder Builds.

## 2026-11-07 — Smart Journal speichert Tages-Deposits

- Smart-Log-Vorschau um vier bearbeitbare Tages-Deposits erweitert; leere
  Bereiche bleiben leer, der Nutzer kann erkannte oder fehlende Angaben
  ergänzen. Übernommene Deposits erscheinen beim Journaleintrag und sind
  nachträglich ohne neue KI-Analyse editierbar.
- Persistenz liegt idempotent im Smart-Log-Metadatum des vorhandenen
  Journaleintrags; keine zweite Tages-Logger-Datenquelle angelegt.
- Gegenstück im gemeinsamen Backend ergänzt die strukturierte Extraktion.
  Tests und Build wurden nicht ausgeführt.

## 2026-11-07 — CI-Agent-Deploy-Routing und No-op-Ausgänge korrigiert

- Reale Modul-Deploy-/Preview-Workflownamen ergänzt; grüne Deploy-Läufe lösen keine Merges aus. Ohne sichere Quellreparatur endet der Agent ohne Commit.
- Tailwind-4- und Dependabot-Upgrades bleiben erhalten; Gemini schreibt keine Lockfiles um.
- Actions-Secrets und ein echter Fehler→Reparatur→Check→Deploy-Rundlauf sind noch zu verifizieren.

## 2026-11-07 — Gemini CI-Agent installiert

- CI-Agent fuer Check-Fehler, Dependabot-PRs und Merge-Konflikte ergänzt; Tailwind-/Paket-Upgrades bleiben erhalten.
- Quellreparaturen werden auf den betroffenen Branch geschrieben; Zielbranch-Reparaturen erhalten einen PR und werden erst nach gruenem Check gemergt.
- Gemini-API und `SYNC_TOKEN` muessen als Actions-Secrets vorhanden sein. Nachweis: erster erfolgreicher automatischer Reparatur- und Deploy-Lauf steht aus.

## 2026-11-06 — Fokus-Sperre (Stufe 0/1): Mindest-Log-Funktion, Daily Four und Tracker-Habits unter der Haube

Bausteine für den Fokus-Sperrmodus („erst loggen, dann Apps“, ~/vitalos-prod/docs/product-dev/FOKUS-SPERRMODUS.md), als pure, getestete Funktionen ohne UI-Anbindung, plus das von Daniel per Session-Chat bestätigte Ur-Modell „alles ist ein umfunktioniertes Journal (Datenstand)“: Daily Four aus fitness (Sessions), fuel (Mahlzeiten/Ernährung), relax (Meditation), journal/habits (Memoirs).

- **`src/lib/focus/minimumLog.js` (`9edb12a`, `3d736fa`):** reine `hasMinimumLogToday(entries, habitCompletions, now, options)` — erfüllt, wenn heute (lokal) mind. 1 Journal-Eintrag ODER 1 Habit-Vollzug existiert; `options.rule` ('journal'|'habit'|'any', Default 'any'), `options.requiredBeforeHour` (0–23) verlangt den Log lokal VOR der vollen Stunde ( Zeitpunkt-Frist, keine Gnadenfrist — von Daniel bestätigt und im Modulkopf verankert). Datenformen aus `lib/db/journal.js` (normalizeEntry) und `views/v2/habitsModel.js` (habit.records); defensiv gegen undefined/ungültige Eingaben. Tests `tests/minimumLog.test.mjs` (8): Mitternacht, Zeitzone, leere Listen, Grenzfälle.
- **`src/lib/focus/dailyFour.js` (`ef51b88`):** reine Wurzel `buildDailyActivity(bundles)` + `hasDailyFourLogToday(activity, now, options)` — Tages-Sets je Domain (Form kompatibel zur Shell-Header-Auswertung buildDayMap, plus relax), `options.domains` schränkt ein; Tages-Predikate gespiegelt aus apps/habits (Mahlzeit ODER Wasser, Session nur mit Substanz, Relax-Praxis nur mit Details). Keine Uhrzeit-Fristen — dafür minimumLog.js.
- **`apps/habits/src/views/Habits/trackerHabitModel.js` (`ef51b88`, neu, rein):** TRACKER_HABITS (fitness/fuel/relax; versteckte System-Habits `hidden:true, systemTracker:<key>`), `isTrackerActive`, `hasSessionDetails`, `visibleHabits`, `trackerDatesToWrite` (Diff: nur aktive, ungespiegelte, nicht-zukünftige Tage — nur additiv, niemals Un-Spiegeln).
- **`apps/habits/src/db/index.js` (`ef51b88`):** `ensureTrackerHabits()` (idempotent) und `syncTrackerHabits(days=28)` — liest Sessions-/Ernährungs-/Relax-Tagesdatenstände (28-Tage-Fenster, Backfill inklusive) und schreibt fehlende DONE-Records nach `fitness/{uid}/habitRecords/{uuid}_{date}` mit `systemTracker`-Provenance; fire-and-forget beim App-Start (`views/Habits/index.jsx load()`), schreibt also erstmals echte Nutzerdaten.
- **Sichtbarkeit:** System-Habits nie in UI/Zuordnung — Filter `!hidden` in `views/Habits/index.jsx` (Liste), `DailyFourLayout.jsx` (activeHabits) und `dailyExecutionModel.js` (normalizeDailyAssignments).
- **Konzept:** `docs/FOKUS-DAILY-FOUR-TRACKER-HABITS.md` (Ur-Modell, Daily-Four-Zählkriterien, Sync-Regeln: additiv/keine Zukunft/konservativ bei Tombstones, offene Punkte).
- **Tests:** `tests/tracker-habits.test.mjs` (8). Geprüft: minimumLog+tracker-habits 16/16 grün; TZ=UTC und TZ=Pacific/Kiritimati je 8/8; esbuild-Syntaxcheck aller geänderten JS/JSX-Dateien; die Worktree-Suite-Failures sind Vorbefund `ERR_MODULE_NOT_FOUND: date-fns` (kein node_modules unter /dev/shm, kein Voll-Install), Haupt-Checkout-Baseline 154/154.
- **CI:** alle drei Commits auf `dev` gepusht (`9edb12a`, `3d736fa`, `ef51b88`); `Check (Journal)` und `Preview (Journal dev)` je success. Nicht im Browser, nicht gegen echte Firestore-Daten geprüft; Verhalten von syncTrackerHabits (Schreiblast, Timing beim Start) ungetestet.

---

## 2026-10-31 — Door v2 Plan (Quelle Taskwarrior): „Als Door der Woche“ entfernt +door nicht mehr von anderen Doors, Release bis in die Shell

Offene Frage aus dem Vorlauf: `selectWeeklyDoor` entfernte `+door` von allen anderen offenen Tasks und zerstörte damit Doors samt Hits und Profit. Auf Entscheidung des Users entschärft (statt den Button auszublenden).

- **`src/lib/door/taskwarrior.door.js` (`fde6b31`):** `selectWeeklyDoor` lässt `+door` überall stehen; die Woche markiert der Tag `kw<NN>` (ISO-Woche, aktuell `kw44`), den `weekDoor.js` schon als Rückfall liest. Der Tag wandert vom bisherigen Wochen-Task zum gewählten Task, der gewählte bekommt zusätzlich `+door`, falls er es noch nicht hatte. Import `getISOWeek` aus `date-fns`.
- **Verhalten:** Hängen schon Hits dieser Woche an einer anderen Door, gewinnt weiterhin diese (Hits haben Vorrang vor dem Tag); der Button ändert die angezeigte Door der Woche dann erst, wenn die Hits umgehängt sind. So gewollt.
- **Release:** `dev` gepusht, Release-PR [#11](https://github.com/nimmsel23/journal-dev/pull/11) (dev → master) per `vos-release-pr journal` gemergt, Checks grün, Live-Deploy per CI. Danach `journal-release --yes` (ohne `--yes` bricht das Skript ab, weil `gum confirm` kein TTY hat): vitalos-Shell auf `aad3d62`.
- **Kein Test:** `selectWeeklyDoor` ruft `tasks()`/`commit()` direkt gegen die TaskChampion-Replik, dafür gibt es keine Test-Attrappe.

Validierung: 119/119 Node-Tests grün. `pnpm run build:firebase` brach mit einem pnpm-Fehler ab (Install-Check, siehe CLAUDE.md), stattdessen `npx vite build --mode firebase` grün. Nicht im Browser und nicht gegen echte Taskwarrior-Daten ausprobiert.

---

## 2026-10-31 — Autosave und Entwürfe: Game v2 (Frame/Focus/Freedom), Journal v2, Habits offline-first

Frame/Focus/Freedom speicherten nur bei `onBlur` und bauten das Feld per `key={…antwort}` neu auf: Beenden/Neuladen vor dem Verlassen des Feldes verlor den Text. Jetzt Autosave mit Entwurf im localStorage.

- **Neu:** `src/lib/draftStore.js` (rein; Entwurf, Entprellen, Dirty-Regel, Wiederherstellung), `src/lib/useAutosaveField.js`, `src/views/game/AutosaveArea.jsx`, `src/lib/db/fastDocs.js` (cache-first Lesen). Tests: `draft-store` (18), `fast-docs` (6).
- **Game v2:** `GameMapPanel.jsx` (Frame, Fire-Strike/Hit-Slots), `MapDocsPanel.jsx` (Focus/Freedom, alle Perioden). Permission-/Listener-/Netz-Warntexte entfernt.
- **Journal v2/Habits:** Eingabe- und Bearbeiten-Entwurf; `getJournal`/`getJournalRange`/`getHabitsRange` cache-first; `recordHabit`/`unrecordHabit`/`addHabit`/`updateHabit`/`setHabitArchived` awaiten die Server-Bestätigung nicht mehr (offline hing das Abhaken ewig und `habitLock` sperrte weitere Aktionen).
- **Tent v2:** geprüft, bereits sauber (Entwurf je Tastendruck, Listener cache-first, Abschluss lokal sofort), unverändert. Journal v1 unberührt.
- **Nicht getestet:** Browser, Flugmodus, PWA-Kill, Cursor-Verhalten; nur Node-Tests und beide Builds (Journal, Door-Flavor).

---

## 2026-10-31 — Door v2 komplett offline-first (Google Tasks: lokaler Store + Outbox + stiller Abgleich)

Anforderung des Users: Apps müssen offline-first sein — keine Lags, keine Warnhinweise, nichts geht verloren; lokaler Speicher ist die Wahrheit, Abgleich still im Hintergrund. Bisher las und schrieb Door v2 „Google Tasks“ direkt per REST (nach Reload offline leer, Schreiben ging verloren, „Failed to fetch“/„offline?“-Texte, großer „nicht verbunden“-Block bei abgelaufenem Token).

- **Neu `src/lib/door/gtasks.{store,model,sync,lists,local}.js`:** Store (localStorage `dv2:lf:gtasks:v1:<uid>`) mit Outbox, temp-ids (`tmp:…` → echte id, Alias-Tabelle), Zusammenfassen von Ops; Door-Modell, das alle Funktionen aus dem Store rechnet (`peek.*` synchron); Sync-Engine (Outbox → Pull → Rebase, Backoff, Timeouts, 404 &c. verwerfen, verlorene Insert-Antworten adoptieren); Listenauflösung (nie doppelt anlegen, kleinste id, nie löschen); Verdrahtung (Web Lock, `startBackgroundSync`, online/visibility/storage). `gtasks.door.js` ist nur noch Adapter, `gtasks.js` liefert REST für den Abgleich (Status am Fehler, 20-s-Timeout, `ensureList` über `gtasks.lists.js`).
- **UI:** `DoorV2Panels.jsx` — `msg()` still bei Verbindungsfehlern, `State` blendet Daten nie aus, `initialData` aus `peek` (kein „Lade …“). `DoorV2View.jsx` — Panels laufen ohne Verbindung mit lokalen Daten, Hinweis „nicht verbunden“ nur bei Erstverwendung, dezentes „↻ n“ für offene Änderungen, Queries werden nach Pull/id-Mapping neu aus dem Store gelesen. Popup-Hinweis „gilt ca. 1 h“ entfernt.
- **Backend/Push:** `*.firestore.js` und `useJournalPushNotifications` awaiten keine Server-Bestätigung mehr (`track()`/optimistisch), sonst hängt das Schreiben offline.
- **Hosting `door`:** `firebase.json` ergänzt um `no-cache` für `/index.html`, `/manifest.webmanifest`, `/journal-messaging-sw.js` (Letzteres fiel sonst unter die 1-Jahr-immutable-Regel für `*.js`). Door-Build geprüft: Precache 60 Einträge/~1,5 MiB, alle 39 JS-Chunks, `index.html`, Fallback `/index.html`, Door-Icons.
- **Tests (neu, Node):** `gtasks-store`, `gtasks-model`, `gtasks-sync` (Offline-Write → Outbox → Sync mit id-Mapping, stille Fehler + Backoff, Rebase, atomarer Pull, verlorene Antwort, zwei Clients gegen dasselbe Konto), `gtasks-lists`; Hilfen in `tests/helpers/fake-google.mjs`. Gesamt 84/84 grün, `vite build` (Journal und Flavor `door`) grün.
- **Grenzen:** Notiz/Quadrant/Door-Woche teilen sich das Google-Feld `notes` → bei gleichzeitiger Offline-Änderung zweier Geräte gewinnt der zuletzt Sendende. Door v1 (`v1.js`) schreibt Notizen/Updates weiter direkt per REST. Backend-Quelle liest per `getDocs` (Cache, aber bei schlechtem Netz evtl. Wartezeit). Ein Konto-/Google-Wechsel leert die Outbox nicht. Ohne deployte Functions (siehe Eintrag oben) gilt weiter der 1-h-Popup-Token: Abgleich pausiert danach still bis „Google Tasks verbinden“, die App arbeitet lokal weiter.
- **Nicht getestet:** Verhalten im Browser/Flugmodus, echter Google-Login und -Abgleich, Web Locks und mehrere Tabs real, iOS-PWA. Kein Deploy.

---

## 2026-10-31 — Door v2 Google Tasks: Functions nie deployt, Popup-Rückfall griff nicht

Symptom in Door v2: „Google gerade nicht erreichbar (offline?)“ und „Google Tasks ist nicht verbunden“, „Google Tasks verbinden“ wirkungslos. Ursache: `googleLinkConfig`, `googleLink`, `googleAccessToken`, `googleUnlink` und `scheduledDoorReminders` sind in `fitness-aos` **nicht deployt** (`firebase functions:list`); Secret `GOOGLE_OAUTH_CLIENT_SECRET` existiert nicht, die Client-ID ist nicht hinterlegt. Eine nicht deployte Callable antwortet mit 404 ohne CORS-Header, der Browser blockiert das, das SDK meldet `functions/internal` statt `functions/not-found`. Der Rückfall in `auth.js` wartete nur auf `not-found` und endete deshalb bei `google-offline`.

- **`src/lib/google/auth.js` (`1643ebe`):** `prepareGoogleConnect` wertet `functions/internal` bei bestehender Verbindung als „nicht eingerichtet“ → Firebase-Popup (~1 h). Nicht im Browser getestet; ein Node-Test ist nicht möglich (`auth.js` importiert Firebase).
- **Offen (braucht Daniel):** OAuth-Client + Ursprünge, Zustimmungsbildschirm „In Produktion“, `firebase functions:secrets:set GOOGLE_OAUTH_CLIENT_SECRET`, Client-ID als `GOOGLE_OAUTH_CLIENT_ID`, dann Deploy der Codebase `journal` (`functions:journal`, siehe `JOURNAL-V2.md`). Das OK zum Deploy liegt vor, es fehlen Secret und Client-ID. Ob `deploy-push-functions.yml` in vitalos die Google-Functions mitnimmt, ist nicht geprüft.
- Bis dahin gibt es keine Door-Erinnerung (`scheduledDoorReminders` fehlt) und nur die 1-h-Verbindung. Der Fix steht auf `dev`, nicht auf `master`/live.

Validierung: 51 Node-Tests und `vite build --mode firebase` grün.

---

## 2026-10-29 — Door v2 Potential: Notizfeld und Sheet lagen unter dem Wisch-Hinweis, Release nach master

Das „fehlende“ Notizfeld in Door v2 Potential lag nicht am Markup, sondern an der Überdeckung: `.dv2-swhint` (Wisch-Hinweis) ist `position: absolute; inset: 0` und deckt den ganzen Eintrag ab, nur die Zeile ist `position: relative`. Notizfeld und Sheet (Quadrant-Buttons, War Stack) waren unpositioniert und wurden deshalb unter der Farbfläche gemalt. Vermutlich bestand das seit `2599095` (18.10.). Der Fix steht auf `dev`, der Release-PR nach `master` ist gemergt und der Live-Deploy der Standalone-Targets lief grün.

- **`src/views/door/v2/door-v2.css`:** `.dv2-swipe > .dv2-note, .dv2-swipe > .dv2-sheet { position: relative; }`, damit beide in DOM-Reihenfolge über dem Hinweis liegen (`a0b7bac`).
- **Revert von `03d67bf` (`8ec4a24`):** Das dauerhaft sichtbare Notizfeld unter jedem Eintrag war nur ein Workaround für das Overlay-Problem und wurde zurückgenommen; das Feld steht wieder nur im aufgeklappten Sheet.
- **Release:** `dev` gepusht, Release-PR [#4](https://github.com/nimmsel23/journal-dev/pull/4) per `vos-release-pr journal` (dev → master) gemergt, Live-Deploy (`deploy-master.yml`, Run 40894437472) erfolgreich. Die vitalos-Shell (`vos-release journal`) wurde **nicht** ausgelöst.

Validierung: 51 Node-Tests (`node --test tests/*.test.mjs`) und `vite build --mode firebase` grün. Die Behebung beruht auf den CSS-Malregeln und wurde nicht im Browser angesehen; wegen des Service Workers kann ein zweiter Reload nötig sein.

---

## 2026-10-28 — Google Tasks/Calendar: dauerhafte Verbindung, gemeinsamer Token-Dienst, Calendar in Fire

Ursache des ständigen Ablaufens: Firebase-`reauthenticateWithPopup` liefert nur einen ~1-h-Access-Token ohne Refresh-Token, abgelegt in
`sessionStorage` (Tasks und Kalender je getrennt). Jetzt ein gemeinsamer Dienst mit serverseitigem Refresh-Token (Cloud Function) und
Popup-Rückfall, solange die Function nicht eingerichtet ist.

- **`src/lib/google/{tokens,auth,useGoogle}.js` (neu):** Token-Speicher in `localStorage`, Erneuerung 2 min vor Ablauf (geteilt bei parallelen Aufrufen), 401 → einmal mit frischem Token wiederholen, Fehler `google-expired`/`google-offline`; Hook für alle Oberflächen.
- **`functions/google.js`, `functions/index.js`:** `googleLinkConfig`, `googleLink`, `googleAccessToken`, `googleUnlink`; Refresh-Token in `googleTokens/{uid}` (keine Client-Rule). Keine neuen Pakete.
- **`gcal.js`, `gtasks.js`:** nur noch REST über `google.authFetch`. **`DoorV2View.jsx`, `DoorV2Panels.jsx`, `JournalV2View.jsx`, `GameMapPanel.jsx` (Fire), `firebase.js` (`app` exportiert):** auf den Hook umgestellt; Fire zeigt „Heute“ und hat den Umschalter „Alle Kalender“ (`jv2:cal-all`).
- **Tests:** `tests/google-tokens.test.mjs`, `tests/google-function.test.mjs`.

Offen/manuell: OAuth-Client (Ursprünge), Zustimmungsbildschirm auf „In Produktion“ (sonst Refresh-Token nach 7 Tagen weg), Secret setzen und Functions deployen – Schritte in `JOURNAL-V2.md`. Echter Google-Login im Browser nicht getestet.

---

## 2026-10-26 — Door v2: Rechtsklick-Menüs und Notizfeld, Journal v2: Jahr-Ansicht und Eintrag bearbeiten

Rechtsklick-Menüs in allen vier Door-v2-Phasen, Notizfeld in Potential für alle Datenquellen, zweizeiliger
Journal-v2-Header mit Jahr-Ansicht und Bearbeiten von Tageseinträgen. Alles auf `dev` committed und mit
`journal-release --yes` nach vitalos veröffentlicht (Deploy Journal PWA und Deploy VitalOS Shell grün); beim
letzten Release (`3813407`) blockierte die Auto-Mode-Prüfung den Aufruf aus Claude heraus, der Nutzer startete ihn selbst.

- **`src/views/door/v2/DoorV2ContextMenu.jsx` (neu):** Menü per `contextmenu`-Event (Rechtsklick, Menü-Taste, Umschalt+F10, Langdruck), Pfeiltasten, Esc und Klick daneben schließen; Rollen `menuitem`/`menuitemradio` (aktueller Quadrant mit ✓); `useContextMenu`-Hook, CSS `.dv2-menu` in `door-v2.css`.
- **`DoorV2Panels.jsx`:** Potential: Quadrant Q1–Q4, Notiz/War Stack öffnen bzw. schließen, „Entfernen“ (rot, Zeile verschwindet sofort, Refetch holt sie bei Fehler zurück); „Erledigt“ gibt es in Potential nicht (`585f613`, `b12e7cf`, `973f302`, `44ad2d8`, `bc2948f`). Plan: Q1–Q4 und „Als Door der Woche“, die Door-Logik aus dem Drag-and-drop steckt jetzt in `setDoor`. Production: „Erledigt“/„Wieder öffnen“ und „Text kopieren“. Profit: Menü je Zeile (`a81900f`).
- **`src/lib/door/{source,potential,gtasks.door}.js`:** Notizfeld in Potential für Backend, Google Tasks und Taskwarrior (bisher nur Taskwarrior), vorhandene Notiz wird angezeigt (`cb441d3`).
- **`src/views/v2/JournalV2View.jsx`, `JournalV2Range.jsx`, `journal-v2.css`:** Header zweizeilig: Zeile 1 Tag/Woche/Monat/Jahr, Zeile 2 Habits plus Sprünge zu Door (unter Woche), Focus (unter Monat) und Game (unter Jahr); neue Jahr-Ansicht mit zwölf Mini-Monaten, heute markiert (`9fcbb94`).
- **`src/lib/hashRoute.js`, `tests/hash-route.test.mjs`:** Modus `jahr` für `#v2/jahr` ergänzt, Test angepasst.
- **`JournalV2View.jsx`, `journal-v2.css`:** Tageseinträge bearbeiten: ✎ neben dem ×, Text und `+tags` im Textfeld, Strg/Cmd+Enter oder „Speichern“ sichert, Esc/„Abbrechen“ verwirft; Zeitraum und Uhrzeit bleiben, leerer Text wird mit Fehlermeldung abgelehnt, danach laden Tages-, Wochen- und Monatsliste neu (`3813407`).

Validierung: 27/27 Node-Tests (`node --test tests/*.test.mjs`) und `vite build --mode firebase` bei jedem Commit grün. Das Notizfeld wurde in Thorium headless mit gemockten Daten und der echten `PotentialPanel` geprüft (`<textarea>` vorhanden, nicht readOnly, fokussierbar; Tippen nicht simuliert), Header und Jahr-Ansicht per Screenshot. Rechtsklick-Menüs, Header-Sprünge und Bearbeiten wurden nicht im Browser angeklickt, Notiz und Bearbeiten nicht gegen echte Firestore-/Backend-Daten getestet.

---

## 2026-10-25 — Voice-Pause-Visualisierungen gemerged, dev gepusht, Release nach vitalos

`pnpm-workspace.yaml` bereinigt, den Remote-Branch `origin/claude/blissful-sagan-lrk7u7` in `dev` gemerged und
`journal` über `journal-release --yes` nach vitalos veröffentlicht.

- **`pnpm-workspace.yaml`:** toter Eintrag `better-sqlite3: true` aus `allowBuilds` entfernt (nirgends mehr referenziert, seit Fastify/SQLite raus sind); Punkt aus `NEXT.md` gestrichen (`1f95077`).
- **Merge `855e2c6`:** sechs Voice-Commits mit den Pause-Visualisierungen (Mandelbrot-Zoom, Julia, Flow, Mandelbrot-Baum, Atemkreis/Atemring, Buddhabrot; Auswahl pro Tag, Zufall wiederholt nie die letzte) ohne Konflikte in `dev`. Betroffen: `src/views/game/PauseViz.jsx` (neu), `VoicePanel.jsx`, `game-v2.css`.
- **Release:** `dev` nach `origin/dev` gepusht (`690509c..855e2c6`); `journal-app` auf `vitalos` per Fast-Forward von `47654c6` auf `855e2c6` (enthält auch Offline-First für Game/Voice/Tent samt SyncBadge), vitalos-Pointer-Bump `1697008` auf `master`.

Validierung: `vite build --mode firebase` nach dem Merge grün. `pnpm test` lief nicht, die Visualisierungen sind nicht im Browser angesehen, ob die CI das Ergebnis deployt hat ist nicht geprüft.

---

## 2026-10-24 — Aufräumen: Dependencies, Hash-Routing, Docs

fuel-dev-Reste entfernt: 24 ungenutzte Dependencies (Fastify, SQLite, FullCalendar, zod, react-hook-form,
12 einzelne `@firebase/*` u. a.), `zustand`, `store.js`, tote Workflows, das fuel-Dispatcher-Backup und alle
fuel-Docs (AGENT, ARCHITECTURE, FIRESTORE, GEMINI, HOT, NUTRITION, TOOLLIST, `.claude/README.md`, fuel-Tickets).
Das Bundle blieb byte-identisch, die entfernten Pakete waren nie darin. `pnpm-lock.yaml` ist getrackt und passt
wieder zur `package.json` (CI nutzt `--frozen-lockfile`). Lokal ist `node_modules` jetzt ein Symlink auf
`~/vitalos/node_modules` (835 MB gespart, kein `pnpm install` mehr im Repo).

v2: `useSetting`-Hook ersetzt die handgebauten localStorage-Blöcke in `JournalV2View`; Habit-Pending/-Fehler
laufen über `useMutation` (Ref-Guard bleibt gegen Doppelklick im selben Tick). URL-Hash ist jetzt die einzige
Quelle für Tab/Modus/Datum (`hashRoute.js` + `useHashRoute`), `main.jsx` von 234 auf 159 Zeilen, alle
bestehenden URLs bleiben gültig. `localToday()` nutzte UTC und sprang nach 22/23 Uhr auf den nächsten Tag,
jetzt Ortszeit. CLAUDE.md, README, DEPLOYMENT und JOURNAL-V2 an den Ist-Zustand angepasst.

Validierung: 24 Node-Tests, `build:firebase` und beide CI-Läufe grün. Headless-Thorium lädt `#v2/woche/…`,
`#door2/plan`, `#focus`, `#tent2/…` und `#v2` in die richtige Ansicht. Klick-Navigation, Offline-Reload und
Habit-Doppelklick sind nicht im Browser geprüft.

## 2026-10-22 — Habits v2 vervollständigt

Bearbeiten von Name/Core4-Kategorie/Frequenz, Tagesraster-Korrekturen,
Archiv/Wiederherstellen, Suche und Filter ergänzt. Bestehende Icons/Reihenfolge
und Habit-Records bleiben erhalten. Laden folgt dem gewählten Zeitraum statt
heute. Serien/Quoten berücksichtigen feste Wochentage, Erstellungsdatum und
Zukunft; Monatsziele zählen den gewählten Kalendermonat. Fehler werden angezeigt,
Entwürfe bei fehlgeschlagenem Speichern erhalten, parallele Aktionen gesperrt.
Kein optimistisches Verstecken fehlgeschlagener Schreibvorgänge mehr.
Optionale Host-Navigation für die eingebetteten Journal-v2-Links ergänzt.

Validierung: 13 Node-Tests erfolgreich, einschließlich sechs neuen Tests für
Statistik/Validierung/historische Abfrage und schonende Firestore-Schreibpayloads
mit isolierten Test-Doubles. Browserprüfung bei 320/390px mit synthetischen
Daten: vergangene Tage, fehlgeschlagenes/erfolgreiches Anlegen, Bearbeiten,
Kategorie/Monatsziel, Archiv/Abbruch/Wiederherstellen, Metadaten/Historie, Filter
und Layout. Keine echten Nutzerdaten geschrieben. Firebase-Build erfolgreich;
keine Live-Firestore-/Auth-Prüfung und kein Push/Deployment.

## 2026-10-22 — Getrennter Push-Sender

Reminder-Function heißt `scheduledJournalPushReminders` in der eigenen Firebase-Codebase `journal`. Deployment erfolgt gezielt über VitalOS `deploy-push-functions.yml`, damit andere App-Sender weder überschrieben noch implizit gelöscht werden.

## 2026-10-21 — Gemeinsamer Changelog

Universalisierten VitalOS-Release-Dialog über vendorte Vite-Module eingebunden. Standalone mit eigener Bestätigung; eingebettet unterdrückt zugunsten des zentralen Shell-Dialogs.

## 2026-10-21 — npm run deploy:vos

Neuer npm-Befehl nutzt vos-release journal --yes: dev pushen, nach
journal-app/vitalos mergen, Release-Branch sowie VitalOS-Pointer pushen.
Vorhandene Release-Prüfungen wiederverwendet und Ablauf in DEPLOYMENT.md
dokumentiert. Bash-Syntax und npm-Aufruf mit isoliertem Stub geprüft:
journal/--yes, Weitergabe von --dry-run und unveränderte Fehlercodes.
Kein echter Release ausgeführt.

# Results

## 2026-11-01 — Tent-Push in der installierten Tent-PWA

- `TentV2View` bietet Push-Anmeldung und eine konfigurierbare Sonntagszeit (Standard 14:00, Europe/Vienna). `apps.tent` ist eine eigene Token-Lane; Registrierung verwendet `/tent-messaging-sw.js` unter `/tent-push/` und Pushdaten mit `app: tent`.
- Die Journal-Cloud-Function prüft sonntags zur gespeicherten Zeit, ob diese Woche ein Journal-Eintrag mit `tent` und ISO-Wochen-Tag vorliegt. Bei offenem Tent sendet sie einen Link nach `/#tent2`; Journal-/Door-Payloads bleiben getrennt.
- PR #15 wurde mit grünem CI nach `master` gemergt; `journal-release` aktualisierte `journal-app/vitalos` und den VitalOS-Pointer. Live-Deploy `41299163327` veröffentlichte die Hosting-Targets inklusive `tent` erfolgreich.
- `scheduledJournalPushReminders` wurde anschließend direkt mit Firebase CLI für `fitness-aos` deployt. `firebase functions:list` bestätigt `scheduled` in `europe-west1`, `v1`, Node.js 22. Der separate CI-Functions-Workflow bleibt am fehlenden `secretmanager.secrets.get` des CI-Serviceaccounts hängen.
- Live geprüft: `vos-tent.web.app/` liefert HTTP 200, der Tent-Bundle enthält den Push-Schalter und `/tent-messaging-sw.js` liefert HTTP 200 mit `Cache-Control: no-cache`. Empfang auf dem installierten Handy ist noch nicht geprüft; Push muss dort einmal eingeschaltet und erlaubt werden.

## 2026-10-21

- Journal v1: Fitness/Fuel/Relax support right click, long tap and ContextMenu/Shift+F10 to choose tabs and nested views. Normal clicks retain their existing action. Explicit Fitness destinations are preserved through embedded Shell navigation; standalone destinations use their full URL/hash.
- Reuses VitalOS shared context-menu and keyboard navigation via @vos-shell-ui. Arrow keys also work between the three large crossover buttons. Escape restores focus; moving a touch cancels long press.
- Validation: pnpm run build:firebase passed; isolated browser checks at 320px and 390px passed for all three buttons, keyboard, focus, long press and scroll cancellation. Committed on dev only; no push, merge or deploy.

## 2026-10-19

- Journal push reminders now use the `apps.journal` lane in the shared push settings document. The Journal client registers its own `/journal-messaging-sw.js` worker at `/journal-push/`, and its reminder function queries only enabled Journal settings and tags outgoing messages with `app: journal`.
- Added Journal reminder enable/disable controls and reminder time to Journal settings. Legacy shared tokens are not adopted as Journal tokens.

## 2026-10-29
- **TaskChampion CORS:** `journal-dev/scripts/tc-cors-proxy.mjs` erlaubt jetzt zusätzlich `https://vitalos.web.app`, damit Game/Fire innerhalb der VitalOS-Shell den TaskChampion-Sync über denselben Proxy verwenden kann.

## 2026-10-31 — Dependabot

Enabled Dependabot alerts and security updates. Configured weekly GitHub Actions and npm/pnpm updates; version updates target `dev`. Minor/patch updates are grouped; vendored mini-app-shell copies stay maintained at their source. Validated YAML, repository manifest paths and update targets.

## 2026-11-01 — lokaler vos-tent-dev und optionaler Login

- `vos-tent-dev` als lokaler Branch mit eigenem Git-Worktree unter `.worktrees/vos-tent-dev` angelegt; keine Remote-Änderung.
- Tent zeigt ohne Google-Konto den lokalen Demo-Modus samt Hinweis, dass Notizen im Browser bleiben, plus freiwilligen Google-Login mit Lade- und Fehlerstatus. Cloud-Abschluss und Push benötigen weiterhin ein Konto.
- `pnpm run deploy:tent:build` konnte wegen eines schreibgeschützten pnpm-Store-Operation-Locks in der Sandbox nicht starten; kein Workaround am Store vorgenommen.

## 2026-11-01 — optionale Anmeldung in Tent, Voice und Door

- Wiederverwendbarer Google-Login-Helfer ergänzt. Tent- und Voice-Eingaben bleiben ohne Konto in ihrem bestehenden Browser-`localStorage`; Login ist optional und schaltet Cloud-Speicherung frei.
- Door zeigt den Helfer im Gastmodus und lässt die lokalen Taskwarrior-Daten sowie bereits lokal verfügbare Google-Tasks weiterlaufen. Backend-Daten benötigen weiterhin Journal-Login.
- Zunächst im temporären Branch `vos-tent-dev` vorbereitet, danach in `journal-dev/dev` integriert (Commit `8683de3`). Game v2 zeigt den Helfer zusätzlich bei Fire/Focus/Freedom/Frame; Voice nutzt denselben Helfer in der Voice-Phase. Die Hosting-Flavors/Targets bleiben in Journal definiert.
- Build-Prüfung war nicht möglich: pnpm scheiterte am schreibgeschützten Store-Lock; im Worktree gibt es kein lokales `node_modules/.bin/vite`.
## 2026-11-01 — Build-Versionen
- **Build-Versionen:** Journal zeigt im Update-Dialog die Paketversion mit der gebauten Git-Revision statt dauerhaft `v0.1.1`; `pnpm release` startet den vorgesehenen `dev → master`-PR-Releaseweg statt lokal eine Patch-Version zu ändern und direkt zu deployen.

## 2026-11-03 — Smart-Log-Retry und Google-Kalenderberechtigung
- Smart-Log-Request-IDs bleiben für Nutzer und Journaldatum lokal gespeichert und werden bei Wiederholungen nach Reload wiederverwendet. Änderungen am Entwurf löschen die ID; erfolgreiche Übernahme und manuelles Speichern räumen sie auf. Der Server kann so gecachte Analyseergebnisse liefern, statt einen zweiten Gemini-Aufruf für denselben Entwurf zu starten.
- Die Eingabe ist während einer laufenden Analyse gesperrt. Meldungen für laufende Requests, ausgeschöpftes Wochenkontingent und fehlende Provider-Konfiguration erklären, dass der Entwurf erhalten bleibt und ohne KI gespeichert werden kann.
- Google-OAuth prüft `calendar.events.owned` jetzt neben Kalender-Lese- und Tasks-Scope serverseitig. Tokens ohne Kalenderschreibrecht werden beim Verbinden abgelehnt.
- Verifiziert: `CI=true pnpm test` (135/135) und `CI=true pnpm run build:firebase` erfolgreich; `git diff --check` sauber. Kein Push, Release oder Deploy.

## 2026-11-03 — Smart-Log-Datentransparenz
- Vor der Analyse wird in beiden Smart-Log-Einstiegen die Übermittlung an Gemini offengelegt. V2 nennt Text, Datum, Tags und Habit-Namen; die ältere Ansicht nennt Text, Datum und Habit-Namen. Analyse startet ausschließlich nach dem Klick, Vorschläge bleiben prüfbar.
- Verifiziert: `pnpm run build:cloud` erfolgreich (3.009 Module). Fokus-Tests für Smart-Log und Google-Flows zuvor erfolgreich; keine Deploys.

## 2026-11-03 — Voice-Journal-Kontext an Konto binden
- Der Kontext eines Journaleintrags wird vor dem Start von The Voice mit der aktuellen UID markiert. Bei Accountwechsel, Gast-/Login-Wechsel oder alten ungebundenen Kontexten wird der Kontext verworfen; er wird nicht in einer anderen Anmeldung angezeigt.
- Regressionstests decken gleiches Konto, anderes Konto, Gastwechsel und alte Metadaten ab. Verifiziert: `node --test tests/*.test.mjs` (22 Testdateien, alle bestanden) und `pnpm run build:cloud` (3.010 Module, PWA-Service-Worker erzeugt). Keine Nutzerdaten migriert; kein Push/Deploy.


## 2026-11-07 — Gemini CI-Agent aktiviert

- Agent-Workflow und lokale Trigger für `journal-dev` auf `dev` eingerichtet; `GEMINI_API_KEY` als Actions-Secret gesetzt.
- `Check`/Preview und Agent-Run [42405240561](https://github.com/nimmsel23/journal-dev/actions/runs/42405240561) waren auf Commit `66aa07e7` grün. Dieser Lauf war ein No-op auf einem erfolgreichen Check; ein roter Code-Fehler wurde noch nicht absichtlich simuliert.
- Pushes und PR-Merges verwenden die eng berechtigte `GITHUB_TOKEN`-Workflow-Berechtigung; kein separates `SYNC_TOKEN` erforderlich.
