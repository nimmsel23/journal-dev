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

## 2026-10-21

- Journal v1: Fitness/Fuel/Relax support right click, long tap and ContextMenu/Shift+F10 to choose tabs and nested views. Normal clicks retain their existing action. Explicit Fitness destinations are preserved through embedded Shell navigation; standalone destinations use their full URL/hash.
- Reuses VitalOS shared context-menu and keyboard navigation via @vos-shell-ui. Arrow keys also work between the three large crossover buttons. Escape restores focus; moving a touch cancels long press.
- Validation: pnpm run build:firebase passed; isolated browser checks at 320px and 390px passed for all three buttons, keyboard, focus, long press and scroll cancellation. Committed on dev only; no push, merge or deploy.

## 2026-10-19

- Journal push reminders now use the `apps.journal` lane in the shared push settings document. The Journal client registers its own `/journal-messaging-sw.js` worker at `/journal-push/`, and its reminder function queries only enabled Journal settings and tags outgoing messages with `app: journal`.
- Added Journal reminder enable/disable controls and reminder time to Journal settings. Legacy shared tokens are not adopted as Journal tokens.
