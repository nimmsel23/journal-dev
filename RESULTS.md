# RESULTS — Arbeitslog (ausgedünnt 2026-11-07; Destillat in den Doku-Dateien des Repos)

---

## 2026-11-06 — Fokus-Sperre (Stufe 0/1): Mindest-Log-Funktion, Daily Four und Tracker-Habits unter der Haube

Bausteine für den Fokus-Sperrmodus ("erst loggen, dann Apps", ~/vitalos-prod/docs/product-dev/FOKUS-SPERRMODUS.md).

- **Offen:** Verhalten von `syncTrackerHabits` (Schreiblast, Timing beim Start) **ungetestet** (kein Browser, keine echte Firestore-Daten).

---

## 2026-10-31 — Door v2 Plan (Quelle Taskwarrior): `+door` nicht mehr entfernt, Release bis in die Shell

- **Offen:** `selectWeeklyDoor` ruft `tasks()`/`commit()` direkt gegen die TaskChampion-Replik → **keine Test-Attrappe**. Nicht im Browser und nicht gegen echte Taskwarrior-Daten ausprobiert.
- **Validierung:** 119/119 Node-Tests grün. `pnpm run build:firebase` brach mit pnpm-Fehler ab → stattdessen `npx vite build --mode firebase` grün. Nicht im Browser getestet.

---

## 2026-10-31 — Autosave und Entwürfe: Game v2, Journal v2, Habits offline-first

- **Nicht getestet:** Browser, Flugmodus, PWA-Kill, Cursor-Verhalten; nur Node-Tests und beide Builds grün.

---

## 2026-10-31 — Door v2 komplett offline-first (Google Tasks: lokaler Store + Outbox + stiller Abgleich)

- **Grenzen:** Notiz/Quadrant/Door-Woche teilen sich das Google-Feld `notes` → bei gleichzeitiger Offline-Änderung zweier Geräte gewinnt der zuletzt Sendende. Door v1 (`v1.js`) schreibt Notizen/Updates weiter direkt per REST. Backend-Quelle liest per `getDocs` (Cache, aber bei schlechtem Netz evtl. Wartezeit). Ein Konto-/Google-Wechsel leert die Outbox nicht. Ohne deployte Functions gilt weiter der 1-h-Popup-Token: Abgleich pausiert still bis "Google Tasks verbinden", die App arbeitet lokal weiter.
- **Nicht getestet:** Verhalten im Browser/Flugmodus, echter Google-Login und -Abgleich, Web Locks und mehrere Tabs real, iOS-PWA. Kein Deploy.

---

## 2026-10-31 — Door v2 Google Tasks: Functions nie deployt, Popup-Rückfall griff nicht

- **Offen (braucht Daniel):** OAuth-Client + Ursprünge, Zustimmungsbildschirm "In Produktion", `firebase functions:secrets:set GOOGLE_OAUTH_CLIENT_SECRET`, Client-ID als `GOOGLE_OAUTH_CLIENT_ID`, dann Deploy der Codebase `journal` (`functions:journal`). Das OK zum Deploy liegt vor, es fehlen Secret und Client-ID. Ob `deploy-push-functions.yml` in vitalos die Google-Functions mitnimmt, ist nicht geprüft.
- **Status:** Fix steht auf `dev`, nicht auf `master`/live. Validierung: 51 Node-Tests und `vite build --mode firebase` grün.

---

## 2026-10-29 — Door v2 Potential: Notizfeld und Sheet lagen unter dem Wisch-Hinweis, Release nach master

- **Offen:** Service Worker kann ein zweiter Reload nötig sein. Validierung: 51 Node-Tests und `vite build --mode firebase` grün. Die Behebung beruht auf CSS-Malregeln und wurde nicht im Browser angesehen.

---

## 2026-10-28 — Google Tasks/Calendar: dauerhafte Verbindung, gemeinsamer Token-Dienst, Calendar in Fire

- **Offen/manuell:** OAuth-Client (Ursprünge), Zustimmungsbildschirm auf "In Produktion", Secret setzen und Functions deployen – Schritte in JOURNAL-V2.md. Echter Google-Login im Browser nicht getestet.

---

## 2026-10-26 — Door v2: Rechtsklick-Menüs und Notizfeld, Journal v2: Jahr-Ansicht und Eintrag bearbeiten

- **Validierung:** 27/27 Node-Tests und `vite build --mode firebase` bei jedem Commit grün. Header und Jahr-Ansicht per Screenshot. Rechtsklick-Menüs, Header-Sprünge und Bearbeiten wurden nicht im Browser angeklickt, Notiz und Bearbeiten nicht gegen echte Firestore-/Backend-Daten getestet.

---

## 2026-10-25 — Voice-Pause-Visualisierungen gemerged, dev gepusht, Release nach vitalos

- **Offen:** Visualisierungen nicht im Browser angesehen; ob die CI das Ergebnis deployt hat ist nicht geprüft.

---

## 2026-10-24 — Aufräumen: Dependencies, Hash-Routing, Docs

- **Offen:** Klick-Navigation, Offline-Reload und Habit-Doppelklick sind nicht im Browser geprüft. Headless-Thorium lädt `#v2/woche/…`, `#door2/plan`, `#focus`, `#tent2/…` und `#v2` in die richtige Ansicht.

---

## 2026-10-22 — Habits v2 vervollständigt

- **Nicht getestet:** Keine echten Nutzerdaten geschrieben; kein Push/Deployment.

---

## 2026-10-22 — Getrennter Push-Sender

- **Offen:** Prüfen ob `deploy-push-functions.yml` in vitalos die Google-Functions mitnimmt.

---

## 2026-10-21 — Gemeinsamer Changelog

- **Validierung:** Universalisierter VitalOS-Release-Dialog über vendorte Vite-Module eingebunden. Standalone mit eigener Bestätigung; eingebettet unterdrückt.

---

## 2026-10-21 — npm run deploy:vos

- **Offen:** Kein echter Release ausgeführt. Bash-Syntax und npm-Aufruf mit isoliertem Stub geprüft.

---

## 2026-11-01 — Tent-Push in der installierten Tent-PWA

- **Offen:** Empfang auf dem installierten Handy ist noch nicht geprüft; Push muss dort einmal eingeschaltet und erlaubt werden. CI-Functions-Workflow bleibt am fehlenden `secretmanager.secrets.get` des CI-Serviceaccounts hängen.

---

## 2026-10-21 — Journal v1: ContextMenu für Fitness/Fuel/Relax

- **Offen:** Kein push, merge oder deploy. Committed on dev only.

---

## 2026-10-19 — Journal push reminders: eigene Lane und Worker

- **Status:** Legacy shared tokens werden nicht als Journal-Tokens übernommen.

---

## 2026-10-29 — TaskChampion CORS-Proxy

- **Offen:** Game/Fire innerhalb der VitalOS-Shell können TaskChampion-Sync über denselben Proxy verwenden.

---

## 2026-10-31 — Dependabot aktiviert

- **Validierung:** YAML, repository manifest paths und update targets geprüft.

---

## 2026-11-01 — lokaler vos-tent-dev und optionaler Login

- **Offen:** `pnpm run deploy:tent:build` konnte wegen schreibgeschütztem pnpm-Store-Operation-Lock in der Sandbox nicht starten; kein Workaround am Store vorgenommen. Push-Prüfung auf Handy noch ausständig.

---

## 2026-11-01 — optionale Anmeldung in Tent, Voice und Door

- **Status:** Game v2 zeigt den Helfer zusätzlich bei Fire/Focus/Freedom/Frame. Build-Prüfung war nicht möglich (pnpm Store-Lock).

---

## 2026-11-01 — Build-Versionen

- **Validierung:** Kein Push, Release oder Deploy.

---

## 2026-11-03 — Smart-Log-Retry und Google-Kalenderberechtigung

- **Validierung:** `CI=true pnpm test` (135/135) und `CI=true pnpm run build:firebase` erfolgreich; `git diff --check` sauber. Kein Push, Release oder Deploy. Echte Gemini-Aufrufe und Kalender-Schreiben nicht getestet.

---

## 2026-11-03 — Smart-Log-Datentransparenz

- **Validierung:** `pnpm run build:cloud` erfolgreich (3.009 Module). Keine Deploys. Datenschutz-Hinweise nicht im Browser geprüft.

---

## 2026-11-03 — Voice-Journal-Kontext an Konto binden

- **Validierung:** `node --test tests/*.test.mjs` (22 Testdateien, alle bestanden) und `pnpm run build:cloud` (3.010 Module). Keine Nutzerdaten migriert; kein Push/Deploy.

## Offen (Sicherheitsnetz 2026-11-07: vom Bot zurückgestopft, in den Ziel-Docs nicht auffindbar)
- **Konzept:** `docs/FOKUS-DAILY-FOUR-TRACKER-HABITS.md` (Ur-Modell, Daily-Four-Zählkriterien, Sync-Regeln: additiv/keine Zukunft/konservativ bei Tombstones, offene Punkte).
- Offene Frage aus dem Vorlauf: `selectWeeklyDoor` entfernte `+door` von allen anderen offenen Tasks und zerstörte damit Doors samt Hits und Profit. Auf Entscheidung des Users entschärft (statt den Button auszublenden).
- **UI:** `DoorV2Panels.jsx` — `msg()` still bei Verbindungsfehlern, `State` blendet Daten nie aus, `initialData` aus `peek` (kein „Lade …“). `DoorV2View.jsx` — Panels laufen ohne Verbindung mit lokalen Daten, Hinweis „nicht verbunden“ nur bei Erstverwendung, dezentes „↻ n“ für offene Änderungen, Queries werden nach Pull/id-Mapping neu aus dem Store gelesen. Popup-Hinweis „gilt ca. 1 h“ entfernt.
- Offen/manuell: OAuth-Client (Ursprünge), Zustimmungsbildschirm auf „In Produktion“ (sonst Refresh-Token nach 7 Tagen weg), Secret setzen und Functions deployen – Schritte in `JOURNAL-V2.md`. Echter Google-Login im Browser nicht getestet.
- **Merge `855e2c6`:** sechs Voice-Commits mit den Pause-Visualisierungen (Mandelbrot-Zoom, Julia, Flow, Mandelbrot-Baum, Atemkreis/Atemring, Buddhabrot; Auswahl pro Tag, Zufall wiederholt nie die letzte) ohne Konflikte in `dev`. Betroffen: `src/views/game/PauseViz.jsx` (neu), `VoicePanel.jsx`, `game-v2.css`.
- Die Journal-Cloud-Function prüft sonntags zur gespeicherten Zeit, ob diese Woche ein Journal-Eintrag mit `tent` und ISO-Wochen-Tag vorliegt. Bei offenem Tent sendet sie einen Link nach `/#tent2`; Journal-/Door-Payloads bleiben getrennt.
- Vor der Analyse wird in beiden Smart-Log-Einstiegen die Übermittlung an Gemini offengelegt. V2 nennt Text, Datum, Tags und Habit-Namen; die ältere Ansicht nennt Text, Datum und Habit-Namen. Analyse startet ausschließlich nach dem Klick, Vorschläge bleiben prüfbar.
