# HOT.md — Open Source Quellen & Tools

## Nährstoff-Datenbanken

| DB | URL | Was | Zugang |
|----|-----|-----|--------|
| **USDA FoodData Central** | fdc.nal.usda.gov | Nährstoffe in Lebensmitteln + angereicherte Foods | REST API, kostenlos |
| **Open Food Facts** | openfoodfacts.org | Produkte + Nährstoffe → Glukosekurven, Makros | REST API + CSV/MongoDB-Download |
| **FooDB** | foodb.ca | Lebensmittel-Inhaltsstoffe auf Molekülebene (Polyphenole, Fettsäuren) | Download + API |
| **Phenol-Explorer** | phenol-explorer.eu | Polyphenol-Gehalt + Bioverfügbarkeit | CSV Download |
| **EFSA NDA** | efsa.europa.eu | EU Nährstoff-Referenzwerte + Sicherheitsbewertungen | Download, kostenlos |

## Supplement-Datenbanken (Schnittmenge mit relax-dev)

Adaptogene, Mikronährstoffe, Nootropika — wirken auf Physiologie (relax) UND kommen aus Ernährung/Nahrungsergänzung (fuel).

| DB | Was | Zugang |
|----|-----|--------|
| **DSLD** (NIH Dietary Supplement Label Database) | 100k+ Produkte mit Inhaltsstoffen + Dosierungen | REST API + Bulk Download, kostenlos |
| **ODS NIH** (Office of Dietary Supplements) | Fact Sheets pro Nährstoff (Mg, Zn, B12, D3) mit Referenzwerten | HTML/JSON, frei |
| **COCONUT** | Größte Open-Source-Sammlung natürlicher Verbindungen (500k+) | REST API + Download |
| **LOTUS** | Naturstoffe + Organismen (Ashwagandha, Rhodiola, L-Theanin...) | SPARQL + Download |
| **TCMSP** | TCM-Pflanzen → Moleküle → biologische Targets | Web + Download |

**Relevanz für fuel-dev:**
- Mikronährstoffe (Mg, Zn, B6, D3) → Cofaktoren für Makro-Stoffwechsel
- DSLD: Supplement-Label-Daten ergänzen Mahlzeit-Tracking
- Open Food Facts: Basis für Makro-Parsing + Gemini-Enrichment

## Moleküle / Biochemie

| DB | Was | Zugang |
|----|-----|--------|
| **PubChem** (NIH) | 100M+ Compounds, SMILES, Halbwertszeiten, Bioaktivität | REST API, kostenlos |
| **HMDB** | Endogene Metaboliten, Hormone, Nährstoff-Metabolismus | XML-Dump + REST |
| **ChEMBL** | Drug-like molecules + biologische Aktivität | REST API + SQLite-Download |

## Node Module

### Daten-Fetch / Parsing

| Paket | Warum |
|-------|-------|
| nativer `fetch` (Node 18+) | reicht für USDA/DSLD/PubChem REST |
| `@google/generative-ai` | Gemini API für Makro-Parsing (bereits integriert) |
| `yaml` | YAML-Configs lesen/schreiben |

### Daten-Verarbeitung

| Paket | Warum |
|-------|-------|
| `better-sqlite3` | Lokale Nährstoff-DB cachen (USDA/Open Food Facts) |
| `node-cache` | In-Memory TTL-Cache für API-Responses |

### Visualisierung (wenn fuel-dev Charts bekommt)

| Paket | Warum |
|-------|-------|
| `recharts` | Makro-Verteilung, Kalorien-Verlauf |
| `@nivo/line` | Glukosekurven (Schnittmenge mit relax-dev Physio) |

---

## Priorität

1. Open Food Facts REST — Produkt-Lookup für Makro-Parsing-Fallback
2. DSLD REST API — Supplement-Inhaltsstoffe ergänzen Mahlzeit-Tracking
3. USDA FoodData Central — Referenz-Nährstoffwerte für Gemini-Kontext
4. `better-sqlite3` — Lokaler Cache um API-Calls zu minimieren
