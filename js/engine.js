/**
 * LearnAPI engine — FastAPI (Python) and plumber (R) parsers plus a
 * deterministic mock HTTP runtime used by the tutorial simulator.
 *
 * Client-side execution model:
 * Parses route declarations, Pydantic models, dependencies (Depends),
 * header auth contracts, query/path parameters, and evaluates handler
 * expressions with local variable scoping and type coercion.
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
 * @property {Record<string, {type: string, required: boolean, alias?: string}>} headers
 * @property {string[]} deps
 * @property {{status: number, detail: string, ifParam?: string, ifEquals?: string|number}[]} raises
 * @property {{type: string, required: boolean, example?: unknown}|null} body
 * @property {string|null} bodyModel
 * @property {string|null} responseModel
 */

/**
 * @typedef {Object} ParsedApp
 * @property {'python'|'r'} language
 * @property {string} title
 * @property {string} version
 * @property {Route[]} routes
 * @property {string[]} errors
 * @property {Record<string, object>} models
 * @property {Record<string, unknown>} dependencies
 */

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Normalize a route path to canonical form (leading slash, no trailing slash).
 * @param {string} path
 * @returns {string}
 */
export function normalizePath(path) {
  if (!path) return '/';
  let p = path.trim();
  if (!p.startsWith('/')) p = '/' + p;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

/**
 * Convert OpenAPI-style `{id}` and plumber-style `<id>` path params to `{id}`.
 * @param {string} path
 * @returns {string}
 */
export function normalizePathParams(path) {
  return normalizePath(path).replace(/<([^:>]+)(?::[^>]+)?>/g, '{$1}');
}

/**
 * Extract a balanced-delimiter block starting at `start`.
 * @param {string} src
 * @param {number} start
 * @param {string} [open='{']
 * @param {string} [close='}']
 * @returns {string}
 */
export function extractBalanced(src, start, open = '{', close = '}') {
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
 * Parse literals and dictionary/list templates into JavaScript values.
 * @param {string} text
 * @returns {unknown}
 */
export function parseLiteral(text) {
  const src = text.trim();
  if (!src) return null;
  try {
    return JSON.parse(src);
  } catch {
    /* fall through to normalization */
  }

  let normalized = src
    .replace(/\bas\.(?:integer|numeric|character)\s*\(\s*([A-Za-z_][\w.$]*)\s*\)/g, '$1')
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null')
    .replace(/\bNULL\b/g, 'null')
    .replace(/\bNA\b/g, 'null')
    .replace(/\bTRUE\b/g, 'true')
    .replace(/\bFALSE\b/g, 'false')
    // settings["app_name"] -> settings.app_name
    .replace(/([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*['"]([^'"]+)['"]\s*\]/g, '$1.$2')
    // single quotes -> double
    .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, s) => JSON.stringify(s))
    // keys name: or name =
    .replace(/([({[,\s])([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":')
    .replace(/([({[,\s])([A-Za-z_][A-Za-z0-9_]*)\s*=/g, '$1"$2":')
    .replace(/\blist\s*\(/g, '(')
    .replace(/\bdict\s*\(/g, '(')
    .replace(/\bc\s*\(/g, '(');

  // identifiers to quoted strings for JSON parsing
  normalized = normalized.replace(
    /:\s*([A-Za-z_][A-Za-z0-9_]*(?:[.$][A-Za-z_][A-Za-z0-9_]*)?)(\s*[,}\])])/g,
    (_, id, end) => {
      if (['true', 'false', 'null'].includes(id)) return `: ${id}${end}`;
      return `: ${JSON.stringify(id)}${end}`;
    }
  );

  normalized = normalized.replace(/\(\s*\)/g, '{}');

  if (/^\(/.test(normalized) && !/^\(\s*[\{\[]/.test(normalized)) {
    const inner = extractBalanced(normalized, 0, '(', ')').slice(1, -1).trim();
    if (/:/.test(inner) && !/^[\d\s.,\-+"']*$/.test(inner)) {
      normalized = `{${inner}}`;
    } else if (inner === '') {
      normalized = '{}';
    } else if (/,/.test(inner) || /^[\d\s.\-+"']+$/.test(inner)) {
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

  if (/^\(\s*\{/.test(normalized)) {
    normalized = normalized.replace(/^\(\s*/, '').replace(/\s*\)$/, '');
  }
  if (/^\(\s*\[/.test(normalized)) {
    normalized = normalized.replace(/^\(\s*/, '').replace(/\s*\)$/, '');
  }

  try {
    return JSON.parse(normalized);
  } catch {
    /* fallback to raw text */
  }
  return src;
}

/**
 * Split on top-level commas.
 * @param {string} raw
 * @returns {string[]}
 */
export function splitTopLevel(raw) {
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
 * Extract return literal or R list from handler source.
 * @param {string} body
 * @returns {string}
 */
export function extractReturnLiteral(body) {
  const cleaned = body.replace(/#.*$/gm, '').replace(/\/\/.*$/gm, '');
  const returns = [...cleaned.matchAll(/\breturn\s+([\s\S]+)/g)];
  let expr = '';
  if (returns.length) {
    expr = returns[returns.length - 1][1];
  } else {
    const lists = [...cleaned.matchAll(/\blist\s*\(/g)];
    if (lists.length) {
      const start = lists[lists.length - 1].index + lists[lists.length - 1][0].length - 1;
      expr = extractBalanced(cleaned, start, '(', ')');
    } else {
      expr = cleaned;
    }
  }

  expr = expr
    .replace(/;+\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();

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
 * Substitute variables, f-strings, and attribute reads in an evaluated value.
 * @param {unknown} value
 * @param {Record<string, unknown>} bindings
 * @returns {unknown}
 */
export function bindValue(value, bindings) {
  if (typeof value === 'string') {
    const full = value.match(/^\{(\w+)\}$/);
    if (full && bindings[full[1]] !== undefined) {
      return bindings[full[1]];
    }
    if (Object.prototype.hasOwnProperty.call(bindings, value)) {
      return bindings[value];
    }
    // user.name or body$name or settings.app_name
    const attr = value.match(/^(\w+)[.$](\w+)$/);
    if (attr) {
      const key = `${attr[1]}.${attr[2]}`;
      if (Object.prototype.hasOwnProperty.call(bindings, key)) return bindings[key];
      if (Object.prototype.hasOwnProperty.call(bindings, attr[2])) return bindings[attr[2]];
      if (Object.prototype.hasOwnProperty.call(bindings, value)) return bindings[value];
      const bag = bindings[attr[1]];
      if (bag && typeof bag === 'object' && !Array.isArray(bag) && attr[2] in bag) {
        return bag[attr[2]];
      }
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
 * Coerce values into specified types.
 * @param {unknown} raw
 * @param {string} type
 * @returns {unknown}
 */
export function coerce(raw, type) {
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
 * Micro-evaluator for handler statements and expressions.
 * Supports local variable assignments, simple math, string templates, and conditions.
 *
 * @param {string} source
 * @param {Record<string, unknown>} bindings
 * @returns {{ bound: unknown, earlyReturn?: { status: number, detail: string } }}
 */
export function evaluateHandler(source, bindings) {
  const scope = { ...bindings };
  const lines = source.split('\n');
  let skippingBlock = false;
  let blockIndent = 0;

  for (const rawLine of lines) {
    const indent = rawLine.search(/\S|$/);
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;

    if (skippingBlock) {
      if (indent > blockIndent) {
        continue;
      }
      skippingBlock = false;
    }

    // if condition:
    const ifMatch = line.match(/^if\s+([A-Za-z_]\w*)\s*(==|!=|<|>|<=|>=)\s*([^:]+)\s*:/);
    if (ifMatch) {
      const leftName = ifMatch[1];
      const op = ifMatch[2];
      const rightRaw = ifMatch[3].trim().replace(/^['"]|['"]$/g, '');
      const leftVal = scope[leftName];
      const rightVal = /^-?\d+$/.test(rightRaw) ? Number(rightRaw) : rightRaw;

      let condMet = false;
      if (op === '==') condMet = String(leftVal) === String(rightVal);
      if (op === '!=') condMet = String(leftVal) !== String(rightVal);
      if (op === '<') condMet = Number(leftVal) < Number(rightVal);
      if (op === '>') condMet = Number(leftVal) > Number(rightVal);
      if (op === '<=') condMet = Number(leftVal) <= Number(rightVal);
      if (op === '>=') condMet = Number(leftVal) >= Number(rightVal);

      if (!condMet) {
        skippingBlock = true;
        blockIndent = indent;
        continue;
      }
    }

    // Check for `raise HTTPException(status_code=N, detail="...")`
    const raiseMatch = line.match(/^raise\s+HTTPException\(\s*status_code\s*=\s*(\d{3})(?:,\s*detail\s*=\s*['"]([^'"]+)['"])?\s*\)/);
    if (raiseMatch) {
      return {
        bound: null,
        earlyReturn: {
          status: parseInt(raiseMatch[1], 10),
          detail: raiseMatch[2] || 'error',
        },
      };
    }

    // Direct return statement in executed block
    if (/^return(\s+.*|\{.*|\[.*|$)/.test(line)) {
      const idx = source.indexOf(rawLine);
      const rest = idx >= 0 ? source.slice(idx) : rawLine;
      const retStr = extractReturnLiteral(rest);
      const val = bindValue(parseLiteral(retStr), scope);
      return { bound: val };
    }

    // Assignment: var_name = expr or var_name <- expr
    const assignMatch = line.match(/^([A-Za-z_]\w*)\s*(?:=|<-)\s*([^=].*)$/);
    if (assignMatch && !line.startsWith('if ') && !line.startsWith('return ')) {
      const varName = assignMatch[1];
      const expr = assignMatch[2].trim();

      // Math: a + b, a - b, etc.
      const mathMatch = expr.match(/^([A-Za-z_]\w*|\d+)\s*([\+\-\*\/])\s*([A-Za-z_]\w*|\d+)$/);
      if (mathMatch) {
        const leftVal = mathMatch[1] in scope ? Number(scope[mathMatch[1]]) : Number(mathMatch[1]);
        const rightVal = mathMatch[3] in scope ? Number(scope[mathMatch[3]]) : Number(mathMatch[3]);
        if (!Number.isNaN(leftVal) && !Number.isNaN(rightVal)) {
          if (mathMatch[2] === '+') scope[varName] = leftVal + rightVal;
          if (mathMatch[2] === '-') scope[varName] = leftVal - rightVal;
          if (mathMatch[2] === '*') scope[varName] = leftVal * rightVal;
          if (mathMatch[2] === '/') scope[varName] = leftVal / rightVal;
          continue;
        }
      }

      // f-string: f"hello {name}"
      const fStringMatch = expr.match(/^f['"](.*)['"]$/);
      if (fStringMatch) {
        scope[varName] = fStringMatch[1].replace(/\{(\w+)\}/g, (_, k) =>
          scope[k] !== undefined ? String(scope[k]) : ''
        );
        continue;
      }

      // Literal or variable reference
      if (expr in scope) {
        scope[varName] = scope[expr];
      } else {
        scope[varName] = parseLiteral(expr);
      }
    }
  }

  const templateStr = extractReturnLiteral(source);
  const parsedTemplate = parseLiteral(templateStr);
  const bound = bindValue(parsedTemplate, scope);

  return { bound };
}

/**
 * Split Python def arguments on top-level commas.
 * @param {string} raw
 * @returns {string[]}
 */
export function splitArgs(raw) {
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
 * Parse FastAPI Python source into routes, models, and dependencies.
 * @param {string} source
 * @returns {ParsedApp}
 */
export function parsePython(source) {
  /** @type {ParsedApp} */
  const app = {
    language: 'python',
    title: 'FastAPI',
    version: '1.0.0',
    routes: [],
    errors: [],
    models: {},
    dependencies: {},
  };

  const titleMatch = source.match(/FastAPI\s*\(([^)]*)\)/);
  if (titleMatch) {
    const t = titleMatch[1].match(/title\s*=\s*['"]([^'"]+)['"]/);
    const v = titleMatch[1].match(/version\s*=\s*['"]([^'"]+)['"]/);
    if (t) app.title = t[1];
    if (v) app.version = v[1];
  }

  // Pydantic models
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
      const rawType = fm[2].trim();
      const type = rawType.replace(/\[.*$/, '').replace(/\|.*$/, '').trim();
      fields[fm[1]] = {
        type,
        required: fm[3] === undefined && !rawType.includes('None') && !rawType.includes('Optional'),
        example: fm[3] !== undefined ? parseLiteral(fm[3]) : undefined,
      };
    }
    app.models[name] = fields;
  }

  // Dependency providers: def get_settings(): return {...}
  const depRe = /def\s+([A-Za-z_]\w*)\s*\(\s*\)\s*:\n([\s\S]*?)(?=\n@|\ndef\s|\nasync\s|\nclass\s|$)/g;
  let dm;
  while ((dm = depRe.exec(source))) {
    const name = dm[1];
    const body = dm[2];
    if (/@app\./.test(source.slice(Math.max(0, dm.index - 80), dm.index))) continue;
    const lit = extractReturnLiteral(body);
    if (lit) {
      try {
        app.dependencies[name] = parseLiteral(lit);
      } catch {
        /* ignore */
      }
    }
  }

  // Routes: @app.get(...), @app.post(...)
  const routeRe = /@app\.(get|post|put|patch|delete)\s*\(\s*(['"])([^'"]+)\2([^)]*)\)/g;
  let rm;
  while ((rm = routeRe.exec(source))) {
    const method = rm[1].toUpperCase();
    const path = normalizePathParams(rm[3]);
    const args = rm[4] || '';
    const after = source.slice(rm.index + rm[0].length);
    const defHead = after.match(/^\s*(?:async\s+)?def\s+(\w+)\s*\(/);
    const handlerName = defHead ? defHead[1] : 'handler';
    let paramsRaw = '';
    let bodyRaw = '';
    if (defHead) {
      const parenStart = after.indexOf('(', defHead.index + defHead[0].length - 1);
      const paramsBlock = extractBalanced(after, parenStart, '(', ')');
      paramsRaw = paramsBlock.slice(1, -1);
      const afterParams = after.slice(parenStart + paramsBlock.length);
      const bodyM = afterParams.match(/^\s*(?:->\s*[^:]+)?\s*:\n([\s\S]*?)(?=\n@|\ndef\s|\nasync\s|\nclass\s|$)/);
      bodyRaw = bodyM ? bodyM[1] : '';
    }

    /** @type {Record<string, string>} */
    const pathParams = {};
    for (const m of path.matchAll(/\{(\w+)(?::(\w+))?\}/g)) {
      pathParams[m[1]] = m[2] || 'str';
    }

    const cleanParamsRaw = paramsRaw.replace(/#.*$/gm, '').replace(/\/\/.*$/gm, '');

    for (const part of splitArgs(cleanParamsRaw)) {
      const sig = part.match(/^\s*self\s*,?/) ? null : part.match(/^\s*(\w+)\s*:\s*([A-Za-z_][\w\[\], .|]*)/);
      if (sig && pathParams[sig[1]] !== undefined) {
        pathParams[sig[1]] = sig[2].trim().split('=')[0].trim();
      }
    }

    /** @type {Record<string, {type: string, required: boolean}>} */
    const query = {};
    /** @type {Record<string, {type: string, required: boolean, alias?: string}>} */
    const headers = {};
    /** @type {string[]} */
    const deps = [];
    let body = null;
    let bodyModel = null;

    for (const part of splitArgs(cleanParamsRaw)) {
      const nm = part.match(/^\s*(\w+)\s*(?::\s*([^=]+?))?\s*(?:=\s*(.+))?$/s);
      if (!nm) continue;
      const name = nm[1];
      if (name === 'self' || name === 'req' || name === 'request') continue;
      const type = (nm[2] || 'str').trim().split('=')[0].trim();
      const def = nm[3];
      if (pathParams[name] !== undefined) {
        if (nm[2]) pathParams[name] = type;
        continue;
      }

      const dep = (def || type || '').match(/Depends\s*\(\s*([A-Za-z_][\w]*)\s*\)/);
      if (dep) {
        deps.push(dep[1]);
        continue;
      }

      const hdr = (def || type || '').match(/Header\s*\(\s*([.A-Za-z_]|'[^']*'|"[^"]*")/);
      if (hdr || /Header\b/.test(type) || /Header\b/.test(def || '')) {
        let alias = name.replace(/_/g, '-');
        const aliasStr = (def || '').match(/Header\s*\(\s*['"]([^'"]+)['"]/);
        if (aliasStr) alias = aliasStr[1];
        if (/api_key|apikey|token/i.test(name) && !aliasStr) {
          alias = name.replace(/_/g, '-');
        }
        headers[name] = {
          type: 'str',
          required: !/Optional|None/.test(type) && !/=\s*None/.test(def || ''),
          alias,
        };
        continue;
      }

      if (Object.keys(app.models).includes(type) || /BaseModel|User|Item|Create|Request/.test(type)) {
        body = { type, required: def === undefined };
        bodyModel = type;
      } else {
        const parsedDef = def !== undefined ? parseLiteral(def) : undefined;
        query[name] = {
          type,
          required: def === undefined && !rawType.includes('None') && !rawType.includes('Optional'),
          default: parsedDef,
        };
      }
    }

    let status = 200;
    const sc = args.match(/status_code\s*=\s*(\d{3})/);
    if (sc) status = parseInt(sc[1], 10);
    const summary = (args.match(/summary\s*=\s*['"]([^'"]+)['"]/) || [])[1] || null;
    const tag = (args.match(/tags\s*=\s*\[\s*['"]([^'"]+)['"]\s*\]/) || [])[1] || null;
    const responseModel =
      (args.match(/response_model\s*=\s*([A-Za-z_][\w]*)/) || [])[1] || null;

    const raises = [];
    const raiseRe =
      /if\s+(\w+)\s*==\s*(['"]?)([^'"\n:]+)\2\s*:\s*\n\s*raise\s+HTTPException\(\s*status_code\s*=\s*(\d{3})/g;
    let raiseM;
    while ((raiseM = raiseRe.exec(bodyRaw))) {
      const raw = raiseM[3].trim();
      raises.push({
        status: parseInt(raiseM[4], 10),
        detail: 'error',
        ifParam: raiseM[1],
        ifEquals: /^-?\d+$/.test(raw) ? Number(raw) : raw,
      });
    }

    if (/HTTPException\s*\(/.test(bodyRaw) && !raises.length) {
      const st = bodyRaw.match(/HTTPException\(\s*status_code\s*=\s*(\d{3})/);
      raises.push({
        status: st ? parseInt(st[1], 10) : 400,
        detail: (bodyRaw.match(/detail\s*=\s*['"]([^'"]+)['"]/) || [])[1] || 'error',
      });
    }

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
      headers,
      deps,
      raises,
      body,
      bodyModel,
      responseModel,
    });
  }

  if (!app.routes.length && /@app\./.test(source)) {
    app.errors.push('Found @app decorators but no routes parsed — verify indentation and syntax.');
  }
  return app;
}

/**
 * Parse plumber R source annotations and functions.
 * @param {string} source
 * @returns {ParsedApp}
 */
export function parseR(source) {
  /** @type {ParsedApp} */
  const app = {
    language: 'r',
    title: 'Plumber API',
    version: '1.0.0',
    routes: [],
    errors: [],
    models: {},
    dependencies: {},
  };

  const title = source.match(/#\*\s*@apiTitle\s+(.+)/);
  const ver = source.match(/#\*\s*@apiVersion\s+(.+)/);
  if (title) app.title = title[1].trim();
  if (ver) app.version = ver[1].trim();

  const blockRe = /((?:^\s*#\*(?!\s*@api)[^\n]*\n)+)^\s*((?:async\s+)?function\s*\([^)]*\)\s*\{[\s\S]*?\n\})/gm;
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
    for (const m of methodPath[2].matchAll(/<(\w+)(?::(\w+))?>/g)) {
      pathParams[m[1]] = m[2] || 'str';
    }
    for (const m of path.matchAll(/\{(\w+)\}/g)) {
      if (!pathParams[m[1]]) pathParams[m[1]] = 'str';
    }

    /** @type {Record<string, {type: string, required: boolean}>} */
    const query = {};
    for (const pm of annotations.matchAll(/@param\s+([^:\s]+)(?::(\w+))?/g)) {
      const name = pm[1].replace(/[<{}>]/g, '');
      if (pathParams[name] !== undefined) {
        if (pm[2]) pathParams[name] = pm[2];
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
      headers: {},
      deps: [],
      raises: [],
      body,
      bodyModel: null,
      responseModel: null,
    });
  }

  const loose = [...source.matchAll(/#\*\s*@(get|post|put|patch|delete)\s+(\S+)/gi)];
  if (!app.routes.length && loose.length) {
    app.errors.push('Found plumber annotations but no handler functions attached.');
  }
  return app;
}

/**
 * Detect language and parse source code.
 * @param {string} source
 * @param {'python'|'r'|'auto'} [language='auto']
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
 * Match an incoming request against route table.
 * @param {Route[]} routes
 * @param {HttpMethod|string} method
 * @param {string} path
 * @returns {{ route: Route, params: Record<string, string> } | null}
 */
export function matchRoute(routes, method, path) {
  const normMethod = String(method).toUpperCase();
  const p = normalizePathParams(path.split('?')[0]);
  for (const route of routes) {
    if (route.method !== normMethod) continue;
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
 * Build bindings map for request context.
 * @param {Route} route
 * @param {Record<string, string>} pathParams
 * @param {Record<string, string>} query
 * @param {unknown} body
 * @param {ParsedApp} [parsedApp]
 * @returns {Record<string, unknown>}
 */
export function buildBindings(route, pathParams, query, body, parsedApp) {
  /** @type {Record<string, unknown>} */
  const b = {};
  for (const [k, meta] of Object.entries(route.query || {})) {
    if (meta.default !== undefined) {
      b[k] = meta.default;
    }
  }
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

  // Inject Depends providers
  if (parsedApp?.dependencies && route.deps?.length) {
    for (const dep of route.deps) {
      const val = parsedApp.dependencies[dep];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        Object.assign(b, val);
        b[dep] = val;
        for (const [k, v] of Object.entries(val)) {
          b[`${dep}.${k}`] = v;
        }
      } else if (val !== undefined) {
        b[dep] = val;
      }
    }
  }
  return b;
}

/**
 * Execute a mock HTTP request against parsed application.
 *
 * @param {ParsedApp} parsed
 * @param {{ method: HttpMethod|string, path: string, query?: Record<string, string>, body?: unknown, headers?: Record<string, string> }} req
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

  /** @type {Record<string, string>} */
  const reqHeaders = {};
  for (const [k, v] of Object.entries(req.headers || {})) {
    reqHeaders[k.toLowerCase()] = v;
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

  // Required header validation (API key auth gate)
  for (const [name, meta] of Object.entries(hit.route.headers || {})) {
    if (!meta.required) continue;
    const alias = (meta.alias || name).toLowerCase();
    const present =
      reqHeaders[alias] !== undefined ||
      reqHeaders[name.toLowerCase()] !== undefined ||
      (reqHeaders['x-api-key'] !== undefined && /api[_-]?key|token/i.test(name));
    if (!present) {
      return {
        status: 401,
        ok: false,
        headers: { 'content-type': 'application/json' },
        body: { detail: `Missing required header ${meta.alias || name}` },
        matched: hit.route,
        params: hit.params,
        error: 'auth',
      };
    }
  }

  // Path parameter integer validation -> 422
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

  const bindings = buildBindings(hit.route, hit.params, query, req.body, parsed);

  // Check explicit raises rules
  for (const rule of hit.route.raises || []) {
    if (rule.ifParam === undefined) continue;
    const actual =
      hit.params[rule.ifParam] !== undefined
        ? coerce(hit.params[rule.ifParam], hit.route.params[rule.ifParam])
        : query[rule.ifParam] !== undefined
          ? coerce(query[rule.ifParam], hit.route.query[rule.ifParam]?.type)
          : bindings[rule.ifParam];
    if (String(actual) === String(rule.ifEquals)) {
      return {
        status: rule.status,
        ok: false,
        headers: { 'content-type': 'application/json' },
        body: { detail: rule.detail || 'error' },
        matched: hit.route,
        params: hit.params,
        error: 'http_exception',
      };
    }
  }

  // Micro-evaluate handler body
  const evalResult = evaluateHandler(hit.route.source, bindings);
  if (evalResult.earlyReturn) {
    return {
      status: evalResult.earlyReturn.status,
      ok: false,
      headers: { 'content-type': 'application/json' },
      body: { detail: evalResult.earlyReturn.detail },
      matched: hit.route,
      params: hit.params,
      error: 'http_exception',
    };
  }

  const status = hit.route.status;
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { 'content-type': 'application/json' },
    body: evalResult.bound === null ? null : evalResult.bound,
    matched: hit.route,
    params: hit.params,
  };
}

/**
 * Create immutable app snapshot from source.
 * @param {string} source
 * @param {'python'|'r'|'auto'} [language='auto']
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
 * Template return literal with bindings.
 * @param {string} bodySource
 * @param {Record<string, unknown>} bindings
 * @returns {unknown}
 */
export function renderHandlerBody(bodySource, bindings) {
  return evaluateHandler(bodySource, bindings).bound;
}

export const __internals = {
  normalizePath,
  normalizePathParams,
  parseLiteral,
  extractReturnLiteral,
  extractBalanced,
  bindValue,
  buildBindings,
  coerce,
  evaluateHandler,
  METHODS,
};
