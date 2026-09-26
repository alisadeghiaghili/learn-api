/**
 * Smoke tests for the LearnAPI engine parsers and mock runtime.
 * Run: node tests/engine.test.mjs
 */
import { parseSource, executeRequest, matchRoute, renderHandlerBody } from '../js/engine.js';
import { generateOpenAPI, openApiHas } from '../js/openapi.js';

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed += 1;
    console.log(`  ok  ${msg}`);
  } else {
    failed += 1;
    console.log(`  FAIL ${msg}`);
  }
}

const py = `
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Users API", version="2.0.0")

class User(BaseModel):
    name: str
    age: int = 0

@app.get("/users")
def list_users():
    return {"users": []}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "ada"}

@app.post("/users", status_code=201)
def create_user(user: User):
    return {"id": 1, "name": user.name, "age": user.age}

@app.get("/search")
def search(q: str = "", limit: int = 10):
    return {"q": q, "limit": limit}
`;

const r = `
library(plumber)

#* @apiTitle Users API
#* @apiVersion 1.0.0
#* @get /users
#* @serializer json
function() {
  list(users = list())
}

#* @get /users/<id>
#* @param id:int
function(id) {
  list(id = id, name = "ada")
}

#* @post /users
#* @status 201
#* @serializer json
function(req) {
  body <- jsonlite::fromJSON(req$postBody)
  list(id = 1, name = body$name)
}
`;

console.log('python parse');
const app = parseSource(py, 'python');
assert(app.language === 'python', 'language python');
assert(app.title === 'Users API', 'title');
assert(app.routes.length === 4, `routes = 4 (got ${app.routes.length})`);
assert(app.routes.some((x) => x.method === 'GET' && x.path === '/users'), 'GET /users');
assert(app.routes.some((x) => x.method === 'GET' && x.path === '/users/{user_id}'), 'GET /users/{user_id}');
assert(app.models.User != null, 'User model');

const get42 = executeRequest(app, { method: 'GET', path: '/users/42' });
assert(get42.status === 200, `GET /users/42 → 200 (got ${get42.status})`);
assert(get42.body.id === 42, `body.id === 42 (got ${JSON.stringify(get42.body)})`);

const getBad = executeRequest(app, { method: 'GET', path: '/users/ada' });
assert(getBad.status === 422, `GET /users/ada → 422 (got ${getBad.status})`);

const post = executeRequest(app, {
  method: 'POST',
  path: '/users',
  body: { name: 'ada', age: 36 },
});
assert(post.status === 201, `POST /users → 201 (got ${post.status})`);
assert(post.body.name === 'ada', `body.name ada (got ${JSON.stringify(post.body)})`);

const search = executeRequest(app, { method: 'GET', path: '/search?q=ada&limit=2' });
assert(search.status === 200, 'GET /search 200');
assert(search.body.q === 'ada' && search.body.limit === 2, `search bind ${JSON.stringify(search.body)}`);

console.log('openapi');
const doc = generateOpenAPI(app);
assert(doc.openapi === '3.0.3', 'openapi version');
assert(openApiHas(doc, 'paths./users.get'), 'paths./users.get');
assert(openApiHas(doc, 'components.schemas.User'), 'components.schemas.User');
assert(openApiHas(doc, 'info.title'), 'info.title');

console.log('plumber parse');
const rapp = parseSource(r, 'r');
assert(rapp.language === 'r', 'language r');
assert(rapp.title === 'Users API', 'r title');
assert(rapp.routes.length === 3, `r routes = 3 (got ${rapp.routes.length})`);
assert(rapp.routes.some((x) => x.path === '/users/{id}'), 'r /users/{id}');

const rget = executeRequest(rapp, { method: 'GET', path: '/users/7' });
assert(rget.status === 200, `r GET /users/7 (got ${rget.status})`);
assert(rget.body.id === 7, `r body.id 7 (got ${JSON.stringify(rget.body)})`);

const rpost = executeRequest(rapp, {
  method: 'POST',
  path: '/users',
  body: { name: 'ada' },
});
assert(rpost.status === 201, `r POST status (got ${rpost.status})`);
assert(rpost.body.name === 'ada', `r body name (got ${JSON.stringify(rpost.body)})`);

console.log('misc');
assert(matchRoute(app.routes, 'GET', '/users/42'), 'matchRoute hit');
assert(!matchRoute(app.routes, 'DELETE', '/users'), 'matchRoute miss method');
const rendered = renderHandlerBody('return {"id": user_id, "name": "ada"}', { user_id: 9 });
assert(rendered && rendered.id === 9, 'renderHandlerBody');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
