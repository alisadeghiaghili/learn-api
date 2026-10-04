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
      codeContains: ['@app.get("/")', 'return'],
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
      codeContains: ['@app.post("/items", status_code=201)', 'return'],
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
      codeContains: ['@app.get("/users/{user_id}")', 'return'],
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
      codeContains: ['return'],
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
      codeContains: ['class User(BaseModel):', 'return'],
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
      codeContains: ['@app.delete("/notes/{note_id}", status_code=204)', 'return'],
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
      codeContains: ['Depends(get_settings)', 'return'],
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
      codeContains: ['Header(...)', 'return'],
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
      codeContains: ['response_model=UserOut', 'return'],
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
      codeContains: ['class Item(BaseModel):', 'return'],
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
      codeContains: ['@app.get("/health")', '@app.get("/metrics")', 'return'],
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
