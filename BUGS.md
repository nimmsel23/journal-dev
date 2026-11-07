In  journal-dev  (und  fitness-dev ) läuft das Journal inzwischen über die          
  Collection  fitness/{uid}/journal  im neuen Format (ein Dokument pro Eintrag mit Auto-ID via       
  addDoc , Feldern wie  text ,  time ,  tags  und Abwärtskompatibilität beim Lesen).   

DAS DING IST ABER DASS ES WOHL KOMPLIZIERT MIT DEN FUEL LOGS IST WEIL DER JOURNAL ORDNER IM FITNESS ORDNER LIEGT!
WAS MAN EIGNETLICH MACHEN MUSS IST DAS JOURNAL-DEV AUF ALLE FITNESS+NUTRITION+RELAX JOURNAL-ORDNER ZU HETZEN.

## Destillat aus der RESULTS.md (2026-11-07)

Kurzfassung dauerhaft relevanten Wissens aus dem früheren Arbeitslog, thematisch einsortiert vom thin-results-Dienst.

# Bekannte Fehler & Lösungen

## Google-Integration

### Functions nicht deployt

- **Symptom:** "Google gerade nicht erreichbar (offline?)", "Google Tasks ist nicht verbunden", "Google Tasks verbinden" wirkungslos
- **Ursache:** `googleLinkConfig`, `googleLink`, `googleAccessToken`, `googleUnlink`, `scheduledDoorReminders` sind in `fitness-aos` **nicht deployt**
- **Technisch:** 404 ohne CORS-Header → Browser blockiert → SDK meldet `functions/internal` (nicht `functions/not-found`)
- **Workaround:** `prepareGoogleConnect` (`src/lib/google/auth.js`) wertet `functions/internal` als "nicht eingerichtet" → **Firebase-Popup (~1 h)**
- **Lösung:**
  1. OAuth-Client mit Ursprüngen erstellen
  2. Zustimmungsbildschirm auf "**In Produktion**" setzen
  3. `firebase functions:secrets:set GOOGLE_OAUTH_CLIENT_SECRET`
  4. `GOOGLE_OAUTH_CLIENT_ID` setzen
  5. `firebase deploy --only functions:journal`

---

### Token-Laufzeit

- **Symptom:** Verbindung bricht nach ~1 Stunde ab
- **Ursache:** `reauthenticateWithPopup` liefert nur **~1-h-Access-Token ohne Refresh-Token**
- **Lösung:** Serverseitige Functions mit **Refresh-Token** in `googleTokens/{uid}` (siehe FIREBASE.md)
- **Achtung:** Ohne "In Produktion"Zustimmungsbildschirm → Refresh-Token nach **7 Tagen** weg

---

### Scope-Fehler

- **Symptom:** Kalender-Schreiben funktioniert nicht
- **Ursache:** Fehlender Scope `calendar.events.owned`
- **Lösung:** Serverseitige Prüfung → Tokens ohne Scope werden **abgelehnt**

---

## Door v2

### Notizfeld unter Wisch-Hinweis

- **Symptom:** Notizfeld und Sheet in Door v2 Potential nicht sichtbar
- **Ursache:** `.dv2-swhint` (`position: absolute; inset: 0`) deckt den ganzen Eintrag ab
- **Lösung:** `.dv2-swipe > .dv2-note, .dv2-swipe > .dv2-sheet { position: relative; }`
- **Commit:** `a0b7bac` (Revert von Workaround `03d67bf`)

---

### Hits haben Vorrang

- **Symptom:** Door der Woche ändert sich nicht, obwohl Button gedrückt
- **Ursache:** Hits dieser Woche hängen an einer anderen Door
- **Verhalten:** **Hits haben Vorrang** vor dem `kw<NN>`-Tag; Button ändert Door erst, wenn Hits umgehängt sind
- **Lösung:** Hits manuell umhängen oder Warten bis Wocheends

---

### Gleichzeitige Offline-Änderungen

- **Symptom:** Änderungen eines Geräts überschreiben Änderungen eines anderen Geräts
- **Ursache:** Notiz/Quadrant/Door-Woche teilen sich das Google-Feld `notes`
- **Verhalten:** **Letzter Sender gewinnt** (kein Merge)
- **Lösung:** Keine (architektonische Einschränkung)

---

## Offline-First

### Service Worker Cache

- **Symptom:** Service Worker wird nicht aktualisiert
- **Ursache:** `*.js` fällt unter 1-Jahr-immutable-Regel
- **Lösung:** `no-cache` für `/*-messaging-sw.js` in `firebase.json`

---

### Outbox nicht geleert

- **Symptom:** Outbox bleibt nach Konto-Wechsel bestehen
- **Ursache:** Keine automatische Löschung
- **Verhalten:** Outbox bleibt für **neues Konto** sichtbar (aber nicht nutzbar)
- **Lösung:** Manuelles Leeren oder Browser-Cache löschen

---

## Build & Deployment

### pnpm Store Lock

- **Symptom:** `pnpm run build:firebase` scheitert mit `ERR_PNPM_STORE_DIR_OPEN_OPERATION_LOCK`
- **Ursache:** Schreibzugriff auf pnpm-Store blockiert
- **Lösung:** Schreibzugriff in der zulässigen Umgebung ermöglichen

---

### CI-Serviceaccount

- **Symptom:** `deploy-push-functions.yml` scheitert
- **Ursache:** Fehlendes `secretmanager.secrets.get` für CI-Serviceaccount
- **Lösung:** Berechtigungen für Serviceaccount erweitern

---

## Journal v2

### localToday() UTC-Bug

- **Symptom:** Datum springt nach 22/23 Uhr auf nächsten Tag
- **Ursache:** `localToday()` nutzte **UTC** statt Ortszeit
- **Lösung:** `localToday()` nutzt jetzt **Ortszeit**

---

### Autosave nur bei onBlur

- **Symptom:** Textverlust bei Beenden/Neuladen
- **Ursache:** Frame/Focus/Freedom speicherten nur bei `onBlur`
- **Lösung:** Autosave mit Entwurf in `localStorage` (`draftStore.js`)

---

## Habits v2

### Offline-Schreiben hängte

- **Symptom:** Abhaken hängte ewig; `habitLock` sperrte weitere Aktionen
- **Ursache:** `recordHabit`, `unrecordHabit`, etc. awaiteten Server-Bestätigung
- **Lösung:** **Optimistisches Schreiben** ohne Server-Bestätigung

---

## Smart Log

### Doppelter Gemini-Aufruf

- **Symptom:** Gleiche Analyse wird zweimal ausgelöst
- **Ursache:** Request-IDs wurden nicht lokal gespeichert
- **Lösung:** Request-IDs bleiben **lokal für Nutzer und Journaldatum** gespeichert → Server kann Cache nutzen

---

### Eingabe nicht gesperrt

- **Symptom:** Änderungen während Analyse gehen verloren
- **Ursache:** Eingabe war nicht gesperrt
- **Lösung:** Eingabe **gesperrt** während laufender Analyse; Entwurf bleibt erhalten
