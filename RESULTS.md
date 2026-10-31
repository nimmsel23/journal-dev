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

## 2026-10-21

- Journal v1: Fitness/Fuel/Relax support right click, long tap and ContextMenu/Shift+F10 to choose tabs and nested views. Normal clicks retain their existing action. Explicit Fitness destinations are preserved through embedded Shell navigation; standalone destinations use their full URL/hash.
- Reuses VitalOS shared context-menu and keyboard navigation via @vos-shell-ui. Arrow keys also work between the three large crossover buttons. Escape restores focus; moving a touch cancels long press.
- Validation: pnpm run build:firebase passed; isolated browser checks at 320px and 390px passed for all three buttons, keyboard, focus, long press and scroll cancellation. Committed on dev only; no push, merge or deploy.

## 2026-10-19

- Journal push reminders now use the `apps.journal` lane in the shared push settings document. The Journal client registers its own `/journal-messaging-sw.js` worker at `/journal-push/`, and its reminder function queries only enabled Journal settings and tags outgoing messages with `app: journal`.
- Added Journal reminder enable/disable controls and reminder time to Journal settings. Legacy shared tokens are not adopted as Journal tokens.

## 2026-10-29
- **TaskChampion CORS:** `journal-dev/scripts/tc-cors-proxy.mjs` erlaubt jetzt zusätzlich `https://vitalos.web.app`, damit Game/Fire innerhalb der VitalOS-Shell den TaskChampion-Sync über denselben Proxy verwenden kann.
