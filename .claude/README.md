# Fuel-Dev Claude Configuration

Project-specific Claude Code configuration aligned with **VITALTRAINER_AGENTS** ecosystem structure.

---

## Architecture Overview

```
VITALTRAINER ECOSYSTEM (Nutrition Domain)
└─ Main Agents (User-Callable)
   ├─ nutrition-agent (/nutrition-agent) ← Allgemeiner Koordinator
   └─ nutrition-protocol-agent (/nutrition-protocol-agent) ← Protokoll-Generator
      │
      └─ Tempel (Backend Service)
         └─ fuel-dev :9000
            ├─ V1 Frontend (Vanilla HTML PWA)
            ├─ V2 Frontend (React + Vite + TailwindCSS)
            └─ API: /nutrition/*, /supplements/*, /fuel/*
               │
               └─ Dev Agent (Development)
                  └─ fuel-dev-coding-agent (reads tickets, implements features)
```

---

## Main Agents (User-Callable)

### `/nutrition-agent`

**Type:** Main Agent (General Coordinator)
**Role:** Ernährungs-Koordinator für Vitaltrainer-Ausbildung
**Tempel:** fuel-dev (:9000)

**Responsibilities:**
- Pflichtaufgaben Management (7-Tage Ernährungstrainer, 14-Tage Fitnesstrainer)
- Daily Nutrition Logging (wger-food hybrid search, fuel-log quick CLI)
- Data Integration (wger-Docker :8000, Open Food Facts)
- Reporting & Analysis (weekly summaries, macro calculations, trends)
- PDF Export für Assignment-Submission

**Trigger:** "nutrition", "Ernährung", "Protokoll", "tracking", "Makros", "7-Tage", "14-Tage", etc.

**Agent Definition:** `~/.claude/agents/nutrition-agent.md`

**Tickets:** Writes to `~/.claude/agents/TICKETS/fuel-dev-tickets.md` (FD-xxx)

---

### `/nutrition-protocol-agent`

**Type:** Main Agent (Specialized)
**Role:** Protokoll-Generator
**Tempel:** fuel-dev (:9000)

**Responsibilities:**
- Generate 7-day protocols (Ernährungstrainer B-Lizenz assignment)
- Generate 14-day protocols (Fitnesstrainer assignment)
- Auto-calculate macros from wger-API
- Verify output format (Vormittag/Nachmittag/Abend structure)
- Preview generation before saving

**Trigger:** "Generate protocol", "nutrition protocol", "Ernährungstrainer", "Fitnesstrainer", "Protokoll generieren"

**Agent Definition:** `~/.claude/agents/nutrition-protocol-agent.md`

**Tickets:** Writes to `~/.claude/agents/TICKETS/fuel-dev-tickets.md` (FD-xxx)

---

## Tempel (Backend Service)

### fuel-dev (:9000)

**Type:** Node.js + file-based JSON storage
**Purpose:** Nutrition Tracking Backend Service
**Data Storage:** `~/.aos/fuel/` (file-based JSON)

**Frontends:**
- **V1:** Fuel Classic (`public/index.html`) — Vanilla HTML PWA, stable fallback
- **V2:** Fuel Studio (`src/main.jsx`) — React 18 + Vite + TailwindCSS, modern features

**Key Endpoints:**
- `GET /health` — server status
- `GET/POST /nutrition/log` — daily meals
- `GET /nutrition/search` — Open Food Facts proxy
- `GET/POST /nutrition/catalog` — saved dishes
- `GET/POST /nutrition/journal` — free-form entries
- `GET/POST /supplements/log` — intakes
- `GET /supplements/stats` — trends & streaks

**Build:**
```bash
npm run dev      # Development (nodemon + Vite)
npm run build    # Build to /opt/fuel
npm run prod     # Prod static server (:7000)
```

---

## Dev Agent

### fuel-dev-coding-agent

**Type:** Development Agent
**Reads Tickets From:** nutrition-agent, nutrition-protocol-agent
**Responsibility:** Implementiert Features basierend auf Tickets
**Ticket Storage:** `~/.claude/agents/TICKETS/fuel-dev-tickets.md`
**Ticket Prefix:** `FD-xxx`

**Workflow:**
1. Main Agents (nutrition-agent, nutrition-protocol-agent) write tickets to FD-tickets.md
2. fuel-dev-coding-agent reads tickets, clarifies if needed
3. Implements features (code, tests, documentation)
4. Updates ticket status (in progress → done)
5. Merges to production (:9000)

---

## Tools

### nutrition-protocol-generator
- **Path:** `~/Nutrition/bin/nutrition-protocol-generator`
- **Purpose:** Generate 7/14-day protocols for assignments
- **Usage:** `nutrition-protocol-generator --days 7|14 [--output FILE] [--preview]`
- **Prerequisites:** wger-Docker :8000

### wger-food
- **Path:** `~/Nutrition/bin/wger-food`
- **Purpose:** Log meals (Open Food Facts + wger-API hybrid)
- **Usage:** `wger-food <food-item>` (interactive picker)
- **Prerequisites:** wger-Docker :8000, fzf, curl

### fuel-log
- **Path:** `~/fuel-dev/fuel-log.zsh`
- **Purpose:** Quick CLI logging to fuel-dev API
- **Usage:** `fuel-log` (interactive prompts)
- **Prerequisites:** fuel-dev running (:9000)

### fuel
- **Path:** `~/fuel-dev/fuel` (Python/Typer)
- **Purpose:** Supplement logging CLI
- **Usage:** `fuel log <supplement> [--dose N] [--time TIME]`
- **Prerequisites:** Python, fuel-dev :9000, wger-Docker :8000

---

## Integrations

### wger-Docker
- **Purpose:** Local nutrition database (7000+ foods)
- **Location:** `http://localhost:8000`
- **API:** `/api/v2/`
- **Status:** Requires `docker compose up`

### Open Food Facts
- **Purpose:** Fallback nutrition search (no API key)
- **Integration:** wger-food hybrid mode + server proxy

### Bridge (AlphaOS API Gateway)
- **Proxies:** `/api/fuel/* → :9000`
- **Location:** `http://localhost:9080`

### vital-hub (Future)
- **Purpose:** Client integration (multi-user nutrition tracking)
- **Status:** Route normalization ready, auth layer TBD

---

## Ticketing Workflow

**Main Agents Role:**
- Write tickets when features/gaps discovered during Ausbildung
- Specific: "workout logging" > "more features"
- Give context: Why? What use case?
- Flag dependencies between tickets

**Dev Agent Role:**
- Read tickets thoroughly
- Clarify if context unclear
- Implement code, tests, documentation
- Small PRs, not mega-changes
- Update ticket status (in progress → done)

**Ticket Format:**
```markdown
# Ticket für [dev-agent-name]

## Title
[Kurze Beschreibung]

## Context
[Warum? Welcher Kontext?]

## Requirement
[Was genau soll entwickelt werden?]

## Acceptance Criteria
- [ ] Feature funktioniert
- [ ] Tests/Docs aktualisiert

## Priority
[Critical | High | Medium | Low]

## Dependencies
[Andere Tickets?]
```

See: `~/.claude/agents/TICKETS/fuel-dev-tickets.md`

---

## For Future Development

To add more agents/skills:

1. **Create Agent MD** in `~/.claude/agents/`
   - Define: Purpose, Trigger Words, System Prompt, Test Prompts
   - Follow VITALTRAINER_AGENTS ecosystem pattern

2. **Register in settings.json** under `mainAgents[]` or `devAgents[]`
   - Include: type, tempel, role, responsibilities, ticketing

3. **Update this README** with new agent documentation

---

## References

- **VITALTRAINER_AGENTS.md** — Ecosystem overview & architecture
- **nutrition-agent.md** — Full nutrition-agent system prompt
- **nutrition-protocol-agent.md** — Full protocol-agent system prompt
- **CLAUDE.md** — fuel-dev project documentation

---

**Last Updated:** 2026-05-17
**Ecosystem:** VITALTRAINER Diplom (Nutrition Domain)
