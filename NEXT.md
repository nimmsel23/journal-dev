- [ ] „Als Door der Woche“ (Plan, Quelle Taskwarrior) im Browser gegen echte Daten prüfen (`fde6b31`, live seit 2026-10-31): Tag `kw<NN>` wandert zum gewählten Task, andere `+door` bleiben; bei vorhandenen Hits der Woche an anderer Door ändert sich die Anzeige bewusst nicht. Dafür gibt es keinen Node-Test (TaskChampion-Replik nicht gefälscht).
- [ ] Tent-Push in der installierten `vos-tent.web.app` am Handy einschalten und echten Empfang prüfen. UI und Cloud Function sind live; Firestore-Registrierung und Geräte-Zustellung sind offen.
- [ ] Klick-Navigation im Browser prüfen (Tabs, Modi, Datum-Pfeile, `pick` in der Monatsansicht), dazu Offline-Reload und Habit-Doppelklick; bisher nur Headless-Laden der Hash-URLs getestet.
- [ ] Weitere Vereinfachung in v2 (vorgeschlagen, nicht begonnen): Door-Datenquellen (`lib/door/`, REST-Zweig vermutlich tot, erst verifizieren) und `JournalV2View.jsx` (463 Zeilen, mehrere Aufgaben in einer Komponente).
- [ ] Pause-Visualisierungen der Voice-Ansicht (`PauseViz.jsx`) im Browser ansehen und `pnpm test` laufen lassen (nach dem Merge nur der Build geprüft); ob die CI den Release vom 2026-10-25 deployt hat, ist nicht kontrolliert.
- [ ] Release dev → master → vitalos (`journal-release`) nur nach ausdrücklichem OK.
- [ ] Door v2 und Journal v2 vom 2026-10-26 im Browser ausprobieren: Rechtsklick-Menüs in Potential/Plan/Production/Profit, Notizfeld in Potential (Tippen und Speichern je Quelle, vorher nur bei Taskwarrior vorhanden), Header-Sprünge Door/Focus/Game, Jahr-Ansicht und ✎-Bearbeiten eines Tageseintrags gegen echte Daten.
- [ ] Door v2 Potential im Browser prüfen, ob Notizfeld, Quadrant-Buttons und War Stack nach dem Overlay-Fix (`a0b7bac`, live seit 2026-10-29) im aufgeklappten Eintrag sichtbar und bedienbar sind (ggf. zweiter Reload wegen Service Worker); der Fix beruht nur auf den CSS-Malregeln. Gleiches Muster beim Wisch-Hinweis in Plan/Production/Profit prüfen.
- [ ] vitalos-Shell mit dem Door-v2-Fix aktualisieren (`vos-release journal`): Standalone-Targets sind live, die Shell steht noch auf dem alten Stand; nur nach ausdrücklichem OK.

**Gemini-Review (potenzielle blinde Flecken, 2026-10-24):**
*   **`pnpm-lock.yaml` Tracking:** Die Dokumentation wurde aktualisiert, um zu sagen, dass `pnpm-lock.yaml` getrackt wird, aber es wurde nicht explizit geprüft oder gezeigt, dass die `.gitignore`-Datei entsprechend angepasst wurde.
*   **Bundle-Größen-Verifizierung:** Die Behauptung, dass das Bundle nach dem Entfernen von Abhängigkeiten „byte-identisch“ blieb, wird nicht durch einen Vergleich der Bundle-Größen vor und nach der Änderung verifiziert, sondern nur durch erfolgreiche Builds.
*   **`localToday()` Zeitzonen-Test:** Die Korrektur des `localToday()`-Verhaltens (UTC vs. Ortszeit) ist kritisch, aber es wird kein spezifischer Test erwähnt, der diese zeitzonensensible Logik validiert.

**Gemini-Review (potenzielle blinde Flecken, 2026-10-25):**
*   **Unadressierte Staging-Diskrepanz:** Das Fitness-Frontend auf Staging (:8100) wurde mit einem alten `dist/` deployt, was bedeutet, dass die neuesten Änderungen dort nicht sichtbar sind. Dies wurde zwar im Turn berichtet, aber nicht als offener Punkt oder Problem im Gesamtkontext hervorgehoben.
*   **Ignorierte Python-Deprecation-Warnungen:** Während des Fitness-Release-Prozesses gab es Warnungen zu veralteten Python-Versionen für Google API-Bibliotheken, die zukünftige Kompatibilitätsprobleme signalisieren. Diese wurden nicht als potenzielles Problem oder notwendige zukünftige Aktion im Bericht erwähnt.
*   **Ungeprü

**Gemini-Review (potenzielle blinde Flecken, 2026-10-26):**
*   **Interaktions- und UI-Flüsse ungetestet:** Die Rechtsklick-Menüs, Header-Navigation (Door, Focus, Game) und die Bearbeitungsfunktion für Journaleinträge wurden nicht manuell im Browser getestet.
*   **Backend-Persistenz ungetestet:** Das Notizfeld in Door v2 Potential und die Bearbeitungsfunktion für Journaleinträge wurden nicht gegen echte Firestore-/Backend-Daten getestet.
*   **Fehlerbehandlung ungetestet:** Die Fehlermeldung bei leerem Journaleintragstext während des Bearbeitens wurde implementiert, aber nicht explizit getestet.

**Gemini-Review (potenzielle blinde Flecken, 2026-10-29):**
*   **Unberücksichtigte Lernkurve bei Tool-Nutzung:** Die Zusammenfassung verschweigt, dass Claude zweimal vom System wegen unzulässiger `sleep`-Befehle blockiert wurde, bevor es korrekt auf `Monitor` umstellte – ein relevanter Aspekt der eigenen Problemlösungseffizienz.
*   **Ungeprüfte Annahme zur Cache-Invalidierung:** Die Empfehlung eines zweiten Reloads für den Service Worker ist eine Annahme, die nicht die Möglichkeit tieferer Cache-Probleme oder fehlgeschlagener Service-Worker-Updates berücksichtigt, die den Fix weiterhin blockieren könnten.
*   **Fehlende End-to-End-Verifikation für visuellen Fehler:** Obwohl das Problem ein

**Gemini-Review (potenzielle blinde Flecken, 2026-10-31):**
*   Die Session zeigt nicht die Implementierung oder detaillierte Verifikation der spezifischen Codeänderungen an `selectWeeklyDoor` durch Claude selbst; der anfängliche `git diff` ist gekürzt, und die Beschreibung der Änderung erfolgt primär über den Commit-Text.
*   Es wird nicht explizit überprüft, ob `npx vite build --mode firebase` ein funktional äquivalenter Ersatz für das fehlgeschlagene `pnpm run build:firebase` ist, insbesondere da der `pnpm`-Fehler einen "Install-Check" betraf, was auf tiefere Abhängigkeitsprobleme hindeuten könnte.
*   Obwohl Claude es selbst berichtet, bleibt die zentrale Funktionalität der `selectWeeklyDoor`-Änderung (Interaktion mit Taskwarrior-Daten und das resultierende UI-Verhalten) ungetestet im Browser und gegen echte Taskwarrior-Daten, was eine wesentliche "sollte funktionieren"-Behauptung unbestätigt lässt.
- [ ] Tent-Login-Helfer auf `vos-tent-dev` im Browser prüfen: ohne Konto Notizen im localStorage bearbeiten und Reload überstehen; optional Google-Login und danach Cloud-Abschluss prüfen. Build war in der Sandbox am schreibgeschützten pnpm-Store-Lock blockiert.
- [ ] Login-Helfer für Tent, Voice, Game und Door im Browser prüfen (Gastmodus, localStorage nach Reload, optionaler Google-Login und Cloud-Speichern). Änderungen liegen direkt auf `journal-dev/dev`; die Flavor-Hosting-Targets bleiben erhalten.
