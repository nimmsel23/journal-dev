# C-003 — 4-Deposit-Lückenliste (Observe/Free, ohne KI)

Org-Task `c46b3028` · CEO-DISPATCH #002 · AL journal-dev 2026-11-09.

## Frage

Deckt **ein** Freitext-Eintrag Body / Business / Balance / Being **sichtbar** ab
(Zuordnung / Korrektur / Tagesrückblick), **ohne KI** (Observe/Free)?

## Kurzantwort

**Nein.** Ohne Smart-Log-Analyse erscheint keine 4-Deposit-Darstellung.
Freitext speichert nur `text` + `tags`. Die vier Bereiche leben unter
`smartLog.applied.daily_deposits` und sind an den KI-Pfad gekoppelt.

## Belege (Ist-Stand)

| Aspekt | Beleg |
| --- | --- |
| Deposit-Felder Body/Business/Balance/Being | `src/views/v2/JournalV2View.jsx` `DAILY_DEPOSITS` (Z. 32–37) |
| Persistenz nur unter Smart-Log-Metadatum | `src/lib/db/journal.js` `updateJournalDailyDeposits` → `smartLog.applied.daily_deposits` (`b33f924`) |
| Anzeige am Eintrag nur wenn `smartLog.applied.daily_deposits` existiert | `JournalV2View.jsx` Z. 593–623 (`dailyDeposits && …`) |
| Deposit-Editor in Vorschau nur bei `smart && analysis` | `JournalV2View.jsx` Z. 637–648 |
| Normales Log ohne KI | `saveJournal(date, text, { tags })` im Nicht-Smart-Submit (`JournalV2View.jsx` ~400–405) |
| „Ohne KI im Journal speichern“ | gleicher Plain-Save, kein Deposit-Schreiben (Z. ~723) |
| Quick-Tags ≠ 4 Deposits | `SKILL_TAGS` = Fitness/Fuel/Relax (Z. 81) |
| Wochen-Bereichsspur nur Smart-Deposits | `src/views/v2/JournalV2Range.jsx` Z. 55–56 |
| Einführung Deposits | Commit `b33f924` · RESULTS 2026-11-07 „Smart Journal speichert Tages-Deposits“ |
| Bereichsspur | Commit zur Wochenansicht · RESULTS 2026-11-07 „Wochenrückblick zeigt Bereichsspur“ |

Nach Smart-Übernahme sind Deposits **ohne neue KI** editierbar
(`updateJournalDailyDeposits`) — das setzt aber einen vorherigen Smart-Apply voraus.

## Lücken S (Small) — max. 5

1. **S1 Anzeige-Gate:** Plain-Einträge blenden Body/Business/Balance/Being nie ein (`dailyDeposits &&`).
2. **S2 Composer-Pfad:** „Log“ schreibt keine Deposit-Felder.
3. **S3 Fallback-Pfad:** „Ohne KI im Journal speichern“ ebenfalls ohne Deposits.
4. **S4 Quick-Tags:** Skill-Tags Fitness/Fuel/Relax ≠ Deposit-Domains.
5. **S5 Leere Deposits unsichtbar in Liste:** Nur nicht-leere Keys werden als Karten gerendert; leere Domains fehlen in der Zusammenfassung.

## Lücken M (Medium) — max. 5

1. **M1 Kein manueller Einstieg:** UI bietet „Deposits anlegen“ nicht ohne vorheriges `smartLog.applied.daily_deposits`.
2. **M2 API vs. UI:** `updateJournalDailyDeposits` kann schreiben, Einstieg ist nur Korrektur nach Smart-Apply.
3. **M3 Zuordnung fehlt:** Freitext hat keine Domain-Zuordnung (Checkbox/Felder) im Observe-Composer.
4. **M4 Wochenrückblick stumm:** Bereichsspur bleibt leer, solange nur Plain-Logs existieren (`JournalV2Range.jsx`).
5. **M5 Eintrags- vs. Tagesmodell:** Deposits hängen am Smart-Log-Eintrag, nicht an einem unabhängigen Tagesobjekt — mehrere Plain-Logs ergeben keine Bereichssicht.

## Lücken L (Large) — max. 5

1. **L1 Observe-Produktlücke:** Free/Observe kann Freitext loggen, aber die 4-Deposit-Sichtbarkeit ist Operate-/KI-Pfad.
2. **L2 Schema-Kopplung:** Deposits unter `smartLog.applied.*` erschweren einen KI-freien Observe-First-Pfad ohne Modell-/UI-Schnitt.
3. **L3 Zwei Viererkreise:** Daily-Four/Tracker (fitness/fuel/relax/memoirs, `docs/FOKUS-DAILY-FOUR-TRACKER-HABITS.md`) vs. Game-Deposits (body/business/balance/being) — ohne Doku/UI leicht verwechselt.
4. **L4 Suche/Filter:** Kein Filter „Einträge mit Body-Deposit“ / Domain-Suche.
5. **L5 Korrektur ohne Vorgeschichte:** Wer nie Smart-Log genutzt hat, kann Deposits weder korrigieren noch nachtragen (UI).

## Nicht gebaut

Nur diese Liste. Kein UI-/Schema-Change, kein Deploy.

## Empfohlene nächste Produktfrage (PM/CEO, nicht AL)

Soll Observe eine **manuelle** 4-Deposit-Erfassung am Freitext bekommen
(Composer oder Eintragsaktion), entkoppelt vom Smart-Log-Metadatum — oder bleiben
Deposits bewusst Operate/Smart-only?
