/**
 * Command console interpreter (learnGitBranching-style command surface).
 *
 * The console mutates game state through a small command context object
 * provided by app.js.
 */

/**
 * @typedef {Object} CommandContext
 * @property {(line: string, cls?: string) => void} print
 * @property {() => object} getState
 * @property {(code: string) => void} setCode
 * @property {(opts?: object) => void} run
 * @property {(req: object) => object} call
 * @property {() => object} openapiDoc
 * @property {() => void} showLevels
 * @property {() => void} showHint
 * @property {() => void} showSolution
 * @property {() => void} undo
 * @property {() => void} reset
 * @property {() => void} nextLevel
 * @property {() => void} enterSandbox
 * @property {(msg: string) => void} toast
 */

const HELP = `commands
  help                 this list
  levels               browse levels
  hint                 level hint
  run                  compile editor code into the mock server
  call <METHOD> <path> [body=JSON] [headers=JSON]
                       send a request, e.g. call GET /users
  openapi              print OpenAPI JSON
  goal                 show level goals
  solution             reveal solution (golf fail)
  undo                 undo last run
  reset                reset level
  next                 next level
  sandbox              free play
  clear                clear console`;

/**
 * Parse a `call` command line into a request object.
 *
 * @param {string} rest
 * @returns {{ method: string, path: string, body?: unknown, headers?: Record<string, string> } | { error: string }}
 */
export function parseCall(rest) {
  let body;
  let headers;
  let head = rest;

  const bodyIdx = rest.search(/\bbody\s*=/);
  const headersIdx = rest.search(/\bheaders\s*=/);

  if (bodyIdx >= 0 || headersIdx >= 0) {
    const cuts = [bodyIdx, headersIdx].filter((i) => i >= 0).sort((a, b) => a - b);
    head = rest.slice(0, cuts[0]).trim();
    for (let i = 0; i < cuts.length; i++) {
      const start = cuts[i];
      const end = i + 1 < cuts.length ? cuts[i + 1] : rest.length;
      const chunk = rest.slice(start, end).trim();
      const isBody = chunk.startsWith('body');
      const raw = chunk.replace(/^body\s*=\s*/, '').replace(/^headers\s*=\s*/, '').trim();
      try {
        const parsed = JSON.parse(raw);
        if (isBody) body = parsed;
        else headers = parsed;
      } catch {
        return { error: `${isBody ? 'body' : 'headers'} is not valid JSON: ${raw}` };
      }
    }
  }

  const parts = head.trim().split(/\s+/);
  if (parts.length < 2) {
    return { error: 'usage: call <METHOD> <path> [body=JSON] [headers=JSON]' };
  }
  const method = parts[0].toUpperCase();
  const path = parts[1].startsWith('/') ? parts[1] : `/${parts[1]}`;
  return { method, path, body, headers };
}

/**
 * Create a console handler bound to a context.
 *
 * @param {CommandContext} ctx
 * @returns {{ exec: (line: string) => void }}
 */
export function createConsole(ctx) {
  /** @type {string[]} */
  const history = [];

  function exec(line) {
    const raw = line.trim();
    if (!raw) return;
    history.push(raw);
    ctx.print(`$ ${raw}`, 'cmd');

    const [name, ...restParts] = raw.split(/\s+/);
    const rest = restParts.join(' ');
    const cmd = name.toLowerCase();

    switch (cmd) {
      case 'help':
      case '?':
        HELP.split('\n').forEach((l) => ctx.print(l, 'dim'));
        break;
      case 'levels':
      case 'level':
        ctx.showLevels();
        break;
      case 'hint':
        ctx.showHint();
        break;
      case 'goal':
      case 'goals': {
        const st = ctx.getState();
        const g = st.level?.goal || {};
        if (g.endpoints?.length) {
          ctx.print('endpoints:', 'dim');
          g.endpoints.forEach((e) =>
            ctx.print(`  ${e.method} ${e.path}${e.status ? ` → ${e.status}` : ''}`)
          );
        }
        if (g.calls?.length) {
          ctx.print('calls:', 'dim');
          g.calls.forEach((c) =>
            ctx.print(`  ${c.method} ${c.path} → ${c.expectStatus}`)
          );
        }
        if (g.codeContains?.length) {
          ctx.print('code must contain:', 'dim');
          g.codeContains.forEach((s) => ctx.print(`  ${s}`));
        }
        if (g.openapiHas?.length) {
          ctx.print('openapi must have:', 'dim');
          g.openapiHas.forEach((s) => ctx.print(`  ${s}`));
        }
        if (!Object.keys(g).length) ctx.print('no goals (sandbox)', 'dim');
        break;
      }
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
      case 'swagger': {
        const doc = ctx.openapiDoc();
        ctx.print(JSON.stringify(doc, null, 2), 'str');
        break;
      }
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
        // handled by caller via event; still acknowledge
        ctx.print('', 'dim');
        break;
      default:
        ctx.print(`unknown command: ${name} — try 'help'`, 'fail');
    }
  }

  return {
    exec,
    history,
    parseCall,
  };
}
