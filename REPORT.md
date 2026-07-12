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
