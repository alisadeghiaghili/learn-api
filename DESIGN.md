# LearnAPI — Design Spec

Interactive API development tutorial game in the mold of learnGitBranching.
Covers **FastAPI (Python)**, **plumber (R)**, and **OpenAPI / Swagger**.

## Style anchor

Packet-capture workstation chrome crossed with LGB’s game tutorial overlay.
Reference: Wireshark dark density + FastAPI docs clarity + LGB modal levels.
Not a SaaS marketing page. Not a codepen demo.

## Palette

| Token | Hex | Role |
|-------|-----|------|
| `bg` | `#0A0F1A` | App background (deep capture navy) |
| `panel` | `#111827` | Panels, editors |
| `line` | `#1F2A3C` | Borders, grid |
| `ink` | `#E8EDF5` | Primary text |
| `muted` | `#8B9BB4` | Secondary text |
| `fastapi` | `#009485` | FastAPI track / method pills |
| `plumber` | `#276DC3` | plumber / R track |
| `openapi` | `#85CB33` | OpenAPI / Swagger track |
| `packet` | `#7C6AF7` | Live request packet |
| `ok` | `#2DD4A8` | 2xx |
| `fail` | `#F07178` | 4xx/5xx |

## Typography

- UI: `Segoe UI Variable Text`, `Segoe UI`, `system-ui`, sans-serif
- Mono: `Cascadia Code`, `Cascadia Mono`, `Consolas`, `ui-monospace`, monospace
- Scale: 11 / 12 / 14 / 17 / 22 / 32 / 48
- Method badges: mono 700, track-colored, never decorative caps eyebrows

## Layout

```
┌─ chrome: LearnAPI · track · levels · golf · undo / reset ────┐
├─ level dialog (LGB-style modal / left rail)                  │
├──────────────┬──────────────────────────┬────────────────────┤
│ sequences /  │  pipeline visualization  │ OpenAPI map        │
│ level list   │  Client → Router →       │ (path tree)        │
│              │  Handler → Response      │                    │
├──────────────┴──────────────────────────┴────────────────────┤
│ code editor (FastAPI / plumber)     │ command console        │
└─────────────────────────────────────┴────────────────────────┘
```

Grid rhythm: 8px base. Panel padding 12–16. Dense chrome, airy dialogs.

## Signature moments

1. **Packet flight** — a violet packet carries `GET /users` through
   Client → Router → Handler → Response; status badge snaps on arrival.
2. **Surface bloom** — `run` compiles code; endpoint nodes bloom into the
   OpenAPI map with track-colored method pills (LGB’s tree growth).

## Principles

- Method/track colors are identity, not decoration.
- One motion system only (packet flight + endpoint birth).
- Code is the hero; chrome stays quiet.
- Levels are JSON (start code / goal / dialog / solution / golf par).
- 100% client-side: parsers + mock runtime, no backend.

## Level model

```js
{
  id, track, language, name, hint, golf,
  startCode, solutionCode,
  goal: { endpoints?, calls?, codeContains?, openapiHas? },
  startDialog: [{ type: 'ModalAlert' | 'ApiDemo', ... }]
}
```

Tracks: `http` · `fastapi` · `plumber` · `openapi` · `compare`.

## Interaction loop (mirrors LGB)

1. Dialog teaches the idea (ModalAlert + live ApiDemo).
2. Learner edits code / console commands.
3. Visualization and OpenAPI map update live on `run`.
4. Win when goal endpoints and sample calls match.
5. `levels`, `hint`, `undo`, `reset`, `solution`, golf score.
