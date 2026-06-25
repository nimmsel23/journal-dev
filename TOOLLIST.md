# AOS Dev-Hub Toollist & Architecture

Zusammenfassung der strategischen Tools und Architektur-Entscheidungen für das **AlphaOS Ecosystem** (`fuel-dev`, `relax-dev`, `fitness-dev`, `vital-dev`).

## 1. Frontend Power-Tools (NPM)
*   **[framer-motion](https://www.framer.com/motion/):** Für flüssige Tab-Übergänge und lebendige UI-Interaktionen (Glow-Animationen).
*   **[Radix UI](https://www.radix-ui.com/):** Headless Components für Modals, Popover und Tooltips (voller Tailwind-Support).
*   **[React Markdown](https://github.com/remarkjs/react-markdown):** Echte Markdown-Visualisierung im Journal-Tab.
*   **[Lucide React](https://lucide.dev/):** Aktueller Standard für Icons (bereits im Einsatz).

## 2. Backend & Frontend Logic (NPM)
*   **[TanStack Query v5](https://tanstack.com/query/latest):** Zentrales State-Management für Server-Daten (bereits im Einsatz).
*   **[Zustand](https://zustand-demo.pmnd.rs/):** Leichtgewichtiger Client-State (bereits im Einsatz für Settings & Tab-State).
*   **[Drizzle ORM](https://orm.drizzle.team/):** Typescript-ORM für lokale SQLite-Datenbanken (schneller & sicherer als Roh-SQL).
*   **[Zod](https://zod.dev/):** Schema-Validierung für API-Responses und Formulare (bereits im Einsatz).

## 3. Python Knowledge Base & CLI (Python)
*   **[Pydantic V2](https://docs.pydantic.dev/latest/):** Rigorose Datenvalidierung für Knowledge-Objekte und Firestore-Sync.
*   **[FastAPI](https://fastapi.tiangolo.com/):** High-Performance Backend für die Python-Knowledge-Bases.
*   **[SQLModel](https://sqlmodel.tiangolo.com/):** Die perfekte Brücke zwischen Pydantic und SQLAlchemy.
*   **[HTTPX](https://www.python-httpx.org/):** Async HTTP-Client für schnellere Gemini-API Calls und Syncs.
*   **[Sqlite-utils](https://sqlite-utils.datasette.io/):** Schweizer Taschenmesser für die Manipulation der `.db` Dateien.
*   **[DuckDB](https://duckdb.org/):** In-Process Analytical Database für komplexe Langzeit-Auswertungen über alle JSON-Logs hinweg.
*   **[Typer](https://typer.tiangolo.com/):** Basis für die `fuel` CLI (bereits im Einsatz).

## 4. Strategic Architecture (The "Dev-Hub")
Umstellung auf ein **Monorepo** mittels **NPM Workspaces**:

*   **`packages/shared-ui`**: Gemeinsame Tailwind-Komponenten.
*   **`packages/shared-lib`**: Die vereinte API-Bridge (`fetchJson`), Firestore-Logic und Shared-Utils.
*   **`packages/[domain]-studio`**: Die individuellen PWAs (Fuel, Relax, Fitness).
*   **`services/knowledge-base`**: Zentrales Python-Service-Verzeichnis.

## 5. Workflow & DX (Developer Experience)
*   **[Turborepo](https://turbo.build/repo):** Orchestrierung der Workspaces, Caching von Builds und paralleles Ausführen von Dev-Servern.
*   **[Vite](https://vitejs.dev/):** Blitzschneller Build-Toolchain (bereits im Einsatz).
*   **[Firebase Hosting/Firestore](https://firebase.google.com/):** Cloud-Native Infrastruktur für den PWA-Betrieb (V3).

---
*Erstellt am 07. Juni 2026 für den AOS-Entwicklungsprozess.*
