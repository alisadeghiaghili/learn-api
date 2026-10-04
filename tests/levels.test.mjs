/**
 * Verify every level's solutionCode satisfies its goal against the mock runtime.
 * Run: node tests/levels.test.mjs
 */
import { parseSource, executeRequest, matchRoute } from '../js/engine.js';
import { generateOpenAPI, openApiHas } from '../js/openapi.js';
import { codeMatchesRequirement } from '../js/game.js';
import { LEVELS } from '../js/levels.js';

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

for (const level of LEVELS) {
  console.log(level.id);
  const lang = level.language === 'r' ? 'r' : 'python';
  const parsed = parseSource(level.solutionCode, lang);
  const g = level.goal || {};
  const code = level.solutionCode;

  for (const e of g.endpoints || []) {
    const found = parsed.routes.some(
      (r) =>
        r.method === e.method &&
        r.path === e.path &&
        (e.status === undefined || r.status === e.status)
    );
    assert(found, `endpoint ${e.method} ${e.path}${e.status ? ` ${e.status}` : ''}`);
  }
  for (const s of g.codeContains || []) {
    assert(codeMatchesRequirement(code, s, lang), `code contains ${s}`);
  }
  for (const s of g.openapiHas || []) {
    assert(openApiHas(generateOpenAPI(parsed), s), `openapi ${s}`);
  }
  for (const c of g.calls || []) {
    const hit = matchRoute(parsed.routes, c.method, c.path.split('?')[0]);
    assert(!!hit, `match ${c.method} ${c.path}`);
    if (!hit) continue;
    const res = executeRequest(parsed, {
      method: c.method,
      path: c.path,
      body: c.body,
      headers: c.headers,
    });
    assert(res.status === c.expectStatus, `call ${c.method} ${c.path} → ${c.expectStatus} (got ${res.status})`);
    if (c.expectBody) {
      for (const [k, v] of Object.entries(c.expectBody)) {
        const actual = res.body && typeof res.body === 'object' ? res.body[k] : undefined;
        assert(JSON.stringify(actual) === JSON.stringify(v), `body.${k} = ${JSON.stringify(v)} (got ${JSON.stringify(actual)})`);
      }
    }
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
