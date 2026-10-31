# Journal v2 (Design „Raster“)

Zweite Oberfläche für das VOS-Journal, neben der alten Timeline (v1). Schweizer-Logbuch-Optik:
Papierweiß, Schwarz, Signalblau (`#1738ff`), Archivo (schmal) + Martian Mono. Alles unter
`src/views/v2/`, Styles gekapselt unter `.jv2` (`journal-v2.css`). v1 bleibt unverändert nutzbar.

## Aufruf

Hash-Route, gleiche Datenquelle wie v1 (Firestore `fitness/{uid}/…`):

| URL-Hash | Ansicht |
|---|---|
| `#v2` / `#v2/today` / `#v2/2026-10-17` | Tag |
| `#v2/woche/<datum>` | Woche (7 Zeilen, Mo–So) |
| `#v2/monat/<datum>` | Monat (Raster mit KW) |
| `#v2/habits/<datum>` | Habits (28 Tage bis zum Datum) |

Door (Potential/Plan/Production/Profit) hat eigene Hashes: `#door2` (Potential), `#door2/plan`, `#door2/production`,
`#door2/profit`. Links: im Journal-v2-Footer „Door →“, im Door-v2-Footer „← Journal“.

**Routing:** Die URL ist die einzige Quelle für Tab, Modus und Datum (kein eigener State, funktioniert offline).
`src/lib/hashRoute.js` hält die Tab-Tabelle (Alias `v2`/`door2`/`game2`/`tent2`, Modi, ob das Datum im Hash steht) und
parst/baut den Hash; `src/lib/useHashRoute.js` liefert `{ tab, mode, date, setDate, setMode, navigate }`. Tab-Keys
(`journal-v2`, `door-v2`, `game-v2`, `tent-v2`) stehen in `src/routes.js` (`bare: true` = ohne App-Header); die Views
bekommen `mode`/`date` und die Setter über `getProps`. Ein Hash ohne bekannten Tab fällt auf den Start-Tab, der per
Build-Variable `VITE_DEFAULT_TAB` gesetzt wird (siehe Deploy). Das Datum bleibt beim Tab-Wechsel erhalten. Der Parser ist
gegen das frühere Verhalten getestet (`tests/hash-route.test.mjs`).

## Dateien

| Datei | Zweck |
|---|---|
| `JournalV2View.jsx` | Shell: Modusleiste, Tag-Ansicht, Eingabe, Smart Logger, Queries |
| `JournalV2Range.jsx` | Wochen- und Monatsansicht (nur Darstellung) |
| `JournalV2Habits.jsx` | Habits-Ansicht: Heute-Toggle, Serie, Quote, 28-Tage-Raster, anlegen/archivieren |
| `TimelineDrag.jsx` | Versteckte Timeline (Hook `useTimelineDrag` + `TimelineOverlay`) |
| `gcal.js` | Google-Calendar-Lesezugriff |
| `habitsDb.js` | Habit anlegen / archivieren |
| `src/lib/useSetting.js` | Einstellung mit localStorage-Persistenz (`jv2:grain`, `jv2:smart`, `jv2:cal-all`) |
| `src/lib/smartJournalApply.js` | Smart-Logger-Übernahme (auch vom Tab „Smart Log“ genutzt) |
| `src/lib/db/journal.js` | `getJournal`, `getJournalRange`, `saveJournal`, `setJournalTime`, `deleteJournal` |

v2 importiert das Journal-CRUD **direkt** aus `lib/db/journal.js`, nicht über `@journal-db`: dort kann die
fitness-dev-Variante mit anderer `saveJournal`-Signatur (Tags als Array) durchschlagen.

## Features

- **Tag:** Habit-Leiste (erste 5 Habits, Namen brechen um), Einträge nach lokaler Uhrzeit, Eingabe mit
  `+tag`-Syntax, Löschen mit ×. Tag `offen` färbt einen Eintrag blau. Kalendertermine stehen schraffiert dazwischen.
- **Woche / Monat:** Letzter Eintrag, Anzahl Einträge und Termine, Habit-Kästchen bzw. -Balken; Klick springt in den Tag.
- **Habits:** alle Habits. Serie = aufeinanderfolgende erledigte Tage bis zum gewählten Tag (ist dieser noch offen, bis gestern).
  Quote = erledigte Tage / 28. Archivieren setzt nur `deleted: true`, Records bleiben. Navigation in 7-Tage-Schritten.
- **Versteckte Timeline (Drag):** Uhrzeit eines Eintrags anfassen und ziehen → seitlich erscheint eine Timeline
  (Zeile = Stunde, Zellen = Halbe/Viertel). Raster 1 h / 30 min / 15 min beim Ziehen durch Darüberfahren der Kopfzeile
  wählbar (`jv2:grain`, per `useSetting`). Loslassen setzt `time` (`setJournalTime`), außerhalb loslassen bricht ab.
  Tastatur: Fokus auf die Uhrzeit, Pfeil hoch/runter verschiebt um das Raster. Umsetzung mit Pointer Events
  (`touch-action: none`, `setPointerCapture`), bewusst ohne dnd-kit; Touch auf dem iPad ist ungetestet.
- **Smart Logger (✦ in der Eingabezeile):** Freitext → `analyzeSmartJournal` (Firebase AI Logic / Vertex,
  `gemini-2.5-flash`) → Vorschau (Eintrag, Mahlzeiten, Wasser, Habits) → „Übernehmen“. Schreibt Journal (Tag `smart-log`),
  Nutrition-Log und Habit-Records. Unbekannte Habit-Namen werden übersprungen. Toggle in `jv2:smart` (per `useSetting`; alte Werte `"1"`/`"0"` bleiben lesbar).
- **Google Calendar (nur lesen):** „Kalender verbinden“ im Footer, `reauthenticateWithPopup` mit Scope
  `calendar.readonly`. Token ~1 h nur in `sessionStorage`, nie in Firestore. Standard: nur der Kalender „Fire Map“ (Taskwarrior-Termine `[TW today]`/`[TW overdue]`, von `firectl gcal due` gepusht); „Alle Kalender“ im Footer zeigt jeden in Google ausgewählten Kalender,
  abgelehnte/abgesagte Termine entfallen. „Rückblick →“ legt einen Eintrag mit Tag `termin` an. Voraussetzung im
  GCP-Projekt `fitness-aos`: Calendar API aktiviert (ist es) und Scope im OAuth-Zustimmungsbildschirm bzw. Testnutzer.
- **Vollbild / iPad:** Seite füllt den Viewport (`100dvh`), Safe-Area-Insets, Papierfarbe auch für Hintergrund und
  `theme-color`, größere Typo ab 700 px. Voll bildschirmfüllend nur als installierte PWA.

## Splash und Auto-Updater (gilt für die ganze App)

- **Splash:** statisch in `index.html`, mind. 600 ms, weg nach dem ersten Auth-Status (Fallback 2,5 s / 8 s);
  `window.__hideSplash()` wird aus `main.jsx` gerufen. Manifest-`background_color` = Splash-Farbe.
- **Updater:** `src/components/UpdateManager.jsx`, `registerType: "prompt"`. Neue Version → Hinweis mit 8-s-Countdown,
  pausiert solange ein Eingabefeld Fokus hat, „Später“ = 10 min, danach Reload und kurzer Hinweis „Aktualisiert auf vX“.
  Prüfung alle 10 min, bei Fokus und beim Sichtbarwerden. Erkennung über Datei-Hashes, nicht über die Versionsnummer.
- **Service Worker:** Precache der App-Dateien, Navigation-Fallback `/index.html` (ohne `/api`, `/__/`),
  Google Fonts per Runtime-Cache (CSS: StaleWhileRevalidate, Dateien: CacheFirst, max. 30). Firestore, Auth, Vertex und
  Google-APIs laufen immer übers Netz. `skipWaiting` nur auf die Nachricht `SKIP_WAITING`.

## Deploy

| Befehl | Wirkung |
|---|---|
| `pnpm run deploy:cloud` (`npm run firebase`) | Build + Deploy auf **journal-vos.web.app** (Target `journal`) |
| `pnpm run deploy:v2` | Build nach `dist-v2` mit `VITE_DEFAULT_TAB=journal-v2` + Deploy auf **vos-journal.web.app** (Target `v2`) |
| `pnpm run deploy:v2:build` | nur der v2-Build |
| `pnpm run deploy:door` | Build nach `dist-door` mit `VITE_APP_FLAVOR=door` + `VITE_DEFAULT_TAB=door-v2` + Deploy auf **vos-door.web.app** (Target `door`) |
| `pnpm run deploy:door:build` | nur der Door-Build |
| `pnpm run deploy:voice` / `deploy:game` / `deploy:tent` (jeweils `…:build`) | Flavor-Apps auf **vos-voice / vos-game / vos-tent.web.app** (Targets `voice`/`game`/`tent`) |
| `pnpm run deploy:all` (`deploy:all:build`) | baut alle sechs Varianten und deployt alle Targets in einem `firebase deploy` |
| `./deploy.sh [--pull] [--dry-run]` | Desktop-Prod `/opt/journal`: baut im Repo, kopiert nur `dist-firebase/`, keine Backups |

Targets: `firebase.json` (sechs Hosting-Einträge) + `.firebaserc` (`journal` → `journal-vos`, `v2` → `vos-journal`,
`door` → `vos-door`, `voice` → `vos-voice`, `game` → `vos-game`, `tent` → `vos-tent`). Alle Builds enthalten denselben Code und unterscheiden sich nur durch Start-Tab, Name, Icons
und Farben. Die Seiten `vos-journal`, `vos-door`, `vos-voice`, `vos-game` und `vos-tent` wurden per `firebase hosting:sites:create` angelegt.
CI-Workflows setzen `target: journal`. `firebase deploy` endete einmal mit „Timed out“ im Aufräumschritt nach
erfolgreichem Release (Exit 2); das Hosting war trotzdem live.

## Door v2 (Raster)

`src/views/door/v2/`: `DoorV2View.jsx` (Shell, Modusleiste, Quelle-Umschalter, papierfarbener Vollbild-Effekt),
`DoorV2Panels.jsx` (die vier Panels), `door-v2.css` (Scope `.dv2`). Datenquelle standardmäßig das Backend
(`src/lib/door/{potential,plan,production,profit}.js`, REST bzw. Firestore), alternativ Google Tasks (nächster Abschnitt).
- **Potential:** Hot List anzeigen, hinzufügen, erledigen, löschen (Zwei-Klick-Bestätigung).
- **Plan:** Door War mit Q1–Q4 und Unsortiert, Quadranten zuweisen, „Door wählen“ nur bei Q2-Items.
- **Production:** 7-Tage-Raster der Daily Hits mit Toggle, Hits der Woche mit Quote.
- **Profit:** lesend (Wochen-Door mit Hits, abgeschlossene War Stacks, Reflexionen).
- Bewusst weggelassen: Notizen/Bearbeiten, Lens-Auswahl (MoSCoW), War-Stack-Wizard, Reflexion schreiben.
- Alle Modi haben Lade-, Fehler- (mit „Erneut versuchen“) und Leerzustand. Die alte v1-Ansicht bleibt unverändert.

## Door als eigene App (vos-door.web.app)

- **Icon-Paket** `public/icons-door/`: `icon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (Motiv in der
  80-%-Sicherheitszone), `apple-touch-icon.png` (180), `favicon-32.png`, `favicon.ico` (32+48). Motiv: schwarzer Türrahmen,
  blaue Tür, Griff, Papierhintergrund. Quelle sind `icon.svg`/`maskable.svg`, gerendert mit `rsvg-convert`.
- **Flavor-Build:** `VITE_APP_FLAVOR=door` (in `vite.config.cjs`) setzt Manifest-Name „The Door“ / „Door“, Theme- und
  Hintergrundfarbe Papier (`#f6f6f2`), die Door-Icons, den Titel, Apple-Web-App-Titel und einen hellen Splash (Plugin
  `journal:flavor-html` ersetzt Strings in `index.html`). Im Door-Build sind `icons/**`, im Journal-Build `icons-door/**`
  aus dem Service-Worker-Precache ausgenommen.
- **Auth:** `vos-door.web.app` und `vos-door.firebaseapp.com` stehen in den autorisierten Domains von `fitness-aos`.

## Kalender: Fire Map

Der Kalender in Journal v2 zeigt standardmäßig nur den Google-Kalender „Fire Map“ (Name enthält „fire“; Taskwarrior-Termine
`[TW today]` / `[TW overdue]`, von `firectl gcal due` gepusht, siehe auch `fire-gcal-calcurse`). Umschalter im Footer:
„Alle Kalender“ / „Nur Fire Map“ (`jv2:cal-all`, per `useSetting`). Fehlt der Kalender, erscheint ein Hinweis.

## Google-Cloud-Einrichtung (Projekt `fitness-aos`)

Per `gcloud`/REST erledigt: Google Calendar API und Google Tasks API aktiviert; `vos-journal.web.app`,
`vos-journal.firebaseapp.com`, `vos-door.web.app`, `vos-door.firebaseapp.com` in den Auth-Domains
(Identity Toolkit `authorizedDomains`). Vertex/Firebase AI Logic und Billing waren bereits aktiv.
**Nur in der Console möglich:** Scopes `calendar.readonly` und `tasks` im OAuth-Zustimmungsbildschirm (oder Konto als
Testnutzer) und, bei `origin_mismatch`, die Ursprünge `https://vos-journal.web.app` / `https://vos-door.web.app` am
Web-OAuth-Client.

## pnpm

Das Repo nutzt pnpm (`packageManager: pnpm@11.3.0`, `pnpm-workspace.yaml` mit `allowBuilds`, `@firebase/util`-Override
1.12.1, `shamefullyHoist`). **`pnpm-lock.yaml` ist getrackt**, beide CI-Workflows installieren damit per
`--frozen-lockfile` (siehe `DEPLOYMENT.md`); `package.json` und Lock gehören in denselben Commit. Die vitalos-CI
installiert dagegen aus dem Root-Lock von vitalos. Lokal ist `node_modules` ein Symlink auf `~/vitalos/node_modules`
(kein `pnpm install` in diesem Repo, siehe `CLAUDE.md`).

**Stand 2026-10-24:** Die Dependencies wurden bereinigt. Entfernt sind die fuel-Reste (`fastify`, `better-sqlite3`,
`zod`, `react-hook-form`, `recharts`, `@fullcalendar/*`, `@radix-ui/*` u. a.), die zwölf einzelnen `@firebase/*`-Pakete
(der Code importiert nur `firebase/*`) sowie `zustand` (der Store entfiel mit dem Hash-Routing).

## Nach vitalos übernehmen

Normalfall: `pnpm run deploy:vos` bzw. `journal-release` (siehe `DEPLOYMENT.md`). Früher brach `vos-release journal` an
`package.json` ab (`link:` ↔ `workspace:*`); die `link:`-Abhängigkeit gibt es in dev nicht mehr, ob der Abbruch damit
weg ist, ist ungeprüft. Manuell: in `~/vitalos/journal-app` (Branch `vitalos`) `origin/dev` mergen, `package.json` des
`vitalos`-Stands behalten und nur die Änderungen aus dev übertragen (dev hat die `@firebase/*`/`motion-*`-Deklarationen
entfernt; ob der `vitalos`-Stand sie noch braucht, ist ungeprüft),
`pnpm-workspace.yaml` entfernen (ein Lockfile-Konflikt tritt nicht mehr auf), bei neuen Abhängigkeiten `pnpm install --lockfile-only` im vitalos-Root (sonst scheitert das CI mit `--frozen-lockfile`), pushen, Pointer in vitalos committen.

## Door v2 · Google Tasks

Umschalter „Quelle“ in der Door-v2-Shell (`localStorage` `dv2:source` = `backend` | `gtasks` | `taskwarrior`, Default `backend`; v1 unberührt).
**Offline-first** (Stand 2026-10-31, Abschnitt unten): die Oberfläche liest und schreibt nur einen lokalen Store, Google Tasks wird
still im Hintergrund abgeglichen. Module: `gtasks.store.js` (Store + Outbox), `gtasks.model.js` (Door-Funktionen auf dem Store),
`gtasks.sync.js` (Abgleich), `gtasks.lists.js` (Listenauflösung), `gtasks.local.js` (Verdrahtung), `gtasks.door.js` (Adapter mit den
Rückgabeformen der Backend-Module), `gtasks.js` (nur noch REST für den Abgleich und Door v1), `source.js` (Umschaltung).
Auth und Token über den gemeinsamen Dienst `src/lib/google/` (siehe „Google dauerhaft verbinden“).
Angefasst werden ausschließlich die Listen „Door · Potential“ und „Door · Production“ (werden bei Bedarf angelegt).

- **Potential**: Task in „Door · Potential“; erledigen = `status: completed`, löschen = DELETE.
- **Plan**: dieselben Tasks; Priorität in der ersten Zeile von `notes`: `Door: Q2 · Door 2026-W42` (Quadrant + Wochen-Door,
  nur auf Q2; eine Door pro Woche). Restliche Notizzeilen bleiben erhalten, der Titel bleibt sauber. Die Priorität ist zusätzlich die Reihenfolge der Liste (`move`).
- **Production**: Tasks in „Door · Production“, `due` = Tag der Woche (Mo–So); Toggle completed ↔ needsAction; Quote = erledigt/gesamt.
  Hits werden im Panel selbst angelegt (Tag + Text).
- **Profit** (nur lesend): letzte 8 Wochen, erledigte Potential-Tasks und Hits je Woche (nach `completed`), Liste erledigter Wochen-Doors. Keine Reflexionen.

Voraussetzung: Tasks API im GCP-Projekt aktiviert (fitness-aos: ja); der Scope `tasks` muss im OAuth-Zustimmungsbildschirm stehen (oder der Nutzer Testnutzer sein).

## Door v2 · Offline-first (Google Tasks, 2026-10-31)

Anforderung: die App darf sich von fehlendem oder schlechtem Netz nicht stören lassen — keine Lags, keine Warnhinweise,
nichts geht verloren. Deshalb ist der lokale Store die Wahrheit und Google Tasks nur noch das Ziel des stillen Abgleichs.

- **Store** (`gtasks.store.js`): Listen („Door · Potential“ offen + letzte 8 Wochen erledigt, „Door · Production“ −8 bis +6 Wochen)
  und Outbox als JSON in `localStorage`, Schlüssel `dv2:lf:gtasks:v1:<uid>` (je Firebase-uid und Quelle; jede Origin hat ihren
  eigenen Speicher). Gesperrter/voller Speicher → läuft im Arbeitsspeicher weiter. Mehrere Tabs derselben Origin: vor jeder
  Änderung wird der gespeicherte Stand neu gelesen, den Abgleich sperrt ein Web Lock (`navigator.locks`).
- **Lesen** (`gtasks.model.js`): `fetchHotlist`, `fetchDoorWar`, `fetchDailyWeek`, `fetchHitsWeek`, `fetchProfitGtasks` rechnen aus dem Store,
  nie aus dem Netz. `peek.*` sind die synchronen Kerne; die Panels nutzen sie als react-query-`initialData` → kein „Lade …“.
- **Schreiben**: wirkt sofort lokal (optimistisch) und landet in der Outbox. Offline angelegte Tasks haben die id `tmp:…`; beim
  Senden wird sie auf die echte id gemappt (`aliases`, damit eine Ansicht mit der alten id weiterarbeitet). Ops werden zusammengefasst
  (Patches eines Tasks → eine Op, Löschen eines nie gesendeten Tasks → keine Anfrage).
- **Abgleich** (`gtasks.sync.js`): Outbox der Reihe nach senden, danach Pull der Listen und **Rebase** (Serverstand + offene Outbox
  obenauf). Auslöser: Start, `online`, Sichtbarwerden, 60-s-Intervall (`startBackgroundSync`), Verbinden, 0,7 s nach einem Schreibzugriff.
  Pull höchstens alle 30 s, außer nach gesendeten Ops. Anfragen haben 20 s Timeout.
- **Fehler sind still**: Netz weg, Timeout, 5xx, 429, abgelaufener Token (`google-offline`/`google-expired`) → Durchgang bricht ab, Outbox
  bleibt, Backoff 4 s … 5 min (`online` setzt zurück). Nur endgültig abgelehnte Ops (400/404/409/410/412/422) werden verworfen, damit
  eine kaputte Op die Warteschlange nie blockiert. Ein Insert mit verlorener Antwort wird beim Wiederholen gegen die offene Liste
  geprüft und adoptiert statt doppelt angelegt.
- **UI**: keine Warntexte („Google gerade nicht erreichbar“, „Failed to fetch“, Tasks-/Sync-Server nicht erreichbar) — `msg()` in
  `DoorV2Panels.jsx` ist dafür leer. `State` blendet vorhandene Daten bei Fehlern nie aus. Die Panels rendern auch ohne aktive
  Google-Verbindung mit den lokalen Daten; der Hinweis „noch nicht verbunden“ erscheint nur, wenn es weder Verbindung noch lokale
  Daten gibt. Offene Änderungen zeigt ein dezentes „↻ n“; ist die Verbindung abgelaufen, bleibt nur der Knopf „Google Tasks verbinden“.
- **Mehrere Origins/Geräte** (journal, v2, door, vitalos-Shell …): je Origin eigener Store, eigene Outbox, eigener Google-Token; alle
  syncen unabhängig gegen dieselben Listen. Gesendet werden nur geänderte Felder (PATCH); der Pull-Rebase hält lokale offene Änderungen
  obenauf → last-write-wins pro Task und Feld. Grenze: Quadrant, Door-Woche und Notiz liegen im selben Google-Feld `notes`; ändern
  zwei Geräte gleichzeitig offline dieselbe Notiz, gewinnt das zuletzt sendende. Änderungen an einem inzwischen gelöschten Task gehen ins Leere.
- **Listen** (`gtasks.lists.js`): „Door · …“ wird nur angelegt, wenn der vollständig paginierte Abruf erfolgreich keine fand. Mehrere
  Treffer → lexikografisch kleinste id; nach dem Anlegen wird einmal neu gelesen (zwei Clients, die gleichzeitig anlegen, landen
  auf derselben Liste). Doppelte Listen werden nie gelöscht.
- **Backend (Firestore)**: Schreibzugriffe in `potential/plan/production/profit.firestore.js` und `useJournalPushNotifications` awaiten
  die Server-Bestätigung nicht mehr (`track()`); Lesen kommt aus dem Firestore-Cache. **Taskwarrior**: lokale Replik + Outbox (unverändert).
- **Hosting/PWA** (`dist-door`): Service Worker mit Precache aller 39 JS-Chunks + `index.html` (`navigateFallback`), ~1,5 MiB;
  `firebase.json` Target `door`: `sw.js`, `index.html`, `manifest.webmanifest`, `journal-messaging-sw.js` mit `no-cache`, `*.js|css|woff2` immutable.
- Tests: `gtasks-store`, `gtasks-model`, `gtasks-sync` (inkl. zwei Clients gegen dasselbe Konto), `gtasks-lists` (Node, ohne Browser).
  **Nicht automatisiert getestet:** Verhalten im Browser, Flugmodus, echter Google-Login/-Abgleich, Web Locks, mehrere Tabs real.

## Geplant / offen

Weitere v1-Funktionen sollen schrittweise und unauffällig in v2 wandern (Kalender-Ansicht, Medien-Anhänge,
Zeiträume `startDate`/`endDate`, Tagesprompts, Habit-Journale, Supplements/Mahlzeiten in der Timeline).
Offen: Test des Ziehens auf dem iPad, Zustimmungsbildschirm (Calendar, Tasks), Habit-Häufigkeit in der Quote,
Browser-Test von Door v2 (Layout, Hash-Wechsel) und Google Tasks gegen die echte API (Zeitzonen der `due`-Tage, Token-Ablauf).

## Door v2 · Quellen-Registry und Plan-Board (Drag & Drop)

- **Registry:** `SOURCES` in `src/lib/door/source.js` (Backend, Google Tasks, Taskwarrior); jede Quelle ist ein Funktionsset mit identischen Signaturen (`door(source)`). Die Wahl liegt pro Nutzer in Firestore `journal/{uid}/settings/door` (Rule `journal/{uid}/**`; der alte Pfad `fitness/{uid}/settings/door` wird nur noch als Fallback gelesen), `localStorage` `dv2:source` ist nur Cache.
- **Plan-Board:** dnd-kit (`@dnd-kit/core`). Karten haben einen Griff „⠿“ (nur der Griff sperrt Scrollen, wichtig für iPad); Ziel sind Q1–Q4 oder der beim Ziehen erscheinende Slot „Door der Woche“ (setzt Q2 und wählt die Door). Optimistisches Update im Query-Cache, danach Speichern. Hits zwischen Tagen ziehen (Production) gibt es noch nicht.

## Potential: Wischen, Notiz, +hot aus dem Journal

- **Wischen** (`PotentialRow` in `DoorV2Panels.jsx`, Pointer Events, `touch-action: pan-y`): `Q1 « Q2 ‹ Eintrag › Q3 » Q4` – kurz (≥ 56 px) = Q2/Q3, weit (≥ 130 px) = Q1/Q4; setzt über `assignQuadrant` den Plan-Quadranten (bei Taskwarrior `priority`), der Quadrant steht als Badge an der Zeile. Haken (erledigt) und Kreuz (löschen) sind entfernt.
- **Antippen** öffnet ein Blatt: Q1–Q4-Knöpfe (auch ohne Touch), **Notiz** (nur Taskwarrior: Annotation `NOTE\n<text>` am Task; `door-taskopen` übernimmt sie beim ersten `hot`-Öffnen in die Potential-Markdown) und **War Stack starten** (Wizard startet direkt für diesen Eintrag bzw. setzt eine offene Session fort).
- **+hot im Journal:** Ein Journal-Eintrag mit Tag `hot` (v1 und v2) wird beim Speichern/Bearbeiten über `saveJournal`/`updateJournal` (`lib/db/journal.js` → `lib/door/hotFromJournal.js`) als Potential-Item in der in Door v2 gewählten Quelle angelegt (Titel = erste Zeile ohne `+tags`). Der Marker `hot_potential` am Eintrag verhindert Doppel-Anlage; scheitert die Quelle (z. B. Taskwarrior nicht verbunden), bleibt der Marker aus und der nächste Speichervorgang versucht es erneut. Das Journal-Speichern selbst bleibt unberührt.

- **+p / +profit / +review im Journal:** Solche Einträge landen beim Speichern/Bearbeiten (`lib/db/journal.js` → `lib/door/profitFromJournal.js`) in `journal/{uid}/profit/{Eintrags-ID}` (Titel, Text, Datum, Woche) und erscheinen im **Profit**-Panel unter „Reviews aus dem Journal“ – für alle drei Quellen. Doc-ID = Eintrags-ID, also kein Duplikat beim Bearbeiten; Löschen des Journal-Eintrags entfernt die Review mit. Gilt für Einträge, die ab jetzt gespeichert werden.

## Door v2 · Taskwarrior (TaskChampion-Sync)

Dritte Quelle neben „Backend“ und „Google Tasks“ (Registry `SOURCES` in `src/lib/door/source.js`; Wahl pro Nutzer in `journal/{uid}/settings/door`, alter Pfad `fitness/{uid}/settings/door` nur als Fallback).

- **Client:** `src/lib/door/taskchampion.js` – Pull gegen den `taskchampion-sync-server` (Snapshot + Versionen), Replik in IndexedDB `tc-door`. Krypto: PBKDF2-SHA256 (600 000 It., Salt = 16-Byte-Client-ID), ChaCha20-Poly1305 (`@noble/ciphers`), Hülle `[1][nonce 12][ct+tag]`, AAD `[1][Version-ID]`; Klartext ist **zlib-komprimiertes JSON**, Versionen als `{"operations":[…]}`.
- **Adapter:** `taskwarrior.door.js` – Potential = `+hot`/`+potential`, Plan: Quadrant aus `priority` (H=Q1, M=Q2, L=Q3, leer=Q4; `+q1…+q4` überschreibt), Door der Woche `+door`, Production = `+hit` mit `due` in der Woche, Profit aus `end` der letzten 8 Wochen. **Schreiben** per AddVersion (`commit()` in `taskchampion.js`: erst Pull, dann Push, bei 409 neu ziehen und wiederholen). Schreibende Funktionen: Hot-List anlegen/erledigen/löschen (`+hot`), Quadrant ändern (setzt `priority`, entfernt `+q*`), Door wählen (`+door` an den gewählten Task, von anderen offenen Tasks entfernt), Hits anlegen/abhaken (`+hit`, `due` = lokale Mitternacht). Versionen gehen als **unkomprimiertes** UTF-8-JSON raus (komprimiert → `task sync` panict mit Utf8Error); nur Snapshots sind zlib.
- **Zugangsdaten** (Server-URL, `sync.server.client_id`, `sync.encryption_secret` – Werte in `~/.taskrc` bzw. `~/.env/taskwarrior.env`) gibt man einmal ein; sie liegen in der IndexedDB und als Spiegel in `localStorage` (`tc:config`) des Browsers (+ `navigator.storage.persist()`) und zusätzlich in Firestore `journal/{uid}/settings/taskchampion` (Rule `journal/{uid}/**`, nur der eigene Nutzer; liegt als Modul-Fragment `firestore.rules.part` hier und wird von vitalos per `scripts/build-rules.mjs` in dessen `firestore.rules` eingebettet und deployed). Dadurch gelten sie für alle Apps (jede hat eigene Origin) und Geräte nach der Anmeldung; fehlt die lokale Config, wird sie von dort geholt. Das Secret liegt damit im Klartext in Firestore. Die Replik (Tasks) bleibt beim Ändern nur der URL erhalten und wird offline weiter genutzt. Dieselbe Client-ID wie auf Desktop/iOS (Claw Warrior) nutzen.
- **Infrastruktur:** `taskchampion-sync-server` (Port 53589) ist über den Tailscale-Funnel-Root `https://ideapad.tail7a15d6.ts.net/` erreichbar; der Root zeigt auf den CORS-Proxy (`tailscale funnel --bg --set-path=/ http://127.0.0.1:53590`).
- **CORS:** der Sync-Server sendet keine CORS-Header → `scripts/tc-cors-proxy.mjs` (user-Unit `tc-cors-proxy.service`, `:53590`, erlaubt nur die Firebase-Origins) steht davor; Tailscale-Funnel-Root zeigt auf den Proxy.
- **Verifiziert** mit einem Test-Account (eigene Client-ID): Push aus dem Browser-Client → `task sync` (3.5.0) liest die Änderungen; `task add` + `task sync` → Browser-Client liest zurück. Die echte Historie wurde dafür nicht angefasst.
- **Offen:** Konfliktbehandlung ist simpel (neu ziehen, Eigenschaften überschreiben); Hits zwischen Tagen verschieben fehlt.

## Door v2 · War Stack

- **Backend-Quelle (Firestore/REST):** Wizard `DoorV2Warstack.jsx` im Plan – 11 Schritte aus `WARSTACK_STEPS`, Start an der gewählten Door, offene Sessions lassen sich fortsetzen.
- **Taskwarrior-Quelle:** gleiche Oberfläche, Entwurf in `localStorage` (`dv2:tw-ws:<uuid>`). Beim Abschluss: UDAs `domain`, `subdomain`, `domino_door` am +door-Task und das fertige Markdown als Annotation `WARSTACK\n<md>`. `~/.dotfiles/bin/door-taskopen` (Funktion `seed_warstack`) legt daraus beim ersten Öffnen `Vault/Door/War-Stacks/STACK_<slug>.md` an, danach öffnet taskopen die Datei wie gewohnt. Mit Test-Account gegen `task sync` verifiziert.

## Game v2 (`#game2/<fire|focus|freedom|frame|voice>`, Kurzformen `#fire` …)

`src/views/game/`. Die Maps sind keine Tasklisten (außer Fire), sondern Dokumente je Domain (Body/Being/Balance/Business) im Firestore des Nutzers (`journal/{uid}/…`, Rule `journal/{uid}/**`); Fragen/Felder aus `~/aos/game` (`maps/store.py`, `freedom/model.py`, `frame/cli.py`), Antworten speichern beim Verlassen des Feldes.

| Map | Inhalt | Firestore |
|---|---|---|
| Frame | fünf Fragen je Domain (`FRAME_QUESTIONS`) | `journal/{uid}/frame/{domain}` |
| Freedom | **Ideal Parallel World** (8 Felder, ohne Zeitraum), **Annual** (Jahr), **Quarterly** (Quartal) – je Domain | `journal/{uid}/freedom/{view}_{periode}_{domain}` |
| Focus | **Monthly** (Mission, Ergebnisse, Engpass, Kapazität, Habits, Routines, Additions, Eliminations, Set Sail), **Weekly** (Focus der Woche) – je Domain | `journal/{uid}/focus/{view}_{periode}_{domain}` |

Perioden wechselt man per ← → (`mapDb.js`: `periodKey`/`shiftPeriod`). Die Quarterly-Felder (`quarter_game`, `quarter_evidence`) sind in der Pillar-Doku nicht definiert und analog zum Annual Game ergänzt.

**Fire (Taskwarrior)** = die Woche nach dem Door-Framework: **eine Door** (`+door`, mit `domain`) und ihre **4 Hits/Strikes/Bigrocks** (`+hit` bzw. `alphatype:bigrock`, Platz = `hit_number` 1–4, diese Woche fällig oder erledigt). Leere Plätze legen beim „Add“ einen Task an (`+hit`, `alphatype:bigrock`, `hit_number`, `domain` und `domino_door` von der Door, fällig heute). Hits lassen sich abhaken und wieder öffnen. Darunter: Termine aus Google Calendar „Fire Map“ (lesend, `[TW …]`-Spiegel ausgeblendet), „weiterer Strike“ (`+fire`) und die übrigen offenen Strikes (überfällig/heute/Woche). Ohne gewählte Door verweist die Ansicht auf Door v2 → Plan.

**Voice** (`VoicePanel.jsx`, Fragen aus `voiceData.js` = `~/aos/voice/phases.py`): vier Phasen Stop/Submit/Struggle/Strike, jede Phase wird als Journal-Eintrag (Tags `voice`, `<phase>`) gespeichert.

## Tent v2 (`#tent2`)

`src/views/tent/` – General's Tent als eigene Raster-Ansicht (nicht Teil von Game): Return and Report (Habits aus Firestore, Fire/Hits/Doors aus Taskwarrior), Lessons Learned, Course Correction, New Targets; „Tent schließen“ speichert einen Journal-Eintrag (Tags `tent`, `<Woche>`), Status „Tent offen/geschlossen“ je ISO-Woche. Core4-Scores aus dem aos server fehlen (Browser erreicht ihn nicht).

## Geplant / offen (Stand Taskwarrior/Game/Tent)

- Ungetestet im Browser: Game v2, Tent v2, Voice, die drei neuen Apps, Push nach Taskwarrior gegen die echte Historie (getestet nur mit Test-Account).
- Game v2 liest/schreibt die YAML-Maps des Pillars nicht (eigene Firestore-Dokumente); Core4-Scores im Tent.
- Production: Hits zwischen Tagen verschieben (Fälligkeit ändern) je Quelle.
- Zustimmungsbildschirm (Scopes `calendar.readonly`, `tasks`, ggf. Testnutzer) nur in der Cloud Console; JavaScript-Ursprünge der OAuth-Clients nur bei `origin_mismatch` nötig (Firebase-Popup läuft über `authDomain`).
- vitalos: Umstellung auf direkten Zugriff auf `journal-dev` (Symlink/Pnpmfile/Checkout statt Submodul + Branch `vitalos`) ist nur besprochen, nicht umgesetzt.

## Weitere Apps: Voice, Game, Tent

Wie die Door-App: derselbe Code, eigener Flavor-Build (`VITE_APP_FLAVOR`, Liste `FLAVORS` in `vite.config.cjs`) mit eigenem Icon-Paket, Manifest, Splash und Hosting-Target.

| App | Site | Start | Befehl | Icons |
|---|---|---|---|---|
| Voice | vos-voice.web.app | `#voice` (`VITE_DEFAULT_GAME_MODE=voice`) | `pnpm run deploy:voice` | `public/icons-voice` |
| Game | vos-game.web.app | `#fire` | `pnpm run deploy:game` | `public/icons-game` |
| Tent | vos-tent.web.app | `#tent2` | `pnpm run deploy:tent` | `public/icons-tent` |

- Icons erzeugt `scripts/make-flavor-icons.sh` (rsvg-convert + ImageMagick, Raster-Stil).
- `pnpm run deploy:all` baut und deployt jetzt alle sechs Targets (journal, v2, door, voice, game, tent).
- Auth-Domains (`*.web.app`, `*.firebaseapp.com`) sind registriert, der TaskChampion-CORS-Proxy kennt die Origins.
- OAuth-Client-Ursprünge der neuen Sites (für Google Calendar/Tasks) nur in der Cloud Console eintragbar.
- Die ältere Vue-PWA `~/voice-dev` (Target `voice` in ihrem eigenen Firebase-Projekt) bleibt unberührt.


## Habits v2 · Erweiterung 2026-10-22

- Name, Core4-Kategorie und Frequenz bearbeiten; täglich, feste Wochentage oder
  Monatsziel (1–31). Icon, Reihenfolge und bestehende Records bleiben erhalten.
- Suchen und nach aktiv/offen/erledigt/archiviert filtern. Archivieren mit
  Bestätigung und Abbruch; Archiv wiederherstellen ohne Historienverlust.
- Das 28-Tage-Raster ist mit Maus/Tastatur bedienbar und kann vergangene
  Erledigungen setzen/zurücknehmen. Zukünftige Tage sind gesperrt.
- Datenfenster folgt dem gewählten Tag, einschließlich sichtbarer Woche/Monat;
  frühere Zeiträume werden nicht mehr fälschlich mit Daten ab heute dargestellt.
- Serien zählen geplante Wochentage; Quote ignoriert freie, zukünftige und
  vor dem Erstellungsdatum liegende Tage. Monatsziele zeigen Kalenderfortschritt.
- Fehler beim Laden/Speichern bleiben sichtbar. Wiederholen ist möglich;
  fehlgeschlagene Entwürfe bleiben erhalten. Laufende Änderungen sperren
  parallele Bedienung und werden erst nach bestätigtem Schreiben übernommen.
- In Habits über den eingebauten JournalAppWrapper und den Einstieg „Habits v2“.
  Eingebettete Links bleiben beim Host; standalone bleiben #door2/#journal gültig.

## Offline-first (Game, Voice, Journal-Schreiben)

- **Schreiben ist lokal fertig**: Firestore-Writes werden nicht mehr awaited (die Promise löst erst nach Server-Bestätigung auf und hängt offline). `lib/offline.js` `track()` zählt sie, schluckt Fehler und meldet sie über `useSyncState()`; `saveJournal`/`updateJournal`/`deleteJournal`, `saveFrameAnswer`, `saveMapAnswer` liefern `synced` bzw. eine Promise<boolean>.
- **Lesen ist cache-first**: Frame/Freedom/Focus hören per `onSnapshot` (`useLiveSnap`, `watchFrames`, `watchMapDocs`) – sofort lokaler Stand, Server-Änderungen kommen im Hintergrund nach. react-query läuft global mit `networkMode: "offlineFirst"`.
- **Taskwarrior (Fire)**: `taskchampion.js` hält eine Outbox (`state.pending` in IndexedDB). `commit()` merkt Operationen vor und zeigt sie sofort (`tasks()` = Replik + Outbox), `flush()` zieht neue Versionen und sendet die Outbox (409 → neu ziehen). `onChange()` meldet Änderungen der Replik an die Ansichten.
- **Hintergrund-Sync**: `startBackgroundSync` (main.jsx) leert die Outbox beim Start, bei `online`, beim Sichtbarwerden und alle 60 s. Echtes Background-Sync bei geschlossener App (SW) gibt es nicht.
- **Kalender (Fire Map)**: letzter Stand der Woche liegt in localStorage und bleibt offline sichtbar.
- **SyncBadge** (GameV2View) zeigt Offline-Status, offene Änderungen und Schreibfehler.
- **Tent**: Habits (`watchHabits`) und die Tent-Einträge der Woche (`watchJournalRange`) kommen per Listener cache-first; der Wochenabschluss ist lokal sofort gespeichert, die Taskwarrior-Scores rechnen sich bei Replik-Änderungen neu. Entwurf lag schon in localStorage.
- Grenze: die allererste Taskwarrior-Replik und Google-Login/Kalender-Token brauchen einmal Netz.

## Autosave und Entwürfe (Game, Journal v2, Habits · 2026-10-31)

Frame/Focus/Freedom speicherten bisher erst bei `onBlur`; wer die PWA beendete oder neu lud, bevor das Feld den Fokus verlor, verlor den Text.
Außerdem baute `key={…${antwort}}` das Feld bei jeder gespeicherten Änderung neu auf (Entwurf weg, Cursor springt).

- **Bausteine**: `src/lib/draftStore.js` (rein, getestet in `tests/draft-store.test.mjs`: Entwurfsspeicher mit Speicher-Rückfall, `createAutosaver`) und
  `src/lib/useAutosaveField.js` (Hook `useAutosaveField`, `usePersistedText`). Komponente `views/game/AutosaveArea.jsx`.
- **Ablauf je Feld**: jede Eingabe → Entwurf sofort in `localStorage` (`draft:v1:<uid>:<pfad>`) → entprellt (700 ms) lokal speichern (`saveFrameAnswer`/`saveMapAnswer`,
  `track()`, nie awaiten; Abgleich im Hintergrund). Sofort speichern bei Blur, `visibilitychange`→hidden, `pagehide`, `beforeunload`, Unmount/Ansichtswechsel.
- **Stabil beim Tippen**: das Feld ist kontrolliert und wird nicht mehr per `key` neu aufgebaut. Eingehende Stände (Cache/Server/Echo) überschreiben das Feld nur,
  wenn nichts Ungesendetes getippt ist (Dirty-Regel); sonst gewinnt der lokale Text (letzter Schreiber gewinnt). Der Entwurf wird erst gelöscht, wenn Stand = Text (Echo).
- **Wiederherstellung**: beim Start wird ein vom Stand abweichender Entwurf angezeigt und sofort nachgespeichert. Vor dem Laden des Stands wird nichts gespeichert (Entwurf wartet);
  schlägt der Listener fehl, gilt das Feld trotzdem als bereit.
- **Eingabezeilen mit Entwurf** (`usePersistedText`): Fire „Neuer Strike“ und Hit-Slots, Journal v2 Eingabe/Smart Logger (`<uid>:jv2:compose`), Bearbeiten-Feld eines Eintrags (`<uid>:jv2:edit:<id>`, bis Speichern/Verwerfen).
- **Keine Warnhinweise mehr** in Frame/Maps (Permission-/Listener-Texte), Fire (Netzfehler der Replik, Kalender „offline“), Journal v2 (Habits-Ladefehler nur noch, wenn gar nichts da ist; Kalender „offline“).
- **Lesen cache-first** (`src/lib/db/fastDocs.js`, getestet in `tests/fast-docs.test.mjs`): `getJournal`, `getJournalRange`, `getHabitsRange` antworten innerhalb von 1,2 s mit dem Serverstand, sonst sofort mit dem lokalen Stand (IndexedDB);
  der Serverstand kommt per `onLate` nach. Ist der Cache leer und das Netz da, wird wie bisher auf den Server gewartet.
- **Habit-Schreiben ohne Warten**: `recordHabit`/`unrecordHabit` (`src/db/index.js`) und `addHabit`/`updateHabit`/`setHabitArchived` (`habitsDb.js`) awaiten nicht mehr die Server-Bestätigung (`track()`); vorher hing das Abhaken offline ewig und
  `habitLock` sperrte danach alle weiteren Habit-Aktionen. Neue Habits bekommen die ID clientseitig.
- **Tent v2** war bereits sauber (Entwurf je Tastendruck in `tv2:<woche>`, Listener cache-first, Abschluss lokal sofort); unverändert.
- **Nicht getestet**: Verhalten im Browser (Tippen, Cursor, Flugmodus, PWA-Kill), nur die reine Logik per Node-Tests.

## Google dauerhaft verbinden (Tasks + Calendar, 2026-10-28)

**Ursache des Ablaufens:** `reauthenticateWithPopup` (Firebase) liefert nur einen Google-Access-Token (~1 h) und nie einen
Refresh-Token. Er lag in `sessionStorage` (weg beim Schließen von Tab/PWA) und wurde nach 55 min verworfen; danach half nur
ein neues Popup. Das galt für `gcal.js` (Kalender) und `gtasks.js` (Door v2) getrennt, jeweils mit eigenem Token.
(Die älteren Abschnitte oben zu `sessionStorage`/„1 h“ beschreiben diesen Stand; er gilt nur noch als Rückfall.)

**Gewählte Lösung:** ein gemeinsamer Token-Dienst `src/lib/google/` für Tasks, Journal-Kalender und Game → Fire.
Zwei Betriebsarten, die der Dienst selbst wählt:

| Art | Wann | Laufzeit |
|---|---|---|
| `server` | Cloud Function eingerichtet | dauerhaft: Refresh-Token liegt serverseitig, der Browser holt bei Bedarf (2 min vor Ablauf, bei 401) einen frischen Access-Token |
| `popup` | Function nicht eingerichtet/erreichbar | wie bisher ~1 h (Footer/Leiste zeigt „Verbindung ca. 1 h“), Token jetzt im `localStorage` und übersteht Reload/PWA-Neustart innerhalb der Stunde |

Begründung: Ein reiner Browser-Weg kann keine dauerhafte Verbindung liefern. GIS-Token-Client mit stillem Re-Request ist
Popup-/Cookie-abhängig und scheitert ohne Nutzergeste (iOS/PWA); Firebase-Auth gibt keinen Refresh-Token heraus. Der einzige
robuste Weg ist der Code-Flow mit serverseitigem Refresh-Token. `functions/` gab es schon (Region `europe-west1`), neue Pakete
sind nicht nötig (Node-22-`fetch`). Der Refresh-Token verlässt den Server nie: Firestore `googleTokens/{uid}` hat **keine**
Rule (Standard = verboten für Clients), nur das Admin-SDK der Function liest/schreibt.

**Dateien:**
- `src/lib/google/tokens.js` – reiner Dienst (Speicher, Ablauf, geteilte Erneuerung, 401-Retry, Modi); getestet in `tests/google-tokens.test.mjs`.
- `src/lib/google/auth.js` – Browser-Glue: Cloud-Function-Aufrufe (`firebase/functions`, erst beim Verbinden/Erneuern nachgeladen), Google-Identity-Services-Skript (wird erst beim Verbinden-Vorladen geholt, nie beim Start), Firebase-Popup-Rückfall. Beide Scopes (`calendar.readonly`, `tasks`) in einer Einwilligung.
- `src/lib/google/useGoogle.js` – Hook `{ connected, mode, busy, error, connect, disconnect }`; eine Verbindung gilt in Door v2, Journal v2 und Fire.
- `functions/google.js` (+ Export in `functions/index.js`) – `googleLinkConfig`, `googleLink` (Code → Refresh-Token), `googleAccessToken`, `googleUnlink`; getestet in `tests/google-function.test.mjs`.
- `gcal.js`/`gtasks.js` rufen nur noch `google.authFetch` auf (Fehler: `google-expired` → „neu verbinden“, `google-offline` → Verbindung bleibt, Hinweis).

**Offline:** Beim Start/Navigation kein Google-Zugriff. Ist der Token abgelaufen und das Netz weg, wirft der Dienst `google-offline`
(Verbindung bleibt gespeichert, kein Crash); Fire zeigt dann den zuletzt geladenen Wochenstand (`gv2:cal:…`).

**Game → Fire:** `FireCalendar` (in `GameMapPanel.jsx`) nutzt denselben Dienst; Termine der Woche, „Heute“ hervorgehoben,
Umschalter „Alle Kalender“/„Nur Fire Map“ (gleiche Einstellung `jv2:cal-all` wie Journal v2). Die Kalender-Anbindung in
Journal v2 gab es schon (`gcal.js`), sie wird wiederverwendet.

**Einrichtung für die dauerhafte Verbindung (manuell, nicht von Claude erledigt):**
1. Google Cloud Console, Projekt `fitness-aos` → APIs & Dienste → Anmeldedaten: OAuth-Client-ID „Webanwendung“ (der von Firebase angelegte Web-Client kann genutzt werden). **Autorisierte JavaScript-Ursprünge:** alle Hosting-Domains (`https://vos-journal.web.app`, `https://vos-door.web.app`, die Game/Tent/Voice-Sites, ggf. `http://127.0.0.1:9001`). Weiterleitungs-URIs nicht nötig (Popup-Flow, `postmessage`).
2. Zustimmungsbildschirm: Scopes `calendar.readonly` und `tasks` eintragen. **Status auf „In Produktion“ stellen**: im Status „Testing“ laufen Refresh-Tokens nach 7 Tagen ab (dann `google-expired` → neu verbinden). Für Scopes ohne Prüfung (nur eigener Account, <100 Nutzer) reicht „nicht verifiziert“ mit Warnhinweis beim Verbinden.
3. `firebase functions:secrets:set GOOGLE_OAUTH_CLIENT_SECRET` (Client-Secret), Client-ID beim Deploy als Parameter `GOOGLE_OAUTH_CLIENT_ID` angeben (oder in `functions/.env.fitness-aos`), dann `firebase deploy --only functions:journal`.
4. Im Browser einmal „verbinden“. Bekommt Google keinen Refresh-Token geliefert (Zugriff war schon erteilt), Meldung `google-no-refresh-token`: unter myaccount.google.com/permissions den Zugriff der App entfernen und neu verbinden.

Ohne diese Schritte läuft alles im Popup-Modus (~1 h), wie zuvor.

**Stand 2026-10-31: Schritte 1–3 sind noch nicht erledigt.** In `fitness-aos` sind `googleLinkConfig`, `googleLink`,
`googleAccessToken`, `googleUnlink` und `scheduledDoorReminders` nicht deployt (`firebase functions:list`), das Secret
`GOOGLE_OAUTH_CLIENT_SECRET` existiert nicht. Prüfen: `firebase functions:list --project fitness-aos` und
`firebase functions:secrets:get GOOGLE_OAUTH_CLIENT_SECRET --project fitness-aos` (404 = nicht gesetzt). Deploy läuft über die
Codebase `journal` (`firebase.json`), nicht über einzelne Functions von Hand; andere App-Sender dürfen nicht überschrieben werden
(siehe `RESULTS.md`, 2026-10-22, `deploy-push-functions.yml` in vitalos).

**Fehlercode bei fehlender Function:** Eine nicht deployte Callable liefert 404 ohne CORS-Header; der Browser blockiert die
Antwort, das SDK meldet `functions/internal` (nicht `functions/not-found`). `prepareGoogleConnect` in `auth.js` behandelt das
online als „nicht eingerichtet“ und fällt auf das Popup zurück. Ohne Netz bleibt es bei `google-offline`.

**Ungetestet (braucht echten Google-Login im Browser):** GIS-Code-Popup, Token-Tausch und Erneuerung gegen Google, Cloud-Function-Deploy, Popup-Rückfall bei fehlender Function (`functions/internal`, per `curl` auf 404 ohne CORS geprüft, nicht im Browser), Popup-Blocker auf iOS.

## Door-Erinnerungen (offene Daily Hits, 2026-10-28)

Google Tasks speichert nur das Fälligkeits-**Datum**, keine Uhrzeit und keine Erinnerung. Deshalb gibt es
eine **tägliche Erinnerung** statt Zeiten je Task:

- Door v2 → Zeile „Erinnerung offene Hits“: einschalten, Uhrzeit wählen (Standard 08:00). Gespeichert in
  `fitness/{uid}/settings/push` unter `apps.door` (Token wird mit dem Journal-Push geteilt).
- Cloud Function `scheduledDoorReminders` (alle 5 Min., `functions/index.js`, Logik in `functions/door-reminders.js`)
  holt mit dem gespeicherten Refresh-Token (`googleTokens/{uid}`) die offenen Tasks der Liste „Door · Production“
  mit Fälligkeit heute oder früher und sendet eine FCM-Datennachricht `app: "door"`.
- `public/journal-messaging-sw.js` zeigt sie an (Tag `door-reminder`, Klick → `/#door2/production`).
- Voraussetzung: **dauerhafte** Google-Verbindung (nicht der 1-h-Popup-Rückfall) und Functions-Deploy
  (`firebase deploy --only functions:scheduledDoorReminders`, Secret `GOOGLE_OAUTH_CLIENT_SECRET` wie bei den Google-Functions).
- Ohne offene Hits wird nichts gesendet. Test: `tests/door-reminders.test.mjs`.
