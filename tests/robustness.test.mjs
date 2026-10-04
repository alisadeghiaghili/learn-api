import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseSource, executeRequest } from '../js/engine.js';
import { generateOpenAPI } from '../js/openapi.js';

test('robustness: handles union types and optional defaults', () => {
  const code = `
from fastapi import FastAPI
from typing import Optional

app = FastAPI()

@app.get("/items")
def list_items(q: str | None = None, limit: int = 10, tag: Optional[str] = None):
    return {"q": q, "limit": limit, "tag": tag}
`;
  const parsed = parseSource(code, 'python');
  assert.equal(parsed.routes.length, 1);
  const route = parsed.routes[0];
  assert.equal(route.path, '/items');

  const res1 = executeRequest(parsed, { method: 'GET', path: '/items' });
  assert.equal(res1.status, 200);
  assert.deepEqual(res1.body, { q: null, limit: 10, tag: null });

  const res2 = executeRequest(parsed, { method: 'GET', path: '/items?q=books&limit=5&tag=tech' });
  assert.equal(res2.status, 200);
  assert.deepEqual(res2.body, { q: 'books', limit: 5, tag: 'tech' });
});

test('robustness: handles comments and multi-line formatting gracefully', () => {
  const code = `
# Top-level comment
from fastapi import FastAPI # inline comment

app = FastAPI(title="CommentApp")

# Route comment
@app.get("/calc/{a}/{b}")
def calc(
    a: int, # first operand
    b: int  # second operand
):
    # calculate total
    total = a + b
    # return dictionary
    return {
        "a": a,
        "b": b,
        "total": total
    }
`;
  const parsed = parseSource(code, 'python');
  assert.equal(parsed.routes.length, 1);

  const res = executeRequest(parsed, { method: 'GET', path: '/calc/10/25' });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { a: 10, b: 25, total: 35 });
});

test('robustness: complex conditional HTTPException flow', () => {
  const code = `
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/lookup/{val}")
def lookup(val: int):
    if val == 42:
        return {"result": "meaning of life"}
    if val < 0:
        raise HTTPException(status_code=400, detail="negative not allowed")
    raise HTTPException(status_code=404, detail="not found")
`;
  const parsed = parseSource(code, 'python');
  assert.equal(parsed.routes.length, 1);

  const res42 = executeRequest(parsed, { method: 'GET', path: '/lookup/42' });
  assert.equal(res42.status, 200);
  assert.equal(res42.body.result, 'meaning of life');

  const resNeg = executeRequest(parsed, { method: 'GET', path: '/lookup/-5' });
  assert.equal(resNeg.status, 400);

  const resUnknown = executeRequest(parsed, { method: 'GET', path: '/lookup/7' });
  assert.equal(resUnknown.status, 404);
});

test('robustness: plumber R parser with multiple decorators and comments', () => {
  const code = `
#* @apiTitle Robust Plumber API

#* Health check endpoint
#* @get /health
#* @serializer json
function() {
  list(status = "healthy", uptime = 100)
}

#* User profile endpoint
#* @param id The user identifier
#* @get /users/<id:int>
function(id) {
  list(id = as.integer(id), active = TRUE)
}
`;
  const parsed = parseSource(code, 'r');
  assert.equal(parsed.title, 'Robust Plumber API');
  assert.equal(parsed.routes.length, 2);

  const res1 = executeRequest(parsed, { method: 'GET', path: '/health' });
  assert.equal(res1.status, 200);
  assert.deepEqual(res1.body, { status: 'healthy', uptime: 100 });

  const res2 = executeRequest(parsed, { method: 'GET', path: '/users/99' });
  assert.equal(res2.status, 200);
  assert.deepEqual(res2.body, { id: 99, active: true });
});

test('robustness: OpenAPI schema extraction with models and responses', () => {
  const code = `
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="SchemaApp")

class UserIn(BaseModel):
    name: str
    age: int

@app.post("/users", status_code=201)
def create_user(user: UserIn):
    return user
`;
  const parsed = parseSource(code, 'python');
  const spec = generateOpenAPI(parsed);

  assert.equal(spec.info.title, 'SchemaApp');
  assert.ok(spec.paths['/users']);
  assert.ok(spec.paths['/users'].post.responses['201']);
  assert.equal(spec.paths['/users'].post.responses['201'].description, 'Successful response');
  assert.ok(spec.components.schemas.UserIn);
  assert.equal(spec.components.schemas.UserIn.properties.name.type, 'string');
  assert.equal(spec.components.schemas.UserIn.properties.age.type, 'integer');
});

test('robustness: renderMarkdown handles links and trusted anchor tags', async () => {
  const { renderMarkdown } = await import('../js/dialog.js');
  const { COFFEE_BUTTON_HTML } = await import('../js/share.js');

  const raw = `
Check out [profile](https://linktr.ee/aliaghili).

${COFFEE_BUTTON_HTML}
`;
  const rendered = renderMarkdown(raw);
  assert.ok(rendered.includes('<a href="https://linktr.ee/aliaghili" target="_blank" rel="noopener noreferrer">profile</a>'));
  assert.ok(rendered.includes('https://img.buymeacoffee.com/button-api/'));
  assert.ok(!rendered.includes('&lt;a href='), 'trusted a tags should not be escaped');
});

