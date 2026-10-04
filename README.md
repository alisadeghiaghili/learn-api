# LearnAPI

Interactive web API development tutorial and simulation lab for **FastAPI (Python)**, **plumber (R)**, and **OpenAPI 3.0**.

Learners write framework code in an integrated editor, compile it into an in-browser deterministic mock server with **Run**, inspect live request pipelines and generated OpenAPI schemas, and invoke endpoints via a dedicated terminal.

## Run

Open `index.html` directly in any modern browser, or serve locally:

```bash
python -m http.server 8080
# open http://localhost:8080
```

- **Zero build steps**: Pure ECMAScript modules (ESM).
- **Zero backend dependencies**: 100% client-side execution engine, tokenizer, and mock HTTP runtime.
- **Persistent progress**: Automatically stored via `localStorage` and cookie fallback.

## Curriculum & Tracks

The curriculum is structured around production engineering principles (target depth & real-world applicability >= 8.5/10):

1. **HTTP Basics (`http`)**: Protocol foundation, request-response lifecycles, HTTP methods (GET, POST), status codes, and JSON body payloads.
2. **FastAPI Track (`fastapi`)**: Routing, type-annotated path parameters, query parameters with defaults, Pydantic data schemas, CRUD endpoints, HTTPExceptions, dependency injection (`Depends`), header-based authorization, and response model filtering (`response_model`).
3. **Plumber Track (`plumber`)**: R-native web services, roxygen-style endpoint decorators (`#* @get`, `#* @post`), typed parameter casting, serializers, and R data structures.
4. **OpenAPI Track (`openapi`)**: Interactive API specifications, path items, request bodies, components schemas, and documentation generation.
5. **Compare Stacks (`compare`)**: Side-by-side architecture comparisons between Python FastAPI and R Plumber implementations.

## Interface & Workstation

- **Toolbar**: Language switcher (EN / FA), Level Selector, Lesson Replay, Guide Focus, Hint, Solution, Undo, Reset, and Sandbox mode.
- **Learning Guide (Dock)**: An always-on panel presenting theoretical objectives, practical production field notes, and interactive goal checklists with real-time feedback.
- **Visualizer**:
  - *Pipeline View*: Visualizes packet routing from Client through Router and Handler to Response.
  - *API Surface*: Graph map of registered endpoints.
  - *OpenAPI View*: Real-time compiled OpenAPI 3.0 document.
- **Terminal**: Interactive shell supporting autocomplete (Tab), history navigation (Up / Down), command golf par tracking, and formatted responses.

## Console Commands

| Command | Description |
|---------|-------------|
| `help` | List available terminal commands |
| `levels` | Open the interactive level selection modal |
| `lesson` | Replay concept walkthrough slides |
| `hint` | Print the current level hint |
| `goal` | Highlight the goal checklist and next recommended action |
| `run` | Compile editor source into the mock server runtime |
| `call <METHOD> <path> [body=JSON] [headers=JSON]` | Dispatch an HTTP request |
| `openapi` | View the generated OpenAPI 3.0 specification |
| `solution` | Reveal reference solution code |
| `undo` / `reset` | Revert to previous code revision or reset to starting state |
| `next` | Proceed to the next level |
| `sandbox` | Switch to open sandbox mode |
| `clear` | Clear terminal output log |

## Project Structure

```
index.html              Application HTML shell
css/
  main.css              Workstation theme, guide dock, celebration and layout styles
js/
  app.js                Application shell, UI coordinator, and lifecycle management
  engine.js             Python/FastAPI and R/Plumber parsers, tokenizer, and mock HTTP runtime
  game.js               Pure functional goal evaluation, checklist resolution, and state rules
  levels.js             Curriculum levels, sequences, and sandbox definitions
  terminal.js           Terminal component with command line history and word completion
  console.js            Console command dispatcher and argument parser
  openapi.js            OpenAPI 3.0 specification generator
  visualizer.js         SVG pipeline and API surface visualizers
  dialog.js             Modal dialogs and Markdown rendering
  confetti.js           Confetti particle physics and audio fanfare
  progress.js           Learner progress tracking and persistence
  share.js              Social progress sharing integration
  visitor.js            Visitor metrics counter
  i18n/
    index.js            Localization coordinator (LTR / RTL)
    en.js               English copy catalog
    fa.js               Persian copy catalog
    fa-dialogs.js       Persian localized lesson slides
tests/
  engine.test.mjs       Engine parsing and execution tests
  levels.test.mjs       Level validation and solution verification tests
  game.test.mjs         Game state and action resolution tests
  robustness.test.mjs   Adversarial code parsing and error handling tests
  i18n.test.mjs         Localization key completeness and curriculum checks
```

## Running Tests

Run the test suite using Node.js:

```bash
npm test
```
