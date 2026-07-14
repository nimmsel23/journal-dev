# REPORT — journal-dev Fehler-Audit + Fixes

**Datum:** 2026-07-12
**Session:** Claude Code (Fable 5)
**Commits:** journal-dev `bedacbc` (dev), habits-dev `aab29f4` (dev)
**Bilanz:** −1591 Zeilen toter Code, DB-Schema-Konflikt behoben, Bundle-Chunks repariert

---

## 1. DB-Schema-Konflikt (Hauptfehler, behoben)

### Befund

Zwei **inkompatible Schemata** schrieben in dieselbe Firestore-Collection
`fitness/{uid}/journal`:

| Pfad | Schema | Genutzt von |
|---|---|---|
| `src/lib/db/journal.js` (lokale Kopie) | 1 Doc pro Tag, Doc-ID = Datum, Feld `content` | fitness-dev local-Mode (re-exportiert als `local/journal.js` via `@journal`-Alias) |
| fitness-dev `firestore/journal.js` (modular) | N Einträge pro Tag, auto-ID, Felder `date`/`text`/`tags`/`time` | journal-Standalone-Build (`@db` → `src/db/index.js`), fitness-Firebase-Mode |

Einträge des einen Pfads waren im anderen **unsichtbar**. Zusätzlich lasen die
Habit-Journal-Aggregate aus einer toten Subcollection (`habits/{id}/journal/`)
statt der kanonischen flachen `habitJournals`-Collection.

### Fix

`src/lib/db/journal.js` komplett neu geschrieben:

- Schema jetzt **identisch** mit fitness-dev `firestore/journal.js` (Multi-Entry) —
  das Modell für die Integrations-Vision: Trainings-Tag + Nutrition-Tag als
  eigenständige Journal-Einträge pro Tag
- `await auth.authStateReady()` beibehalten (Fix aus `22dd205`)
- Alt-Dokumente im `content`-Format werden **lesend gemappt**, geschrieben wird
  nur noch kanonisch
- Habit-Journal-Aggregate (`getAllHabitJournalsHistory/ForDate`) lesen die flache
  `habitJournals`-Collection
- HabitJournal-**CRUD bewusst nicht exportiert**: kollidiert per `export *` mit
  habits-dev im fitness-Barrel (Rollup „Conflicting namespaces" → Build rot).
  CRUD-Ownership liegt bei habits-dev (local) bzw. fitness firestore (cloud).

---

## 2. Bundle-Chunks griffen ins Leere (behoben)

### Befund

`vendor-react` und `vendor-charts` waren **leere 0.07-kB-Stubs**; recharts steckte
komplett im DashboardView-Chunk (546 kB), React im index-Chunk (624 kB).

**Ursache:** Die `manualChunks`-**Objekt-Syntax** matcht nur Module aus journal-devs
eigenem `node_modules`. Die fuel-Views (DashboardView & Co.) kommen aus
`~/vitalos/fuel-dev` und lösten recharts/React in *deren* node_modules auf.
Zusätzlich lauerte in `vitalos/node_modules` recharts **3.9.0** (Major-Bruch zu
journal/fuel 2.15.4).

### Fix (vite.config.cjs)

1. `manualChunks` als **Funktion** mit node_modules-Pfad-Match (baumunabhängig)
2. `dedupe` erweitert um `recharts`, `lucide-react`, `framer-motion`
3. Firestore-Split getestet und **verworfen** (zirkuläre Chunks firestore ↔ app =
   Init-Risiko); `chunkSizeWarningLimit: 1000` mit Begründungskommentar

### Ergebnis

| Chunk | vorher | nachher |
|---|---|---|
| DashboardView | 546 kB | **161 kB** |
| index | 624 kB | **209 kB** |
| vendor-react | 0.07 kB (leer) | 142 kB |
| vendor-charts | 0.07 kB (leer) | 383 kB |
| vendor-calendar | 394 kB | 260 kB |
| vendor-firebase | 543 kB | 958 kB (gzip 230 — konsolidiert, SDK-Realität) |

---

## 3. Cleanup (−1591 Zeilen)

Alles per `mv` nach `.archiv/2026-07-12-cleanup/` (journal-dev) bzw.
`.archiv/2026-07-12-duplikate/` (habits-dev):

- **Tote lib/db-Forks:** `analysis.js`, `sessions.js`, `kb.js`, `user.js`,
  `habits.js`, `utils.js` (divergierte Kopien des fitness-Layers, kein Consumer)
- **Alter Monolith:** `src/lib/firestore-db.js` (310 Z.) + verwaistes `src/lib/api.js`
- **Verwaiste Module:** `src/components/habit/`, `src/lib.bak/`
- **Toter Symlink:** `TabSettingsModal.jsx.symlink.bak` (Ziel existierte nicht)
- **~20 .bak-Dateien:** vite.config ×3, package.json ×2, main.jsx ×3, u. a.
- **habits-dev:** „`(1)`"-Duplikate in `views/Habits/` (diff-identisch mit Originalen)
- `package.json`-Exports + `src/db.js`-Barrel auf bereinigten Stand angepasst
- `.archiv/` in `.gitignore` aufgenommen

---

## 4. Wichtige Architektur-Erkenntnis (⚠️ Stolperfalle)

`fitness-dev/src/views/Journal` ist ein **Verzeichnis-Symlink** auf
`journal-dev/src/views/Journal` (beide Checkouts). Deshalb existiert auch der
Symlink `journal-dev/src/constants` → `fitness-dev/src/constants` (relative
Imports der symlinked View lösen im journal-dev-Realpath auf).

Diese Verdrahtung ist über `@journal`-Greps **unsichtbar** — `views/Journal/` wurde
zunächst fälschlich archiviert (fitness-Build brach) und sofort wiederhergestellt.

**Regel:** Vor Archivieren/Umbenennen in `journal-dev/src/`:
`find <repos> -type l -lname "*journal-dev*"`

Dokumentiert in Memory: `project_journal_dev_state.md`.

---

## 5. Verifikation

| Build | Status |
|---|---|
| journal-dev (cloud/client) | ✅ 11 s, warnungsfrei |
| fitness-dev local | ✅ |
| fitness-dev firebase | ✅ |
| fuel-dev | nicht betroffen (definiert kein `@db`/`@utils`, nutzt nur die View) |

---

## 6. Offene Punkte (nächste Sessions)

1. **View-Konsolidierung Richtung DayOne:** Zwei parallele Journal-View-Linien —
   `views/Journal/` (fitness embedded, Symlink) vs. `JournalVosView.jsx` +
   `components/Journal/` (Standalone + fuel, mit Nutrition-Timeline). Zusammenführen
   zu EINER Komponente; fuel-Styles (`vos-fuel`, Orange-Töne) raus, UI Richtung
   DayOne (Ursprung ist fitness-Code).
2. **vitalos-Submodule-Pointer:** vitalos/journal-dev zeigt noch auf den alten
   Stand — `git submodule update --remote journal-dev` + Pointer-Commit nötig,
   damit fuel-dev cloud den Fix bekommt. Achtung: vitalos-Push triggert
   CI-Deploy, und die CI ist aktuell rot (package-lock nicht synchron).
3. **Datenmigration prüfen:** Bestehende Alt-Einträge (`content`-Format) werden
   lesend gemappt; optional einmalige Migration auf das kanonische Format.
4. **Vite-CJS-Deprecation:** `vite.config.cjs` → ESM (bricht bei Vite 6).
5. **fitness local-Mode-Frage:** `local/journal.js` re-exportiert eine
   Firestore-Implementierung — „local" ist dort effektiv cloud-only. Bewusste
   Entscheidung dokumentieren oder echten Local-Store bauen.

---

# NACHTRAG 2026-07-13 — View-Konsolidierung Richtung DayOne (Schritt 1)

**Offener Punkt 1 aus dem Audit umgesetzt:** Die zwei parallelen
Journal-View-Linien sind zu EINEM Kern zusammengeführt.

## Neue Struktur

```
src/components/Journal/
├── JournalTimeline.jsx   ⭐ DER gemeinsame Kern (Logik-Superset beider Linien)
├── JournalEntry.jsx      tokenisiert, alle Entry-Typen (workout/activity/meal/
│                         nutrition-journal/habit/habit-completion/regular)
├── JournalForm.jsx       Composer, tokenisiert
├── JournalHeader.jsx     Datum + Navigation, tokenisiert
├── JournalModal.jsx      Detail-Ansicht, tokenisiert (+ Meal-Detail neu)
├── JournalSettings.jsx   Superset (Darstellung + optional Integrationen)
└── journalUtils.js       localToday/formatRelativeDate/sessionInfo/TYPE_COLORS
                          (ersetzt @utils-Abhängigkeit — fuel hat kein @utils)

src/views/JournalVosView.jsx   dünner Wrapper (journal standalone + fuel)
src/views/Journal/index.jsx    dünner Re-Export (fitness-Symlink-Einstieg)
```

Alte views/Journal-Komponenten: `.archiv/2026-07-13-view-konsolidierung/`.

## Kern-Mechaniken

1. **`import * as db from "@db"` + Feature-Detection** — nicht jeder Kontext
   exportiert alle Quellen (fitness local: keine Nutrition/Meals). Namespace-
   Zugriff `db.getNutritionJournalHistory?.()` bricht nicht beim Build.
2. **Theme-Token-Kontrakt:** Kern-Root mappt einmalig
   `--j-* = var(--fitness-token, DayOne-Fallback)`. Im fitness-Kontext greifen
   dessen Themes (--accent/--card/--line/--ink/--bg/--dim), standalone/fuel
   bekommen ruhige Defaults (Akzent #4a9eff statt fuel-Orange #fb923c).
   Typ-Farben (workout=blau, meal=emerald, nutrition=sky) sind semantisch fix.
3. **⚠️ Verzeichnis-Symlink-Semantik gelernt:** Der Importer-Pfad bleibt
   symbolisch — relative Imports, die den symlinked Ordner VERLASSEN, lösen im
   HOST-Repo auf (deshalb brach `../../components/...` im fitness-Build).
   Fix: Re-Export via `@journal`-Alias (alle Konsumenten definieren ihn) —
   zwingt in den journal-Realpath.
4. **CrossoverButtons** nur im VOS-Wrapper (`showCrossover`), fitness sieht
   sie nicht. fuel-Orange dort ist Pillar-Semantik (Fitness/Fuel/Relax).

## Verifikation

| Build | Status |
|---|---|
| journal-dev standalone | ✅ 11.8 s |
| fitness-dev local | ✅ 9.6 s |
| fitness-dev firebase | ✅ 7.2 s |
| fuel-dev | ✅ 14.5 s |

## DayOne-Roadmap (nächste Schritte)

- [ ] Composer-UX: „Neuer Eintrag"-Karte mit Prompt des Tages statt Dauer-Textarea
- [ ] Foto-/Medien-Einträge (DayOne-Kernfeature)
- [ ] Kalender-/Heatmap-Navigation über der Timeline
- [ ] Tags + Suche über alle Einträge
- [ ] Wrapper-Header in journal-standalone weiter beruhigen (main.jsx Shell hat noch fuel-Gradient/Orange in styles.css)

---

# NACHTRAG 2026-07-13 (2) — DayOne-Features + fuel-Views-Entkopplung

## Composer-UX (DayOne-Muster)
- Eingeklappt: Einladungs-Karte mit **Prompt des Tages** (14 rotierende Fragen,
  deterministisch pro Datum via `getDailyPrompt`), „Entwurf fortsetzen"-Hinweis.
- Klick öffnet den Editor (Prompt als Kicker + Placeholder), nach dem Sichern
  klappt er zu; Bearbeitungs-Modus öffnet automatisch.

## Kalender-Navigation
- `JournalCalendar.jsx`: eigener Monats-Grid ohne Kalender-Library
  (FullCalendar existiert nicht in allen Konsumenten-Builds). Typ-Punkte pro
  Tag (max 3, TYPE_COLORS), Heute-Ring, Zukunft gesperrt, „Heute"-Shortcut.
- Toggle via CalendarDays-Button im JournalHeader; Tagesklick setzt das Datum
  und scrollt smooth zur Timeline-Gruppe (`#journal-day-{date}`).

## Medien-Einträge (Subagent)
- `journalMedia.js`: Upload nach Firebase Storage
  (`journal/{uid}/{date}/{ts}_{name}`), `attachToEntry`/`removeAttachment` via
  updateDoc + arrayUnion/arrayRemove auf `fitness/{uid}/journal/{id}`.
  Bewusst NICHT über @db (dessen saveJournal-Implementierungen kennen keine
  attachments) — eigenes Modul über journals guarded firebase.js.
- Dual-Mode-bewusst: `mediaAvailable()` (Firebase-Auth-User) blendet die
  Medien-UI ein/aus — der local-Modus bleibt unberührt.
- Form: ImagePlus-Button + lokale Previews (ObjectURL, sauber revoked),
  Entry: Thumbnail-Reihe (max 4, „+N"), Modal: Grid mit Klick → Original.
- **⚠️ OFFEN: Storage-Rules im Firebase-Projekt fitness-aos setzen** (kein
  storage.rules im Repo, firebase.json hat nur hosting+firestore):
  `match /journal/{uid}/{allPaths=**} { allow read, write: if request.auth != null && request.auth.uid == uid; }`
  Ohne das schlagen Uploads mit permission-denied fehl.

## fuel-Views raus aus der Standalone-App (Subagent)
- Tabs nur noch **Journal** (Default) + **Habits**; alle 7 @fuel/views-Tabs raus.
- main.jsx entkoppelt (NutritionHeatmap, useAppData → .archiv, kcal-Panel raus),
  store.js Default-Tab journal, @api-Alias + FullCalendar-dedupe +
  vendor-calendar-Chunk + nutrition/supplements-runtimeCaching entfernt.
- **@fuel-DB-Layer bleibt** (src/db/index.js) — Nutrition-/Meal-Einträge
  erscheinen weiterhin als Journal-Einträge in der Timeline.

## Dual-Mode-Klarstellung (User-Info)
journal, fuel, habits haben wie fitness local + firebase. journals vite.config
schaltet @db derzeit nicht um (immer Firestore-Doppelwrapper) — das
Soll-Muster nach fitness-Vorbild (`@db` → src/db.js im coach-Build) ist als
offener Punkt notiert.

## Verifikation
journal ✅ 9.3s · fitness local ✅ 11.3s · fitness firebase ✅ 9.2s · fuel ✅ 16.7s
vitalos-Shell: nach Commit + Submodule-Pointer (CI).
