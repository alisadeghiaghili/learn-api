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
 * Strip code comments based on programming language.
 * Preserves Plumber annotations ('#*') in R.
 *
 * @param {string} code
 * @param {string} [language='python']
 * @returns {string}
 */
export function stripCodeComments(code, language = 'python') {
  if (!code) return '';
  const lines = code.split('\n');
  const cleaned = lines.map((line) => {
    if (language === 'r') {
      if (/^\s*#\*/.test(line)) return line;
    }
    let inSingle = false;
    let inDouble = false;
    let out = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const prev = i > 0 ? line[i - 1] : '';
      if (ch === "'" && prev !== '\\' && !inDouble) {
        inSingle = !inSingle;
        out += ch;
      } else if (ch === '"' && prev !== '\\' && !inSingle) {
        inDouble = !inDouble;
        out += ch;
      } else if (ch === '#' && !inSingle && !inDouble) {
        if (language === 'r' && line[i + 1] === '*') {
          out += ch;
        } else {
          break;
        }
      } else {
        out += ch;
      }
    }
    return out;
  });
  return cleaned.join('\n');
}

/**
 * Check if the code satisfies a requirement without matching inside comments.
 *
 * @param {string} code
 * @param {string} requirement
 * @param {string} [language='python']
 * @returns {boolean}
 */
export function codeMatchesRequirement(code, requirement, language = 'python') {
  if (!requirement) return true;
  const stripped = stripCodeComments(code, language);
  const normReq = requirement.replace(/\s+/g, ' ').trim();
  const normCode = stripped.replace(/\s+/g, ' ');
  if (normCode.includes(normReq)) return true;
  if (/^[A-Za-z_]\w*$/.test(normReq)) {
    return new RegExp(`\\b${normReq}\\b`).test(stripped);
  }
  return false;
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
  const lang = parsed?.language || 'python';

  // 1. Code editor text requirements
  for (const s of g.codeContains || []) {
    items.push({
      kind: 'code',
      target: 'editor',
      label: s,
      done: !!parsed && !parsed.errors?.length && codeMatchesRequirement(code, s, lang),
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

/**
 * Extract complete handler snippet (decorator, def, body, return) from solutionCode.
 * @param {string} source
 * @param {string} label E.g. "GET /" or "POST /items"
 * @param {string} [language='python']
 * @returns {string}
 */
export function extractHandlerSnippet(source, label, language = 'python') {
  if (!source) return '';
  const parts = label.split(' ');
  const method = (parts[0] || 'GET').toLowerCase();
  const path = parts[1] || '/';

  if (language === 'r') {
    const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{(\w+)\\\}/g, '(?:<\\w+>|\\{$1\\})');
    const re = new RegExp(`((?:^\\s*#\\*[^\\n]*\\n)*^\\s*#\\*\\s*@${method}\\s+${escaped}[^\\n]*\\n(?:^\\s*#\\*[^\\n]*\\n)*^\\s*(?:async\\s+)?function\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n\\})`, 'm');
    const m = source.match(re);
    if (m) return m[1].trim();
  } else {
    const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(@app\\.${method}\\s*\\(\\s*['"]${escaped}['"][^)]*\\)[\\s\\S]*?(?:\\n\\s*(?:async\\s+)?def\\s+\\w+\\s*\\([^)]*\\)[^:]*:[\\s\\S]*?)(?=\\n(?:@|def\\s|class\\s|$)))`, 'm');
    const m = source.match(re);
    if (m) return m[1].trim();
  }
  return '';
}

/**
 * Extract complete block snippet for a code label from solutionCode.
 * @param {string} source
 * @param {string} label E.g. "class User(BaseModel):" or "Depends(get_settings)"
 * @returns {string}
 */
export function extractCodeSnippet(source, label) {
  if (!source) return label;
  if (/^class\s+\w+/.test(label)) {
    const className = (label.match(/^class\s+(\w+)/) || [])[1];
    if (className) {
      const re = new RegExp(`(class\\s+${className}[\\s\\S]*?)(?=\\n(?:@|class\\s|def\\s|$))`, 'm');
      const m = source.match(re);
      if (m) return m[1].trim();
    }
  }
  if (/^(?:async\s+)?def\s+\w+/.test(label)) {
    const fnName = (label.match(/def\s+(\w+)/) || [])[1];
    if (fnName) {
      const lines = source.split('\n');
      let startIdx = -1;
      let endIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (new RegExp(`(?:async\\s+)?def\\s+${fnName}\\b`).test(lines[i])) {
          startIdx = i;
          while (startIdx > 0 && lines[startIdx - 1].trim().startsWith('@')) {
            startIdx--;
          }
          endIdx = i;
          while (
            endIdx + 1 < lines.length &&
            (lines[endIdx + 1].startsWith(' ') ||
              lines[endIdx + 1].startsWith('\t') ||
              lines[endIdx + 1].trim() === '')
          ) {
            endIdx++;
          }
          break;
        }
      }
      if (startIdx !== -1) {
        return lines.slice(startIdx, endIdx + 1).join('\n').trim();
      }
    }
  }
  if (label.startsWith('@app.')) {
    const lines = source.split('\n');
    let startIdx = -1;
    let endIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(label.trim())) {
        startIdx = i;
        endIdx = i;
        while (
          endIdx + 1 < lines.length &&
          (lines[endIdx + 1].startsWith(' ') ||
            lines[endIdx + 1].startsWith('\t') ||
            lines[endIdx + 1].startsWith('@') ||
            lines[endIdx + 1].trim() === '' ||
            lines[endIdx + 1].trim().startsWith('def '))
        ) {
          endIdx++;
          if (lines[endIdx].trim().startsWith('def ')) {
            while (
              endIdx + 1 < lines.length &&
              (lines[endIdx + 1].startsWith(' ') ||
                lines[endIdx + 1].startsWith('\t') ||
                lines[endIdx + 1].trim() === '')
            ) {
              endIdx++;
            }
            break;
          }
        }
        return lines.slice(startIdx, endIdx + 1).join('\n').trim();
      }
    }
  }
  if (label.includes('Depends(') || label.includes('Header(') || label.includes('response_model=')) {
    const lines = source.split('\n');
    let startIdx = -1;
    let endIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(label) || (label.includes('Header') && lines[i].includes('Header('))) {
        startIdx = i;
        while (startIdx > 0 && lines[startIdx - 1].trim().startsWith('@app.')) {
          startIdx--;
        }
        endIdx = i;
        while (endIdx + 1 < lines.length && (lines[endIdx + 1].startsWith(' ') || lines[endIdx + 1].startsWith('\t') || lines[endIdx + 1].trim() === '')) {
          endIdx++;
        }
        break;
      }
    }
    if (startIdx !== -1) {
      return lines.slice(startIdx, endIdx + 1).join('\n').trim();
    }
  }
  if (label.includes('raise HTTPException')) {
    const lines = source.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('HTTPException')) {
        let s = i;
        if (i > 0 && lines[i - 1].trim().startsWith('if ')) s = i - 1;
        return lines.slice(s, i + 1).join('\n').trim();
      }
    }
  }
  return label;
}

/**
 * Format a complete code snippet instruction for the code editor based on current level and language.
 *
 * @param {GoalItem} item
 * @param {object} level
 * @returns {string}
 */
export function editorSnippetForGoal(item, level) {
  if (!level) return item.label;
  if (item.kind === 'endpoint') {
    const s = extractHandlerSnippet(level.solutionCode, item.label, level.language);
    if (s) return s;
    if (level.pattern) return level.pattern;
  }
  if (item.kind === 'code') {
    const s = extractCodeSnippet(level.solutionCode, item.label);
    if (s) return s;
    return item.label;
  }
  return item.label;
}
