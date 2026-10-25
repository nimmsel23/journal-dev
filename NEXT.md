- [ ] `dev` ist 2 Commits vor `origin/dev` (`948a40c`, `bb0c9a0`, Docs-Aufräumen): pushen, sobald gewünscht.
- [ ] Klick-Navigation im Browser prüfen (Tabs, Modi, Datum-Pfeile, `pick` in der Monatsansicht), dazu Offline-Reload und Habit-Doppelklick; bisher nur Headless-Laden der Hash-URLs getestet.
- [ ] `pnpm-workspace.yaml`: toten `better-sqlite3: true`-Eintrag in `allowBuilds` entfernen.
- [ ] Weitere Vereinfachung in v2 (vorgeschlagen, nicht begonnen): Door-Datenquellen (`lib/door/`, REST-Zweig vermutlich tot, erst verifizieren) und `JournalV2View.jsx` (463 Zeilen, mehrere Aufgaben in einer Komponente).
- [ ] Release dev → master → vitalos (`journal-release`) nur nach ausdrücklichem OK.

**Gemini-Review (potenzielle blinde Flecken, 2026-10-24):**
*   **`pnpm-lock.yaml` Tracking:** Die Dokumentation wurde aktualisiert, um zu sagen, dass `pnpm-lock.yaml` getrackt wird, aber es wurde nicht explizit geprüft oder gezeigt, dass die `.gitignore`-Datei entsprechend angepasst wurde.
*   **Bundle-Größen-Verifizierung:** Die Behauptung, dass das Bundle nach dem Entfernen von Abhängigkeiten „byte-identisch“ blieb, wird nicht durch einen Vergleich der Bundle-Größen vor und nach der Änderung verifiziert, sondern nur durch erfolgreiche Builds.
*   **`localToday()` Zeitzonen-Test:** Die Korrektur des `localToday()`-Verhaltens (UTC vs. Ortszeit) ist kritisch, aber es wird kein spezifischer Test erwähnt, der diese zeitzonensensible Logik validiert.
