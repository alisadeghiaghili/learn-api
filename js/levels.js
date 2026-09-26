/**
 * LearnAPI level definitions.
 *
 * Shape (mirrors learnGitBranching):
 *   id, track, language, name, hint, golf (par),
 *   startCode, solutionCode,
 *   goal: { endpoints?, calls?, codeContains?, openapiHas? },
 *   startDialog: [{ type: 'ModalAlert'|'ApiDemo'|'GoalList', ... }]
 */

/** @typedef {import('./engine.js').HttpMethod} HttpMethod */

/**
 * @typedef {Object} Level
 * @property {string} id
 * @property {string} track
 * @property {'python'|'r'|'http'|'openapi'} language
 * @property {string} name
 * @property {string} hint
 * @property {number} golf
 * @property {string} startCode
 * @property {string} solutionCode
 * @property {{ endpoints?: {method: string, path: string, status?: number}[], calls?: {method: string, path: string, body?: object, expectStatus: number, expectBody?: object}[], codeContains?: string[], openapiHas?: string[] }} goal
 * @property {object[]} startDialog
 * @property {string} [editorLabel]
 */

/** @type {Level[]} */
export const LEVELS = [
  // ── HTTP ──────────────────────────────────────────────
  {
    id: 'http-01',
    track: 'http',
    language: 'python',
    name: 'What is an endpoint?',
    hint: 'Define one GET route on `/` that returns a small JSON object.',
    golf: 2,
    editorLabel: 'server.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Hello API")

# Add a GET endpoint on "/"
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Hello API")

@app.get("/")
def read_root():
    return {"hello": "world"}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/' }],
      calls: [{ method: 'GET', path: '/', expectStatus: 200 }],
      codeContains: ['@app.get', 'return'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Endpoints',
          'An API exposes **endpoints** — addressable operations on a server. Each endpoint pairs an HTTP method with a path.',
          'FastAPI registers them with a decorator: `@app.get("/")` handles `GET /`.',
          'The function under the decorator runs when a request arrives and returns JSON.',
        ],
      },
      {
        type: 'ApiDemo',
        beforeMarkdowns: ['Register `GET /` and watch the surface pick up the node.'],
        afterMarkdowns: ['`GET /` is live. Call it from the console: `call GET /`'],
        command: 'call GET /',
      },
      {
        type: 'ModalAlert',
        markdowns: ['Close this dialog, define the endpoint, press **Run**, then `call GET /`.'],
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
    hint: 'Add `@app.post("/items")` that returns 201 and the created item.',
    golf: 3,
    editorLabel: 'server.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Hello API")

@app.get("/items")
def list_items():
    return {"items": []}

# Add POST /items with status_code=201
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
      calls: [{ method: 'POST', path: '/items', expectStatus: 201 }],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Methods',
          '`GET` reads. `POST` creates. `PUT`/`PATCH` update. `DELETE` removes.',
          'Same path, different methods = different endpoints. FastAPI lets you stack decorators or use `@app.post(..., status_code=201)` for the create status.',
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
    hint: 'Use `{user_id}` in the path and take `user_id: int` in the function.',
    golf: 2,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Users API")

@app.get("/users")
def list_users():
    return {"users": []}

# GET /users/{user_id} → {"id": user_id, "name": "ada"}
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
        { method: 'GET', path: '/users/42', expectStatus: 200, expectBody: { id: 42 } },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Path parameters',
          'A path segment in braces is a **path parameter**: `/users/{user_id}` matches `/users/42` with `user_id=42`.',
          'Declare it in the function signature with a type. FastAPI validates it — `int` rejects `ada` with **422**.',
          'Try `call GET /users/ada` after you implement the route.',
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
    hint: 'Optional query args have defaults: `limit: int = 10`.',
    golf: 2,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Users API")

@app.get("/search")
def search():
    return {"q": None, "limit": 10}

# Accept query params: q: str, limit: int = 10
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
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Query parameters',
          'Anything after `?` is the query string: `GET /search?q=ada&limit=2`.',
          'In FastAPI, non-path function args become query parameters. A default makes them optional.',
          'After `run`, call `call GET /search?q=ada&limit=2` and watch the pipeline bind values.',
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
    hint: 'Create a Pydantic model and accept it as `user: User`.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Users API")

# Define User(BaseModel) with name: str, age: int = 0
# POST /users → 201 with {"id": 1, "name": user.name}

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
      codeContains: ['BaseModel', 'class User'],
      openapiHas: ['components.schemas.User'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Request body',
          'Creates carry a **JSON body**. FastAPI validates it with a Pydantic `BaseModel`.',
          'The OpenAPI document then advertises `components.schemas.User` — that is what Swagger UI shows.',
          'Send: `call POST /users body={"name":"ada","age":36}"',
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
    hint: 'Return an empty object with `status_code=204` on DELETE.',
    golf: 2,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Notes API")

@app.get("/notes/{note_id}")
def get_note(note_id: int):
    return {"id": note_id}

# DELETE /notes/{note_id} → 204
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
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Status codes',
          '200 OK · 201 Created · 204 No Content · 404 Not Found · 422 Validation Error',
          'Tell clients what happened with the status code. `DELETE` that succeeds is often **204** with an empty body.',
        ],
      },
      { type: 'GoalList' },
    ],
  },

  // ── plumber ───────────────────────────────────────────
  {
    id: 'plumber-01',
    track: 'plumber',
    language: 'r',
    name: 'Your first plumber route',
    hint: 'Use `#* @get /` above `function() list(hello = "world")`.',
    golf: 2,
    editorLabel: 'plumber.R',
    startCode: `library(plumber)

#* @apiTitle Hello API
#* @get /

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
          '## plumber annotations',
          'plumber turns R functions into HTTP endpoints with **roxygen-style comments**.',
          '```\n#* @get /\nfunction() list(hello = "world")\n```',
          'The comment `#* @get /` binds the next function to `GET /`. Return a `list()` — it serializes to JSON.',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'plumber-02',
    track: 'plumber',
    language: 'r',
    name: 'Path params in plumber',
    hint: 'Annotate `#* @get /users/<id>` and `#* @param id:int`, then use `id` in the function args.',
    golf: 3,
    editorLabel: 'plumber.R',
    startCode: `library(plumber)

#* @apiTitle Users API
#* @get /users
function() {
  list(users = list())
}

#* @get /users/<id>
#* @param id:int

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
  list(id = id, name = "ada")
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
          '## plumber path parameters',
          'Angle brackets mark a path parameter: `#* @get /users/<id>` matches `/users/7`.',
          'Declare it with `#* @param id:int` and list `id` in the function signature so the value is injected.',
          'This is the R twin of FastAPI’s `/users/{user_id}`.',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'plumber-03',
    track: 'plumber',
    language: 'r',
    name: 'POST body in plumber',
    hint: 'Read `req$postBody` and return `list(id = 1, name = body$name)` with status 201.',
    golf: 3,
    editorLabel: 'plumber.R',
    startCode: `library(plumber)

#* @apiTitle Users API
#* @post /users
#* @serializer json

# Create a user from the JSON body, status 201
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
      calls: [
        {
          method: 'POST',
          path: '/users',
          body: { name: 'ada' },
          expectStatus: 201,
          expectBody: { name: 'ada' },
        },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## plumber request body',
          'For `POST`, take `req` and read `req$postBody` (JSON string). Parse it with `jsonlite::fromJSON`.',
          'Set the status with `#* @status 201` — the R twin of FastAPI’s `status_code=201`.',
          'Try: `call POST /users body={"name":"ada"}"',
        ],
      },
      { type: 'GoalList' },
    ],
  },

  // ── OpenAPI / Swagger ─────────────────────────────────
  {
    id: 'openapi-01',
    track: 'openapi',
    language: 'openapi',
    name: 'Read the OpenAPI map',
    hint: 'Run the starter code and open the OpenAPI panel — then `openapi` in the console.',
    golf: 1,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Petstore Mini", version="1.0.0")

@app.get("/pets", tags=["pets"], summary="List pets")
def list_pets():
    return {"pets": []}

@app.post("/pets", tags=["pets"], status_code=201)
def create_pet():
    return {"id": 1, "name": "rex"}
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Petstore Mini", version="1.0.0")

@app.get("/pets", tags=["pets"], summary="List pets")
def list_pets():
    return {"pets": []}

@app.post("/pets", tags=["pets"], status_code=201)
def create_pet():
    return {"id": 1, "name": "rex"}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/pets' },
        { method: 'POST', path: '/pets', status: 201 },
      ],
      openapiHas: ['paths./pets.get', 'paths./pets.post', 'info.title'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## OpenAPI / Swagger',
          'Every FastAPI app can emit an **OpenAPI** document: `info`, `paths`, `components`.',
          'Swagger UI is a *renderer* of that document. Tags group operations; summaries label them.',
          'Press **Run**, inspect the OpenAPI panel, and type `openapi` to dump the JSON.',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'openapi-02',
    track: 'openapi',
    language: 'python',
    name: 'Schemas land in components',
    hint: 'A Pydantic model named `Item` becomes `components.schemas.Item`.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Store")

# class Item(BaseModel): name: str, price: float
# POST /items with body model Item
`,
    solutionCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Store")

class Item(BaseModel):
    name: str
    price: float

@app.post("/items", status_code=201)
def create_item(item: Item):
    return {"id": 1, "name": item.name, "price": item.price}
`,
    goal: {
      endpoints: [{ method: 'POST', path: '/items', status: 201 }],
      openapiHas: ['components.schemas.Item', 'paths./items.post.requestBody'],
      codeContains: ['class Item', 'BaseModel'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## components.schemas',
          'Named models are the contract clients generate against.',
          'A `BaseModel` used as a body becomes `#/components/schemas/Item`, referenced from `requestBody`.',
          'That is exactly what `schemas` in the OpenAPI panel shows after `run`.',
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
    name: 'Same API, two stacks',
    hint: 'Implement `GET /health` and `GET /metrics` in FastAPI first; the solution shows the plumber twin.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Ops API")

# GET /health  → {"status": "ok"}
# GET /metrics → {"cpu": 0.12, "mem": 0.44}
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Ops API")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/metrics")
def metrics():
    return {"cpu": 0.12, "mem": 0.44}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/health' },
        { method: 'GET', path: '/metrics' },
      ],
      calls: [
        { method: 'GET', path: '/health', expectStatus: 200, expectBody: { status: 'ok' } },
        { method: 'GET', path: '/metrics', expectStatus: 200 },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## One contract, two runtimes',
          'The OpenAPI contract is language-agnostic. FastAPI and plumber both emit paths, methods, params, and schemas.',
          'This level is the FastAPI side. After you solve it, switch the editor to the plumber twin below and compare annotation vs decorator.',
          '```\n#* @get /health\nfunction() list(status = "ok")\n```',
        ],
      },
      { type: 'GoalList' },
    ],
  },
  {
    id: 'compare-02',
    track: 'compare',
    language: 'r',
    name: 'The plumber twin',
    hint: 'Mirror the FastAPI ops API with `#* @get /health` and `#* @get /metrics`.',
    golf: 3,
    editorLabel: 'plumber.R',
    startCode: `library(plumber)

#* @apiTitle Ops API
#* @get /health

#* @get /metrics

`,
    solutionCode: `library(plumber)

#* @apiTitle Ops API
#* @get /health
#* @serializer json
function() {
  list(status = "ok")
}

#* @get /metrics
#* @serializer json
function() {
  list(cpu = 0.12, mem = 0.44)
}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/health' },
        { method: 'GET', path: '/metrics' },
      ],
      calls: [
        { method: 'GET', path: '/health', expectStatus: 200, expectBody: { status: 'ok' } },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## plumber twin',
          'Same two endpoints, R style. Annotation comments replace decorators; `list()` replaces a dict return.',
          'Notice the OpenAPI map is nearly identical — clients cannot tell the runtime apart.',
        ],
      },
      { type: 'GoalList' },
    ],
  },
];

/**
 * Sequence catalog for the left rail (LGB `sequenceInfo` analogue).
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
