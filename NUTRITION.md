# Nutrition Stack — fuel-dev

Ernährungs-Tracking auf zwei Ebenen: CLI für schnelle Eingabe, Web-UI für Journal + Makro-Übersicht + Mikro-Heatmap.

---

## Datenquellen

| Quelle | Für |
|--------|-----|
| **Open Food Facts** | Lebensmittelsuche im UI (`/nutrition/search`) |
| **wger API** | Ingredient-Lookup beim Compose, Cache in SQLite |
| **Gemini** | Makro-Schätzung bei fehlenden Daten, Mikronährstoff-Schätzung pro Mahlzeit |
| **Meal Catalog** | Repo-versionierte Gerichte (`catalogs/nutrition/meals/`) |

---

## API-Endpunkte

| Methode | Pfad | Funktion |
|---------|------|----------|
| GET | `/nutrition/search?q=&limit=` | Open Food Facts proxy |
| GET | `/nutrition/log?date=YYYY-MM-DD` | Tages-Log laden |
| POST | `/nutrition/log` | Mahlzeit loggen |
| GET | `/nutrition/catalog` | Alle Gerichte (aus `catalogs/nutrition/meals/`) |
| POST | `/nutrition/catalog` | Gericht speichern |
| GET | `/nutrition/daily/:date` | Tages-Makros + Mikros aggregiert |
| GET | `/nutrition/weekly/:year/:week` | Wochen-Mikros vs. DACH |
| POST | `/nutrition/compose` | Gericht via wger + Gemini komponieren |
| POST | `/nutrition/estimate` | Gemini Makro-Schätzung (kein Save) |
| GET | `/nutrition/journal?date=` | Journal-Eintrag |
| POST | `/nutrition/journal` | Journal schreiben |

---

## Datenpfade

| Was | Wo |
|-----|----|
| Tages-Logs | `~/.aos/fuel/nutrition/YYYY-MM-DD.json` |
| SQLite (wger + Mikros) | `~/.aos/fuel/nutrition/nutrition.db` |
| Journal | `~/.aos/fuel/nutrition_journal/YYYY-MM-DD.md` |
| Meal-Katalog | `fuel-dev/catalogs/nutrition/meals/{id}.json` |
| Supplement-Logs | `~/.aos/fuel/supplements/logs/YYYY-MM-DD.json` |
| Supplement-Katalog | `fuel-dev/catalogs/supplements/catalog.json` |
| CLI-Logs (Markdown) | `~/Nutrition/logs/YYYY-MM-DD.md` |

---

## Mikronährstoffe (DACH)

Referenz: **DGE/ÖGE DACH-Werte** (`src/config/dach.mjs`) — nicht US-RDA.

Mikros werden **nicht täglich eingetragen**. Stattdessen:
- Gemini schätzt beim Compose das Mikronährstoffprofil der Mahlzeit als gegessen
- Absolute Werte (keine per-100g) → `meal_micros`-Tabelle in SQLite
- Wochenheatmap im V2 „Mikros"-Tab: letzte 8 Kalenderwochen vs. DACH

Getrackte Mikronährstoffe: B12 · Calcium · Eisen · Vit. D · Vit. E · Folat · Mg · Zink · Natrium · Kalium

---

## CLI-Backend

### `wger-food`

```bash
wger-food haferflocken     # Suche → fzf → Portion → Markdown-Zeile
```

Flow: OFF-API → fzf-Auswahl → S/M/L/XL (100/200/300/450g) → `~/Nutrition/logs/YYYY-MM-DD.md`

Log-Format (Ausbildungs-Vorlage):
```
| Mahlzeit | Uhrzeit | Lebensmittel | Menge | Einheit | Kcal | KH | Fett | Eiweiß | Quelle |
```

### `wger-generate`

```bash
wger-generate               # 14-Tage-Protokoll ~2800 kcal/Tag
wger-generate --days 7      # Ernährungstrainer-Modul
wger-generate --start 2026-05-01
wger-generate --preview
```

Deterministisch per Datum-Seed. Zielwerte: 188 cm / 82,5 kg / sportlich aktiv.

### `fuel` CLI (Python/Typer)

```bash
fuel log melatonin --yesterday
fuel log melatonin 2 --time morning
fuel today
fuel list
fuel week
```

Supplement-Catalog: `catalogs/supplements/catalog.json`

---

## Ausbildungs-Kontext

Entstanden für **Vitaltrainer-Ausbildung FlexyFit Academy Wien**:
- **Fitnesstrainer-Modul**: 14-tägiges Ernährungsprotokoll (Zusatzaufgabe)
- **Ernährungstrainer-Modul**: 7-tägiges Ernährungsprotokoll (Pflichtaufgabe)

Format entspricht exakt der Ausbildungsvorlage.
