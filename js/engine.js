/**
 * LearnAPI engine — FastAPI (Python) and plumber (R) parsers plus a
 * mock HTTP runtime used by the tutorial game. Pure client-side; no
 * real Python or R is executed. Handlers are reduced to static returns
 * and simple parameter substitution so levels stay deterministic.
 *
 * Args:
 *   (module — import consumers only)
 *
 * Returns:
 *   (exports: createApp, parseSource, matchRoute, executeRequest, ...)
 */

/** @typedef {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} HttpMethod */

/**
 * @typedef {Object} Route
 * @property {HttpMethod} method
 * @property {string} path
 * @property {string} handlerName
 * @property {string} source
 * @property {Record<string, string>} params
 * @property {number} status
 * @property {string|null} summary
 * @property {string|null} tag
 * @property {Record<string, {type: string, required: boolean, example?: unknown}>} query
 * @property {{type: string, required: boolean, example?: unknown}|null} body
 * @property {string|null} bodyModel
 */

/**
 * @typedef {Object} ParsedApp
 * @property {'python'|'r'} language
 * @property {string} title
 * @property {string} version
 * @property {Route[]} routes
 * @property {string[]} errors
 * @property {Record<string, object>} models
 */

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Normalize a route path to a canonical form (leading slash, no trailing slash).
 *
 * @param {string} path
 * @returns {string}
 */
function normalizePath(path) {
  if (!path) return '/';
  let p = path.trim();
  if (!p.startsWith('/')) p = '/' + p;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

/**
 * Convert OpenAPI-style `{id}` and plumber-style `<id>` path params to `{id}`.
 *
 * @param {string} path
 * @returns {string}
 */
function normalizePathParams(path) {
  return normalizePath(path).replace(/<([^>]+)>/g, '{$1}');
}

/**
 * Extract a balanced-brace block starting at `start` (index of `{`).
 *
 * @param {string} src
 * @param {number} start
 * @returns {string}
 */
function extractBraces(src, start) {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  return src.slice(start);
}

/**
 * Parse a JSON-ish / Python-dict / R-list literal into a JS value.
 * Supports nested objects/arrays, strings, numbers, true/false/null, TRUE/FALSE/NULL.
 *
 * @param {string} text
 * @returns {unknown}
 */
function parseLiteral(text) {
  const src = text.trim();
  if (!src) return null;
  // Fast path: JSON
  try {
    return JSON.parse(src);
  } catch {
    /* fall through */
  }
  let normalized = src
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null')
    .replace(/\bNULL\b/g, 'null')
    .replace(/\bNA\b/g, 'null')
    .replace(/\bTRUE\b/g, 'true')
    .replace(/\bFALSE\b/g, 'false')
    // single quotes → double
    .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, s) => JSON.stringify(s))
    // Python/R keyword keys: name: / name = (also right after ( or [)
    .replace(/([({[,\s])([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":')
    .replace(/([({[,\s])([A-Za-z_][A-Za-z0-9_]*)\s*=/g, '$1"$2":')
    // list(...) / dict(...) / c(...) wrappers appear as bare tokens — strip common ones
    .replace(/\blist\s*\(/g, '(')
    .replace(/\bdict\s*\(/g, '(')
    .replace(/\bc\s*\(/g, '(');
  // Bare identifier values (path/query param names, attr reads) → strings so
  // JSON parses; bindValue rewrites a string that equals a binding key.
  normalized = normalized.replace(
    /:\s*([A-Za-z_][A-Za-z0-9_]*(?:[.$][A-Za-z_][A-Za-z0-9_]*)?)(\s*[,}\])])/g,
    (_, id, end) => {
      if (['true', 'false', 'null'].includes(id)) return `: ${id}${end}`;
      return `: ${JSON.stringify(id)}${end}`;
    }
  );
  // R: list(a = 1, b = 2) already handled; empty list()
  normalized = normalized.replace(/\(\s*\)/g, '{}');
  // R list() / parenthesized dict: `("a": 1)` without braces → `{"a": 1}`
  // R list of values: `(1, 2, 3)` → `[1, 2, 3]`
  if (/^\(/.test(normalized) && !/^\(\s*[\{\[]/.test(normalized)) {
    const inner = extractBracesOrParens(normalized, 0).slice(1, -1).trim();
    if (/:/.test(inner) && !/^[\d\s.,\-+"']*$/.test(inner)) {
      normalized = `{${inner}}`;
    } else if (inner === '') {
      normalized = '{}';
    } else if (/,/.test(inner) || /^[\d\s.\-+"']+$/.test(inner)) {
      // array-like — quote bare words
      const items = splitTopLevel(inner).map((p) => p.trim()).filter(Boolean);
      const mapped = items.map((p) => {
        try {
          return JSON.parse(p);
        } catch {
          return p.replace(/^["']|["']$/g, '');
        }
      });
      normalized = JSON.stringify(mapped);
    }
  }
  // Unwrap outer parens used as object: ({...}) → {...} if content is object-like
  if (/^\(\s*\{/.test(normalized)) {
    normalized = normalized.replace(/^\(\s*/, '').replace(/\s*\)$/, '');
  }
  if (/^\(\s*\[/.test(normalized)) {
    normalized = normalized.replace(/^\(\s*/, '').replace(/\s*\)$/, '');
  }
  try {
    return JSON.parse(normalized);
  } catch {
    /* ignore */
  }
  // Last resort: treat as string
  return src;
}

/**
 * Split on top-level commas (used for R list() → array).
 *
 * @param {string} raw
 * @returns {string[]}
 */
function splitTopLevel(raw) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of raw) {
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    if (ch === ')' || ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

/**
 * Pull `return <literal>` / bare `list(...)` as the handler payload template.
 *
 * @param {string} body
 * @returns {string}
 */
function extractReturnLiteral(body) {
  // Prefer the last Python `return <expr>`
  const returns = [...body.matchAll(/\breturn\s+([\s\S]+)/g)];
  let expr = '';
  if (returns.length) {
    expr = returns[returns.length - 1][1];
  } else {
    // plumber / R: last `list(...)` call
    const lists = [...body.matchAll(/\blist\s*\(/g)];
    if (lists.length) {
      const start = lists[lists.length - 1].index + lists[lists.length - 1][0].length - 1;
      expr = extractBracesOrParens(body, start);
    } else {
      expr = body;
    }
  }
  expr = expr
    .replace(/#.*$/gm, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/;+\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Cut trailing R/Python noise after the first complete top-level literal
  if (expr.startsWith('{') || expr.startsWith('(') || expr.startsWith('[')) {
    const open = expr[0];
    const close = open === '{' ? '}' : open === '(' ? ')' : ']';
    let depth = 0;
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === open) depth++;
      else if (expr[i] === close) {
        depth--;
        if (depth === 0) {
          expr = expr.slice(0, i + 1);
          break;
        }
      }
    }
  }
  return expr;
}

/**
 * Extract a balanced (...) block starting at `start` (index of `(`).
 *
 * @param {string} src
 * @param {number} start
 * @returns {string}
 */
function extractBracesOrParens(src, start) {
  const open = src[start];
  const close = open === '(' ? ')' : open === '{' ? '}' : ']';
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === open) depth++;
    else if (src[i] === close) {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  return src.slice(start);
}

/**
 * Substitute `{id}`, bare names, and `user.name` attribute reads.
 *
 * @param {unknown} value
 * @param {Record<string, unknown>} bindings
 * @returns {unknown}
 */
function bindValue(value, bindings) {
  if (typeof value === 'string') {
    const full = value.match(/^\{(\w+)\}$/);
    if (full && bindings[full[1]] !== undefined) {
      return bindings[full[1]];
    }
    if (Object.prototype.hasOwnProperty.call(bindings, value)) {
      return bindings[value];
    }
    // Pydantic-style `user.name` / R `body$name` → bindings
    const attr = value.match(/^(\w+)[.$](\w+)$/);
    if (attr) {
      const key = `${attr[1]}.${attr[2]}`;
      if (Object.prototype.hasOwnProperty.call(bindings, key)) return bindings[key];
      if (Object.prototype.hasOwnProperty.call(bindings, attr[2])) return bindings[attr[2]];
      if (Object.prototype.hasOwnProperty.call(bindings, value)) return bindings[value];
    }
    return value.replace(/\{(\w+)\}/g, (m, k) =>
      bindings[k] !== undefined ? String(bindings[k]) : m
    );
  }
  if (Array.isArray(value)) return value.map((v) => bindValue(v, bindings));
  if (value && typeof value === 'object') {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = bindValue(v, bindings);
    return out;
  }
  return value;
}

/**
 * Parse FastAPI-style Python source into routes and models.
 *
 * @param {string} source
 * @returns {ParsedApp}
 */
function parsePython(source) {
  /** @type {ParsedApp} */
  const app = {
    language: 'python',
    title: 'FastAPI',
    version: '1.0.0',
    routes: [],
    errors: [],
    models: {},
  };

  const titleMatch = source.match(/FastAPI\s*\(([^)]*)\)/);
  if (titleMatch) {
    const t = titleMatch[1].match(/title\s*=\s*['"]([^'"]+)['"]/);
    const v = titleMatch[1].match(/version\s*=\s*['"]([^'"]+)['"]/);
    if (t) app.title = t[1];
    if (v) app.version = v[1];
  }

  // Pydantic-ish models
  const classRe = /class\s+(\w+)\s*(?:\(([^)]*)\))?\s*:\n([\s\S]*?)(?=\nclass\s|\n@app\.|\nif\s|$)/g;
  let cm;
  while ((cm = classRe.exec(source))) {
    const [, name, , body] = cm;
    /** @type {Record<string, {type: string, required: boolean, example?: unknown}>} */
    const fields = {};
    for (const line of body.split('\n')) {
      const fm = line.match(/^\s{4}(\w+)\s*:\s*([^=\n]+?)\s*=\s*(.+)$/)
        || line.match(/^\s{4}(\w+)\s*:\s*([^=\n]+)$/);
      if (!fm) continue;
      const type = fm[2].trim().replace(/\[.*$/, '').trim();
      fields[fm[1]] = {
        type,
        required: fm[3] === undefined,
        example: fm[3] !== undefined ? parseLiteral(fm[3]) : undefined,
      };
    }
    app.models[name] = fields;
  }

  const routeRe = /@app\.(get|post|put|patch|delete)\s*\(\s*(['"])([^'"]+)\2([^)]*)\)/g;
  let rm;
  while ((rm = routeRe.exec(source))) {
    const method = rm[1].toUpperCase();
    const path = normalizePathParams(rm[3]);
    const args = rm[4] || '';
    const after = source.slice(rm.index + rm[0].length);
    const defMatch = after.match(/^\s*(?:async\s+)?def\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*[^:]+)?\s*:\n([\s\S]*?)(?=\n@|\ndef\s|\nasync\s|\nclass\s|$)/);
    const handlerName = defMatch ? defMatch[1] : 'handler';
    const paramsRaw = defMatch ? defMatch[2] : '';
    const bodyRaw = defMatch ? defMatch[3] : '';

    /** @type {Record<string, string>} */
    const pathParams = {};
    for (const m of path.matchAll(/\{(\w+)(?::(\w+))?\}/g)) {
      pathParams[m[1]] = m[2] || 'str';
    }
    // FastAPI path params are untyped in the path string; types live in the
    // function signature (`user_id: int`). Upgrade defaults from the signature.
    for (const part of splitArgs(paramsRaw)) {
      const sig = part.match(/^\s*self\s*,?/) ? null : part.match(/^\s*(\w+)\s*:\s*([A-Za-z_][\w\[\], .]*)/);
      if (sig && pathParams[sig[1]] !== undefined) {
        pathParams[sig[1]] = sig[2].trim().split('=')[0].trim();
      }
    }

    /** @type {Record<string, {type: string, required: boolean}>} */
    const query = {};
    let body = null;
    let bodyModel = null;

    for (const part of splitArgs(paramsRaw)) {
      const nm = part.match(/^\s*(\w+)\s*(?::\s*([^=]+?))?\s*(?:=\s*(.+))?$/s);
      if (!nm) continue;
      const name = nm[1];
      if (name === 'self' || name === 'req' || name === 'request') continue;
      const type = (nm[2] || 'str').trim().split('=')[0].trim();
      const def = nm[3];
      if (pathParams[name] !== undefined) {
        // keep signature type on the path param
        if (nm[2]) pathParams[name] = type;
        continue;
      }
      if (Object.keys(app.models).includes(type) || /BaseModel|User|Item|Create|Request/.test(type)) {
        body = { type, required: def === undefined };
        bodyModel = type;
      } else {
        query[name] = { type, required: def === undefined };
      }
    }

    let status = 200;
    const sc = args.match(/status_code\s*=\s*(\d{3})/);
    if (sc) status = parseInt(sc[1], 10);
    const summary = (args.match(/summary\s*=\s*['"]([^'"]+)['"]/) || [])[1] || null;
    const tag = (args.match(/tags\s*=\s*\[\s*['"]([^'"]+)['"]\s*\]/) || [])[1] || null;

    app.routes.push({
      method: /** @type {HttpMethod} */ (method),
      path,
      handlerName,
      source: bodyRaw,
      params: pathParams,
      status,
      summary,
      tag,
      query,
      body,
      bodyModel,
    });
  }

  if (!app.routes.length && /@app\./.test(source)) {
    app.errors.push('Found @app decorators but no routes parsed — check syntax.');
  }
  return app;
}

/**
 * Split Python def params on top-level commas.
 *
 * @param {string} raw
 * @returns {string[]}
 */
function splitArgs(raw) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of raw) {
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    if (ch === ')' || ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur);
  return parts.filter((p) => p.trim());
}

/**
 * Parse plumber-style R source (annotation comments + functions).
 *
 * @param {string} source
 * @returns {ParsedApp}
 */
function parseR(source) {
  /** @type {ParsedApp} */
  const app = {
    language: 'r',
    title: 'Plumber API',
    version: '1.0.0',
    routes: [],
    errors: [],
    models: {},
  };

  const title = source.match(/#\*\s*@apiTitle\s+(.+)/);
  const ver = source.match(/#\*\s*@apiVersion\s+(.+)/);
  if (title) app.title = title[1].trim();
  if (ver) app.version = ver[1].trim();

  // Split into annotation blocks: lines of #* @... followed by a function
  // NOTE: `#\*` is a literal '#*'; a bare `#*` in regex means zero-or-more '#'.
  const blockRe = /((?:^\s*#\*\s*@(?!api)\w+[^\n]*\n)+)^\s*((?:async\s+)?function\s*\([^)]*\)\s*\{[\s\S]*?\n\})/gm;
  let bm;
  while ((bm = blockRe.exec(source))) {
    const annotations = bm[1];
    const fn = bm[2];
    const methodPath = annotations.match(/@((?:get|post|put|patch|delete))\s+(\S+)/i);
    if (!methodPath) continue;
    const method = methodPath[1].toUpperCase();
    const path = normalizePathParams(methodPath[2]);
    const handlerName = (fn.match(/function\s*(\w+)?/) || [])[1] || 'pr_handle';

    /** @type {Record<string, string>} */
    const pathParams = {};
    for (const m of path.matchAll(/\{(\w+)\}/g)) {
      pathParams[m[1]] = 'unknown';
    }

    /** @type {Record<string, {type: string, required: boolean}>} */
    const query = {};
    for (const pm of annotations.matchAll(/@param\s+([^:\s]+)(?::(\w+))?/g)) {
      const name = pm[1].replace(/[<{}>]/g, '');
      if (pathParams[name]) {
        pathParams[name] = pm[2] || 'unknown';
      } else {
        query[name] = { type: pm[2] || 'string', required: true };
      }
    }

    let status = 200;
    const sc = annotations.match(/@status\s+(\d{3})/i) || annotations.match(/@response\s+(\d{3})/i);
    if (sc) status = parseInt(sc[1], 10);
    const summary = (annotations.match(/@description\s+(.+)/) || [])[1]?.trim() || null;
    const tag = (annotations.match(/@tag\s+(.+)/) || [])[1]?.trim() || null;

    let body = null;
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      body = { type: 'object', required: true };
      if (/req\$postBody|req\$body|fromJSON/.test(fn)) {
        body.type = 'json';
      }
    }

    app.routes.push({
      method: /** @type {HttpMethod} */ (method),
      path,
      handlerName,
      source: fn,
      params: pathParams,
      status,
      summary,
      tag,
      query,
      body,
      bodyModel: null,
    });
  }

  // Fallback: @get /path without captured function body
  const loose = [...source.matchAll(/#\*\s*@(get|post|put|patch|delete)\s+(\S+)/gi)];
  if (!app.routes.length && loose.length) {
    app.errors.push('Found plumber annotations but no handler functions — attach function() { ... }.');
  }
  return app;
}

/**
 * Detect language and parse.
 *
 * @param {string} source
 * @param {'python'|'r'|'auto'} [language]
 * @returns {ParsedApp}
 */
export function parseSource(source, language = 'auto') {
  const lang =
    language !== 'auto'
      ? language
      : /@app\.(get|post|put|patch|delete)|from fastapi/i.test(source)
        ? 'python'
        : /library\(plumber\)|#*\s*@(get|post)/i.test(source)
          ? 'r'
          : 'python';
  return lang === 'r' ? parseR(source) : parsePython(source);
}

/**
 * Match a request against the route table.
 *
 * @param {Route[]} routes
 * @param {HttpMethod} method
 * @param {string} path
 * @returns {{ route: Route, params: Record<string, string> } | null}
 */
export function matchRoute(routes, method, path) {
  const p = normalizePathParams(path.split('?')[0]);
  for (const route of routes) {
    if (route.method !== method) continue;
    const routeParts = route.path.split('/').filter(Boolean);
    const reqParts = p.split('/').filter(Boolean);
    if (routeParts.length !== reqParts.length) continue;
    /** @type {Record<string, string>} */
    const params = {};
    let ok = true;
    for (let i = 0; i < routeParts.length; i++) {
      const rp = routeParts[i];
      const qp = reqParts[i];
      const pm = rp.match(/^\{(\w+)\}$/);
      if (pm) {
        params[pm[1]] = decodeURIComponent(qp);
      } else if (rp !== qp) {
        ok = false;
        break;
      }
    }
    if (ok) return { route, params };
  }
  return null;
}

/**
 * Coerce a string binding to match a declared parameter type.
 *
 * @param {unknown} raw
 * @param {string} type
 * @returns {unknown}
 */
function coerce(raw, type) {
  const t = (type || '').toLowerCase();
  if (raw === undefined || raw === null || raw === '') return raw;
  if (['int', 'integer', 'long'].includes(t)) {
    const n = Number(raw);
    return Number.isNaN(n) ? raw : Math.trunc(n);
  }
  if (['float', 'double', 'number', 'numeric'].includes(t)) {
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  if (['bool', 'boolean'].includes(t)) {
    if (raw === true || raw === 'true' || raw === 'True') return true;
    if (raw === false || raw === 'false' || raw === 'False') return false;
    return raw;
  }
  return raw;
}

/**
 * Build bindings for handler interpolation.
 *
 * @param {Route} route
 * @param {Record<string, string>} pathParams
 * @param {Record<string, string>} query
 * @param {unknown} body
 * @returns {Record<string, unknown>}
 */
function buildBindings(route, pathParams, query, body) {
  /** @type {Record<string, unknown>} */
  const b = {};
  for (const [k, v] of Object.entries(pathParams)) {
    b[k] = coerce(v, route.params[k]);
  }
  for (const [k, v] of Object.entries(query)) {
    b[k] = coerce(v, route.query[k]?.type);
  }
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    for (const [k, v] of Object.entries(body)) {
      b[k] = v;
      b[`body.${k}`] = v;
    }
  }
  return b;
}

/**
 * Execute a mock request against a parsed app.
 *
 * @param {ParsedApp} parsed
 * @param {{ method: HttpMethod|string, path: string, query?: Record<string, string>, body?: unknown }} req
 * @returns {{ status: number, ok: boolean, headers: Record<string, string>, body: unknown, matched: Route|null, params: Record<string, string>, error?: string }}
 */
export function executeRequest(parsed, req) {
  const method = String(req.method).toUpperCase();
  const rawPath = req.path || '/';
  const [pathname, qs] = rawPath.split('?');
  /** @type {Record<string, string>} */
  const query = { ...(req.query || {}) };
  if (qs) {
    for (const [k, v] of new URLSearchParams(qs)) query[k] = v;
  }

  const hit = matchRoute(parsed.routes, method, pathname);
  if (!hit) {
    return {
      status: 404,
      ok: false,
      headers: { 'content-type': 'application/json' },
      body: { detail: `No route for ${method} ${normalizePath(pathname)}` },
      matched: null,
      params: {},
      error: 'not_found',
    };
  }

  const bindings = buildBindings(hit.route, hit.params, query, req.body);
  const template = parseLiteral(extractReturnLiteral(hit.route.source));
  const bound = bindValue(template, bindings);

  // Simulate missing required path typing lightly
  for (const [k, t] of Object.entries(hit.route.params)) {
    const tn = (t || '').toLowerCase();
    if ((tn === 'int' || tn === 'integer') && Number.isNaN(Number(hit.params[k]))) {
      return {
        status: 422,
        ok: false,
        headers: { 'content-type': 'application/json' },
        body: {
          detail: [
            {
              loc: ['path', k],
              msg: 'value is not a valid integer',
              type: 'type_error.integer',
            },
          ],
        },
        matched: hit.route,
        params: hit.params,
        error: 'validation',
      };
    }
  }

  const status = hit.route.status;
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { 'content-type': 'application/json' },
    body: bound === null ? null : bound,
    matched: hit.route,
    params: hit.params,
  };
}

/**
 * Create an immutable app snapshot from source.
 *
 * @param {string} source
 * @param {'python'|'r'|'auto'} [language]
 * @returns {ParsedApp & { call: (req: object) => ReturnType<typeof executeRequest> }}
 */
export function createApp(source, language = 'auto') {
  const parsed = parseSource(source, language);
  return {
    ...parsed,
    call(req) {
      return executeRequest(parsed, req);
    },
  };
}

/**
 * Template a return literal (used by demos and tests).
 *
 * @param {string} bodySource
 * @param {Record<string, unknown>} bindings
 * @returns {unknown}
 */
export function renderHandlerBody(bodySource, bindings) {
  return bindValue(parseLiteral(extractReturnLiteral(bodySource)), bindings);
}

export const __internals = {
  normalizePath,
  normalizePathParams,
  parseLiteral,
  extractReturnLiteral,
  extractBraces,
  extractBracesOrParens,
  bindValue,
  buildBindings,
  coerce,
  METHODS,
};
