# LearnAPI

Interactive API development tutorial — a game in the spirit of
[learnGitBranching](https://github.com/pcottle/learnGitBranching) — for
**FastAPI (Python)**, **plumber (R)**, and **OpenAPI / Swagger**.

You write framework code, `run` it into a mock server, watch the request
pipeline and OpenAPI surface update, then call endpoints from the console.
Levels teach one idea at a time with LGB-style dialogs, goal trees, hints,
and command golf.

## Run

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8080
# open http://localhost:8080
```

No build step. No backend. 100% client-side.

## Modes

- **Sandbox** — free play with a starter FastAPI app
- **Levels** — guided challenges (`levels` in the console)
- Tracks: HTTP basics, FastAPI, plumber, OpenAPI/Swagger, side-by-side compare

## Console commands

| Command | Effect |
|---------|--------|
| `help` | List commands |
| `levels` | Level browser |
| `hint` | Level hint |
| `run` | Compile current editor code into the mock server |
| `call GET /users` | Send a request |
| `call POST /users body={"name":"ada"}` | Send with JSON body |
| `openapi` | Print the generated OpenAPI document |
| `undo` / `reset` | Undo last run / reset level |
| `solution` | Show solution code (counts as a fail for golf) |
| `next` | Next level (after solve) |
| `sandbox` | Leave levels for free play |

## Project layout

```
index.html
css/main.css
js/
  app.js         UI shell, routing, dialogs
  engine.js      FastAPI / plumber parsers + mock HTTP runtime
  openapi.js     OpenAPI 3.0 generation
  visualizer.js  Pipeline + OpenAPI map (SVG)
  levels.js      Level definitions (JSON-shaped)
  console.js     Command interpreter
DESIGN.md        Visual and interaction spec
```

## Adding a level

Append an object to `js/levels.js` matching the `Level` shape in `DESIGN.md`.
Export `startCode`, `solutionCode`, `goal`, and `startDialog`.
