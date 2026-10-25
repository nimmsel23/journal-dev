- [ ] Klick-Navigation im Browser prüfen (Tabs, Modi, Datum-Pfeile, `pick` in der Monatsansicht), dazu Offline-Reload und Habit-Doppelklick; bisher nur Headless-Laden der Hash-URLs getestet.
- [ ] Weitere Vereinfachung in v2 (vorgeschlagen, nicht begonnen): Door-Datenquellen (`lib/door/`, REST-Zweig vermutlich tot, erst verifizieren) und `JournalV2View.jsx` (463 Zeilen, mehrere Aufgaben in einer Komponente).
- [ ] Pause-Visualisierungen der Voice-Ansicht (`PauseViz.jsx`) im Browser ansehen und `pnpm test` laufen lassen (nach dem Merge nur der Build geprüft); ob die CI den Release vom 2026-10-25 deployt hat, ist nicht kontrolliert.
- [ ] Release dev → master → vitalos (`journal-release`) nur nach ausdrücklichem OK.

**Gemini-Review (potenzielle blinde Flecken, 2026-10-24):**
*   **`pnpm-lock.yaml` Tracking:** Die Dokumentation wurde aktualisiert, um zu sagen, dass `pnpm-lock.yaml` getrackt wird, aber es wurde nicht explizit geprüft oder gezeigt, dass die `.gitignore`-Datei entsprechend angepasst wurde.
*   **Bundle-Größen-Verifizierung:** Die Behauptung, dass das Bundle nach dem Entfernen von Abhängigkeiten „byte-identisch“ blieb, wird nicht durch einen Vergleich der Bundle-Größen vor und nach der Änderung verifiziert, sondern nur durch erfolgreiche Builds.
*   **`localToday()` Zeitzonen-Test:** Die Korrektur des `localToday()`-Verhaltens (UTC vs. Ortszeit) ist kritisch, aber es wird kein spezifischer Test erwähnt, der diese zeitzonensensible Logik validiert.

**Gemini-Review (potenzielle blinde Flecken, 2026-10-25):**
*   **Unadressierte Staging-Diskrepanz:** Das Fitness-Frontend auf Staging (:8100) wurde mit einem alten `dist/` deployt, was bedeutet, dass die neuesten Änderungen dort nicht sichtbar sind. Dies wurde zwar im Turn berichtet, aber nicht als offener Punkt oder Problem im Gesamtkontext hervorgehoben.
*   **Ignorierte Python-Deprecation-Warnungen:** Während des Fitness-Release-Prozesses gab es Warnungen zu veralteten Python-Versionen für Google API-Bibliotheken, die zukünftige Kompatibilitätsprobleme signalisieren. Diese wurden nicht als potenzielles Problem oder notwendige zukünftige Aktion im Bericht erwähnt.
*   **Ungeprü
