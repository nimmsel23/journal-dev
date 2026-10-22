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
