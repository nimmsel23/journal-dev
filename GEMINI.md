# Fuel Centre

Fuel Centre is a multifunctional nutrition and supplement tracking project designed for personal use and nutrition training. It features a dual-stack frontend, a local Node.js server, and a powerful CLI-based backend.

## Project Architecture

- **Frontend:**
  - `v1 / Fuel Classic`: Vanilla HTML/JS (`public/index.html`) as a stable fallback.
  - `v2 / Fuel Studio`: Modern Vite-based React/Tailwind application (`index.html` + `src/`).
- **Backend:** Node.js server (`server.mjs`) for local data management.
- **Data:**
  - Local mode: JSON files under `data/`.
  - Cloud mode (Firebase): Firestore for synchronized storage.
- **CLI Utilities:** Python/Typer CLI (`fuel`) for rapid logging and management.

## Building and Running

### Development
1. **Install:** `npm install`
2. **Start Server:** `npm run dev` (Runs on `http://127.0.0.1:9000`)

### Deployment & Git Workflow
1. **Home-Repo (dev branch):** Entwickle Features in `~/journal-dev` (Branch `dev`).
2. **Preview:** Teste Änderungen in der Cloud mit `npm run deploy:preview` (erstellt einen 24h-gültigen Firebase Channel Link).
3. **Merge zu Master:** Wenn die Preview stabil ist, wird der `dev` Branch in `master` überführt.
4. **Live Deploy:** `npm run deploy:cloud` pusht den Master live. (Die Produktions-Shell Apps liegen typischerweise unter `~/vitalos/...`).

### Synchronization
- **Push Local to Cloud:** `npm run sync:push`
- **Pull Cloud to Local:** `npm run sync:pull`

## Repo & Path Conventions (CRITICAL)

### Zwei-Welt-Modell: `-dev` Home vs. `vitalos/` Produktion

Das Projekt existiert in zwei Welten:

| Welt | Pfad | Branch | Zweck |
|------|------|--------|-------|
| Dev Playground | `~/journal-dev` | `dev` | Lokale Entwicklung, **nicht deploybar** |
| Produktion | `~/vitalos/journal-app` | `master` | Firebase Hosting, deploybar |

Analog für alle Submodule: `~/fitness-dev` ↔ `~/vitalos/fitness-app`, `~/fuel-dev` ↔ `~/vitalos/fuel-app`, `~/relax-dev` ↔ `~/vitalos/relax-app`, etc.

### `-app`-Pfade überall – keine Ausnahme

**Alle Sibling-Repo-Referenzen** (in `vite.config.cjs`, `src/db/index.js` etc.) verwenden **immer** `-app`-Namen:

```js
// ✅ KORREKT – überall, auch in journal-dev
const FITNESS = path.resolve(__dirname, "../fitness-app");
const FUEL    = path.resolve(__dirname, "../fuel-app");
const RELAX   = path.resolve(__dirname, "../relax-app");

// ❌ FALSCH – niemals committen
const FITNESS = path.resolve(__dirname, "../fitness-dev");
```

**Warum:** Die `-dev` Home-Repos haben keine `-app`-Sibling-Repos → Build bricht absichtlich → klares Signal: nicht deploybar.  
**Niemals** `-dev`-Pfade committen, auch nicht in `~/journal-dev`.

### Merge-Workflow (Agent-Regel)

Beim Merge `dev → master` in `~/vitalos/journal-app`:
- Prüfen, dass **keine `-dev`-Pfade** in den Diff-Dateien landen.
- Falls doch: Merge abbrechen, Pfade korrigieren, dann erneut mergen.

## Development Conventions

- **Frontend:** Maintain separation between `v1` (legacy) and `v2` (React/Tailwind). New UI components should go into `src/components/`.
- **Backend:** Maintain API endpoint compatibility in `server.mjs` for both local and Firestore data access.
- **CLI:** Add new CLI commands to the `fuel` dispatcher in line with existing patterns (Typer, loguru).
- **Documentation:** Keep `ARCHITECTURE.md` and `NUTRITION.md` updated with structural changes.

## Key Files

- `README.md`: High-level project documentation and usage guide.
- `server.mjs`: Main local API server.
- `src/`: Source code for the `v2` PWA frontend.
- `fuel`: Python CLI tool for log management.
- `data/`: Local storage for nutrition logs, catalogs, and journal entries.

## Useful Resources
- Refer to `ARCHITECTURE.md` for technical design details.
- Refer to `NUTRITION.md` for CLI backend and training-related context.
- Refer to `OFFEN.md` for current technical debt and open bugs.
