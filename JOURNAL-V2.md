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

Tab-Key `journal-v2` (`src/routes.js`, `bare: true` = ohne App-Header). Hash-Alias `v2` und Modus-Teil
werden in `src/main.jsx` geparst; Modus liegt in `useApp().v2Mode` (`src/store.js`).
Startansicht per Build-Variable `VITE_DEFAULT_TAB=journal-v2` (siehe Deploy), ein Hash hat Vorrang.

## Dateien

| Datei | Zweck |
|---|---|
| `JournalV2View.jsx` | Shell: Modusleiste, Tag-Ansicht, Eingabe, Smart Logger, Queries |
| `JournalV2Range.jsx` | Wochen- und Monatsansicht (nur Darstellung) |
| `JournalV2Habits.jsx` | Habits-Ansicht: Heute-Toggle, Serie, Quote, 28-Tage-Raster, anlegen/archivieren |
| `TimelineDrag.jsx` | Versteckte Timeline (Hook `useTimelineDrag` + `TimelineOverlay`) |
| `gcal.js` | Google-Calendar-Lesezugriff |
| `habitsDb.js` | Habit anlegen / archivieren |
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
  wählbar (`localStorage jv2:grain`). Loslassen setzt `time` (`setJournalTime`), außerhalb loslassen bricht ab.
  Tastatur: Fokus auf die Uhrzeit, Pfeil hoch/runter verschiebt um das Raster. Umsetzung mit Pointer Events
  (`touch-action: none`, `setPointerCapture`), bewusst ohne dnd-kit; Touch auf dem iPad ist ungetestet.
- **Smart Logger (✦ in der Eingabezeile):** Freitext → `analyzeSmartJournal` (Firebase AI Logic / Vertex,
  `gemini-2.5-flash`) → Vorschau (Eintrag, Mahlzeiten, Wasser, Habits) → „Übernehmen“. Schreibt Journal (Tag `smart-log`),
  Nutrition-Log und Habit-Records. Unbekannte Habit-Namen werden übersprungen. Toggle in `localStorage jv2:smart`.
- **Google Calendar (nur lesen):** „Kalender verbinden“ im Footer, `reauthenticateWithPopup` mit Scope
  `calendar.readonly`. Token ~1 h nur in `sessionStorage`, nie in Firestore. Alle in Google ausgewählten Kalender,
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
| `./deploy.sh [--pull] [--dry-run]` | Desktop-Prod `/opt/journal`: baut im Repo, kopiert nur `dist-firebase/`, keine Backups |

Targets: `firebase.json` (zwei Hosting-Einträge) + `.firebaserc` (`journal` → `journal-vos`, `v2` → `vos-journal`).
CI-Workflows setzen `target: journal`. `firebase deploy` endete einmal mit „Timed out“ im Aufräumschritt nach
erfolgreichem Release (Exit 2); das Hosting war trotzdem live.

## pnpm

Das Repo ist auf pnpm umgestellt (`packageManager: pnpm@11.3.0`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` mit
`allowBuilds`, `@firebase/util`-Override 1.12.1, `shamefullyHoist`). `@vos/cross-app-aliases` steht standalone als
`link:` (pnpm kopiert `file:`-Verzeichnisse, relative Pfade brächen). **Im vitalos-Submodul** gilt stattdessen
`workspace:*`; `pnpm-lock.yaml` und `pnpm-workspace.yaml` gehören dort nicht hinein (Root-Lock von vitalos).

## Nach vitalos übernehmen

`vos-release journal` bricht an `package.json` ab (`link:` ↔ `workspace:*`). Manuell: in `~/vitalos/journal-app`
(Branch `vitalos`) `origin/dev` mergen, `package.json` des `vitalos`-Stands behalten und nur die Änderungen aus dev
übertragen (nicht komplett `--theirs`, sonst gehen die `@firebase/*`/`motion-*`-Deklarationen verloren),
`pnpm-lock.yaml`/`pnpm-workspace.yaml` entfernen, `pnpm install --lockfile-only` im vitalos-Root, pushen, Pointer in vitalos committen.

## Geplant / offen

Weitere v1-Funktionen sollen schrittweise und unauffällig in v2 wandern (Kalender-Ansicht, Medien-Anhänge,
Zeiträume `startDate`/`endDate`, Tagesprompts, Habit-Journale, Supplements/Mahlzeiten in der Timeline).
Offen: Test des Ziehens auf dem iPad, Zustimmungsbildschirm für Calendar, Habit-Häufigkeit in der Quote.
