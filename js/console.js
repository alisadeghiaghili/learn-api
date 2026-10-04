/**
 * Command console interpreter.
 *
 * The console mutates application state through a small context object
 * supplied by app.js. Command names are always English; messages around
 * them are localized through the i18n catalog.
 */

import { ui } from './i18n/index.js';

/**
 * @typedef {Object} CommandContext
 * @property {(line: string, cls?: string) => void} print
 * @property {() => object} getState
 * @property {() => void} run
 * @property {(req: object) => void} call
 * @property {() => object} openapiDoc
 * @property {() => void} showLevels
 * @property {() => void} showHint
 * @property {() => void} showSolution
 * @property {() => void} undo
 * @property {() => void} reset
 * @property {() => void} nextLevel
 * @property {() => void} enterSandbox
 * @property {() => void} clear
 */

const COMMANDS = [
  'help', 'levels', 'hint', 'run', 'call', 'openapi', 'goal',
  'solution', 'undo', 'reset', 'next', 'sandbox', 'clear',
];

/**
 * Parse a `call` command line into a request object.
 *
 * @param {string} rest text after `call`
 * @returns {{ method: string, path: string, body?: unknown, headers?: Record<string, string> } | { error: string }}
 */
export function parseCall(rest) {
  const u = ui();
  let body;
  let headers;
  let head = rest;

  const bodyIdx = rest.search(/\bbody\s*=/);
  const headersIdx = rest.search(/\bheaders\s*=/);

  if (bodyIdx >= 0 || headersIdx >= 0) {
    const cuts = [bodyIdx, headersIdx].filter((i) => i >= 0).sort((a, b) => a - b);
    head = rest.slice(0, cuts[0]).trim();
    for (let i = 0; i < cuts.length; i++) {
      const end = i + 1 < cuts.length ? cuts[i + 1] : rest.length;
      const chunk = rest.slice(cuts[i], end).trim();
      const isBody = chunk.startsWith('body');
      const raw = chunk.replace(/^body\s*=\s*/, '').replace(/^headers\s*=\s*/, '').trim();
      try {
        const parsed = JSON.parse(raw);
        if (isBody) body = parsed;
        else headers = parsed;
      } catch {
        return { error: u.invalidJson(isBody ? 'body' : 'headers', raw) };
      }
    }
  }

  const parts = head.trim().split(/\s+/);
  if (parts.length < 2 || !parts[0]) return { error: u.usageCall };
  const method = parts[0].toUpperCase();
  const path = parts[1].startsWith('/') ? parts[1] : `/${parts[1]}`;
  return { method, path, body, headers };
}

/**
 * Create a console handler bound to a context.
 *
 * @param {CommandContext} ctx
 * @returns {{ exec: (line: string) => void, history: string[], parseCall: typeof parseCall }}
 */
export function createConsole(ctx) {
  /** @type {string[]} */
  const history = [];

  function printHelp() {
    const u = ui();
    ctx.print(u.helpTitle, 'dim');
    for (const name of COMMANDS) {
      ctx.print(`  ${name.padEnd(10)} ${u.cmdHelp[name]}`, 'dim');
    }
  }

  function printGoals() {
    const u = ui();
    const g = ctx.getState().level?.goal || {};
    const rows = [
      ...(g.endpoints || []).map((e) => `  ${e.method} ${e.path}${e.status ? ` → ${e.status}` : ''}`),
      ...(g.calls || []).map((c) => `  ${c.method} ${c.path} → ${c.expectStatus}`),
      ...(g.codeContains || []).map((s) => `  code: ${s}`),
      ...(g.openapiHas || []).map((s) => `  openapi: ${s}`),
    ];
    if (!rows.length) {
      ctx.print(u.noActiveLevel, 'dim');
      return;
    }
    ctx.print(`${u.goalsHeading}:`, 'dim');
    rows.forEach((r) => ctx.print(r));
  }

  /** @param {string} line */
  function exec(line) {
    const raw = line.trim();
    if (!raw) return;
    history.push(raw);
    ctx.print(`$ ${raw}`, 'cmd');

    const [name, ...restParts] = raw.split(/\s+/);
    const rest = restParts.join(' ');

    switch (name.toLowerCase()) {
      case 'help':
      case '?':
        printHelp();
        break;
      case 'levels':
      case 'level':
        ctx.showLevels();
        break;
      case 'hint':
        ctx.showHint();
        break;
      case 'goal':
      case 'goals':
        printGoals();
        break;
      case 'run':
      case 'r':
        ctx.run();
        break;
      case 'call':
      case 'curl':
      case 'http': {
        const parsed = parseCall(rest);
        if ('error' in parsed) {
          ctx.print(parsed.error, 'fail');
          break;
        }
        ctx.call(parsed);
        break;
      }
      case 'openapi':
      case 'swagger':
        ctx.print(JSON.stringify(ctx.openapiDoc(), null, 2), 'str');
        break;
      case 'solution':
        ctx.showSolution();
        break;
      case 'undo':
        ctx.undo();
        break;
      case 'reset':
        ctx.reset();
        break;
      case 'next':
        ctx.nextLevel();
        break;
      case 'sandbox':
        ctx.enterSandbox();
        break;
      case 'clear':
        ctx.clear();
        break;
      default:
        ctx.print(ui().unknownCommand(name), 'fail');
    }
  }

  return { exec, history, parseCall };
}
