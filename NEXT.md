- [ ] Klick-Navigation im Browser prüfen (Tabs, Modi, Datum-Pfeile, `pick` in der Monatsansicht), dazu Offline-Reload und Habit-Doppelklick; bisher nur Headless-Laden der Hash-URLs getestet.
- [ ] Weitere Vereinfachung in v2 (vorgeschlagen, nicht begonnen): Door-Datenquellen (`lib/door/`, REST-Zweig vermutlich tot, erst verifizieren) und `JournalV2View.jsx` (463 Zeilen, mehrere Aufgaben in einer Komponente).
- [ ] Pause-Visualisierungen der Voice-Ansicht (`PauseViz.jsx`) im Browser ansehen und `pnpm test` laufen lassen (nach dem Merge nur der Build geprüft); ob die CI den Release vom 2026-10-25 deployt hat, ist nicht kontrolliert.
- [ ] Release dev → master → vitalos (`journal-release`) nur nach ausdrücklichem OK.
- [ ] Door v2 und Journal v2 vom 2026-10-26 im Browser ausprobieren: Rechtsklick-Menüs in Potential/Plan/Production/Profit, Notizfeld in Potential (Tippen und Speichern je Quelle, vorher nur bei Taskwarrior vorhanden), Header-Sprünge Door/Focus/Game, Jahr-Ansicht und ✎-Bearbeiten eines Tageseintrags gegen echte Daten.

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
