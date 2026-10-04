# LearnAPI — System Architecture & Design Specification

LearnAPI is an interactive, browser-based tutorial and simulation laboratory for modern backend API development using **FastAPI (Python)**, **plumber (R)**, and **OpenAPI 3.0**.

---

## 1. Architectural Principles

1. **Deterministic Client-Side Simulation**:
   No backend server, Docker container, or WebAssembly sandbox is required. The engine implements a lightweight static code parser, tokenizer, micro-evaluator, and mock HTTP request router directly in vanilla ES modules.

2. **Clean Separation of Concerns**:
   - `engine.js`: Pure AST-like parsing, parameter coercion, route matching, and mock request execution.
   - `game.js`: Pure game domain rules, goal evaluation, and next-action recommendation. Completely detached from DOM manipulation.
   - `app.js`: View controller, UI layout orchestration, event routing, and modal lifecycles.
   - `terminal.js` & `dialog.js`: Presentational UI components.

3. **High Pedagogical Rigor (Depth >= 8.5/10)**:
   Every lesson teaches production-grade concepts: idempotency, REST semantics, validation errors (422), dependency injection, API key security, and schema documentation. Each level provides three core theoretical concepts and three field-tested production notes.

4. **Bi-directional Internationalization**:
   Full support for both English (LTR) and Persian (RTL). All instructional copy, modals, goals, field notes, and hints are localized, while commands and code tokens remain standard English.

---

## 2. Visual System & Design Tokens

### Color Palette

| Token | Hex | Role |
|-------|-----|------|
| `--ink` | `#0A0F1A` | Dark foundation / terminal canvas background |
| `--panel` | `#111827` | Primary surface panel background |
| `--panel-2` | `#182234` | Secondary surface / elevated elements |
| `--line` | `#1F2A3C` | Structural border and grid dividers |
| `--text` | `#E8EDF5` | Primary body typography |
| `--haze` | `#8B9BB4` | Muted labels, secondary descriptions |
| `--accent` | `#009485` | LearnAPI primary accent (Teal) |
| `--api-logo` | `#7C6AF7` | Violet wordmark branding for `API` |
| `--remote` | `#F59E0B` | Production field notes (Amber) |
| `--hint-orange` | `#FF8C1A` | Active checklist item glow and terminal hinter |
| `--code` | `#60A5FA` | Terminal commands and code references |
| `--ok` | `#2DD4A8` | Successful operations and 2xx statuses |
| `--warn` | `#F5C542` | Warnings and 3xx/4xx informational states |
| `--err` | `#F07178` | Validation errors and failure states |
| `--packet` | `#7C6AF7` | Request packet animation color |

### Typography

- **Interface**: `'Segoe UI Variable Text'`, `'Segoe UI'`, `system-ui`, `-apple-system`, sans-serif
- **Code & Shell**: `'Cascadia Code'`, `Consolas`, `ui-monospace`, monospace

---

## 3. Workstation Layout

The interface is structured as a two-column responsive grid:

```
┌──────────────────────────────────────────────────────────┬──────────────────────────┐
│ Toolbar: LearnAPI · Level Title · Controls · Lang · Links │                          │
├────────────────────────────┬─────────────────────────────┤ Always-On Learning Guide │
│ Visualizer Panel           │ Code Editor                 │ Dock                     │
│  - Pipeline (Client/Server)│  - server.py / server.R     │  - Objective             │
│  - API Surface Graph       │  - Run Action (Ctrl+Enter)  │  - Concepts              │
│  - Live OpenAPI Schema     │                             │  - Field Notes           │
├────────────────────────────┴─────────────────────────────┤  - Interactive Checklist │
│ Interactive Terminal (Command input, tab completion)     │  - Next Action Card      │
└──────────────────────────────────────────────────────────┴──────────────────────────┘
```

---

## 4. Execution & Evaluation Flow

1. **Compilation Phase**:
   - Learner inputs framework code and clicks **Run** (or presses `Ctrl+Enter`).
   - `engine.js` parses routes, decorators, parameter annotations, and schemas.
   - Live visualizers render the updated pipeline nodes and OpenAPI documentation.

2. **Testing Phase**:
   - Learner dispatches HTTP calls in the terminal (`call GET /users/1`).
   - `engine.js` matches route paths, verifies parameter types, resolves dependencies, and executes handlers.
   - The packet flight animation traces the request from Client to Router to Handler to Response.

3. **Checklist Validation & Golfing**:
   - `game.js` compares the parsed server and executed requests against level goals.
   - When all checklist items are met, celebration fanfare and confetti are triggered.
   - Player command count is scored against the ideal par target.
