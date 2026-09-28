/**
 * LearnAPI application shell — wires levels, engine, visualizer, console.
 */

import { parseSource, executeRequest, matchRoute } from './engine.js';
import { generateOpenAPI, openApiHas } from './openapi.js';
import { createPipelineViz, createSurfaceViz } from './visualizer.js';
import { createConsole, parseCall } from './console.js';
import { LEVELS, SEQUENCES, TRACKS, SANDBOX } from './levels.js';

/** @typedef {import('./levels.js').Level} Level */

const state = {
  /** @type {Level} */
  level: SANDBOX,
  mode: /** @type {'sandbox'|'level'} */ ('sandbox'),
  track: 'http',
  code: SANDBOX.startCode,
  /** @type {import('./engine.js').ParsedApp|null} */
  parsed: null,
  history: /** @type {string[]} */ ([]),
  commandCount: 0,
  solved: /** @type {Set<string>} */ (new Set(loadSolved())),
  activeViz: 'pipeline',
  lastCall: null,
};

const els = {
  trackNav: document.getElementById('track-nav'),
  sequenceList: document.getElementById('sequence-list'),
  levelCount: document.getElementById('level-count'),
  editor: /** @type {HTMLTextAreaElement} */ (document.getElementById('code-editor')),
  editorLabel: document.getElementById('editor-label'),
  editorStatus: document.getElementById('editor-status'),
  openapiView: document.getElementById('openapi-view'),
  consoleLog: document.getElementById('console-log'),
  consoleForm: document.getElementById('console-form'),
  consoleInput: /** @type {HTMLInputElement} */ (document.getElementById('console-input')),
  dialogRoot: document.getElementById('dialog-root'),
  toast: document.getElementById('toast'),
  golf: document.getElementById('golf-badge'),
  vizPipeline: document.getElementById('viz-pipeline'),
  vizSurface: document.getElementById('viz-surface'),
};

const pipeline = createPipelineViz(els.vizPipeline);
const surface = createSurfaceViz(els.vizSurface);

// —— persistence ——————————————————————————————————————————

function loadSolved() {
  try {
    return JSON.parse(localStorage.getItem('learnapi.solved') || '[]');
  } catch {
    return [];
  }
}

function saveSolved() {
  localStorage.setItem('learnapi.solved', JSON.stringify([...state.solved]));
}

// —— logging / toast ——————————————————————————————————————

/**
 * @param {string} line
 * @param {string} [cls]
 */
function print(line, cls = '') {
  const div = document.createElement('div');
  if (cls) div.className = cls;
  div.textContent = line;
  els.consoleLog.appendChild(div);
  els.consoleLog.scrollTop = els.consoleLog.scrollHeight;
}

/**
 * @param {string} msg
 * @param {string} [kind]
 */
function toast(msg, kind = '') {
  els.toast.textContent = msg;
  els.toast.className = `toast ${kind}`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    els.toast.classList.add('hidden');
  }, 2400);
}

// —— visuals ————————————————————————————————————————————

function trackColor(track) {
  return (
    {
      http: '#8B9BB4',
      fastapi: '#009485',
      plumber: '#276DC3',
      openapi: '#85CB33',
      compare: '#7C6AF7',
    }[track] || '#7C6AF7'
  );
}

function refreshViz(extra = {}) {
  const routes = state.parsed?.routes || [];
  const view = {
    routes,
    title: state.parsed?.title || 'app',
    trackColor: trackColor(state.level.track),
    handlerName: extra.handlerName,
    lastStatus: extra.lastStatus,
    lastOk: extra.lastOk,
    liveStage: extra.liveStage,
  };
  pipeline.render(view);
  surface.render(view);
  els.openapiView.textContent = state.parsed
    ? JSON.stringify(generateOpenAPI(state.parsed), null, 2)
    : '// press Run to compile';
}

// —— engine ops ———————————————————————————————————————————

function bumpGolf() {
  state.commandCount += 1;
  updateGolfBadge();
}

function updateGolfBadge() {
  const par = state.mode === 'level' ? state.level.golf : 0;
  if (!par) {
    els.golf.textContent = 'golf —';
    return;
  }
  const score = state.commandCount;
  const mark = score <= par ? '✓' : score;
  els.golf.textContent = `par ${par} · you ${mark}`;
}

function runCode() {
  bumpGolf();
  state.code = els.editor.value;
  state.history.push(state.code);
  const parsed = parseSource(state.code, state.level.language === 'r' ? 'r' : state.level.language === 'python' || state.level.language === 'openapi' ? 'python' : 'auto');
  state.parsed = parsed;
  refreshViz();
  if (parsed.errors.length) {
    parsed.errors.forEach((e) => print(e, 'fail'));
    els.editorStatus.textContent = 'compiled with warnings';
  } else {
    els.editorStatus.textContent = `${parsed.routes.length} route${parsed.routes.length === 1 ? '' : 's'} · ${parsed.language}`;
    print(`run · ${parsed.routes.length} route(s) · ${parsed.title}`, 'dim');
  }
  parsed.routes.forEach((r) => {
    print(`  ${r.method.padEnd(6)} ${r.path}`, 'dim');
  });
  checkWin();
}

/**
 * @param {{ method: string, path: string, body?: unknown, headers?: Record<string, string> }} req
 */
function doCall(req) {
  bumpGolf();
  if (!state.parsed) {
    print('server not running — press Run first', 'fail');
    return;
  }
  const res = executeRequest(state.parsed, req);
  state.lastCall = { req, res };
  const hdr = req.headers ? ` headers=${JSON.stringify(req.headers)}` : '';
  print(`→ ${req.method} ${req.path}${req.body ? ` body=${JSON.stringify(req.body)}` : ''}${hdr}`, 'cmd');
  print(`← ${res.status}`, res.ok ? 'ok' : 'fail');
  print(JSON.stringify(res.body), res.ok ? 'str' : 'fail');

  const view = {
    routes: state.parsed.routes,
    title: state.parsed.title,
    trackColor: trackColor(state.level.track),
    handlerName: res.matched?.handlerName,
  };
  pipeline.animatePacket(req, res).then(() => {
    refreshViz({
      handlerName: res.matched?.handlerName,
      lastStatus: res.status,
      lastOk: res.ok,
    });
    checkWin();
  });
}

function checkWin() {
  if (state.mode !== 'level') return;
  const g = state.level.goal || {};
  const parsed = state.parsed;
  if (!parsed) return;

  const missing = [];
  for (const e of g.endpoints || []) {
    const found = parsed.routes.some(
      (r) =>
        r.method === e.method &&
        r.path === e.path &&
        (e.status === undefined || r.status === e.status)
    );
    if (!found) missing.push(`endpoint ${e.method} ${e.path}`);
  }
  for (const s of g.codeContains || []) {
    if (!state.code.includes(s)) missing.push(`code contains ${s}`);
  }
  for (const s of g.openapiHas || []) {
    if (!openApiHas(generateOpenAPI(parsed), s)) missing.push(`openapi ${s}`);
  }
  for (const c of g.calls || []) {
    const hit = matchRoute(parsed.routes, c.method, c.path.split('?')[0]);
    if (!hit) {
      missing.push(`call ${c.method} ${c.path}`);
      continue;
    }
    const res = executeRequest(parsed, {
      method: c.method,
      path: c.path,
      body: c.body,
      headers: c.headers,
    });
    if (res.status !== c.expectStatus) {
      missing.push(`call ${c.method} ${c.path} status ${c.expectStatus} (got ${res.status})`);
      continue;
    }
    if (c.expectBody) {
      for (const [k, v] of Object.entries(c.expectBody)) {
        const actual = res.body && typeof res.body === 'object' ? res.body[k] : undefined;
        if (JSON.stringify(actual) !== JSON.stringify(v)) {
          missing.push(`call ${c.method} ${c.path} body.${k}`);
        }
      }
    }
  }

  if (missing.length === 0 && (g.endpoints || g.calls || g.codeContains || g.openapiHas)) {
    solveLevel();
  } else if (missing.length) {
    els.editorStatus.textContent = `${missing.length} goal(s) open`;
  }
}

function solveLevel() {
  if (state.solved.has(state.level.id)) {
    els.editorStatus.textContent = 'solved';
    return;
  }
  state.solved.add(state.level.id);
  saveSolved();
  els.editorStatus.textContent = 'solved';
  toast(`Level solved — ${state.commandCount} commands (par ${state.level.golf})`, 'ok');
  print(`✓ solved ${state.level.id} · golf ${state.commandCount}/${state.level.golf}`, 'ok');
  renderSequences();
  showSolvedDialog();
}

function undo() {
  bumpGolf();
  if (state.history.length < 2) {
    print('nothing to undo', 'dim');
    return;
  }
  state.history.pop();
  const prev = state.history[state.history.length - 1];
  state.code = prev;
  els.editor.value = prev;
  print('undo', 'dim');
  runCodeQuiet();
}

function runCodeQuiet() {
  state.code = els.editor.value;
  state.parsed = parseSource(
    state.code,
    state.level.language === 'r' ? 'r' : 'python'
  );
  refreshViz();
  checkWin();
}

function resetLevel() {
  bumpGolf();
  state.commandCount = 0;
  state.code = state.level.startCode;
  state.history = [state.code];
  els.editor.value = state.code;
  state.parsed = null;
  els.editorStatus.textContent = '';
  refreshViz();
  updateGolfBadge();
  print(`reset · ${state.level.name}`, 'dim');
}

// —— level UI ————————————————————————————————————————————

function renderTracks() {
  els.trackNav.replaceChildren();
  for (const t of TRACKS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `track-chip${state.track === t ? ' active' : ''}`;
    btn.dataset.track = t;
    btn.textContent = t === 'openapi' ? 'openapi' : t;
    btn.addEventListener('click', () => {
      state.track = t;
      renderTracks();
      renderSequences();
    });
    els.trackNav.appendChild(btn);
  }
}

function renderSequences() {
  els.sequenceList.replaceChildren();
  const seq = SEQUENCES.filter((s) => s.id === state.track);
  const groups = seq.length ? seq : SEQUENCES;
  let total = 0;
  for (const s of groups) {
    const levels = LEVELS.filter((l) => l.track === s.id);
    if (!levels.length) continue;
    const wrap = document.createElement('div');
    wrap.className = 'seq-group';
    const title = document.createElement('div');
    title.className = 'seq-title';
    title.textContent = s.name;
    wrap.appendChild(title);
    for (const lv of levels) {
      total += 1;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `level-item${state.level.id === lv.id ? ' active' : ''}${state.solved.has(lv.id) ? ' solved' : ''}`;
      btn.innerHTML = `<span class="dot"></span><span class="title"></span><span class="par"></span>`;
      btn.querySelector('.title').textContent = lv.name;
      btn.querySelector('.par').textContent = lv.golf ? `par ${lv.golf}` : '';
      btn.addEventListener('click', () => loadLevel(lv.id, true));
      wrap.appendChild(btn);
    }
    els.sequenceList.appendChild(wrap);
  }
  const solvedCount = LEVELS.filter((l) => state.solved.has(l.id)).length;
  els.levelCount.textContent = `${solvedCount}/${LEVELS.length} solved`;
}

/**
 * @param {string} id
 * @param {boolean} [showDialog]
 */
function loadLevel(id, showDialog = true) {
  const lv = LEVELS.find((l) => l.id === id) || SANDBOX;
  state.level = lv;
  state.mode = lv.id === 'sandbox' ? 'sandbox' : 'level';
  state.track = lv.track;
  state.code = lv.startCode;
  state.history = [state.code];
  state.commandCount = 0;
  state.parsed = null;
  els.editor.value = state.code;
  els.editorLabel.textContent = lv.editorLabel || 'server.py';
  els.editorStatus.textContent = '';
  updateGolfBadge();
  refreshViz();
  renderTracks();
  renderSequences();
  print(`loaded ${lv.name}`, 'dim');
  if (showDialog && lv.startDialog?.length) showStartDialog(lv);
}

function enterSandbox() {
  loadLevel('sandbox', false);
  print('sandbox — free play', 'ok');
}

// —— dialogs ———————————————————————————————————————————————

/**
 * @param {string} html
 * @param {{ nextLabel?: string, onNext?: () => void, extraActions?: {label: string, onClick: () => void}[] }} opts
 */
function showDialog(html, opts = {}) {
  const root = els.dialogRoot;
  root.classList.remove('hidden');
  root.innerHTML = `<div class="dialog">${html}<div class="dialog-actions"></div></div>`;
  const actions = root.querySelector('.dialog-actions');
  const close = () => {
    root.classList.add('hidden');
    root.replaceChildren();
    els.consoleInput.focus();
  };
  for (const a of opts.extraActions || []) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn ghost';
    b.textContent = a.label;
    b.addEventListener('click', () => {
      close();
      a.onClick();
    });
    actions.appendChild(b);
  }
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'btn primary';
  next.textContent = opts.nextLabel || 'Continue';
  next.addEventListener('click', () => {
    close();
    opts.onNext?.();
  });
  actions.appendChild(next);
  root.addEventListener(
    'click',
    (e) => {
      if (e.target === root) close();
    },
    { once: true }
  );
}

/**
 * @param {Level} level
 */
function showStartDialog(level) {
  let i = 0;
  const steps = level.startDialog || [];
  const showStep = () => {
    if (i >= steps.length) return;
    const step = steps[i++];
    if (step.type === 'ModalAlert') {
      const body = (step.markdowns || [])
        .map((m) => {
          if (m.startsWith('```')) return `<pre>${m.replace(/```/g, '')}</pre>`;
          return `<p>${md(m)}</p>`;
        })
        .join('');
      showDialog(`<h2>${level.name}</h2>${body}`, {
        nextLabel: i >= steps.length ? 'Start' : 'Continue',
        onNext: showStep,
      });
    } else if (step.type === 'ApiDemo') {
      showDialog(
        `<h2>${level.name}</h2>
         <div class="dialog-demo">
           <div class="demo-label">demo</div>
           <p>${md((step.beforeMarkdowns || []).join(' '))}</p>
           <pre>${step.command || ''}</pre>
           <p>${md((step.afterMarkdowns || []).join(' '))}</p>
         </div>`,
        {
          nextLabel: i >= steps.length ? 'Start' : 'Continue',
          onNext: showStep,
          extraActions: [
            {
              label: 'Try demo',
              onClick: () => {
                const cmd = step.command || '';
                if (cmd.startsWith('call ')) {
                  // auto-run then call
                  runCode();
                  const parsed = parseCall(cmd.slice(5));
                  if (!('error' in parsed)) doCall(parsed);
                } else if (cmd) {
                  consoleApi.exec(cmd);
                }
                showStep();
              },
            },
          ],
        }
      );
    } else if (step.type === 'GoalList') {
      const g = level.goal || {};
      const items = [
        ...(g.endpoints || []).map(
          (e) =>
            `<li><span class="meth ${e.method}">${e.method}</span><span>${e.path}</span><span class="muted">${e.status || 200}</span></li>`
        ),
        ...(g.calls || []).map(
          (c) =>
            `<li><span class="meth ${c.method}">${c.method}</span><span>${c.path}</span><span class="muted">call → ${c.expectStatus}</span></li>`
        ),
        ...(g.codeContains || []).map(
          (s) => `<li><span class="muted">code</span><span>${s}</span></li>`
        ),
        ...(g.openapiHas || []).map(
          (s) => `<li><span class="muted">openapi</span><span>${s}</span></li>`
        ),
      ].join('');
      showDialog(
        `<h2>Goals</h2><ul class="goal-list">${items}</ul>
         <p class="muted">par ${level.golf} commands · <code>hint</code> · <code>solution</code></p>`,
        {
          nextLabel: 'Solve it',
          onNext: () => els.consoleInput.focus(),
        }
      );
    } else {
      showStep();
    }
  };
  showStep();
}

function showSolvedDialog() {
  const score = state.commandCount;
  const par = state.level.golf;
  const idx = LEVELS.findIndex((l) => l.id === state.level.id);
  const next = LEVELS[idx + 1];
  showDialog(
    `<h2>Solved</h2>
     <p><code>${state.level.id}</code> — ${score} command(s), par ${par}.</p>
     <p>${score <= par ? 'You matched the par.' : `Golf: try in ${par} next time.`}</p>`,
    {
      nextLabel: next ? `Next: ${next.name}` : 'Sandbox',
      onNext: () => {
        if (next) loadLevel(next.id, true);
        else enterSandbox();
      },
    }
  );
}

/**
 * Tiny markdown: bold, inline code, fenced code, paragraphs already separate.
 *
 * @param {string} text
 * @returns {string}
 */
function md(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// —— console API ——————————————————————————————————————————

const consoleApi = createConsole({
  print,
  getState: () => state,
  setCode: (code) => {
    state.code = code;
    els.editor.value = code;
  },
  run: runCode,
  call: doCall,
  openapiDoc: () =>
    state.parsed ? generateOpenAPI(state.parsed) : { error: 'not compiled' },
  showLevels: () => {
    renderSequences();
    print('pick a level in the left rail', 'dim');
  },
  showHint: () => {
    print(state.level.hint || 'no hint', 'warn');
  },
  showSolution: () => {
    state.commandCount = Math.max(state.commandCount, state.level.golf + 1);
    updateGolfBadge();
    if (state.level.solutionCode) {
      els.editor.value = state.level.solutionCode;
      state.code = state.level.solutionCode;
      print('solution loaded — press Run', 'warn');
    } else {
      print('no solution (sandbox)', 'dim');
    }
  },
  undo,
  reset: resetLevel,
  nextLevel: () => {
    const idx = LEVELS.findIndex((l) => l.id === state.level.id);
    const next = LEVELS[idx + 1];
    if (next) loadLevel(next.id, true);
    else enterSandbox();
  },
  enterSandbox,
  toast,
});

// —— events ———————————————————————————————————————————————

els.consoleForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const line = els.consoleInput.value;
  if (line.trim().toLowerCase() === 'clear') {
    els.consoleLog.replaceChildren();
    els.consoleInput.value = '';
    return;
  }
  consoleApi.exec(line);
  els.consoleInput.value = '';
});

document.getElementById('btn-run').addEventListener('click', () => runCode());
document.getElementById('btn-levels').addEventListener('click', () => {
  renderSequences();
  print('levels in the left rail', 'dim');
});
document.getElementById('btn-hint').addEventListener('click', () => consoleApi.exec('hint'));
document.getElementById('btn-undo').addEventListener('click', () => undo());
document.getElementById('btn-reset').addEventListener('click', () => resetLevel());
document.getElementById('btn-openapi-dump').addEventListener('click', () => consoleApi.exec('openapi'));

for (const tab of document.querySelectorAll('.viz-tab')) {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.viz-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    const which = tab.getAttribute('data-viz');
    state.activeViz = which;
    els.vizPipeline.classList.toggle('hidden', which !== 'pipeline');
    els.vizSurface.classList.toggle('hidden', which !== 'surface');
  });
}

els.editor.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runCode();
  }
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = els.editor.selectionStart;
    const end = els.editor.selectionEnd;
    els.editor.value =
      els.editor.value.slice(0, s) + '    ' + els.editor.value.slice(end);
    els.editor.selectionStart = els.editor.selectionEnd = s + 4;
  }
});

// —— boot ——————————————————————————————————————————————————

renderTracks();
renderSequences();
loadLevel('http-01', true);
print('LearnAPI ready — `help` for commands', 'ok');
