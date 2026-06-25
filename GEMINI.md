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

### Deployment
1. **Build:** `npm run build`
2. **Deploy:** `firebase deploy` (Uses Firebase Hosting and Firestore)

### Synchronization
- **Push Local to Cloud:** `npm run sync:push`
- **Pull Cloud to Local:** `npm run sync:pull`

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
