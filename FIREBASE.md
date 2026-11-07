# FIREBASE

Themen-Doku, angelegt vom thin-results-Dienst am 2026-11-07 aus dem Destillat der RESULTS.md (kein passendes Zuhause vorhanden); proaktiv mitschreiben (Regel der VitalOS AGENTS.md).

## Destillat aus der RESULTS.md (2026-11-07)

Kurzfassung dauerhaft relevanten Wissens aus dem früheren Arbeitslog, thematisch einsortiert vom thin-results-Dienst.

# Firebase-Konfiguration & Deployment

## Google OAuth & Functions

### Auth-Flow

- **Popup-Fallback:** `reauthenticateWithPopup` liefert nur **~1-h-Access-Token ohne Refresh-Token** (speichert in `sessionStorage`)
- **Serverseitig:** Cloud Functions mit **Refresh-Token** in `googleTokens/{uid}` (keine Client-Rule)
- **Token-Speicher:** `localStorage` (statt `sessionStorage`) für Persistenz
- **Erneuerung:** 2 min vor Ablauf; 401 → einmal mit frischem Token wiederholen
- **Fehler:** `google-expired`, `google-offline`

---

### Functions (Journal-Codebase)

| Function | Beschreibung | Status |
|----------|--------------|--------|
| `googleLinkConfig` | OAuth-Konfiguration | **Nicht deployt** |
| `googleLink` | OAuth-Link | **Nicht deployt** |
| `googleAccessToken` | Token-Abruf | **Nicht deployt** |
| `googleUnlink` | OAuth-Trennung | **Nicht deployt** |
| `scheduledDoorReminders` | Door-Erinnerungen | **Nicht deployt** |
| `scheduledJournalPushReminders` | Journal-Push-Erinnerungen | **Deployt** (manuell) |

---

### Deploy-Blocker

- **Secret fehlt:** `GOOGLE_OAUTH_CLIENT_SECRET` nicht gesetzt
- **Client-ID fehlt:** `GOOGLE_OAUTH_CLIENT_ID` nicht hinterlegt
- **OAuth-Client:** Ursprünge und Zustimmungsbildschirm **müssen "In Produktion"** sein (sonst Refresh-Token nach 7 Tagen weg)
- **Deploy-Befehl:** `firebase deploy --only functions:journal` (für Journal-Codebase)
- **CI-Blocker:** `deploy-push-functions.yml` scheitert an fehlendem `secretmanager.secrets.get` des CI-Serviceaccounts

---

### Function-Antworten

- **404 ohne CORS-Header:** Nicht deployte Callable antwortet mit 404 **ohne** CORS-Header → Browser blockiert → SDK meldet `functions/internal` (nicht `functions/not-found`)
- **Fix:** `prepareGoogleConnect` (`src/lib/google/auth.js`) wertet `functions/internal` als **"nicht eingerichtet"** → Firebase-Popup (~1 h)

---

## Hosting

### Cache-Konfiguration (`firebase.json`)


{
  "hosting": {
    "headers": [
      {"source": "/index.html", "headers": [{"key": "Cache-Control", "value": "no-cache"}]},
      {"source": "/manifest.webmanifest", "headers": [{"key": "Cache-Control", "value": "no-cache"}]},
      {"source": "/journal-messaging-sw.js", "headers": [{"key": "Cache-Control", "value": "no-cache"}]}
    ]
  }
}


- **Begründung:** `/journal-messaging-sw.js` fiel sonst unter die **1-Jahr-immutable-Regel** für `*.js`
- **Door-Build:** Precache 60 Einträge (~1,5 MiB), alle 39 JS-Chunks, `index.html`, Fallback `/index.html`

---

## Push-Benachrichtigungen

### Service Worker

| App | Worker | Pfad | Lane |
|-----|--------|------|------|
| Journal | `/journal-messaging-sw.js` | `/journal-push/` | `apps.journal` |
| Tent | `/tent-messaging-sw.js` | `/tent-push/` | `apps.tent` |

- **Trennung:** Journal-/Door-Payloads bleiben **getrennt**
- **Tagging:** Outgoing messages mit `app: journal` bzw. `app: tent`

---

### Tent-Push

- **Prüfung:** Sonntags zur gespeicherten Zeit (Standard **14:00, Europe/Vienna**) prüft die Function, ob diese Woche ein **Journal-Eintrag mit `tent` und ISO-Wochen-Tag** vorliegt
- **Aktion:** Bei offenem Tent → Sendet Link nach `/#tent2`
- **Deployment:**
  - Functions: manuell per Firebase CLI für `fitness-aos`
  - Hosting: `vos-tent.web.app/` liefert HTTP 200; `/tent-messaging-sw.js` liefert HTTP 200 mit `Cache-Control: no-cache`

---

### Journal-Push

- **Reminder:** `scheduledJournalPushReminders` in **eigener Codebase `journal`**
- **Deployment:** gezielt über VitalOS `deploy-push-functions.yml` (andere App-Sender bleiben unberührt)
- **Lane:** `apps.journal` in shared push settings document
- **Legacy:** Alte shared Tokens werden **nicht** als Journal-Tokens übernommen

---

## Scope-Berechtigungen

### Google Calendar

- **Erforderlich:** `calendar.events.owned` neben Kalender-Lese- und Tasks-Scope
- **Serverseitige Prüfung:** Tokens ohne Kalenderschreibrecht werden beim Verbinden **abgelehnt**

---

## Smart Log (Gemini-Integration)

- **Request-IDs:** Bleiben **lokal für Nutzer und Journaldatum** gespeichert → Wiederverwendung bei Reload
- **Cache:** Server kann gecachte Analyseergebnisse liefern (kein zweiter Gemini-Aufruf)
- **Datentransparenz:** Vor Analyse wird die Übermittlung an Gemini offengelegt (Text, Datum, Tags, Habit-Namen)
- **Sperre:** Eingabe gesperrt während laufender Analyse
- **Fallback:** Entwurf bleibt erhalten und kann **ohne KI gespeichert** werden
