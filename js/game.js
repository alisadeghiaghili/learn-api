/**
 * Pure game logic: goal evaluation, checklist items and the next-step
 * suggestion. No DOM access, so it is unit-testable in Node.
 */

import { executeRequest, matchRoute } from './engine.js';
import { generateOpenAPI, openApiHas } from './openapi.js';

/**
 * @typedef {Object} GoalItem
 * @property {'endpoint'|'call'|'code'|'openapi'} kind
 * @property {'editor'|'run'|'openapi'|'console'} target
 * @property {string} label    LTR code-like label shown in the checklist
 * @property {boolean} done
 * @property {number} [status]
 * @property {number} [expectStatus]
 * @property {object} [expectBody]
 * @property {string} [command] console command that performs a call goal
 */

/**
 * Parser language for a level.
 *
 * @param {{ language?: string }} level
 * @returns {'python'|'r'}
 */
export function parserLanguage(level) {
  return level?.language === 'r' ? 'r' : 'python';
}

/**
 * Build the console command that exercises a call goal.
 *
 * @param {{ method: string, path: string, body?: object, headers?: Record<string, string> }} c
 * @returns {string}
 */
export function callCommand(c) {
  let cmd = `call ${c.method} ${c.path}`;
  if (c.body) cmd += ` body=${JSON.stringify(c.body)}`;
  if (c.headers) cmd += ` headers=${JSON.stringify(c.headers)}`;
  return cmd;
}

/**
 * Check one call goal against a parsed app.
 *
 * @param {import('./engine.js').ParsedApp} parsed
 * @param {{ method: string, path: string, body?: object, headers?: Record<string, string>, expectStatus: number, expectBody?: object }} c
 * @returns {boolean}
 */
export function callGoalMet(parsed, c) {
  if (!matchRoute(parsed.routes, c.method, c.path.split('?')[0])) return false;
  const res = executeRequest(parsed, {
    method: c.method,
    path: c.path,
    body: c.body,
    headers: c.headers,
  });
  if (res.status !== c.expectStatus) return false;
  for (const [k, v] of Object.entries(c.expectBody || {})) {
    const actual = res.body && typeof res.body === 'object' ? res.body[k] : undefined;
    if (JSON.stringify(actual) !== JSON.stringify(v)) return false;
  }
  return true;
}

/**
 * Evaluate a level goal into an ordered checklist.
 * Chronological order:
 * 1. Code in editor (codeContains)
 * 2. Route endpoints compiled on server (endpoints)
 * 3. OpenAPI contract (openapiHas)
 * 4. Terminal console requests (calls)
 *
 * @param {import('./engine.js').ParsedApp|null} parsed result of the last Run, or null
 * @param {string} code editor source that produced `parsed`
 * @param {object} goal level goal
 * @returns {GoalItem[]}
 */
export function goalItems(parsed, code, goal) {
  const g = goal || {};
  /** @type {GoalItem[]} */
  const items = [];
  /** @type {object|null} */
  let doc = null;
  const openapi = () => (doc ??= generateOpenAPI(parsed));

  // 1. Code editor text requirements
  for (const s of g.codeContains || []) {
    items.push({
      kind: 'code',
      target: 'editor',
      label: s,
      done: !!parsed && code.includes(s),
    });
  }

  // 2. Server route endpoints (compiled via Run in editor)
  for (const e of g.endpoints || []) {
    items.push({
      kind: 'endpoint',
      target: 'run',
      label: `${e.method} ${e.path}`,
      status: e.status,
      done:
        !!parsed &&
        parsed.routes.some(
          (r) =>
            r.method === e.method &&
            r.path === e.path &&
            (e.status === undefined || r.status === e.status)
        ),
    });
  }

  // 3. OpenAPI schema contract
  for (const s of g.openapiHas || []) {
    items.push({
      kind: 'openapi',
      target: 'openapi',
      label: s,
      done: !!parsed && openApiHas(openapi(), s),
    });
  }

  // 4. HTTP call tests executed in terminal console
  for (const c of g.calls || []) {
    items.push({
      kind: 'call',
      target: 'console',
      label: callCommand(c),
      expectStatus: c.expectStatus,
      expectBody: c.expectBody,
      command: callCommand(c),
      done: !!parsed && callGoalMet(parsed, c),
    });
  }
  return items;
}

/**
 * A level is solved when it has goals and every goal is met.
 *
 * @param {GoalItem[]} items
 * @returns {boolean}
 */
export function isSolved(items) {
  return items.length > 0 && items.every((i) => i.done);
}

/**
 * Suggest the learner's next step.
 *
 * @param {GoalItem[]} items
 * @param {{ running: boolean, stale: boolean }} ctx running: a Run happened; stale: editor changed since
 * @returns {{ type: 'run', command: string } | { type: 'call', command: string, item: GoalItem } | { type: 'edit', item: GoalItem } | null}
 */
export function nextAction(items, ctx) {
  const first = items.find((i) => !i.done);
  if (!first) return null;

  // If editor code requirement is unmet
  if (first.kind === 'code') {
    return { type: 'edit', item: first };
  }

  // If code is modified or server not running
  if (!ctx.running || ctx.stale) {
    return { type: 'run', command: 'run' };
  }

  // If route endpoint or schema is unmet despite running
  if (first.kind === 'endpoint' || first.kind === 'openapi') {
    return { type: 'edit', item: first };
  }

  // If HTTP call test is pending
  if (first.kind === 'call' && first.command) {
    return { type: 'call', command: first.command, item: first };
  }

  return { type: 'edit', item: first };
}
