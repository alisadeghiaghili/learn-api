/**
 * LearnAPI level definitions and curriculum catalog.
 * Professional interactive curriculum for FastAPI, plumber, and OpenAPI.
 *
 * Each level defines:
 *   id, track, language, name, objective, learning, fieldNotes, hint, golf,
 *   pattern, startCode, solutionCode, goal, startDialog
 */

import { FA_LEVELS } from './i18n/fa-levels.js';
import { FA_DIALOGS } from './i18n/fa-dialogs.js';
import { DE_DIALOGS } from './i18n/de-dialogs.js';
import { DE_LEVELS } from './i18n/de-levels.js';

/** @typedef {import('./engine.js').HttpMethod} HttpMethod */

/**
 * @typedef {Object} Level
 * @property {string} id
 * @property {string} track
 * @property {'python'|'r'|'http'|'openapi'} language
 * @property {string} name
 * @property {string} objective
 * @property {string[]} learning
 * @property {string[]} fieldNotes
 * @property {string} hint
 * @property {number} golf
 * @property {string} [pattern]
 * @property {string} startCode
 * @property {string} solutionCode
 * @property {{ endpoints?: {method: string, path: string, status?: number}[], calls?: {method: string, path: string, body?: object, headers?: Record<string, string>, expectStatus: number, expectBody?: object}[], codeContains?: string[], openapiHas?: string[] }} goal
 * @property {object[]} startDialog
 * @property {string} [editorLabel]
 * @property {{ name?: string, objective?: string, hint?: string, learning?: string[], fieldNotes?: string[] }} [fa]
 * @property {{ name?: string, objective?: string, hint?: string, learning?: string[], fieldNotes?: string[] }} [de]
 */

/** @type {Level[]} */
export const LEVELS = [
  // ── HTTP ──────────────────────────────────────────────
  {
    id: 'http-01',
    track: 'http',
    language: 'python',
    name: 'What is an endpoint?',
    objective: 'Expose the root URL of your web service and deliver a valid JSON payload.',
    pattern: `@app.get("/")\ndef read_root():\n    return {"hello": "world"}`,
    learning: [
      'An endpoint pairs an HTTP method (verb) with an addressable path identifier per RFC 9110.',
      'Under the hood: Uvicorn ASGI server receives the socket stream; Starlette router matches the path.',
      'Returned Python dictionaries are automatically serialized by jsonable_encoder into UTF-8 JSON bytes.',
    ],
    fieldNotes: [
      'Kubernetes liveness and readiness probes query root or /healthz endpoints to monitor container health.',
      'Always return dictionary key-value objects rather than bare JSON arrays to preserve forward compatibility.',
      'Keep root handlers non-blocking: avoid synchronous file I/O or heavy computations without async/threadpools.',
    ],
    hint: 'Define `@app.get("/")` with a handler function returning a JSON object like `{"hello": "world"}`.',
    golf: 2,
    editorLabel: 'server.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Hello API")

# TODO: Define @app.get("/") with def read_root() returning {"hello": "world"}
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Hello API")

@app.get("/")
def read_root():
    return {"hello": "world"}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/' }],
      calls: [{ method: 'GET', path: '/', expectStatus: 200, expectBody: { hello: 'world' } }],
      codeContains: ['def read_root():'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Endpoints in HTTP',
          'An **endpoint** is an addressable location on a web server. Each endpoint pairs an HTTP method (verb) with a path (e.g. `GET /`).',
          'In FastAPI, endpoints are registered with route decorators: `@app.get("/")` captures `GET /` requests.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Request Execution',
          '1. The ASGI server (Uvicorn) decodes inbound TCP sockets into an ASGI connection scope.',
          '2. The Starlette router matches the URL path against the route table to find the handler function.',
          '3. Python return dictionaries are encoded by `jsonable_encoder` into UTF-8 JSON with `Content-Type: application/json`.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern',
          'Write the route decorator and handler function in the editor:\n\n```python\n@app.get("/")\ndef read_root():\n    return {"hello": "world"}\n```',
        ],
      },
      {
        type: 'ApiDemo',
        beforeMarkdowns: ['Register `GET /` and watch the surface pick up the node.'],
        afterMarkdowns: ['`GET /` is live. Call it from the console: `call GET /`'],
        command: 'call GET /',
      },
      {
        type: 'GoalList',
      },
    ],
  },
  {
    id: 'http-02',
    track: 'http',
    language: 'python',
    name: 'HTTP methods',
    objective: 'Distinguish between safe reading (GET) and state-mutating creation (POST) with HTTP 201 Created.',
    pattern: `@app.post("/items", status_code=201)\ndef create_item():\n    return {"id": 1, "name": "widget"}`,
    learning: [
      'GET requests must be safe and idempotent (RFC 9110 §9.2.1) — they must never mutate server state.',
      'Under the hood: POST is neither safe nor idempotent; each request represents resource creation or state mutation.',
      'HTTP 201 Created signals successful resource allocation and should include a Location header.',
    ],
    fieldNotes: [
      'Never use GET for state changes (e.g. /items/delete?id=1 breaks web caches, CDNs, and search crawlers).',
      'In distributed systems, pair state-mutating POST requests with Idempotency-Key headers against duplicate retries.',
      'A uniform resource path (/items) handles querying (GET) and creation (POST) via standard HTTP verbs.',
    ],
    hint: 'Add `@app.post("/items", status_code=201)` that returns status 201 and the created item dictionary.',
    golf: 3,
    editorLabel: 'server.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Hello API")

@app.get("/items")
def list_items():
    return {"items": []}

# TODO: Define @app.post("/items", status_code=201) with def create_item() returning {"id": 1, "name": "widget"}
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Hello API")

@app.get("/items")
def list_items():
    return {"items": []}

@app.post("/items", status_code=201)
def create_item():
    return {"id": 1, "name": "widget"}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/items' },
        { method: 'POST', path: '/items', status: 201 },
      ],
      calls: [{ method: 'POST', path: '/items', expectStatus: 201, expectBody: { id: 1, name: 'widget' } }],
      codeContains: ['@app.post("/items", status_code=201)', 'def create_item():'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## HTTP Verbs & Semantics',
          '`GET` reads data without mutating server state. `POST` creates resources or triggers operations.',
          'Same path with different methods = completely independent endpoints on the server.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Why 201 Created?',
          'Returning 200 OK does not inform clients whether a new entity was created or just read.',
          'HTTP 201 Created explicitly confirms creation. In FastAPI, set it using `status_code=201` on the decorator.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\n@app.post("/items", status_code=201)\ndef create_item():\n    return {"id": 1, "name": "widget"}\n```',
        ],
      },
      {
        type: 'GoalList',
      },
    ],
  },
  {
    id: 'http-03',
    track: 'http',
    language: 'python',
    name: 'Caching & Conditional Requests (ETag & 304)',
    objective: 'Inspect cache validation with the ETag and If-None-Match headers, returning 304 Not Modified when fresh.',
    pattern: `@app.get("/items")\ndef get_items(if_none_match: str = Header(None, alias="If-None-Match")):\n    if if_none_match == "etag-v1":\n        raise HTTPException(status_code=304, detail="Not Modified")\n    return {"items": ["alpha", "beta"], "etag": "etag-v1"}`,
    learning: [
      'RFC 9111 HTTP caching reduces server load and bandwidth by validating client caches using entity tags (ETags).',
      'Under the hood: When a client includes If-None-Match matching the resource ETag, the server short-circuits with 304 Not Modified without sending the body.',
      'Conditional requests preserve high performance in high-throughput APIs, saving database queries and network serialization.',
    ],
    fieldNotes: [
      'Always use strong ETags (cryptographic hashes of content) or weak ETags (W/"...") for dynamically generated JSON representations.',
      'Combine ETags with Cache-Control headers (e.g. max-age, no-cache, must-revalidate) to guide browser and CDN reverse proxies.',
      'Status 304 responses must omit the message body per RFC 9110, delivering zero payload overhead.',
    ],
    hint: 'Define `@app.get("/items")` with `if_none_match: str = Header(None, alias="If-None-Match")`. If `if_none_match == "etag-v1"` raise `HTTPException(status_code=304, detail="Not Modified")`, else return `{"items": ["alpha", "beta"], "etag": "etag-v1"}`.',
    golf: 3,
    editorLabel: 'server.py',
    startCode: `from fastapi import FastAPI, Header, HTTPException

app = FastAPI(title="Caching API")

# TODO: Define @app.get("/items") with if_none_match: str = Header(None, alias="If-None-Match")
# Return 304 if if_none_match == "etag-v1", else {"items": ["alpha", "beta"], "etag": "etag-v1"}
`,
    solutionCode: `from fastapi import FastAPI, Header, HTTPException

app = FastAPI(title="Caching API")

@app.get("/items")
def get_items(if_none_match: str = Header(None, alias="If-None-Match")):
    if if_none_match == "etag-v1":
        raise HTTPException(status_code=304, detail="Not Modified")
    return {"items": ["alpha", "beta"], "etag": "etag-v1"}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/items' }],
      codeContains: ['@app.get("/items")', 'if if_none_match == "etag-v1":', 'raise HTTPException(status_code=304'],
      calls: [
        { method: 'GET', path: '/items', headers: { 'if-none-match': 'etag-v1' }, expectStatus: 304 },
        { method: 'GET', path: '/items', headers: {}, expectStatus: 200, expectBody: { etag: 'etag-v1' } },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## HTTP Caching & Conditional Requests',
          'RFC 9111 HTTP Caching uses entity tags (`ETag`) to avoid re-transmitting data that has not changed.',
          'Clients send `If-None-Match: <etag>` on subsequent requests. If the entity has not mutated, the server replies with lightweight **304 Not Modified**.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Zero-Payload 304',
          'Status 304 short-circuits execution before building response bodies, saving network bandwidth and database serialization.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\n@app.get("/items")\ndef get_items(if_none_match: str = Header(None, alias="If-None-Match")):\n    if if_none_match == "etag-v1":\n        raise HTTPException(status_code=304, detail="Not Modified")\n    return {"items": ["alpha", "beta"], "etag": "etag-v1"}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },

  // ── FastAPI ───────────────────────────────────────────
  {
    id: 'fastapi-01',
    track: 'fastapi',
    language: 'python',
    name: 'Path parameters',
    objective: 'Extract dynamic variables from the URL path with automated type validation and 422 errors.',
    pattern: `@app.get("/users/{user_id}")\ndef get_user(user_id: int):\n    return {"id": user_id, "name": "ada"}`,
    learning: [
      'Path segments in curly braces `{param}` match dynamic resource identifiers in the URI path.',
      'Under the hood: FastAPI compiles path routes to regexes at startup and uses Python type hints for coercion.',
      'Type mismatch (e.g. sending text to an int parameter) triggers an immediate RFC 7807 422 error.',
    ],
    fieldNotes: [
      'Use UUIDs or non-sequential identifiers in public APIs to prevent resource enumeration attacks (BOLA/IDOR).',
      'Never perform access control solely based on path parameter parsing; defer to dependency auth guards.',
      'Path parameters are inherently required; if an identifier is optional, model it as a query parameter.',
    ],
    hint: 'Add `{user_id}` in `@app.get("/users/{user_id}")` and type annotate `user_id: int` in the function parameter.',
    golf: 2,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Users API")

@app.get("/users")
def list_users():
    return {"users": []}

# TODO: Add GET /users/{user_id} returning {"id": user_id, "name": "ada"}
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Users API")

@app.get("/users")
def list_users():
    return {"users": []}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "ada"}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/users' },
        { method: 'GET', path: '/users/{user_id}' },
      ],
      calls: [
        { method: 'GET', path: '/users/42', expectStatus: 200, expectBody: { id: 42, name: 'ada' } },
      ],
      codeContains: ['@app.get("/users/{user_id}")', 'def get_user(user_id: int):'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Dynamic Path Parameters',
          'A path segment in braces is a **path parameter**: `/users/{user_id}` matches `/users/42` with `user_id=42`.',
          'Declare it in the function signature with a type annotation: `user_id: int`.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Type Coercion & 422',
          'FastAPI inspects the signature using `inspect.signature` at startup.',
          'Inbound strings are coerced to target types. If coercion fails (`call GET /users/ada`), the handler is never called and a 422 Unprocessable Entity error is returned.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\n@app.get("/users/{user_id}")\ndef get_user(user_id: int):\n    return {"id": user_id, "name": "ada"}\n```',
        ],
      },
      {
        type: 'GoalList',
      },
    ],
  },
  {
    id: 'fastapi-02',
    track: 'fastapi',
    language: 'python',
    name: 'Query parameters',
    objective: 'Implement flexible filtering, search, and pagination contracts using standard query strings.',
    pattern: `@app.get("/search")\ndef search(q: str = "", limit: int = 10):\n    return {"q": q, "limit": limit}`,
    learning: [
      'Function arguments not included in the URL path automatically become query parameters (RFC 3986).',
      'Under the hood: Starlette parses the raw query string; FastAPI coerces values into declared Python types.',
      'Default values make parameters optional; omitting defaults makes parameters strictly required.',
    ],
    fieldNotes: [
      'Always enforce hard limits on pagination parameters (e.g. limit <= 100 via Query(le=100)) to protect server memory.',
      'Query parameters appear in access logs and proxy caches; never transmit credentials or secrets in query strings.',
      'Ensure database indexes cover every query filter to prevent catastrophic full table scans in production.',
    ],
    hint: 'Add function parameters with defaults: `q: str = ""` and `limit: int = 10` to `@app.get("/search")`.',
    golf: 2,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Users API")

@app.get("/search")
def search():
    return {"q": None, "limit": 10}

# TODO: Accept query params: q: str = "", limit: int = 10
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Users API")

@app.get("/search")
def search(q: str = "", limit: int = 10):
    return {"q": q, "limit": limit}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/search' }],
      calls: [
        {
          method: 'GET',
          path: '/search?q=ada&limit=2',
          expectStatus: 200,
          expectBody: { q: 'ada', limit: 2 },
        },
      ],
      codeContains: ['def search(q: str'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Query Strings in HTTP',
          'Everything after `?` is the query string: `GET /search?q=ada&limit=2`.',
          'While path parameters identify resources, query parameters control how resources are presented (filtering, paging, sorting).',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Optional vs Required',
          'Arguments with defaults (`limit: int = 10`) are optional.',
          'Arguments without defaults (`q: str`) are required query parameters — omitting them triggers a 422 error.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\n@app.get("/search")\ndef search(q: str = "", limit: int = 10):\n    return {"q": q, "limit": limit}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-03',
    track: 'fastapi',
    language: 'python',
    name: 'Request body',
    objective: 'Receive and validate structured JSON payloads using Pydantic schema models.',
    pattern: `class User(BaseModel):\n    name: str\n    age: int = 0\n\n@app.post("/users", status_code=201)\ndef create_user(user: User):\n    return {"id": 1, "name": user.name, "age": user.age}`,
    learning: [
      'Inbound JSON payloads are declared and validated using Pydantic schemas inheriting from BaseModel.',
      'Under the hood: ASGI reads body byte chunks, parses JSON, and Pydantic creates a validated object instance.',
      'The schema is automatically published in OpenAPI components.schemas to empower Swagger UI.',
    ],
    fieldNotes: [
      'Always separate Input DTO schemas from Database ORM models to avoid mass-assignment vulnerabilities.',
      'Apply field validation constraints (e.g. Field(min_length=1)) directly at the Pydantic schema layer.',
      'Granular 422 errors give client developers exact field locations (`loc: ["body", "age"]`) for fast debugging.',
    ],
    hint: 'Declare `class User(BaseModel):` with fields `name: str` and `age: int = 0`, then accept `user: User` in POST /users.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Users API")

# TODO: Define User(BaseModel) with name: str, age: int = 0
# TODO: POST /users → status 201 with {"id": 1, "name": user.name, "age": user.age}
`,
    solutionCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Users API")

class User(BaseModel):
    name: str
    age: int = 0

@app.post("/users", status_code=201)
def create_user(user: User):
    return {"id": 1, "name": user.name, "age": user.age}
`,
    goal: {
      endpoints: [{ method: 'POST', path: '/users', status: 201 }],
      calls: [
        {
          method: 'POST',
          path: '/users',
          body: { name: 'ada', age: 36 },
          expectStatus: 201,
          expectBody: { name: 'ada' },
        },
      ],
      codeContains: ['class User(BaseModel):', 'def create_user(user: User):'],
      openapiHas: ['components.schemas.User'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Request Body & JSON Validation',
          'Create and update requests carry a **JSON body**. FastAPI validates incoming payloads using Pydantic `BaseModel` classes.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Deserialization Pipeline',
          '1. The ASGI server reads incoming byte chunks and parses JSON.',
          '2. Pydantic validates each field against declared types and constraints.',
          '3. Your handler receives a clean, strongly-typed model instance; invalid data triggers an automatic 422 error.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\nclass User(BaseModel):\n    name: str\n    age: int = 0\n\n@app.post("/users", status_code=201)\ndef create_user(user: User):\n    return {"id": 1, "name": user.name, "age": user.age}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-04',
    track: 'fastapi',
    language: 'python',
    name: 'Delete and status codes',
    objective: 'Master standard HTTP deletion semantics with empty 204 No Content responses.',
    pattern: `@app.delete("/notes/{note_id}", status_code=204)\ndef delete_note(note_id: int):\n    return {}`,
    learning: [
      'The HTTP DELETE verb signals permanent or logical removal of a target resource.',
      'Under the hood: RFC 9110 §15.3.5 forbids a response payload on 204; clients and proxies strip response bodies.',
      'Status codes drive client state: 200 includes data, 201 confirms creation, 204 confirms deletion without payload.',
    ],
    fieldNotes: [
      'Implement soft deletion in enterprise applications (deleted_at timestamp) to enable audit logging and recovery.',
      'Ensure DELETE endpoints are idempotent: repeated delete requests should consistently return 204 or 404.',
      'Clean up dependent foreign-key records or cascade deletes within database transactions.',
    ],
    hint: 'Define `@app.delete("/notes/{note_id}", status_code=204)` returning an empty dict `{}`.',
    golf: 2,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Notes API")

@app.get("/notes/{note_id}")
def get_note(note_id: int):
    return {"id": note_id}

# TODO: Add DELETE /notes/{note_id} with status_code=204
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Notes API")

@app.get("/notes/{note_id}")
def get_note(note_id: int):
    return {"id": note_id}

@app.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: int):
    return {}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/notes/{note_id}' },
        { method: 'DELETE', path: '/notes/{note_id}', status: 204 },
      ],
      calls: [{ method: 'DELETE', path: '/notes/7', expectStatus: 204 }],
      codeContains: ['@app.delete("/notes/{note_id}", status_code=204)', 'def delete_note(note_id: int):'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## HTTP Status Codes & Deletion',
          'Status codes communicate execution outcomes to clients: 200 OK · 201 Created · 204 No Content · 404 Not Found · 422 Error.',
          'A successful `DELETE` operation that leaves no payload responds with **204 No Content**.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: No Body on 204',
          'RFC 9110 explicitly forbids a response body on 204 responses. Browsers and HTTP clients discard any payload.',
          'In FastAPI, configure this via `status_code=204` on the `@app.delete` decorator.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\n@app.delete("/notes/{note_id}", status_code=204)\ndef delete_note(note_id: int):\n    return {}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-05',
    track: 'fastapi',
    language: 'python',
    name: 'CRUD on one resource',
    objective: 'Orchestrate complete Create, Read, Update, Delete cycles on a uniform REST resource.',
    pattern: `@app.post("/notes", status_code=201)\ndef create_note(): ...\n\n@app.put("/notes/{note_id}")\ndef update_note(note_id: int): ...\n\n@app.delete("/notes/{note_id}", status_code=204)\ndef delete_note(note_id: int): ...`,
    learning: [
      'RESTful architecture organizes capabilities around noun collections (/notes) rather than action verbs.',
      'Under the hood: PUT completely replaces resource representation; PATCH applies partial modifications.',
      'Method routing separates concerns: the same URI /notes/{id} handles Read (GET), Replace (PUT), and Delete (DELETE).',
    ],
    fieldNotes: [
      'Maintain plural nouns for resource collections (/notes, /users), never verbs (/createNote violates REST).',
      'Ensure PUT operations are idempotent: executing the same PUT multiple times produces identical state.',
      'Wrap multi-step mutations in atomic database transactions with automatic rollback on error.',
    ],
    hint: 'Implement all 4 methods: POST `/notes` (201), GET `/notes/{note_id}`, PUT `/notes/{note_id}`, and DELETE `/notes/{note_id}` (204).',
    golf: 5,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Notes")

@app.get("/notes")
def list_notes():
    return {"notes": []}

# TODO: POST /notes → status 201
# TODO: GET /notes/{note_id}
# TODO: PUT /notes/{note_id}
# TODO: DELETE /notes/{note_id} → status 204
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Notes")

@app.get("/notes")
def list_notes():
    return {"notes": []}

@app.post("/notes", status_code=201)
def create_note():
    return {"id": 1, "title": "hello"}

@app.get("/notes/{note_id}")
def get_note(note_id: int):
    return {"id": note_id, "title": "hello"}

@app.put("/notes/{note_id}")
def update_note(note_id: int):
    return {"id": note_id, "title": "updated"}

@app.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: int):
    return {}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/notes' },
        { method: 'POST', path: '/notes', status: 201 },
        { method: 'GET', path: '/notes/{note_id}' },
        { method: 'PUT', path: '/notes/{note_id}' },
        { method: 'DELETE', path: '/notes/{note_id}', status: 204 },
      ],
      calls: [
        { method: 'POST', path: '/notes', expectStatus: 201, expectBody: { id: 1, title: 'hello' } },
        { method: 'GET', path: '/notes/3', expectStatus: 200, expectBody: { id: 3, title: 'hello' } },
        { method: 'PUT', path: '/notes/3', expectStatus: 200, expectBody: { id: 3, title: 'updated' } },
        { method: 'DELETE', path: '/notes/3', expectStatus: 204 },
      ],
      codeContains: ['@app.post("/notes", status_code=201)', '@app.put("/notes/{note_id}")', '@app.delete("/notes/{note_id}", status_code=204)'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## REST CRUD Architecture',
          'A resource is not a single route. **C**reate `POST` · **R**ead `GET` · **U**pdate `PUT` · **D**elete `DELETE`.',
          'Collection path `/notes` handles list and create; item path `/notes/{note_id}` handles read, update, and delete.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: PUT vs PATCH',
          '• **PUT** replaces the complete entity and must be idempotent.',
          '• **PATCH** modifies specific fields partially without resetting unspecified properties.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\n@app.post("/notes", status_code=201)\ndef create_note(): return {"id": 1, "title": "hello"}\n\n@app.put("/notes/{note_id}")\ndef update_note(note_id: int): return {"id": note_id, "title": "updated"}\n\n@app.delete("/notes/{note_id}", status_code=204)\ndef delete_note(note_id: int): return {}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-06',
    track: 'fastapi',
    language: 'python',
    name: 'HTTPException for missing resources',
    objective: 'Halt invalid execution and return clear, semantic HTTP error responses with status 404.',
    pattern: `if item_id == 99:\n    raise HTTPException(status_code=404, detail="Item not found")`,
    learning: [
      'Raising HTTPException immediately aborts handler execution and triggers Starlette error middleware.',
      'Under the hood: The framework builds an RFC 7807 error envelope with `{"detail": "..."}` and the HTTP status.',
      'Status codes convey precise context: 404 Not Found, 400 Bad Request, 401 Unauthorized, 403 Forbidden.',
    ],
    fieldNotes: [
      'Never allow unhandled Python exceptions or database stack traces to leak to clients.',
      'Standardize application error envelopes across services so frontends parse errors reliably.',
      'Document expected error status codes in OpenAPI responses for clear API contracts.',
    ],
    hint: 'Add `if item_id == 99: raise HTTPException(status_code=404, detail="Item not found")` before returning.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI, HTTPException

app = FastAPI(title="Store")

@app.get("/items/{item_id}")
def get_item(item_id: int):
    # TODO: When item_id == 99, raise HTTPException with status_code=404
    return {"id": item_id}
`,
    solutionCode: `from fastapi import FastAPI, HTTPException

app = FastAPI(title="Store")

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id == 99:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"id": item_id}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/items/{item_id}' }],
      calls: [
        { method: 'GET', path: '/items/1', expectStatus: 200, expectBody: { id: 1 } },
        { method: 'GET', path: '/items/99', expectStatus: 404 },
      ],
      codeContains: ['raise HTTPException(status_code=404'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Semantic HTTP Errors',
          'A missing resource is **404 Not Found**, not a 500 crash and not a silent 200 with `null`.',
          'FastAPI signals errors with `raise HTTPException(status_code=404, detail="...")`.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Error Middleware',
          'Raising `HTTPException` interrupts function flow immediately.',
          'Starlette exception middleware catches the error, wraps the detail into `{ "detail": "..." }`, and emits the exact HTTP status code.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\nif item_id == 99:\n    raise HTTPException(status_code=404, detail="Item not found")\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-07',
    track: 'fastapi',
    language: 'python',
    name: 'Dependency injection',
    objective: 'Decouple shared resources, settings, and database sessions with Inversion of Control (IoC).',
    pattern: `def get_settings():\n    return {"app_name": "LearnAPI"}\n\n@app.get("/info")\ndef info(settings: dict = Depends(get_settings)):\n    return {"app": settings["app_name"]}`,
    learning: [
      'Dependency Injection (DI) resolves reusable, decoupled providers before entering the handler.',
      'Under the hood: FastAPI resolves dependencies as a Directed Acyclic Graph (DAG), caching results within request scope.',
      'Generator dependencies using `yield` manage resource lifecycles (opening and closing database sessions).',
    ],
    fieldNotes: [
      'Always use `yield` in database dependencies to guarantee connection closing and automatic rollback on errors.',
      'Leverage `app.dependency_overrides` in unit tests to mock databases or external APIs without patching globals.',
      'Keep dependencies modular and single-purpose to build composable security, caching, and database pipelines.',
    ],
    hint: 'In `@app.get("/info")`, inject settings via parameter `settings: dict = Depends(get_settings)`.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI, Depends

app = FastAPI(title="Config")

def get_settings():
    return {"app_name": "LearnAPI", "debug": False}

@app.get("/info")
def info():
    # TODO: Inject settings via Depends(get_settings)
    return {"app": "unknown"}
`,
    solutionCode: `from fastapi import FastAPI, Depends

app = FastAPI(title="Config")

def get_settings():
    return {"app_name": "LearnAPI", "debug": False}

@app.get("/info")
def info(settings: dict = Depends(get_settings)):
    return {"app": settings["app_name"], "debug": settings["debug"]}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/info' }],
      calls: [{ method: 'GET', path: '/info', expectStatus: 200, expectBody: { app: 'LearnAPI' } }],
      codeContains: ['Depends(get_settings)'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Dependency Injection with Depends',
          'Handlers should not open database connections or parse configuration manually.',
          '**Dependencies** are callable providers that FastAPI resolves and injects into functions automatically.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Dependency Graph (DAG)',
          'FastAPI solves dependencies as a Directed Acyclic Graph (DAG) before calling your handler.',
          'Dependencies with `yield` act as Context Managers: setup runs before the handler, cleanup runs after the response.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\ndef get_settings():\n    return {"app_name": "LearnAPI"}\n\n@app.get("/info")\ndef info(settings: dict = Depends(get_settings)):\n    return {"app": settings["app_name"]}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-08',
    track: 'fastapi',
    language: 'python',
    name: 'API key auth',
    objective: 'Protect administrative and sensitive endpoints using HTTP header authentication contracts.',
    pattern: `@app.get("/admin")\ndef admin(api_key: str = Header(...)):\n    return {"ok": True, "who": "admin"}`,
    learning: [
      'The `Header(...)` parameter extracts metadata from incoming HTTP request headers.',
      'Under the hood: RFC 7230 specifies header names are case-insensitive; FastAPI normalizes snake_case to kebab-case.',
      'Declared security parameters automatically populate OpenAPI `components.securitySchemes`.',
    ],
    fieldNotes: [
      'Always use constant-time string comparison (`secrets.compare_digest`) for secret tokens to eliminate timing attacks.',
      'Adhere to standard headers: `Authorization: Bearer <token>` or `X-API-Key` rather than custom ad-hoc formats.',
      'Always enforce TLS (HTTPS) upstream so header credentials are never transmitted in cleartext.',
    ],
    hint: 'Declare `api_key: str = Header(...)` in the `@app.get("/admin")` function signature.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI, Header

app = FastAPI(title="Secure API")

@app.get("/public")
def public():
    return {"ok": True}

# TODO: GET /admin requires header api_key: str = Header(...)
`,
    solutionCode: `from fastapi import FastAPI, Header

app = FastAPI(title="Secure API")

@app.get("/public")
def public():
    return {"ok": True}

@app.get("/admin")
def admin(api_key: str = Header(...)):
    return {"ok": True, "who": "admin"}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/public' },
        { method: 'GET', path: '/admin' },
      ],
      calls: [
        { method: 'GET', path: '/public', expectStatus: 200, expectBody: { ok: true } },
        { method: 'GET', path: '/admin', expectStatus: 401 },
        { method: 'GET', path: '/admin', headers: { 'api-key': 'secret' }, expectStatus: 200, expectBody: { who: 'admin' } },
      ],
      codeContains: ['Header(...)'],
      openapiHas: ['components.securitySchemes.apiKeyAuth'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## HTTP Headers & Authentication',
          'HTTP headers transmit request metadata. Protected routes inspect headers like `Authorization` or `X-API-Key`.',
          'Missing mandatory headers reject the request immediately with 401 Unauthorized.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Case-Insensitive Headers',
          'RFC 7230 specifies that HTTP header names are case-insensitive.',
          'FastAPI automatically converts Python parameter `api_key` to match `api-key` or `X-API-Key` in request headers.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\n@app.get("/admin")\ndef admin(api_key: str = Header(...)):\n    return {"ok": True, "who": "admin"}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-09',
    track: 'fastapi',
    language: 'python',
    name: 'Response model',
    objective: 'Filter outbound response payloads and conceal sensitive fields with response_model.',
    pattern: `class UserOut(BaseModel):\n    id: int\n    name: str\n\n@app.get("/users/{user_id}", response_model=UserOut)\ndef get_user(user_id: int):\n    return {"id": user_id, "name": "ada", "hashed_password": "secret"}`,
    learning: [
      'The `response_model` defines the outbound response contract, ensuring data filtering and security.',
      'Under the hood: FastAPI validates and filters the returned object through the schema, stripping unmodeled sensitive fields.',
      'Automatically documents the 200 OK response structure in OpenAPI `paths.{path}.responses.200`.',
    ],
    fieldNotes: [
      'Never return raw ORM database objects directly without an output DTO schema to prevent unintended data leaks.',
      'Separate UserCreate (input), UserUpdate (patch), and UserOut (output) schemas to preserve clear API security boundaries.',
      'Use `response_model_exclude_unset=True` when building sparse responses to reduce network payload sizes.',
    ],
    hint: 'Set `response_model=UserOut` in `@app.get("/users/{user_id}", response_model=UserOut)` and declare `class UserOut(BaseModel)`.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Users API")

class UserOut(BaseModel):
    id: int
    name: str

# TODO: Add response_model=UserOut to GET /users/{user_id}
@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "ada", "hashed_password": "secret"}
`,
    solutionCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Users API")

class UserOut(BaseModel):
    id: int
    name: str

@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int):
    return {"id": user_id, "name": "ada", "hashed_password": "secret"}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/users/{user_id}' }],
      calls: [
        { method: 'GET', path: '/users/42', expectStatus: 200, expectBody: { id: 42, name: 'ada' } },
      ],
      codeContains: ['response_model=UserOut'],
      openapiHas: ['components.schemas.UserOut', 'paths./users/{user_id}.get.responses'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Output Filtering with response_model',
          'Returning internal database rows directly exposes sensitive data like password hashes and internal IDs.',
          'Setting `response_model=UserOut` acts as an automated security boundary, stripping unmodeled attributes.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Serialization Filter',
          'FastAPI passes the returned dict or ORM object through the output Pydantic model.',
          'Only attributes declared in the schema are serialized into JSON; the OpenAPI document records the exact 200 response schema.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\nclass UserOut(BaseModel):\n    id: int\n    name: str\n\n@app.get("/users/{user_id}", response_model=UserOut)\ndef get_user(user_id: int):\n    return {"id": user_id, "name": "ada", "hashed_password": "secret"}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-10',
    track: 'fastapi',
    language: 'python',
    name: 'Pagination & Envelope Pattern',
    objective: 'Implement standard offset pagination and deliver a structured response envelope with metadata.',
    pattern: `@app.get("/products")\ndef list_products(limit: int = 10, offset: int = 0):\n    return {"items": ["item1", "item2"], "total": 100, "limit": limit, "offset": offset}`,
    learning: [
      'Unbounded collections can crash microservices; pagination with limit and offset query parameters bounds database load per RFC 9110.',
      'The envelope pattern nests the resource array under "items" alongside metadata ("total", "limit", "offset") to maintain contract extensibility.',
      'Under the hood: Fast query parameter default bindings provide predictable defaults (limit=10, offset=0) without breaking clients.',
    ],
    fieldNotes: [
      'For massive datasets (millions of rows), consider cursor-based pagination (e.g. keyset pagination) to avoid high SQL OFFSET penalties.',
      'Always enforce a strict maximum ceiling on limit (e.g. max 100) using Pydantic Query(le=100) to prevent denial-of-service abuse.',
      'Standard pagination envelopes enable client SDKs and UI data tables to render paginated pagination bars consistently.',
    ],
    hint: 'Define `@app.get("/products")` with query parameters `limit: int = 10` and `offset: int = 0` returning `{"items": ["item1", "item2"], "total": 100, "limit": limit, "offset": offset}`.',
    golf: 2,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Store API")

# TODO: Define @app.get("/products") with limit: int = 10 and offset: int = 0
# Return {"items": ["item1", "item2"], "total": 100, "limit": limit, "offset": offset}
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Store API")

@app.get("/products")
def list_products(limit: int = 10, offset: int = 0):
    return {"items": ["item1", "item2"], "total": 100, "limit": limit, "offset": offset}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/products' }],
      codeContains: ['@app.get("/products")', 'limit: int = 10', 'offset: int = 0', 'return {"items":'],
      calls: [
        { method: 'GET', path: '/products?limit=5&offset=20', expectStatus: 200, expectBody: { total: 100, limit: 5, offset: 20 } },
        { method: 'GET', path: '/products', expectStatus: 200, expectBody: { total: 100, limit: 10, offset: 0 } },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Pagination & Response Envelopes',
          'APIs must never return unbounded datasets. Query parameters `limit` and `offset` give clients paging control.',
          'Wrapping records inside an envelope `{"items": [...], "total": 100, ...}` preserves contract stability as metadata evolves.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Default Query Values',
          'FastAPI automatically extracts function parameters with defaults as optional query string arguments.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\n@app.get("/products")\ndef list_products(limit: int = 10, offset: int = 0):\n    return {"items": ["item1", "item2"], "total": 100, "limit": limit, "offset": offset}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-11',
    track: 'fastapi',
    language: 'python',
    name: 'Bearer Token Authentication',
    objective: 'Authenticate incoming requests using the HTTP Authorization Bearer token header per RFC 6750.',
    pattern: `@app.get("/profile")\ndef get_profile(authorization: str = Header(...)):\n    if authorization != "Bearer secret-token-123":\n        raise HTTPException(status_code=401, detail="Invalid token")\n    return {"user": "alice", "role": "admin"}`,
    learning: [
      'RFC 6750 defines the Bearer token scheme: clients pass "Authorization: Bearer <token>" to access protected resource servers.',
      'Under the hood: FastAPI extracts the Authorization header, validates token authenticity, and yields authenticated user identity.',
      'If the bearer token is missing, invalid, or forged, the server rejects the request with HTTP 401 Unauthorized.',
    ],
    fieldNotes: [
      'Never transmit Bearer tokens over unencrypted HTTP; always mandate HTTPS (TLS) to prevent packet sniffing.',
      'Sign production bearer tokens using cryptographic asymmetric keys (RS256/ES256) with short expiration lifetimes and refresh tokens.',
      'Avoid exposing sensitive stack traces or internal secret values in 401 Unauthorized detail responses.',
    ],
    hint: 'Define `@app.get("/profile")` with `authorization: str = Header(...)`. If `authorization != "Bearer secret-token-123"`, raise `HTTPException(status_code=401, detail="Invalid token")`, else return `{"user": "alice", "role": "admin"}`.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI, Header, HTTPException

app = FastAPI(title="Secure API")

# TODO: Define @app.get("/profile") with authorization: str = Header(...)
# Verify authorization == "Bearer secret-token-123", else raise 401
`,
    solutionCode: `from fastapi import FastAPI, Header, HTTPException

app = FastAPI(title="Secure API")

@app.get("/profile")
def get_profile(authorization: str = Header(...)):
    if authorization != "Bearer secret-token-123":
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"user": "alice", "role": "admin"}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/profile' }],
      codeContains: ['@app.get("/profile")', 'authorization: str = Header(...)', 'raise HTTPException(status_code=401'],
      openapiHas: ['components.securitySchemes.apiKeyAuth', 'paths./profile.get.security'],
      calls: [
        { method: 'GET', path: '/profile', headers: { authorization: 'Bearer secret-token-123' }, expectStatus: 200, expectBody: { user: 'alice', role: 'admin' } },
        { method: 'GET', path: '/profile', headers: { authorization: 'Bearer wrong-key' }, expectStatus: 401 },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Bearer Token Authentication (RFC 6750)',
          'Modern APIs authenticate calls via `Authorization: Bearer <token>`.',
          'FastAPI inspects the header, and rejections are delivered with RFC-standard **401 Unauthorized**.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Auth Guard',
          'Ellipsis (`Header(...)`) marks the header as mandatory. If absent or invalid, request processing immediately aborts.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\n@app.get("/profile")\ndef get_profile(authorization: str = Header(...)):\n    if authorization != "Bearer secret-token-123":\n        raise HTTPException(status_code=401, detail="Invalid token")\n    return {"user": "alice", "role": "admin"}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-12',
    track: 'fastapi',
    language: 'python',
    name: 'Role-Based Access Control (RBAC) & 403',
    objective: 'Enforce authorization permissions: verify user role and return 403 Forbidden when unauthorized.',
    pattern: `@app.get("/admin/audit")\ndef audit_logs(x_role: str = Header("user", alias="X-Role")):\n    if x_role != "admin":\n        raise HTTPException(status_code=403, detail="Forbidden")\n    return {"audit": "access_granted", "status": "ok"}`,
    learning: [
      'Authentication (AuthN - who you are) is distinct from Authorization (AuthZ - what you can do) per RFC 9110.',
      'HTTP 401 indicates unauthenticated identity; HTTP 403 Forbidden indicates an authenticated identity lacks required privileges.',
      'Under the hood: Role-based guards verify claims before routing requests to privileged administrative handlers.',
    ],
    fieldNotes: [
      'Follow the principle of least privilege: deny access by default and explicitly grant granular scopes or roles.',
      'In multi-tenant SaaS, always verify both tenant organization ownership and user permissions to prevent BOLA vulnerabilities.',
      'Log all 403 Forbidden rejection events in security audit logs to track potential privilege escalation attempts.',
    ],
    hint: 'Define `@app.get("/admin/audit")` with `x_role: str = Header("user", alias="X-Role")`. If `x_role != "admin"`, raise `HTTPException(status_code=403, detail="Forbidden")`, else return `{"audit": "access_granted", "status": "ok"}`.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI, Header, HTTPException

app = FastAPI(title="RBAC API")

# TODO: Define @app.get("/admin/audit") with x_role: str = Header("user", alias="X-Role")
# Require x_role == "admin", else raise 403 Forbidden
`,
    solutionCode: `from fastapi import FastAPI, Header, HTTPException

app = FastAPI(title="RBAC API")

@app.get("/admin/audit")
def audit_logs(x_role: str = Header("user", alias="X-Role")):
    if x_role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return {"audit": "access_granted", "status": "ok"}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/admin/audit' }],
      codeContains: ['@app.get("/admin/audit")', 'alias="X-Role"', 'raise HTTPException(status_code=403'],
      calls: [
        { method: 'GET', path: '/admin/audit', headers: { 'x-role': 'admin' }, expectStatus: 200, expectBody: { audit: 'access_granted', status: 'ok' } },
        { method: 'GET', path: '/admin/audit', headers: { 'x-role': 'user' }, expectStatus: 403 },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Role-Based Access Control (RBAC) & 403 Forbidden',
          'Authentication tells the server *who* you are. Authorization decides *what* you can execute.',
          'When an authenticated caller lacks administrative privileges, the server responds with **403 Forbidden**.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: 401 vs 403',
          '• **401 Unauthorized**: Missing or invalid credentials.\n• **403 Forbidden**: Credentials recognized, but action forbidden.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\n@app.get("/admin/audit")\ndef audit_logs(x_role: str = Header("user", alias="X-Role")):\n    if x_role != "admin":\n        raise HTTPException(status_code=403, detail="Forbidden")\n    return {"audit": "access_granted", "status": "ok"}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-13',
    track: 'fastapi',
    language: 'python',
    name: 'Rate Limiting & 429 Too Many Requests',
    objective: 'Protect API resources from abuse by tracking quotas and responding with 429 Too Many Requests.',
    pattern: `@app.get("/compute")\ndef compute(x_rate_limit: int = Header(10, alias="X-Rate-Limit")):\n    if x_rate_limit <= 0:\n        raise HTTPException(status_code=429, detail="Too Many Requests")\n    return {"result": 42, "remaining": x_rate_limit}`,
    learning: [
      'RFC 6585 defines HTTP 429 Too Many Requests to protect API backends from denial of service and runaway loops.',
      'Rate limits are tracked by client IP or API key using token bucket or sliding window algorithms in memory or Redis.',
      'Production APIs return rate-limit telemetry headers (e.g. X-Rate-Limit-Limit, X-Rate-Limit-Remaining, Retry-After).',
    ],
    fieldNotes: [
      'Apply tiered rate limits: anonymous public traffic receives conservative limits while authenticated enterprise tiers receive higher throughput.',
      'Always include Retry-After header with 429 responses so client SDKs can implement exponential backoff cleanly.',
      'Place rate-limiting middleware at the API Gateway or reverse proxy level (Nginx/Envoy/Cloudflare) to absorb attacks before they reach ASGI workers.',
    ],
    hint: 'Define `@app.get("/compute")` with `x_rate_limit: int = Header(10, alias="X-Rate-Limit")`. If `x_rate_limit <= 0`, raise `HTTPException(status_code=429, detail="Too Many Requests")`, else return `{"result": 42, "remaining": x_rate_limit}`.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI, Header, HTTPException

app = FastAPI(title="Rate Limit API")

# TODO: Define @app.get("/compute") with x_rate_limit: int = Header(10, alias="X-Rate-Limit")
# If x_rate_limit <= 0, raise 429 Too Many Requests
`,
    solutionCode: `from fastapi import FastAPI, Header, HTTPException

app = FastAPI(title="Rate Limit API")

@app.get("/compute")
def compute(x_rate_limit: int = Header(10, alias="X-Rate-Limit")):
    if x_rate_limit <= 0:
        raise HTTPException(status_code=429, detail="Too Many Requests")
    return {"result": 42, "remaining": x_rate_limit}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/compute' }],
      codeContains: ['@app.get("/compute")', 'alias="X-Rate-Limit"', 'raise HTTPException(status_code=429'],
      calls: [
        { method: 'GET', path: '/compute', headers: { 'x-rate-limit': '5' }, expectStatus: 200, expectBody: { result: 42, remaining: 5 } },
        { method: 'GET', path: '/compute', headers: { 'x-rate-limit': '0' }, expectStatus: 429 },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Rate Limiting & HTTP 429',
          'RFC 6585 defines **429 Too Many Requests** to protect systems against denial-of-service and runaway loops.',
          'Clients exceeding request quotas are blocked until quota replenishment.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Telemetry Headers',
          'Production APIs inject `X-Rate-Limit` and `Retry-After` headers to communicate quota replenishment timings to client SDKs.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\n@app.get("/compute")\ndef compute(x_rate_limit: int = Header(10, alias="X-Rate-Limit")):\n    if x_rate_limit <= 0:\n        raise HTTPException(status_code=429, detail="Too Many Requests")\n    return {"result": 42, "remaining": x_rate_limit}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-14',
    track: 'fastapi',
    language: 'python',
    name: 'Field Validation & Constraints',
    objective: 'Enforce strict schema constraints using Pydantic Field specifications (min_length, gt) on incoming models.',
    pattern: `class Product(BaseModel):\n    name: str = Field(..., min_length=2)\n    price: float = Field(gt=0)\n    tag: str = "general"\n\n@app.post("/products", status_code=201)\ndef create_product(product: Product):\n    return {"name": product.name, "price": product.price, "tag": product.tag}`,
    learning: [
      'Pydantic Field(...) declares granular schema constraints (min_length, max_length, gt, lt) directly on model attributes.',
      'Under the hood: FastAPI compiles Field rules into OpenAPI schema constraints and produces RFC 7807 422 errors on invalid data.',
      'An ellipsis (...) as the first argument indicates that the attribute is required despite explicit constraint settings.',
    ],
    fieldNotes: [
      'Enforce positive numeric limits (gt=0) at the API boundary to prevent corrupt prices or inventory counts.',
      'Field constraints populate OpenAPI metadata, ensuring auto-generated TypeScript and SDK clients enforce identical bounds.',
      'Combine min_length and regex validation to sanitize and format SKUs, slugs, and usernames.',
    ],
    hint: 'Define `class Product(BaseModel)` with `name: str = Field(..., min_length=2)`, `price: float = Field(gt=0)`, and `tag: str = "general"`, then handle POST /products returning status 201.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Catalog API")

# TODO: Define class Product(BaseModel) with:
#   name: str with Field(..., min_length=2)
#   price: float with Field(gt=0)
#   tag: str = "general"

# TODO: Define @app.post("/products", status_code=201)
#   accepting product: Product and returning {"name": product.name, "price": product.price, "tag": product.tag}
`,
    solutionCode: `from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Catalog API")

class Product(BaseModel):
    name: str = Field(..., min_length=2)
    price: float = Field(gt=0)
    tag: str = "general"

@app.post("/products", status_code=201)
def create_product(product: Product):
    return {"name": product.name, "price": product.price, "tag": product.tag}
`,
    goal: {
      endpoints: [{ method: 'POST', path: '/products', status: 201 }],
      codeContains: ['Field(', 'min_length=', 'gt='],
      calls: [
        {
          method: 'POST',
          path: '/products',
          body: { name: 'Keyboard', price: 79.99, tag: 'hardware' },
          expectStatus: 201,
          expectBody: { name: 'Keyboard', price: 79.99, tag: 'hardware' },
        },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Schema Constraints with Pydantic Field',
          'Basic type annotations verify types, but robust APIs require granular domain constraints like string lengths and positive numerical values.',
          'Pydantic `Field(...)` equips attributes with boundary rules before handler code executes.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: OpenAPI & Validation Pipeline',
          'FastAPI automatically extracts `min_length` and `gt` constraints into the OpenAPI JSON Schema.',
          'Clients sending invalid values immediately receive HTTP 422 Unprocessable Entity with detailed violation pointers.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\nclass Product(BaseModel):\n    name: str = Field(..., min_length=2)\n    price: float = Field(gt=0)\n    tag: str = "general"\n\n@app.post("/products", status_code=201)\ndef create_product(product: Product):\n    return {"name": product.name, "price": product.price, "tag": product.tag}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-15',
    track: 'fastapi',
    language: 'python',
    name: 'Partial Updates: PUT vs PATCH',
    objective: 'Implement RFC 5789 partial resource modification with HTTP PATCH and dedicated partial models.',
    pattern: `class ItemPatch(BaseModel):\n    title: str = "patched_title"\n\n@app.patch("/items/{item_id}")\ndef patch_item(item_id: int, item: ItemPatch):\n    return {"id": item_id, "title": item.title, "mode": "partial"}`,
    learning: [
      'RFC 9110 PUT replaces an entire resource; RFC 5789 PATCH applies delta updates to modified fields.',
      'Under the hood: PATCH handlers update only fields explicitly supplied in the request body, preventing accidental clobbering.',
      'Using PATCH reduces payload sizes and minimizes concurrency hazards in high-throughput collaborative systems.',
    ],
    fieldNotes: [
      'Strictly separate full replacements (PUT) from delta mutations (PATCH) to maintain standard REST semantics.',
      'In production, use Optional attributes with default None and model_dump(exclude_unset=True) to merge updates.',
      'Protect read-only attributes (e.g., createdAt, id) by excluding them from PATCH input models entirely.',
    ],
    hint: 'Define `class ItemPatch(BaseModel)` with `title: str = "patched_title"`, then write `@app.patch("/items/{item_id}")` returning `{"id": item_id, "title": item.title, "mode": "partial"}`.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Inventory API")

# TODO: Define class ItemPatch(BaseModel) with title: str = "patched_title"
# TODO: Define @app.patch("/items/{item_id}")
#   accepting item_id: int, item: ItemPatch
#   returning {"id": item_id, "title": item.title, "mode": "partial"}
`,
    solutionCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Inventory API")

class ItemPatch(BaseModel):
    title: str = "patched_title"

@app.patch("/items/{item_id}")
def patch_item(item_id: int, item: ItemPatch):
    return {"id": item_id, "title": item.title, "mode": "partial"}
`,
    goal: {
      endpoints: [{ method: 'PATCH', path: '/items/{item_id}', status: 200 }],
      codeContains: ['@app.patch("/items/{item_id}")', 'class ItemPatch(BaseModel):'],
      calls: [
        {
          method: 'PATCH',
          path: '/items/42',
          body: { title: 'desk' },
          expectStatus: 200,
          expectBody: { id: 42, title: 'desk', mode: 'partial' },
        },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Partial Resource Modification with HTTP PATCH',
          'While PUT completely overwrites an entire entity, HTTP PATCH (RFC 5789) updates only the specific fields provided by the caller.',
          'This prevents race conditions where a client unintentionally resets fields it did not intend to touch.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Delta Modification Mechanics',
          'In production systems, handlers inspect received attributes and selectively update database columns.',
          'FastAPI supports PATCH routes using the dedicated `@app.patch` decorator.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\nclass ItemPatch(BaseModel):\n    title: str = "patched_title"\n\n@app.patch("/items/{item_id}")\ndef patch_item(item_id: int, item: ItemPatch):\n    return {"id": item_id, "title": item.title, "mode": "partial"}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-16',
    track: 'fastapi',
    language: 'python',
    name: 'Reusable Auth Guards with Depends',
    objective: 'Enforce decoupled authentication pipelines using reusable dependency functions and Header extraction.',
    pattern: `def get_current_user(token: str = Header(..., alias="Authorization")):\n    if token != "Bearer secret-123":\n        raise HTTPException(status_code=401, detail="Unauthorized")\n    return {"username": "alice", "role": "admin"}\n\n@app.get("/me")\ndef read_me(current_user: dict = Depends(get_current_user)):`,
    learning: [
      'FastAPI Depends injection decouples security logic, token extraction, and permission checks from route handlers.',
      'Under the hood: When a request arrives, dependency functions execute first; if an exception is raised, execution aborts before reaching the handler.',
      'Dependency return values are automatically passed into route handler parameters as strongly-typed objects.',
    ],
    fieldNotes: [
      'Centralize authentication, token parsing, and role verification in reusable dependencies across all endpoints.',
      'Using Depends makes unit testing straightforward: swap auth providers in tests using app.dependency_overrides.',
      'Avoid duplicate authorization checks inside route handlers; security belongs in centralized dependency guards.',
    ],
    hint: 'Write `def get_current_user(token: str = Header(..., alias="Authorization"))` verifying "Bearer secret-123", then inject it into `@app.get("/me")` with `Depends(get_current_user)`.',
    golf: 4,
    editorLabel: 'auth.py',
    startCode: `from fastapi import FastAPI, Depends, Header, HTTPException

app = FastAPI(title="Security API")

# TODO: Define def get_current_user(token: str = Header(..., alias="Authorization")):
#   if token != "Bearer secret-123":
#       raise HTTPException(status_code=401, detail="Unauthorized")
#   return {"username": "alice", "role": "admin"}

# TODO: Define @app.get("/me")
#   accepting current_user: dict = Depends(get_current_user)
#   returning {"user": current_user.username, "role": current_user.role}
`,
    solutionCode: `from fastapi import FastAPI, Depends, Header, HTTPException

app = FastAPI(title="Security API")

def get_current_user(token: str = Header(..., alias="Authorization")):
    if token != "Bearer secret-123":
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"username": "alice", "role": "admin"}

@app.get("/me")
def read_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user.username, "role": current_user.role}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/me', status: 200 }],
      codeContains: ['def get_current_user', 'Depends(get_current_user)', 'alias="Authorization"'],
      calls: [
        {
          method: 'GET',
          path: '/me',
          headers: { authorization: 'Bearer secret-123' },
          expectStatus: 200,
          expectBody: { user: 'alice', role: 'admin' },
        },
        {
          method: 'GET',
          path: '/me',
          headers: { authorization: 'Bearer wrong' },
          expectStatus: 401,
        },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Decoupled Security Guards with Depends',
          'Embedding authorization checks inside every route handler creates boilerplate and security anti-patterns.',
          'Using FastAPI `Depends(get_current_user)` isolates authentication into reusable, composable security guards.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Dependency Execution Order',
          'FastAPI evaluates the dependency graph before calling the route function.',
          'If the dependency raises an `HTTPException`, the framework immediately halts and sends the error response, protecting downstream code.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\ndef get_current_user(token: str = Header(..., alias="Authorization")):\n    if token != "Bearer secret-123":\n        raise HTTPException(status_code=401, detail="Unauthorized")\n    return {"username": "alice", "role": "admin"}\n\n@app.get("/me")\ndef read_me(current_user: dict = Depends(get_current_user)):\n    return {"user": current_user.username, "role": current_user.role}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-17',
    track: 'fastapi',
    language: 'python',
    name: 'Modular Architecture with APIRouter',
    objective: 'Decompose monolithic APIs into modular sub-routers with path prefixes and OpenAPI tags.',
    pattern: `router = APIRouter(prefix="/users", tags=["users"])\n@router.get("/")\napp.include_router(router)`,
    learning: [
      'APIRouter structures large backends into isolated domain modules (users, orders, billing) rather than a giant server file.',
      'Under the hood: app.include_router registers sub-router routes, prepending path prefixes and attaching OpenAPI tags.',
      'Modular routers promote team ownership, clean separation of concerns, and clean Swagger documentation groupings.',
    ],
    fieldNotes: [
      'Organize each domain in its own submodule (e.g. routers/users.py) and export its APIRouter instance.',
      'Sub-routers can define router-level dependencies that apply automatically across all attached endpoints.',
      'Never duplicate route prefixes in individual route decorators; configure prefix once at the router declaration.',
    ],
    hint: 'Define `router = APIRouter(prefix="/users", tags=["users"])`, declare `@router.get("/")` and `@router.get("/{user_id}")`, and call `app.include_router(router)`.',
    golf: 4,
    editorLabel: 'routers.py',
    startCode: `from fastapi import FastAPI, APIRouter

app = FastAPI(title="Modular API")

# TODO: Define router = APIRouter(prefix="/users", tags=["users"])
# TODO: Define @router.get("/") returning {"users": ["alice", "bob"]}
# TODO: Define @router.get("/{user_id}") accepting user_id: int returning {"id": user_id, "name": "alice"}
# TODO: Call app.include_router(router)
`,
    solutionCode: `from fastapi import FastAPI, APIRouter

app = FastAPI(title="Modular API")
router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
def list_users():
    return {"users": ["alice", "bob"]}

@router.get("/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "alice"}

app.include_router(router)
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/users', status: 200 },
        { method: 'GET', path: '/users/{user_id}', status: 200 },
      ],
      codeContains: [
        'APIRouter(prefix="/users"',
        'app.include_router(router)',
        '@router.get("/")',
        '@router.get("/{user_id}")',
      ],
      calls: [
        {
          method: 'GET',
          path: '/users',
          expectStatus: 200,
          expectBody: { users: ['alice', 'bob'] },
        },
        {
          method: 'GET',
          path: '/users/42',
          expectStatus: 200,
          expectBody: { id: 42, name: 'alice' },
        },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Modular API Architectures with APIRouter',
          'Monolithic single-file APIs quickly become unmaintainable as endpoints grow.',
          '`APIRouter` enables modular splitting of endpoints into dedicated domain files with shared prefixes and tags.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Prefix Merging & Swagger Tagging',
          'When calling `app.include_router(router)`, the root application merges the sub-router route tree.',
          'All routes gain the configured prefix (e.g., `/users`) and appear grouped under the specified tag in Swagger UI.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\nrouter = APIRouter(prefix="/users", tags=["users"])\n\n@router.get("/")\ndef list_users():\n    return {"users": ["alice", "bob"]}\n\n@router.get("/{user_id}")\ndef get_user(user_id: int):\n    return {"id": user_id, "name": "alice"}\n\napp.include_router(router)\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'fastapi-18',
    track: 'fastapi',
    language: 'python',
    name: 'CORS & Cross-Origin Middleware',
    objective: 'Configure CORSMiddleware to allow safe browser client cross-origin requests and preflight options.',
    pattern: `app.add_middleware(\n    CORSMiddleware,\n    allow_origins=["*"],\n    allow_methods=["*"],\n    allow_headers=["*"],\n)`,
    learning: [
      'Browsers enforce the Same-Origin Policy (SOP); web apps on external domains cannot fetch API resources without CORS headers.',
      'Under the hood: CORSMiddleware intercepts requests, handles preflight OPTIONS checks, and injects Access-Control-Allow-* headers.',
      'Production APIs restrict allow_origins to trusted client domain names rather than wildcard ("*") when handling credentials.',
    ],
    fieldNotes: [
      'Preflight checks use the HTTP OPTIONS method to verify server acceptance before state-changing mutations execute.',
      'When credentials (cookies/auth headers) are sent, browsers disallow wildcard "*" origins for security.',
      'Place CORSMiddleware at the outermost layer of your application pipeline so preflight OPTIONS requests succeed instantly.',
    ],
    hint: 'Add `CORSMiddleware` using `app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])` and define `@app.get("/data")`.',
    golf: 3,
    editorLabel: 'server.py',
    startCode: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Cross-Origin API")

# TODO: Call app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# TODO: Define @app.get("/data") returning {"cors": "enabled"}
`,
    solutionCode: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Cross-Origin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/data")
def get_data():
    return {"cors": "enabled"}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/data', status: 200 }],
      codeContains: ['CORSMiddleware', 'app.add_middleware', 'allow_origins='],
      calls: [
        {
          method: 'OPTIONS',
          path: '/data',
          expectStatus: 200,
        },
        {
          method: 'GET',
          path: '/data',
          expectStatus: 200,
          expectBody: { cors: 'enabled' },
        },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Cross-Origin Resource Sharing (CORS)',
          'When modern frontend apps (React, Vue, mobile web) run on a different origin than the API, web browsers block network requests by default.',
          'CORS headers inform the browser that cross-origin communication is permitted.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Preflight OPTIONS Requests',
          'Browsers send an initial preflight `OPTIONS` request before complex requests (POST with JSON, custom headers).',
          '`CORSMiddleware` answers preflight requests and appends `Access-Control-Allow-Origin` headers to all responses.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=["*"],\n    allow_methods=["*"],\n    allow_headers=["*"],\n)\n\n@app.get("/data")\ndef get_data():\n    return {"cors": "enabled"}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },

  // ── plumber (R) ───────────────────────────────────────
  {
    id: 'plumber-01',
    track: 'plumber',
    language: 'r',
    name: 'Plumber hello',
    objective: 'Create an HTTP endpoint in R using roxygen2 comment annotations.',
    pattern: `#* @get /\nfunction() {\n  list(hello = "world")\n}`,
    learning: [
      'Plumber parses special roxygen2-style comments (`#* @get /`) to bind R functions to HTTP routes.',
      'Under the hood: Plumber builds a router object that wraps R closures and evaluates them inside dedicated environments.',
      'Output serialization: R lists are serialized into JSON via `jsonlite::toJSON(auto_unbox = TRUE)`.',
    ],
    fieldNotes: [
      'R is single-threaded; long-running computations block the entire server process unless offloaded to asynchronous workers.',
      'Explicitly structure output as named lists (`list(key = value)`) to guarantee standard JSON key-value objects.',
      'Deploy containerized Plumber APIs in Docker behind a load balancer for horizontal scaling.',
    ],
    hint: 'Write `#* @get /` above `function() { list(hello = "world") }`.',
    golf: 2,
    editorLabel: 'entrypoint.R',
    startCode: `library(plumber)

#* @apiTitle Hello API

# TODO: Add #* @get /
function() {
  list(hello = "world")
}
`,
    solutionCode: `library(plumber)

#* @apiTitle Hello API
#* @get /
#* @serializer json
function() {
  list(hello = "world")
}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/' }],
      calls: [{ method: 'GET', path: '/', expectStatus: 200, expectBody: { hello: 'world' } }],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Web APIs in R with Plumber',
          'In statistical and data science workflows, R models can be published as HTTP microservices using the **plumber** package.',
          'Routes are declared using special comment tags: `#* @get /`.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Plumber Router & jsonlite',
          'Plumber parses roxygen-style comments and compiles a `PlumberRouter` object.',
          'Named R lists (`list(key = value)`) are converted into JSON objects using `jsonlite`.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```r\n#* @get /\nfunction() {\n  list(hello = "world")\n}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'plumber-02',
    track: 'plumber',
    language: 'r',
    name: 'Plumber path parameters',
    objective: 'Extract dynamic path segments in R using `<id>` angle brackets and type coercion.',
    pattern: `#* @get /users/<id>\n#* @param id:int\nfunction(id) {\n  list(id = as.integer(id), name = "ada")\n}`,
    learning: [
      'Plumber uses angle brackets `<id>` to define dynamic path segments in route comments.',
      'Under the hood: Path segments arrive as character strings; `#* @param id:int` declares the expected type.',
      'Using `as.integer(id)` guarantees JSON serialization outputs numeric literals (`42`) rather than strings.',
    ],
    fieldNotes: [
      'Validate path parameters early and throw informative errors with `res$status <- 400` if parsing fails.',
      'Prevent SQL injection: never concatenate raw path strings into database queries; use parameterized queries.',
      'The `<id>` syntax in Plumber and `{id}` in FastAPI map to the exact same HTTP path parameter semantics.',
    ],
    hint: 'Use `#* @get /users/<id>` and `#* @param id:int`, then convert with `as.integer(id)` in the function body.',
    golf: 3,
    editorLabel: 'entrypoint.R',
    startCode: `library(plumber)

#* @apiTitle Users API

#* @get /users
function() {
  list(users = list())
}

# TODO: Add #* @get /users/<id>
# TODO: Add #* @param id:int
function(id) {
  list(id = as.integer(id), name = "ada")
}
`,
    solutionCode: `library(plumber)

#* @apiTitle Users API
#* @get /users
function() {
  list(users = list())
}

#* @get /users/<id>
#* @param id:int
function(id) {
  list(id = as.integer(id), name = "ada")
}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/users' },
        { method: 'GET', path: '/users/{id}' },
      ],
      calls: [{ method: 'GET', path: '/users/7', expectStatus: 200, expectBody: { id: 7 } }],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Path Parameters in Plumber',
          'Angle brackets declare path variables: `#* @get /users/<id>` matches `/users/7`.',
          'The `#* @param id:int` tag informs Plumber of the parameter type.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Type Handling in R',
          'In R, URL segments arrive as strings. Calling `as.integer(id)` ensures JSON serialization produces a numeric value rather than `"7"`.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```r\n#* @get /users/<id>\n#* @param id:int\nfunction(id) {\n  list(id = as.integer(id), name = "ada")\n}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'plumber-03',
    track: 'plumber',
    language: 'r',
    name: 'Plumber POST JSON',
    objective: 'Process inbound POST JSON payloads from req and configure status codes via res.',
    pattern: `#* @post /users\n#* @status 201\n#* @serializer json\nfunction(req) {\n  body <- jsonlite::fromJSON(req$postBody)\n  list(id = 1, name = body$name)\n}`,
    learning: [
      'Plumber provides request and response lifecycle control through special arguments `req` and `res`.',
      'Under the hood: Inbound JSON payloads are parsed and made available via `req$postBody`.',
      'Response control: Status codes are set explicitly via `#* @status 201`, and `#* @serializer json` controls serialization.',
    ],
    fieldNotes: [
      'Inspect `req$postBody` schema rigorously; R lists do not enforce static typing without validation libraries.',
      'Always set explicit HTTP status codes on mutation endpoints (201 Created on POST, 204 on DELETE).',
      'Configure body size limits at the reverse proxy (Nginx `client_max_body_size`) to prevent memory exhaustion.',
    ],
    hint: 'Add `#* @post /users` and `#* @status 201`, then read `body <- jsonlite::fromJSON(req$postBody)`.',
    golf: 3,
    editorLabel: 'entrypoint.R',
    startCode: `library(plumber)

#* @apiTitle Users API

# TODO: Add #* @post /users
# TODO: Add #* @status 201
# TODO: Add #* @serializer json
function(req) {
  # Read req$postBody with jsonlite::fromJSON
}
`,
    solutionCode: `library(plumber)

#* @apiTitle Users API
#* @post /users
#* @status 201
#* @serializer json
function(req) {
  body <- jsonlite::fromJSON(req$postBody)
  list(id = 1, name = body$name)
}
`,
    goal: {
      endpoints: [{ method: 'POST', path: '/users', status: 201 }],
      calls: [{ method: 'POST', path: '/users', body: { name: 'ada' }, expectStatus: 201, expectBody: { name: 'ada' } }],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Request & Response Objects in Plumber',
          'Plumber passes special `req` and `res` objects when included in the function signature.',
          'The body is parsed in `req$postBody`, and status codes are set with `res$status <- 201`.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Serializers',
          'The `#* @serializer json` tag explicitly declares that the returned R object should be serialized to standard JSON.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```r\n#* @post /users\n#* @serializer json\nfunction(req, res) {\n  res$status <- 201\n  list(id = 1, name = req$postBody$name)\n}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'plumber-04',
    track: 'plumber',
    language: 'r',
    name: 'Plumber Filters & Pipeline Hooks',
    objective: 'Intercept requests with Plumber filters (#* @filter) in R to build logging and cross-cutting middleware.',
    pattern: `#* @filter logger\nfunction(req) {\n  forward()\n}\n\n#* @get /data\n#* @serializer json\nfunction() {\n  list(status = "ok", processed = TRUE)\n}`,
    learning: [
      'Plumber filters declared with `#* @filter` intercept incoming HTTP requests before endpoint handlers run.',
      'Under the hood: Filters invoke `forward()` to pass request context down the pipeline to subsequent filters and route handlers.',
      'Filters enable cross-cutting concerns in R APIs such as request timing, CORS headers, authentication gates, and structured logging.',
    ],
    fieldNotes: [
      'Keep Plumber filters fast and non-blocking to prevent clogging the single-threaded R execution event loop.',
      'Use filters to attach global metadata (e.g. correlation IDs or timestamps) onto the request object for downstream analytics.',
      'In production R, pair Plumber filters with proper error-handling hooks (`pr_set_error`) to prevent raw R error trace leakage.',
    ],
    hint: 'Define `#* @filter logger` with `function(req) { forward() }` followed by `#* @get /data` returning `list(status = "ok", processed = TRUE)`.',
    golf: 4,
    editorLabel: 'entrypoint.R',
    startCode: `library(plumber)

#* @apiTitle Production Plumber API

# TODO: Add #* @filter logger with function(req) { forward() }
# TODO: Add #* @get /data with #* @serializer json returning list(status = "ok", processed = TRUE)
`,
    solutionCode: `library(plumber)

#* @apiTitle Production Plumber API

#* @filter logger
function(req) {
  forward()
}

#* @get /data
#* @serializer json
function() {
  list(status = "ok", processed = TRUE)
}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/data' }],
      codeContains: ['#* @filter logger', 'forward()', '#* @get /data', '#* @serializer json'],
      calls: [
        { method: 'GET', path: '/data', expectStatus: 200, expectBody: { status: 'ok', processed: true } },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Plumber Filters & Middleware in R',
          'Filters declared with `#* @filter` intercept requests before route handlers execute.',
          'Calling `forward()` hands control down the processing chain to subsequent filters and endpoints.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Pipeline Interception',
          'Filters are the ideal vehicle for authentication guards, timing metrics, and CORS header injection in R services.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```r\n#* @filter logger\nfunction(req) {\n  forward()\n}\n\n#* @get /data\n#* @serializer json\nfunction() {\n  list(status = "ok", processed = TRUE)\n}\n```',
        ],
      },
    ],
  },
  {
    id: 'plumber-05',
    track: 'plumber',
    language: 'r',
    name: 'Model Serving & Prediction',
    objective: 'Expose statistical and machine learning model scoring endpoints via Plumber POST handler.',
    pattern: `#* @post /predict\n#* @serializer json\nfunction(req) {\n  list(prediction = 85.5, status = "scored")\n}`,
    learning: [
      'Plumber turns R statistical models (tidymodels, glm, randomForest) into production microservices for scoring.',
      'Under the hood: Prediction endpoints accept feature payloads via POST, pass them to predict(), and serialize numeric output.',
      'The @serializer json annotation ensures predictions return as standard JSON numeric primitives instead of R vectors.',
    ],
    fieldNotes: [
      'Load trained model artifacts (readRDS("model.rds")) once at script startup rather than inside each request handler.',
      'Validate input features against expected types and schemas before feeding them to model matrices to prevent runtime crashes.',
      'Use batch scoring where feasible: accepting an array of feature rows amortizes inference overhead across requests.',
    ],
    hint: 'Annotate with `#* @post /predict` and `#* @serializer json`, then return `list(prediction = 85.5, status = "scored")`.',
    golf: 3,
    editorLabel: 'model_api.R',
    startCode: `library(plumber)

#* @apiTitle ML Scoring Service

# TODO: Define #* @post /predict
# TODO: Define #* @serializer json
# TODO: Define function(req) returning list(prediction = 85.5, status = "scored")
`,
    solutionCode: `library(plumber)

#* @apiTitle ML Scoring Service

#* @post /predict
#* @serializer json
function(req) {
  list(prediction = 85.5, status = "scored")
}
`,
    goal: {
      endpoints: [{ method: 'POST', path: '/predict', status: 200 }],
      codeContains: ['#* @post /predict', '#* @serializer json', 'list(prediction = 85.5'],
      calls: [
        {
          method: 'POST',
          path: '/predict',
          expectStatus: 200,
          expectBody: { prediction: 85.5, status: 'scored' },
        },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Model Serving & Predictions in R',
          'R excels at statistical modeling and machine learning. Plumber transforms trained models into production scoring APIs.',
          'Scoring endpoints typically use HTTP POST to receive feature sets in the request body.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Serialization & Model Lifecycle',
          'Trained model weights remain resident in process memory for microsecond scoring.',
          'The `#* @serializer json` tag directs Plumber to convert native R output into standard JSON.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```r\n#* @post /predict\n#* @serializer json\nfunction(req) {\n  list(prediction = 85.5, status = "scored")\n}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },

  // ── OpenAPI ───────────────────────────────────────────
  {
    id: 'openapi-01',
    track: 'openapi',
    language: 'python',
    name: 'OpenAPI metadata',
    objective: 'Enrich machine-readable OpenAPI 3.0 contracts with operation tags and summaries.',
    pattern: `@app.get("/pets", tags=["pets"], summary="List pets")\ndef list_pets(): ...\n\n@app.post("/pets", status_code=201, tags=["pets"], summary="Create pet")\ndef create_pet(): ...`,
    learning: [
      'OpenAPI 3.0 provides a machine-readable JSON specification documenting the entire API surface.',
      'Under the hood: FastAPI compiles decorator metadata (`tags`, `summary`, `description`) into the OpenAPI root schema.',
      'Swagger UI and Redoc dynamically consume this document to deliver interactive documentation portals.',
    ],
    fieldNotes: [
      'Organize large microservice APIs with meaningful tags to group endpoints into logical domain resources.',
      'Use concise summaries and comprehensive docstrings to provide clear documentation for developers.',
      'Integrate OpenAPI schema validation into CI/CD pipelines to catch breaking contract changes before deployment.',
    ],
    hint: 'Add `tags=["pets"]` and `summary="..."` to both `@app.get("/pets")` and `@app.post("/pets")`.',
    golf: 2,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Petstore", version="1.0.0")

# TODO: Add tags=["pets"] and summary="List pets"
@app.get("/pets")
def list_pets():
    return [{"name": "fido"}]

# TODO: Add tags=["pets"] and summary="Create pet"
@app.post("/pets", status_code=201)
def create_pet():
    return {"name": "fido"}
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Petstore", version="1.0.0")

@app.get("/pets", tags=["pets"], summary="List pets")
def list_pets():
    return [{"name": "fido"}]

@app.post("/pets", status_code=201, tags=["pets"], summary="Create pet")
def create_pet():
    return {"name": "fido"}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/pets' },
        { method: 'POST', path: '/pets', status: 201 },
      ],
      codeContains: ['tags=["pets"]', 'summary='],
      openapiHas: ['paths./pets.get', 'paths./pets.post', 'info.title'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## OpenAPI 3.0 Specifications',
          'OpenAPI (formerly Swagger) is the standard schema language for describing REST APIs.',
          'Metadata tags organize endpoints, and summaries provide clear human-readable operation labels in Swagger UI.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Dynamic Schema Compilation',
          'FastAPI automatically reads decorator arguments (`tags`, `summary`) and compiles them into `/openapi.json`.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\n@app.get("/pets", tags=["pets"], summary="List pets")\ndef list_pets():\n    return [{"name": "fido"}]\n\n@app.post("/pets", status_code=201, tags=["pets"], summary="Create pet")\ndef create_pet():\n    return {"name": "fido"}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'openapi-02',
    track: 'openapi',
    language: 'python',
    name: 'OpenAPI request schema',
    objective: 'Publish Pydantic models as reusable JSON Schemas in components.schemas.',
    pattern: `class Item(BaseModel):\n    name: str\n\n@app.post("/items", status_code=201)\ndef create_item(item: Item):\n    return {"name": item.name}`,
    learning: [
      'Request schemas defined via Pydantic are automatically compiled into OpenAPI `components.schemas`.',
      'Under the hood: The route operation references the schema via `$ref: "#/components/schemas/Item"` in `requestBody`.',
      'Contract-first design: This schema guarantees frontend and backend teams stay synchronized on exact payload structures.',
    ],
    fieldNotes: [
      'Use automated code generation tools (OpenAPI Generator, Orval) to generate TypeScript interfaces directly from this schema.',
      'Enforce backward compatibility: never remove or rename existing fields in published schemas; deprecate them gradually.',
      'Provide example payloads in Pydantic schema configurations (`json_schema_extra`) to enhance API documentation.',
    ],
    hint: 'Define `class Item(BaseModel):` with field `name: str`, and accept `item: Item` in `@app.post("/items")`.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Store")

# TODO: Define Item(BaseModel) with name: str
# TODO: POST /items status 201 with item: Item
`,
    solutionCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Store")

class Item(BaseModel):
    name: str

@app.post("/items", status_code=201)
def create_item(item: Item):
    return {"name": item.name}
`,
    goal: {
      endpoints: [{ method: 'POST', path: '/items', status: 201 }],
      codeContains: ['class Item(BaseModel):'],
      openapiHas: ['components.schemas.Item', 'paths./items.post.requestBody'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Schema Reusability in OpenAPI',
          'Instead of defining parameters inline, OpenAPI centralizes data shapes in `components.schemas`.',
          'Endpoints reference these definitions using `$ref: "#/components/schemas/Item"`.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Contract-First Architecture',
          'Pydantic models compile directly into standard JSON Schema representations.',
          'Frontend teams can generate TypeScript types and client SDKs directly from this contract.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\nclass Item(BaseModel):\n    name: str\n\n@app.post("/items", status_code=201)\ndef create_item(item: Item):\n    return {"name": item.name}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'openapi-03',
    track: 'openapi',
    language: 'python',
    name: 'OpenAPI Error Response Contracts',
    objective: 'Document error response contracts in OpenAPI documentation using explicit HTTPException rules.',
    pattern: `@app.get("/orders/{order_id}")\ndef get_order(order_id: int):\n    if order_id == 0:\n        raise HTTPException(status_code=404, detail="Order not found")\n    return {"order_id": order_id, "status": "shipped"}`,
    learning: [
      'A complete OpenAPI contract documents not only 200 OK successes, but also client error codes (e.g. 404 Not Found, 400 Bad Request).',
      'FastAPI inspects handler exceptions and status codes, documenting them in the OpenAPI components and paths responses map.',
      'Comprehensive OpenAPI contracts enable client SDK generators and contract testers (e.g. Schemathesis) to validate edge cases.',
    ],
    fieldNotes: [
      'Document standard error schemas across all microservices conforming to RFC 7807 (Problem Details for HTTP APIs).',
      'Use contract testing tools in CI/CD pipelines to ensure actual API responses match the published OpenAPI error contracts.',
      'Explicit error documentation reduces developer support tickets and accelerates third-party integration.',
    ],
    hint: 'Define `@app.get("/orders/{order_id}")` with `order_id: int`. If `order_id == 0`, raise `HTTPException(status_code=404, detail="Order not found")`, else return `{"order_id": order_id, "status": "shipped"}`.',
    golf: 3,
    editorLabel: 'server.py',
    startCode: `from fastapi import FastAPI, HTTPException

app = FastAPI(title="Store API")

# TODO: Define @app.get("/orders/{order_id}") with order_id: int
# If order_id == 0, raise 404 HTTPException, else return {"order_id": order_id, "status": "shipped"}
`,
    solutionCode: `from fastapi import FastAPI, HTTPException

app = FastAPI(title="Store API")

@app.get("/orders/{order_id}")
def get_order(order_id: int):
    if order_id == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"order_id": order_id, "status": "shipped"}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/orders/{order_id}' }],
      codeContains: ['@app.get("/orders/{order_id}")', 'order_id: int', 'raise HTTPException(status_code=404'],
      openapiHas: ['paths./orders/{order_id}.get.responses.404', 'paths./orders/{order_id}.get.parameters'],
      calls: [
        { method: 'GET', path: '/orders/12', expectStatus: 200, expectBody: { order_id: 12, status: 'shipped' } },
        { method: 'GET', path: '/orders/0', expectStatus: 404 },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Error Response Contracts in OpenAPI',
          'Production-grade OpenAPI specifications must document potential error states (e.g. 404 Not Found) alongside successful 200 OK responses.',
          'FastAPI automatically reflects `HTTPException` error codes in the `responses` schema.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: OpenAPI Responses Map',
          'Declaring potential error paths allows contract testing suites (Schemathesis) and SDK generators to understand error structures.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\n@app.get("/orders/{order_id}")\ndef get_order(order_id: int):\n    if order_id == 0:\n        raise HTTPException(status_code=404, detail="Order not found")\n    return {"order_id": order_id, "status": "shipped"}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },

  // ── Compare ───────────────────────────────────────────
  {
    id: 'compare-01',
    track: 'compare',
    language: 'python',
    name: 'Ops endpoints: FastAPI',
    objective: 'Implement standard `/health` and `/metrics` operational endpoints for cloud orchestrators in FastAPI.',
    pattern: `@app.get("/health")\ndef health():\n    return {"status": "ok"}\n\n@app.get("/metrics")\ndef metrics():\n    return {"status": "ok"}`,
    learning: [
      'Operational observability requires dedicated endpoints: `/health` for system liveliness and `/metrics` for telemetry.',
      'Under the hood: Container orchestrators (Kubernetes) continuously probe these endpoints to manage pod lifecycles.',
      'Separating operational routes from business logic ensures monitoring probes never interfere with database transactions.',
    ],
    fieldNotes: [
      'Distinguish Liveness probes (is process alive?) from Readiness probes (is database connected and ready for traffic?).',
      'Keep health checks lightweight and fast: slow health checks cause cascade container restarts under heavy load.',
      'Protect internal `/metrics` routes from public internet exposure using internal network policies or reverse proxy rules.',
    ],
    hint: 'Implement `@app.get("/health")` and `@app.get("/metrics")` both returning `{"status": "ok"}`.',
    golf: 2,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Ops")

# TODO: Add GET /health returning {"status": "ok"}
# TODO: Add GET /metrics returning {"status": "ok"}
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Ops")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/metrics")
def metrics():
    return {"status": "ok"}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/health' },
        { method: 'GET', path: '/metrics' },
      ],
      calls: [
        { method: 'GET', path: '/health', expectStatus: 200, expectBody: { status: 'ok' } },
        { method: 'GET', path: '/metrics', expectStatus: 200, expectBody: { status: 'ok' } },
      ],
      codeContains: ['@app.get("/health")', '@app.get("/metrics")'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Operational Endpoints in FastAPI',
          'Production services expose `/health` and `/metrics` routes for monitoring and container orchestration.',
          'Kubernetes uses these probes to restart crashed pods or route traffic.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Liveness vs Readiness',
          'Liveness probes check process health; readiness probes check whether dependencies (databases, caches) are healthy.',
          'Keep these checks fast and isolated from heavy business logic.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```python\n@app.get("/health")\ndef health():\n    return {"status": "ok"}\n\n@app.get("/metrics")\ndef metrics():\n    return {"status": "ok"}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'compare-02',
    track: 'compare',
    language: 'r',
    name: 'Ops endpoints: Plumber',
    objective: 'Mirror operational endpoints in R, verifying language-agnostic API contract parity.',
    pattern: `#* @get /health\nfunction() {\n  list(status = "ok")\n}\n\n#* @get /metrics\nfunction() {\n  list(status = "ok")\n}`,
    learning: [
      'Polyglot system design: API contracts remain completely language-agnostic across Python, R, Go, or Java.',
      'Under the hood: Whether powered by Starlette ASGI or Plumber R closures, the HTTP wire format is identical.',
      'Standardizing operations across languages enables unified monitoring dashboards (Prometheus / Grafana).',
    ],
    fieldNotes: [
      'Ensure health and metrics formats are consistent across all services regardless of the underlying programming language.',
      'In data science architectures, Plumber model serving pods can be orchestrated alongside Python API gateways.',
      'Test endpoints with automated integration tests that query the HTTP interface rather than language-specific function mocks.',
    ],
    hint: 'Implement `#* @get /health` and `#* @get /metrics` in Plumber returning `list(status = "ok")`.',
    golf: 2,
    editorLabel: 'entrypoint.R',
    startCode: `library(plumber)

# TODO: Add #* @get /health returning list(status = "ok")
# TODO: Add #* @get /metrics returning list(status = "ok")
`,
    solutionCode: `library(plumber)

#* @get /health
function() {
  list(status = "ok")
}

#* @get /metrics
function() {
  list(status = "ok")
}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/health' },
        { method: 'GET', path: '/metrics' },
      ],
      calls: [
        { method: 'GET', path: '/health', expectStatus: 200, expectBody: { status: 'ok' } },
        { method: 'GET', path: '/metrics', expectStatus: 200, expectBody: { status: 'ok' } },
      ],
      codeContains: ['#* @get /health', '#* @get /metrics'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Language-Agnostic Operational Contracts',
          'Clients and orchestrators do not care which language runs behind the socket.',
          'Implementing `/health` and `/metrics` in R yields the exact same HTTP response as FastAPI in Python.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Under the Hood: Unified Monitoring',
          'Prometheus scrapes `/metrics` across all microservices uniformly, aggregating telemetry into central Grafana dashboards.',
        ],
      },
      {
        type: 'ModalAlert',
        markdowns: [
          '## Code Pattern\n\n```r\n#* @get /health\nfunction() {\n  list(status = "ok")\n}\n\n#* @get /metrics\nfunction() {\n  list(status = "ok")\n}\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
];

/**
 * Sequence catalog for tracks and level groups.
 */
export const SEQUENCES = [
  {
    id: 'http',
    name: 'HTTP Basics',
    about: 'Endpoints, methods, and the request pipeline',
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    about: 'Decorators, path/query params, bodies, status codes',
  },
  {
    id: 'plumber',
    name: 'plumber (R)',
    about: 'Annotations, path params, JSON bodies',
  },
  {
    id: 'openapi',
    name: 'OpenAPI / Swagger',
    about: 'The contract Swagger UI renders',
  },
  {
    id: 'compare',
    name: 'Compare',
    about: 'One API surface, two stacks',
  },
];

export const TRACKS = ['http', 'fastapi', 'plumber', 'openapi', 'compare'];

/**
 * Default sandbox starter.
 */
export const SANDBOX = {
  id: 'sandbox',
  track: 'http',
  language: 'python',
  name: 'Sandbox',
  objective: 'Free play. Experiment with custom endpoints, Pydantic models, and request flows.',
  pattern: `@app.get("/")\ndef read_root():\n    return {"app": "sandbox"}`,
  learning: [
    'Write any FastAPI Python code and compile it into the mock server.',
    'Test endpoints with `call GET /path` or send JSON payloads.',
    'Inspect live Swagger 3.0 document generation under the OpenAPI panel.',
  ],
  fieldNotes: [
    'Use sandbox mode to draft prototypes before codifying them into level challenges.',
    'Explore route collisions: FastAPI matches routes in order of declaration.',
    'Test validation errors: pass strings to integer path parameters to witness 422 rejections.',
  ],
  hint: 'Free play. `help` for commands.',
  golf: 0,
  editorLabel: 'server.py',
  startCode: `from fastapi import FastAPI

app = FastAPI(title="Sandbox API", version="0.1.0")

@app.get("/")
def root():
    return {"app": "sandbox"}

@app.get("/users")
def list_users():
    return {"users": []}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "ada"}

@app.post("/users", status_code=201)
def create_user():
    return {"id": 1, "name": "guest"}
`,
  solutionCode: '',
  goal: {},
  startDialog: [],
};

for (const level of LEVELS) {
  level.fa = FA_LEVELS[level.id];
  level.de = DE_LEVELS[level.id];
}

SANDBOX.fa = {
  name: 'حالت سندباکس',
  objective: 'آزمایش و کدنویسی آزاد. تعریف اندپوینت‌ها، مدل‌های Pydantic و بررسی جریان درخواست‌ها.',
  hint: 'محیط آزاد. برای مشاهده فرامین `help` را تایپ کنید.',
  learning: [
    'کدهای دلخواه FastAPI را بنویسید و در سرور شبیه‌ساز کامپایل کنید.',
    'اندپوینت‌ها را با دستوراتی مانند `call GET /users` یا ارسال بدنه تست نمایید.',
    'مشخصات زنده Swagger 3.0 را در تب OpenAPI بررسی کنید.',
  ],
  fieldNotes: [
    'از سندباکس برای آزمایش پروتوتایپ‌های جدید پیش از حل مراحل چالش استفاده کنید.',
    'توالی تعریف روت‌ها را ارزیابی کنید: در فریم‌ورک‌ها اولویت با اولین مسیر منطبق است.',
    'رفتارهای اعتبارسنجی را بیازمایید: ارسال رشته به پارامتر عددی برای مشاهده خطای ۴۲۲.',
  ],
};

SANDBOX.de = {
  name: 'Sandbox-Modus',
  objective: 'Freies Experimentieren. Eigene Endpoints, Pydantic-Modelle und Request-Flows testen.',
  hint: 'Freies Spiel. Tippe `help` für Befehle.',
  learning: [
    'Schreibe beliebigen FastAPI-Code und kompiliere ihn in den Mock-Server.',
    'Teste Endpoints mit `call GET /pfad` oder sende JSON-Bodies.',
    'Untersuche die dynamische OpenAPI 3.0 Spezifikation im OpenAPI-Tab.',
  ],
  fieldNotes: [
    'Nutze die Sandbox für Prototypen vor dem Lösen der Challenge-Level.',
    'Teste Routen-Kollisionen: FastAPI matcht Routen in Deklarationsreihenfolge.',
    'Provoziere 422-Validierungsfehler durch falsche Datentypen.',
  ],
};

/**
 * Localize level based on requested language.
 *
 * @param {Level} level
 * @param {'en'|'fa'|'de'} [lang='en']
 * @returns {Level}
 */
export function getLocalizedLevel(level, lang = 'en') {
  if (lang === 'fa' && level.fa) {
    const dlg = FA_DIALOGS[level.id];
    /** @type {object[]} */
    let startDialog = level.startDialog;
    if (dlg) {
      const slides = dlg.slides || (dlg.intro ? [dlg.intro] : []);
      startDialog = slides.map((markdowns) => ({
        type: 'ModalAlert',
        markdowns,
      }));
      if (dlg.demo) {
        startDialog.push({
          type: 'ApiDemo',
          beforeMarkdowns: [dlg.demo.before],
          afterMarkdowns: [dlg.demo.after],
          command: dlg.demo.command,
        });
      }
      startDialog.push({ type: 'GoalList' });
    }
    return {
      ...level,
      name: level.fa.name || level.name,
      objective: level.fa.objective || level.objective,
      hint: level.fa.hint || level.hint,
      learning: level.fa.learning || level.learning,
      fieldNotes: level.fa.fieldNotes || level.fieldNotes,
      startDialog,
    };
  }

  if (lang === 'de' && level.de) {
    const dlg = DE_DIALOGS[level.id];
    /** @type {object[]} */
    let startDialog = level.startDialog;
    if (dlg) {
      const slides = dlg.slides || (dlg.intro ? [dlg.intro] : []);
      startDialog = slides.map((markdowns) => ({
        type: 'ModalAlert',
        markdowns,
      }));
      if (dlg.demo) {
        startDialog.push({
          type: 'ApiDemo',
          beforeMarkdowns: [dlg.demo.before],
          afterMarkdowns: [dlg.demo.after],
          command: dlg.demo.command,
        });
      }
      startDialog.push({ type: 'GoalList' });
    }
    return {
      ...level,
      name: level.de.name || level.name,
      objective: level.de.objective || level.objective,
      hint: level.de.hint || level.hint,
      learning: level.de.learning || level.learning,
      fieldNotes: level.de.fieldNotes || level.fieldNotes,
      startDialog,
    };
  }

  return level;
}
