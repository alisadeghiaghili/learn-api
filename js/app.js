/**
 * LearnAPI application shell: toolbar, workspace, terminal, always-on
 * learning guide and level celebration. Game rules live in game.js and are
 * kept free of DOM access.
 */

import { parseSource, executeRequest } from './engine.js';
import { generateOpenAPI } from './openapi.js';
import { createPipelineViz, createSurfaceViz } from './visualizer.js';
import { createConsole, parseCall } from './console.js';
import { LEVELS, SEQUENCES, SANDBOX, getLocalizedLevel } from './levels.js';
import { goalItems, isSolved, nextAction, parserLanguage } from './game.js';
import { escapeHtml, renderMarkdown, showModal } from './dialog.js';
import { TerminalView } from './terminal.js';
import { launchConfetti, playFanfare } from './confetti.js';
import { initLocale, getLocale, setLocale, LOCALES, ui } from './i18n/index.js';
import { loadProgress, saveProgress, summarize } from './progress.js';
import { buildShareTargets, share, REPO_URL, COFFEE_URL } from './share.js';
import { getVisitorCount } from './visitor.js';

/** @typedef {import('./levels.js').Level} Level */

const TRACK_COLORS = {
  http: '#8B9BB4',
  fastapi: '#009485',
  plumber: '#276DC3',
  openapi: '#85CB33',
  compare: '#7C6AF7',
};

const GITHUB_MARK =
  '<svg class="gh-mark" viewBox="0 0 16 16" aria-hidden="true" width="18" height="18"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>';

const VISITOR_ICON =
  '<svg class="visitor-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0-2.21-2.69-4-6-4s-6 1.79-6 4v1h12v-1zm-1.07 0H3.07C3.56 11.83 5.48 11 8 11s4.44.83 4.93 2z"/></svg>';

class App {
  /** @param {HTMLElement} root */
  constructor(root) {
    this.root = root;
    this.progress = loadProgress();
    /** @type {Level} */
    this.raw = SANDBOX;
    /** @type {'sandbox'|'level'} */
    this.mode = 'sandbox';
    this.code = SANDBOX.startCode;
    /** @type {string|null} source at the last Run */
    this.ranCode = null;
    /** @type {import('./engine.js').ParsedApp|null} */
    this.parsed = null;
    this.history = [SANDBOX.startCode];
    this.commandCount = 0;
    this.solvedFlash = false;
    this.offered = false;
    this.activeViz = 'pipeline';
    /** @type {import('./terminal.js').LogLine[]} */
    this.log = [];

    this.consoleApi = createConsole({
      print: (line, cls) => this.print(line, cls),
      getState: () => ({ level: this.level }),
      run: () => this.run(),
      call: (req) => this.doCall(req),
      openapiDoc: () =>
        this.parsed ? generateOpenAPI(this.parsed) : { error: ui().openapiPlaceholder },
      showLevels: () => this.openLevels(),
      showHint: () => this.print(this.level.hint || ui().noHint, 'warn'),
      showSolution: () => this.showSolution(),
      undo: () => this.undo(),
      reset: () => this.reset(),
      nextLevel: () => this.nextLevel(),
      enterSandbox: () => this.enterSandbox(),
      clear: () => {
        this.log = [];
        this.term.clear();
      },
    });

    this.mount();
    this.loadRaw(SANDBOX, { dialog: false, announce: false });
    this.bootMessages();
    this.initVisitorCounter();
    this.showWelcome();
  }

  /** @returns {Level} localized view of the active level */
  get level() {
    return getLocalizedLevel(this.raw, getLocale());
  }

  // ── mount ────────────────────────────────────────────────

  mount() {
    const u = ui();
    const current = getLocale();
    const langItems = LOCALES.map(
      (loc) =>
        `<button type="button" class="lang-option${current === loc ? ' on' : ''}" data-lang="${loc}" role="menuitem">${loc.toUpperCase()}</button>`
    ).join('');
    this.root.innerHTML = `
      <div class="app-main">
        <header class="toolbar">
          <div class="brand">Learn<span>API</span></div>
          <div class="level-title" id="level-title"></div>
          <div class="toolbar-actions">
            <div class="lang-menu">
              <button type="button" class="lang-btn" data-action="lang-toggle" aria-haspopup="menu" aria-expanded="false" aria-label="${escapeHtml(u.language)}">
                <span>${current.toUpperCase()}</span><span class="lang-caret" aria-hidden="true"></span>
              </button>
              <div class="lang-dropdown" id="lang-dropdown" role="menu" hidden>${langItems}</div>
            </div>
            <button type="button" class="nav-toggle" data-action="nav-toggle" aria-label="${escapeHtml(u.menuLabel)}" aria-expanded="false" aria-controls="nav-drawer"><span class="nav-bars" aria-hidden="true"></span></button>
            <div class="nav-drawer" id="nav-drawer" hidden>
              <button type="button" data-action="levels">${escapeHtml(u.levels)}</button>
              <button type="button" data-action="lesson" title="${escapeHtml(u.lessonTitle)}">${escapeHtml(u.lesson)}</button>
              <button type="button" data-action="goal">${escapeHtml(u.guide)}</button>
              <button type="button" data-action="hint">${escapeHtml(u.hint)}</button>
              <button type="button" data-action="solution">${escapeHtml(u.solution)}</button>
              <button type="button" data-action="undo">${escapeHtml(u.undo)}</button>
              <button type="button" data-action="reset">${escapeHtml(u.reset)}</button>
              <button type="button" data-action="sandbox" class="ghost">${escapeHtml(u.sandboxBtn)}</button>
              <button type="button" class="help-btn" data-action="help" title="${escapeHtml(u.uiGuideTitle)}" aria-label="${escapeHtml(u.help)}">?</button>
            </div>
            <span class="tb-stat visitors" id="visitor-stat" title="${escapeHtml(u.visitorsTitle)}" hidden>${VISITOR_ICON}<span id="visitor-count"></span></span>
            <a class="tb-link gh" href="${REPO_URL}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(u.githubTitle)}" aria-label="GitHub">${GITHUB_MARK}</a>
            <a class="tb-link support" href="${COFFEE_URL}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(u.supportTitle)}">${escapeHtml(u.support)}</a>
          </div>
        </header>
        <div class="board-wrap">
          <section class="panel viz-wrap">
            <div class="viz-tabs" role="tablist">
              <button type="button" class="viz-tab" data-viz="pipeline" role="tab">${escapeHtml(u.tabPipeline)}</button>
              <button type="button" class="viz-tab" data-viz="surface" role="tab">${escapeHtml(u.tabSurface)}</button>
              <button type="button" class="viz-tab" data-viz="openapi" role="tab">${escapeHtml(u.tabOpenapi)}</button>
            </div>
            <div id="viz-pipeline" class="viz-panel"></div>
            <div id="viz-surface" class="viz-panel"></div>
            <pre id="openapi-view" class="viz-panel code-block"></pre>
          </section>
          <section class="panel editor-wrap">
            <div class="editor-head">
              <label for="code-editor" id="editor-label">server.py</label>
              <div class="editor-actions">
                <span class="muted" id="editor-status"></span>
                <button type="button" class="primary" id="btn-run">${escapeHtml(u.editorRun)}</button>
              </div>
            </div>
            <textarea id="code-editor" class="code-editor" spellcheck="false" wrap="off"></textarea>
          </section>
        </div>
        <div class="terminal" id="terminal"></div>
      </div>
      <aside class="dock" id="dock" aria-label="${escapeHtml(u.guidePanel)}"></aside>`;

    const q = (s) => this.root.querySelector(s);
    this.els = {
      title: q('#level-title'),
      editor: q('#code-editor'),
      editorLabel: q('#editor-label'),
      editorStatus: q('#editor-status'),
      openapi: q('#openapi-view'),
      vizPipeline: q('#viz-pipeline'),
      vizSurface: q('#viz-surface'),
      dock: q('#dock'),
    };
    this.pipeline = createPipelineViz(this.els.vizPipeline);
    this.surface = createSurfaceViz(this.els.vizSurface);
    this.term = new TerminalView(q('#terminal'), {
      onSubmit: (line) => this.consoleApi.exec(line),
      getSuggestion: () => this.suggestion(),
      placeholder: (cmd) => ui().termPlaceholder(cmd),
      idlePlaceholder: u.termPlaceholderIdle,
      nextLabel: u.termNext,
      tabNote: u.termTabNote,
      lines: this.log,
    });
    this.wireEvents();
    this.setViz(this.activeViz);
  }

  wireEvents() {
    const actions = {
      levels: () => this.openLevels(),
      lesson: () => this.replayLesson(),
      goal: () => this.focusGuide(),
      hint: () => this.consoleApi.exec('hint'),
      solution: () => this.consoleApi.exec('solution'),
      undo: () => this.consoleApi.exec('undo'),
      reset: () => this.consoleApi.exec('reset'),
      sandbox: () => this.consoleApi.exec('sandbox'),
      help: () => this.openUiHelp(),
    };
    this.root.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'nav-toggle') return this.toggleNav();
        if (action === 'lang-toggle') return this.toggleLang();
        this.closeNav();
        this.closeLang();
        actions[action]?.();
        if (!document.querySelector('.overlay')) this.term.focus();
      });
    });
    this.root.querySelectorAll('[data-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const loc = btn.dataset.lang;
        if (loc === getLocale()) return this.closeLang();
        setLocale(loc);
        this.remount();
      });
    });
    this.root.querySelectorAll('[data-viz]').forEach((tab) => {
      tab.addEventListener('click', () => this.setViz(tab.dataset.viz));
    });
    this.root.querySelector('#btn-run').addEventListener('click', () => this.run());
    const ed = this.els.editor;
    ed.addEventListener('input', () => {
      this.code = ed.value;
      this.renderDock();
      this.term.refreshHint();
    });
    ed.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.run();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const s = ed.selectionStart;
        ed.value = `${ed.value.slice(0, s)}    ${ed.value.slice(ed.selectionEnd)}`;
        ed.selectionStart = ed.selectionEnd = s + 4;
        ed.dispatchEvent(new Event('input'));
      }
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest?.('.lang-menu')) this.closeLang();
    });
  }

  toggleNav() {
    const drawer = this.root.querySelector('#nav-drawer');
    const open = drawer.classList.toggle('is-open');
    drawer.hidden = !open;
    this.root.querySelector('[data-action="nav-toggle"]').setAttribute('aria-expanded', String(open));
    if (open) this.closeLang();
  }

  closeNav() {
    const drawer = this.root.querySelector('#nav-drawer');
    drawer.classList.remove('is-open');
    drawer.hidden = true;
  }

  toggleLang() {
    const menu = this.root.querySelector('#lang-dropdown');
    const open = menu.classList.toggle('is-open');
    menu.hidden = !open;
    this.root.querySelector('[data-action="lang-toggle"]').setAttribute('aria-expanded', String(open));
    if (open) this.closeNav();
  }

  closeLang() {
    const menu = this.root.querySelector('#lang-dropdown');
    if (!menu) return;
    menu.classList.remove('is-open');
    menu.hidden = true;
  }

  /** Re-render the whole shell after a language change, keeping state. */
  remount() {
    this.code = this.els.editor.value;
    this.mount();
    this.els.editor.value = this.code;
    this.els.editorLabel.textContent = this.level.editorLabel || 'server.py';
    this.refreshAll();
    this.initVisitorCounter();
  }

  /** @param {string} which */
  setViz(which) {
    this.activeViz = which;
    this.root.querySelectorAll('.viz-tab').forEach((t) => t.classList.toggle('active', t.dataset.viz === which));
    this.els.vizPipeline.hidden = which !== 'pipeline';
    this.els.vizSurface.hidden = which !== 'surface';
    this.els.openapi.hidden = which !== 'openapi';
  }

  // ── logging ──────────────────────────────────────────────

  /**
   * @param {string} text
   * @param {string} [cls]
   */
  print(text, cls = '') {
    const line = { text, cls };
    this.log.push(line);
    this.term.append(line);
  }

  /**
   * @param {string} html trusted markup
   * @param {string} [cls]
   */
  printRich(html, cls = '') {
    const line = { html, cls };
    this.log.push(line);
    this.term.append(line);
  }

  bootMessages() {
    const u = ui();
    this.printRich(
      escapeHtml(u.welcomeLine).replace('&lt;api&gt;', '<span class="logo-api">api</span>'),
      'welcome'
    );
    this.print(u.welcomeSub.replace(/`/g, ''), 'dim');
    const s = summarize(this.progress);
    if (s.solvedCount > 0) {
      u.resumeLines(s.solvedCount, s.total, s.percent, s.next?.name).forEach((l) => this.print(l.replace(/`/g, ''), 'dim'));
    } else {
      this.print(u.sandboxSeeded.replace(/`/g, ''), 'dim');
      this.print(u.progressSaved, 'dim');
    }
  }

  async initVisitorCounter() {
    const n = await getVisitorCount();
    const stat = this.root.querySelector('#visitor-stat');
    if (n === null || !stat) return;
    this.root.querySelector('#visitor-count').textContent = n.toLocaleString(getLocale() === 'fa' ? 'fa-IR' : 'en-US');
    stat.hidden = false;
  }

  // ── game state ───────────────────────────────────────────

  /** @returns {boolean} editor differs from the last compiled source */
  isStale() {
    return this.ranCode === null || this.ranCode !== this.els.editor.value;
  }

  items() {
    return goalItems(this.parsed, this.ranCode ?? '', this.level.goal);
  }

  /** @returns {string|null} suggested next console command */
  suggestion() {
    if (this.mode === 'sandbox') return this.parsed && !this.isStale() ? 'call GET /' : 'run';
    const act = nextAction(this.items(), { running: !!this.parsed, stale: this.isStale() });
    if (act?.type === 'call') return act.command;
    if (act?.type === 'run') return 'run';
    return null;
  }

  /**
   * Load a level (or the sandbox) and reset session state.
   *
   * @param {Level} raw
   * @param {{ dialog?: boolean, announce?: boolean }} [opts]
   */
  loadRaw(raw, { dialog = true, announce = true } = {}) {
    this.raw = raw;
    this.mode = raw.id === 'sandbox' ? 'sandbox' : 'level';
    this.code = raw.startCode;
    this.ranCode = null;
    this.parsed = null;
    this.history = [raw.startCode];
    this.commandCount = 0;
    this.solvedFlash = false;
    this.offered = false;
    this.els.editor.value = raw.startCode;
    this.els.editorLabel.textContent = raw.editorLabel || 'server.py';
    this.els.editorStatus.textContent = '';
    this.refreshAll();
    if (announce) {
      this.print(this.mode === 'sandbox' ? ui().sandboxFree : ui().loadedLevel(this.level.name), 'dim');
    }
    if (dialog && this.level.startDialog?.length) this.showIntro(this.level);
  }

  enterSandbox() {
    this.loadRaw(SANDBOX, { dialog: false });
  }

  nextLevel() {
    const idx = LEVELS.findIndex((l) => l.id === this.raw.id);
    const next = LEVELS[idx + 1];
    if (next) this.loadRaw(next);
    else this.enterSandbox();
  }

  /** @param {string} id */
  startLevel(id) {
    const lv = LEVELS.find((l) => l.id === id);
    if (lv) this.loadRaw(lv);
  }

  run() {
    this.commandCount += 1;
    const code = this.els.editor.value;
    this.code = code;
    if (this.history[this.history.length - 1] !== code) this.history.push(code);
    this.compile(code);
    const u = ui();
    if (this.parsed.errors.length) {
      this.parsed.errors.forEach((e) => this.print(e, 'fail'));
      this.els.editorStatus.textContent = u.editorWarn;
    } else {
      this.print(u.runSummary(this.parsed.routes.length, this.parsed.title), 'dim');
      this.els.editorStatus.textContent = u.editorCompiled(this.parsed.routes.length, this.parsed.language);
    }
    this.parsed.routes.forEach((r) => this.print(`  ${r.method.padEnd(6)} ${r.path}`, 'dim'));
    this.afterState();
  }

  /** @param {string} code */
  compile(code) {
    this.parsed = parseSource(code, parserLanguage(this.raw));
    this.ranCode = code;
  }

  /** @param {{ method: string, path: string, body?: unknown, headers?: Record<string, string> }} req */
  doCall(req) {
    this.commandCount += 1;
    if (!this.parsed) {
      this.print(ui().serverNotRunning, 'fail');
      return;
    }
    const res = executeRequest(this.parsed, req);
    const hdr = req.headers ? ` headers=${JSON.stringify(req.headers)}` : '';
    this.print(`→ ${req.method} ${req.path}${req.body ? ` body=${JSON.stringify(req.body)}` : ''}${hdr}`, 'cmd');
    this.print(`← ${res.status}`, res.ok ? 'ok' : 'fail');
    this.print(JSON.stringify(res.body), res.ok ? 'str' : 'fail');
    this.pipeline.animatePacket(req, res).then(() => {
      this.refreshViz({ handlerName: res.matched?.handlerName, lastStatus: res.status, lastOk: res.ok });
      this.afterState();
    });
  }

  undo() {
    if (this.history.length < 2) {
      this.print(ui().nothingToUndo, 'dim');
      return;
    }
    this.history.pop();
    const prev = this.history[this.history.length - 1];
    this.els.editor.value = prev;
    this.code = prev;
    this.compile(prev);
    this.print(ui().undoMeta, 'dim');
    this.afterState();
  }

  reset() {
    this.loadRaw(this.raw, { dialog: false, announce: false });
    this.print(ui().resetMeta(this.level.name), 'dim');
  }

  showSolution() {
    const sol = this.level.solutionCode;
    if (!sol) {
      this.print(ui().noSolution, 'dim');
      return;
    }
    this.commandCount = Math.max(this.commandCount, this.level.golf + 1);
    this.els.editor.value = sol;
    this.code = sol;
    this.print(ui().solutionLoaded, 'warn');
    this.renderDock();
    this.term.refreshHint();
  }

  /** Evaluate goals after any state change and trigger the celebration. */
  afterState() {
    if (this.mode === 'level') {
      const items = this.items();
      const solved = isSolved(items);
      if (solved && !this.solvedFlash) {
        this.onSolved();
      } else if (!solved) {
        this.solvedFlash = false;
        this.offered = false;
        const open = items.filter((i) => !i.done).length;
        if (this.parsed && open) this.els.editorStatus.textContent = ui().editorGoalsOpen(open);
      }
    }
    this.refreshAll();
  }

  onSolved() {
    const u = ui();
    this.solvedFlash = true;
    const n = this.commandCount;
    const best = this.progress[this.raw.id]?.bestCommands;
    this.progress[this.raw.id] = { solved: true, bestCommands: best === undefined ? n : Math.min(best, n) };
    saveProgress(this.progress);
    this.els.editorStatus.textContent = u.editorSolved;
    this.print('', '');
    this.print(`${u.levelSolvedBanner} ${this.level.name}`, 'ok');
    this.print(n > 0 ? u.commandsUsed(n, this.level.golf) : u.idealCommands(this.level.golf), 'dim');
    this.print(u.partyMode, 'ok');
    this.refreshAll();
    this.celebrate();
  }

  // ── rendering ────────────────────────────────────────────

  refreshAll(extra = {}) {
    const u = ui();
    const lv = this.level;
    this.els.title.textContent = this.mode === 'sandbox' ? u.sandboxMode : u.titleLine(lv.id, lv.name, lv.golf);
    this.refreshViz(extra);
    this.renderDock();
    this.term.refreshHint();
  }

  refreshViz(extra = {}) {
    const view = {
      routes: this.parsed?.routes || [],
      title: this.parsed?.title || 'app',
      trackColor: TRACK_COLORS[this.raw.track] || TRACK_COLORS.compare,
      handlerName: extra.handlerName,
      lastStatus: extra.lastStatus,
      lastOk: extra.lastOk,
      liveStage: extra.liveStage,
    };
    this.pipeline.render(view);
    this.surface.render(view);
    this.els.openapi.textContent = this.parsed
      ? JSON.stringify(generateOpenAPI(this.parsed), null, 2)
      : ui().openapiPlaceholder;
  }

  renderDock() {
    const u = ui();
    const dock = this.els.dock;
    if (this.mode === 'sandbox') {
      dock.innerHTML = `
        <h2>${escapeHtml(u.guideTitle)}</h2>
        <p class="objective">${escapeHtml(u.guideSubtitle)}</p>
        <div class="learning-box">
          <div class="next-title">${escapeHtml(u.startHere)}</div>
          <ul>${u.startHereItems.map((i) => `<li>${renderMarkdown(i).replace(/^<p>|<\/p>$/g, '')}</li>`).join('')}</ul>
        </div>
        <div class="learning-box">
          <div class="next-title">${escapeHtml(u.sandboxTip)}</div>
          <ul>${u.sandboxTipItems.map((i) => `<li>${renderMarkdown(i).replace(/^<p>|<\/p>$/g, '')}</li>`).join('')}</ul>
        </div>
        <ul class="goal-list">
          <li class="met"><div class="g-label">${escapeHtml(u.noActiveLevel)}</div><div class="g-detail">${escapeHtml(u.noActiveLevelDetail)}</div></li>
        </ul>
        <div class="par-note">${renderMarkdown(u.guideFlashNote).replace(/^<p>|<\/p>$/g, '')}</div>`;
      return;
    }

    const lv = this.level;
    const items = this.items();
    const solved = isSolved(items);
    const stale = this.isStale();
    const act = nextAction(items, { running: !!this.parsed, stale });
    const currentIdx = items.findIndex((i) => !i.done);
    const rows = items
      .map((g, i) => {
        const current = !solved && i === currentIdx;
        const targetClass = `target-${g.target || g.kind}`;
        const targetText = u.targetBadge[g.target || g.kind] || g.kind;
        const hintText = u.targetActionHint[g.target || g.kind] || '';
        return `<li class="${g.done ? 'met' : ''}${current ? ' current' : ''}">
          <div class="g-header">
            <span class="target-chip ${targetClass}">${escapeHtml(targetText)}</span>
            ${hintText ? `<span class="target-hint">${escapeHtml(hintText)}</span>` : ''}
            ${current ? `<span class="chip current-chip">${escapeHtml(u.nowChip)}</span>` : ''}
          </div>
          <div class="g-label" dir="ltr">${g.done ? '✓' : current ? '▶' : '○'} <code>${escapeHtml(g.label)}</code></div>
          <div class="g-detail">${escapeHtml(u.goalDetail(g))}</div>
        </li>`;
      })
      .join('');

    let nextBlock;
    if (solved) {
      nextBlock = `<div class="next-box met">${escapeHtml(u.allSolutionMet)}</div>`;
    } else {
      let boxTitle = u.typeNextTitle;
      let prompt = u.remainingLabel;
      let cmd = '';
      let note = u.wrongCommandNote;
      let isCode = false;

      if (act?.type === 'run') {
        boxTitle = u.nextStepTitle.run;
        prompt = u.nextStepPrompt.run;
        cmd = 'run';
        note = u.runNext;
      } else if (act?.type === 'call') {
        boxTitle = u.nextStepTitle.call;
        prompt = u.nextStepPrompt.call;
        cmd = act.command;
        note = u.wrongCommandNote;
      } else if (act?.type === 'edit') {
        boxTitle = u.nextStepTitle.edit;
        prompt = u.nextStepPrompt.edit;
        cmd = act.item.label;
        note = u.editNext(act.item);
        isCode = true;
      }

      nextBlock = `<div class="next-box">
        <div class="next-title">${escapeHtml(boxTitle)}</div>
        <div class="next-row">
          <span class="g-prompt">${escapeHtml(prompt)}</span>
          ${cmd ? `<code class="g-cmd${isCode ? ' g-code-snippet' : ''}">${escapeHtml(cmd)}</code>` : ''}
        </div>
        <div class="par-note">${escapeHtml(note)}</div>
        ${act?.type === 'call' ? `<div class="par-note dim">${escapeHtml(u.wrongCommandNote)}</div>` : ''}
      </div>`;
    }

    const best = this.progress[lv.id]?.bestCommands;
    const golfNote = best !== undefined ? u.bestSoFar(best, lv.golf) : u.idealSolution(lv.golf);
    const list = (arr) => `<ul>${arr.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`;
    dock.innerHTML = `
      <h2>${escapeHtml(lv.name)}</h2>
      <p class="objective">${escapeHtml(lv.objective)}</p>
      ${lv.learning?.length ? `<div class="learning-box"><div class="next-title">${escapeHtml(u.youAreLearning)}</div>${list(lv.learning)}</div>` : ''}
      ${lv.fieldNotes?.length ? `<div class="field-box"><div class="next-title">${escapeHtml(u.fieldNotesTitle)}</div>${list(lv.fieldNotes)}</div>` : ''}
      <div class="par-note">${escapeHtml(golfNote)}</div>
      ${this.solvedFlash ? `<div class="solved-banner">${escapeHtml(u.solvedBanner(this.commandCount || null))}</div>` : ''}
      ${nextBlock}
      <ul class="goal-list">${rows}</ul>`;
  }

  focusGuide() {
    const dock = this.els.dock;
    dock.scrollTop = 0;
    dock.classList.remove('dock-pulse');
    void dock.offsetWidth;
    dock.classList.add('dock-pulse');
  }

  // ── dialogs ──────────────────────────────────────────────

  showWelcome() {
    const u = ui();
    showModal({
      title: 'welcome to learn api',
      titleHtml: u.welcomeTitleHtml,
      bodyHtml: u.welcomeBody.map((p) => `<p>${renderMarkdown(p).replace(/^<p>|<\/p>$/g, '')}</p>`).join(''),
      closeLabel: u.closeBtn,
      actions: [
        { label: u.welcomeSandbox, className: 'ghost', onClick: () => this.term.focus() },
        { label: u.welcomeLevels, className: 'ghost', onClick: () => this.openLevels() },
        { label: u.welcomeFirst, className: 'primary', onClick: () => this.startLevel(LEVELS[0].id) },
      ],
    });
  }

  replayLesson() {
    if (this.mode === 'level' && this.level.startDialog?.length) this.showIntro(this.level);
    else this.showWelcome();
  }

  openUiHelp() {
    const u = ui();
    showModal({
      title: u.uiGuideTitle,
      bodyHtml: `<div class="ui-help">${u.uiGuide
        .map((i) => `<div class="ui-help-item"><h3>${escapeHtml(i.h)}</h3><p>${escapeHtml(i.p)}</p></div>`)
        .join('')}</div>`,
      closeLabel: u.closeBtn,
    });
  }

  openLevels() {
    const u = ui();
    const lang = getLocale();
    const groups = SEQUENCES.map((s) => {
      const rows = LEVELS.filter((l) => l.track === s.id)
        .map((raw) => {
          const l = getLocalizedLevel(raw, lang);
          const p = this.progress[l.id];
          return `<button type="button" class="level-row${p?.solved ? ' solved' : ''}${l.id === this.raw.id ? ' active' : ''}" data-level="${l.id}">
            <span class="id">${l.id}</span>
            <span class="name">${escapeHtml(l.name)}</span>
            <span class="par-note">${escapeHtml(u.parNote(l.golf))}${p?.bestCommands !== undefined ? ` · ${p.bestCommands}` : ''}</span>
            ${p?.solved ? `<span class="chip ok">${escapeHtml(u.solvedChip)}</span>` : ''}
          </button>`;
        })
        .join('');
      return rows ? `<h3 class="seq-title">${escapeHtml(u.seq[s.id] || s.name)}</h3>${rows}` : '';
    }).join('');
    const modal = showModal({
      title: u.levelsTitle,
      bodyHtml: `<p class="muted-text">${escapeHtml(u.pickChallenge)}</p>
        <div class="legend-box"><div class="next-title">${escapeHtml(u.legendTitle)}</div>
        <ul class="legend-list"><li>${renderMarkdown(u.legendIdeal).replace(/^<p>|<\/p>$/g, '')}</li><li>${renderMarkdown(u.legendSolved).replace(/^<p>|<\/p>$/g, '')}</li></ul></div>
        <div class="level-list">${groups}</div>`,
      closeLabel: u.closeBtn,
    });
    modal.el.querySelectorAll('[data-level]').forEach((btn) => {
      btn.addEventListener('click', () => {
        modal.close();
        this.startLevel(btn.dataset.level);
      });
    });
  }

  /** @param {Level} level */
  showIntro(level) {
    const u = ui();
    const steps = level.startDialog || [];
    let i = 0;
    const next = () => {
      if (i >= steps.length) {
        this.term.focus();
        return;
      }
      const step = steps[i++];
      const last = i >= steps.length;
      const continueAction = {
        label: last ? u.startBtn : u.continueBtn,
        className: 'primary',
        onClick: next,
      };
      if (step.type === 'ModalAlert') {
        showModal({
          title: level.name,
          bodyHtml: renderMarkdown(step.markdowns.join('\n\n')),
          closeLabel: u.closeBtn,
          actions: [continueAction],
        });
      } else if (step.type === 'ApiDemo') {
        showModal({
          title: level.name,
          bodyHtml: `<div class="dialog-demo"><div class="demo-label">${escapeHtml(u.demoLabel)}</div>
            ${renderMarkdown((step.beforeMarkdowns || []).join(' '))}
            <pre>${escapeHtml(step.command || '')}</pre>
            ${renderMarkdown((step.afterMarkdowns || []).join(' '))}</div>`,
          closeLabel: u.closeBtn,
          actions: [
            {
              label: u.tryDemo,
              className: 'ghost',
              onClick: () => {
                const cmd = step.command || '';
                if (cmd.startsWith('call ')) {
                  this.run();
                  const req = parseCall(cmd.slice(5));
                  if (!('error' in req)) this.doCall(req);
                }
                next();
              },
            },
            continueAction,
          ],
        });
      } else if (step.type === 'GoalList') {
        const goals = goalItems(null, '', level.goal)
          .map((g) => {
            const targetClass = `target-${g.target || g.kind}`;
            const targetText = u.targetBadge[g.target || g.kind] || g.kind;
            return `<li>
              <div class="g-header">
                <span class="target-chip ${targetClass}">${escapeHtml(targetText)}</span>
              </div>
              <div class="g-label" dir="ltr"><code>${escapeHtml(g.label)}</code></div>
              <div class="g-detail">${escapeHtml(u.goalDetail(g))}</div>
            </li>`;
          })
          .join('');
        showModal({
          title: u.goalsTitle,
          bodyHtml: `<ul class="goal-list">${goals}</ul><p class="muted-text">${renderMarkdown(u.goalsFooter(level.golf)).replace(/^<p>|<\/p>$/g, '')}</p>`,
          closeLabel: u.closeBtn,
          actions: [{ label: u.solveIt, className: 'primary', onClick: () => this.term.focus() }],
        });
      } else {
        next();
      }
    };
    next();
  }

  /** Confetti first, then the congratulation dialog on top. */
  celebrate() {
    if (this.offered) return;
    this.offered = true;
    const u = ui();
    const lv = this.level;
    const idx = LEVELS.findIndex((l) => l.id === this.raw.id);
    const nextRaw = LEVELS[idx + 1];
    const next = nextRaw ? getLocalizedLevel(nextRaw, getLocale()) : null;
    const n = this.commandCount;
    const sum = summarize(this.progress);
    const targets = buildShareTargets({ levelName: lv.name, solvedCount: sum.solvedCount, total: sum.total });
    const statsLine = !n ? u.statsIdeal(lv.golf) : n <= lv.golf ? u.statsUnder(n, lv.golf) : u.statsOver(n, lv.golf);
    const cheer = u.cheers[Math.floor(Math.random() * u.cheers.length)];
    const learned = sum.learned.map((l) => `<li>${escapeHtml(l.name)}</li>`).join('');
    const seriesTitle = u.seq[this.raw.track] || '';

    const bodyHtml = `
      <div class="celebrate" aria-live="polite">
        <div class="celebrate-visual" aria-hidden="true"><div class="celebrate-ring"></div><div class="celebrate-star">★</div></div>
        <div class="celebrate-badge">${escapeHtml(u.levelCleared)}</div>
        <h3 class="celebrate-title">${escapeHtml(lv.name)}</h3>
        <p class="celebrate-sub">${escapeHtml(seriesTitle)} · <code>${escapeHtml(lv.id)}</code></p>
        <p class="celebrate-cheer">${escapeHtml(cheer)}</p>
        <div class="celebrate-stats">${renderMarkdown(statsLine)}</div>
        <div class="celebrate-progress">
          <div class="prog-track"><div class="prog-fill" style="width:${sum.percent}%"></div></div>
          <div class="par-note">${escapeHtml(u.progressLine(sum.solvedCount, sum.total))}</div>
        </div>
        <div class="share-block">
          <div class="next-title">${escapeHtml(u.shareTitle)}</div>
          <div class="learned-preview">
            <div class="par-note">${escapeHtml(u.styleList)}</div>
            <ul>${learned || `<li>${escapeHtml(u.solveMoreLevels)}</li>`}</ul>
          </div>
          <div class="share-row" role="group" aria-label="${escapeHtml(u.shareGroupLabel)}">
            <button type="button" class="share-btn linkedin" data-share="linkedin">${escapeHtml(u.linkedin)}</button>
            <button type="button" class="share-btn x" data-share="x">${escapeHtml(u.xTwitter)}</button>
            <button type="button" class="share-btn facebook" data-share="facebook">${escapeHtml(u.facebook)}</button>
            <button type="button" class="share-btn copy" data-share="copy">${escapeHtml(u.copyPost)}</button>
          </div>
          <div class="share-status" data-share-status hidden></div>
        </div>
        <div class="celebrate-next">${renderMarkdown(next ? u.nextCelebration(next.id, next.name) : u.lastInPack)}</div>
      </div>`;

    const actions = [
      { label: u.baskInIt, className: 'ghost', onClick: () => { this.offered = false; this.term.focus(); } },
      next
        ? { label: u.celebrateOn(next.id), className: 'primary', onClick: () => { this.offered = false; this.startLevel(next.id); } }
        : { label: u.browseLevels, className: 'primary', onClick: () => { this.offered = false; this.openLevels(); } },
    ];

    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const confetti = launchConfetti(4800);
    playFanfare();
    const modal = showModal({
      title: u.levelComplete,
      bodyHtml,
      variant: 'celebrate',
      actions,
      onClose: () => {
        confetti?.stop();
        this.offered = false;
      },
    });
    const status = modal.el.querySelector('[data-share-status]');
    modal.el.querySelectorAll('[data-share]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const { copied } = await share(btn.dataset.share, targets);
        status.hidden = false;
        status.textContent = copied ? u.copiedNotice : u.copyFailed;
      });
    });
  }
}

initLocale();
new App(document.getElementById('app'));
