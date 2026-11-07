# PATTERNS — wiederkehrende Fehler und Muster

---

### Google Functions nicht deployt
**Vorkommnisse:** 2026-10-28 (Google-Integration), 2026-10-31 (Functions nie deployt); 
**Lektion/Gegenmaßnahme:** Functions müssen explizit deployt werden (OAuth-Client + Secrets + `firebase deploy --only functions:journal`). CI scheitert am fehlenden `secretmanager.secrets.get` → Berechtigungen für Serviceaccount prüfen. Rückfall in `auth.js` (`functions/internal` → Popup) ist nur Workaround, keine Dauerlösung.

---

### 1-Stunden-Token-Problem
**Vorkommnisse:** 2026-10-28 (Popup-Token), 2026-10-31 (1-h-Popup-Token); 
**Lektion/Gegenmaßnahme:** `reauthenticateWithPopup` liefert nur ~1-h-Token ohne Refresh-Token. Serverseitige Functions mit Refresh-Token in `googleTokens/{uid}` nutzen. Zustimmungsbildschirm muss auf "In Produktion" stehen, sonst Refresh-Token nach 7 Tagen weg.

---

### Browser-Tests fehlen
**Vorkommnisse:** 2026-10-25 (Voice-Visualisierungen), 2026-10-26 (Rechtsklick-Menüs, Jahr-Ansicht), 2026-10-28 (Google-Integration), 2026-10-29 (CSS-Fix), 2026-10-31 (Door v2 offline-first, Google Tasks Functions), 2026-11-01 (Tent-Push, optionale Anmeldung), 2026-11-03 (Smart-Log, Voice-Kontext); 
**Lektion/Gegenmaßnahme:** Node-Tests und Build-Checks sind grün, aber Browser-Tests (Flugmodus, PWA-Kill, echte Daten, mobile Geräte) werden **systematisch übersprungen**. Headless-Thorium mit gemockten Daten als minimaler Fallback. **Regel:** Browser-Test vor Release Priorität geben.

---

### pnpm-Store-Lock-Probleme
**Vorkommnisse:** 2026-10-31 (build:firebase), 2026-11-01 (deploy:tent:build); 
**Lektion/Gegenmaßnahme:** `ERR_PNPM_STORE_DIR_OPEN_OPERATION_LOCK` in Sandbox/Worktree-Umgebungen. Schreibzugriff auf pnpm-Store ermöglichen oder Worktree mit eigenem `node_modules` nutzen. Fallback: `npx vite build --mode firebase` statt `pnpm run build:firebase`.

---

### Offline-First-Anforderung
**Vorkommnisse:** 2026-10-31 (Autosave, Door v2 offline-first); 
**Lektion/Gegenmaßnahme:** Nutzer erwartet lokale Daten als Wahrheit, stille Syncs, keine Warnhinweise. Muster: lokaler Store + Outbox + Sync-Engine (Pull → Rebase → Outbox). UI muss Daten immer anzeigen (aus Store), nicht "Lade…" zeigen. **Architektur:** Cache-first Lesen, optimistisches Schreiben.

---

### CSS-Positionierungsfehler
**Vorkommnisse:** 2026-10-29 (Notizfeld unter Wisch-Hinweis); 
**Lektion/Gegenmaßnahme:** Absolute Positionierung (`inset: 0`) deckt Kind-Elemente ab. Lösung: `position: relative` auf den Eltern-Knoten der betroffenen Elemente. **Check:** Immer DOM-Reihenfolge und Stacking-Context prüfen.

---

### Release-Prozess-Automatisierung
**Vorkommnisse:** 2026-10-21 (npm run deploy:vos), 2026-10-25 (vos-release-pr), 2026-10-26 (journal-release), 2026-10-29 (vos-release-pr); 
**Lektion/Gegenmaßnahme:** Standardisierter Weg: `dev` → `master` via `vos-release-pr journal` → Merge → `journal-release --yes` → Pointer-Bump. npm-Shortcut `deploy:vos` als Einstieg. **Achtung:** Ohne `--yes` bricht Skript ab (kein TTY für `gum confirm`).

---

### Service Worker Cache-Probleme
**Vorkommnisse:** 2026-10-31 (Hosting-Targets), 2026-11-01 (Tent-Push); 
**Lektion/Gegenmaßnahme:** Service Worker fallen unter 1-Jahr-immutable-Regel für `*.js`. **Fix:** `no-cache` für `/*-messaging-sw.js` in `firebase.json`. nach Ändern der Worker-Datei **zweimal reloaden** (Service Worker Update).

---

### Gleichzeitige Offline-Änderungen
**Vorkommnisse:** 2026-10-31 (Door v2 Google Tasks); 
**Lektion/Gegenmaßnahme:** Shared Felder (z. B. Google Tasks `notes`) führen zu **"letzter Sender gewinnt"**-Konflikten. **Architektonische Lösung:** Dedizierte Felder pro App oder Merge-Strategie. Bis dahin: Nutzer darauf hinweisen.

---

### CI-Blocker durch fehlende Berechtigungen
**Vorkommnisse:** 2026-10-31 (Push-Functions), 2026-11-01 (Tent-Push); 
**Lektion/Gegenmaßnahme:** CI-Serviceaccount hat oft **keine SecretManager-Berechtigungen**. Gegenmaßnahme: Manuelles Deploy oder Berechtigungen erweitern. **Regel:** Vor CI-Deploy Secret-Zugriff prüfen.

---

### Test-Daten nicht gegen echte Backends
**Vorkommnisse:** 2026-10-22 (Habits v2), 2026-10-26 (Journal v2 Bearbeiten), 2026-10-28 (Google-Integration), 2026-10-31 (Door v2), 2026-11-01 (Tent/Voice/Door Login), 2026-11-03 (Smart-Log, Voice-Kontext); 
**Lektion/Gegenmaßnahme:** Tests nutzen **gemockte Daten** oder Test-Doubles. Echte Backends (Firestore, Google, TaskChampion) werden **nie oder selten** in Tests genutzt. **Risiko:** Production-Bugs durch Mock-Divergenz. **Regel:** Mindestens 1 E2E-Test mit echtem Backend vor Release.

---

### UX: "Lade…"-Zustände vermeiden
**Vorkommnisse:** 2026-10-31 (Door v2 offline-first); 
**Lektion/Gegenmaßnahme:** Offline-First erfordert, dass UI **nie** "Lade…" anzeigt. Daten kommen aus lokalem Store (`peek`), Verbundungsstatus wird dezent angezeigt ("↻ n"). **Muster:** `initialData` aus Store, `msg()` still bei Fehlern, `State` blendet Daten nie aus.
