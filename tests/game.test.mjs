import assert from 'node:assert/strict';
import { test } from 'node:test';
import { goalItems, isSolved, nextAction, callCommand, callGoalMet, parserLanguage } from '../js/game.js';
import { LEVELS } from '../js/levels.js';
import { parseSource } from '../js/engine.js';

test('parserLanguage selects correct engine based on level language', () => {
  assert.equal(parserLanguage({ language: 'python' }), 'python');
  assert.equal(parserLanguage({ language: 'r' }), 'r');
  assert.equal(parserLanguage({}), 'python');
});

test('callGoalMet verifies status and body predicates against parsed app', () => {
  const code = `
from fastapi import FastAPI
app = FastAPI()

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "ada"}
`;
  const parsed = parseSource(code, 'python');
  const goal = { method: 'GET', path: '/users/42', expectStatus: 200, expectBody: { id: 42 } };

  assert.equal(callGoalMet(parsed, goal), true);
  assert.equal(callGoalMet(parsed, { ...goal, expectStatus: 404 }), false);
  assert.equal(callGoalMet(parsed, { ...goal, expectBody: { id: 99 } }), false);
});

test('callCommand generates formatted console command', () => {
  assert.equal(callCommand({ method: 'GET', path: '/items' }), 'call GET /items');
  assert.equal(
    callCommand({ method: 'POST', path: '/users', body: { name: 'ada' } }),
    'call POST /users body={"name":"ada"}'
  );
  assert.equal(
    callCommand({ method: 'GET', path: '/admin', headers: { Authorization: 'Bearer 123' } }),
    'call GET /admin headers={"Authorization":"Bearer 123"}'
  );
});

test('goalItems marks done correctly against parsed app and code', () => {
  const level = LEVELS.find((l) => l.id === 'fastapi-01');
  assert.ok(level);

  // Uncompiled / initial state
  const initialItems = goalItems(null, level.startCode, level.goal);
  assert.equal(isSolved(initialItems), false);

  // Compiled with solution
  const parsed = parseSource(level.solutionCode, 'python');
  const items = goalItems(parsed, level.solutionCode, level.goal);

  assert.equal(items.filter((i) => i.kind === 'endpoint').every((i) => i.done), true);
  assert.equal(items.filter((i) => i.kind === 'call').every((i) => i.done), true);
  assert.equal(isSolved(items), true);
});

test('goalItems preserves logical sequence: code -> endpoint -> openapi -> call', () => {
  const goal = {
    endpoints: [{ method: 'GET', path: '/items' }],
    calls: [{ method: 'GET', path: '/items', expectStatus: 200 }],
    codeContains: ['@app.get'],
    openapiHas: ['paths./items'],
  };
  const items = goalItems(null, '', goal);
  assert.equal(items.length, 4);
  assert.equal(items[0].kind, 'code');
  assert.equal(items[0].target, 'editor');
  assert.equal(items[1].kind, 'endpoint');
  assert.equal(items[1].target, 'run');
  assert.equal(items[2].kind, 'openapi');
  assert.equal(items[2].target, 'openapi');
  assert.equal(items[3].kind, 'call');
  assert.equal(items[3].target, 'console');
  assert.equal(items[3].label, 'call GET /items');
});

test('nextAction advises correct next step', () => {
  const unmetRun = [{ kind: 'endpoint', label: 'GET /items', done: false }];
  assert.deepEqual(nextAction(unmetRun, { running: false, stale: true }), {
    type: 'run',
    command: 'run',
  });

  const unmetCall = [
    { kind: 'call', label: 'GET /users/1', done: false, command: 'call GET /users/1' },
  ];
  const callAction = nextAction(unmetCall, { running: true, stale: false });
  assert.equal(callAction.type, 'call');
  assert.equal(callAction.command, 'call GET /users/1');

  const unmetEdit = [{ kind: 'endpoint', label: 'POST /users', done: false }];
  const editAction = nextAction(unmetEdit, { running: true, stale: false });
  assert.equal(editAction.type, 'edit');

  const allMet = [{ kind: 'endpoint', done: true }];
  assert.equal(nextAction(allMet, { running: true, stale: false }), null);
});
