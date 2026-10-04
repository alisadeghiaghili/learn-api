/**
 * Terminal view: scrolling log, a "next command" hint bar, history with
 * arrow keys and word-by-word Tab completion. Commands stay LTR.
 */

import { escapeHtml } from './dialog.js';

/**
 * @typedef {{ text?: string, html?: string, cls: string }} LogLine
 */

export class TerminalView {
  /**
   * @param {HTMLElement} root
   * @param {{ onSubmit: (line: string) => void, getSuggestion: () => string|null, placeholder: (cmd: string) => string, idlePlaceholder: string, nextLabel: string, tabNote: string, lines?: LogLine[] }} opts
   */
  constructor(root, opts) {
    this.opts = opts;
    /** @type {string[]} */
    this.history = [];
    this.histIdx = -1;
    root.innerHTML = `
      <div class="term-log" id="term-log" aria-live="polite"></div>
      <div class="term-hint" id="term-hint" hidden></div>
      <form class="term-input-row" id="term-form" autocomplete="off">
        <span class="prompt">api $</span>
        <div class="term-input-wrap">
          <input class="term-input" id="term-input" type="text" spellcheck="false" aria-label="Command" />
        </div>
      </form>`;
    this.logEl = root.querySelector('#term-log');
    this.hintEl = root.querySelector('#term-hint');
    this.input = root.querySelector('#term-input');
    for (const l of opts.lines || []) this.append(l);
    root.querySelector('#term-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const line = this.input.value;
      if (line.trim()) {
        this.history.push(line.trim());
        this.histIdx = this.history.length;
      }
      this.input.value = '';
      opts.onSubmit(line);
    });
    this.input.addEventListener('keydown', (e) => this.onKey(e));
    this.refreshHint();
  }

  /** @param {KeyboardEvent} e */
  onKey(e) {
    if (e.key === 'ArrowUp' && this.history.length) {
      e.preventDefault();
      this.histIdx = Math.max(0, this.histIdx - 1);
      this.input.value = this.history[this.histIdx] ?? '';
    } else if (e.key === 'ArrowDown' && this.history.length) {
      e.preventDefault();
      this.histIdx = Math.min(this.history.length, this.histIdx + 1);
      this.input.value = this.history[this.histIdx] ?? '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const sug = this.opts.getSuggestion();
      if (!sug) return;
      const cur = this.input.value;
      if (!sug.startsWith(cur)) return;
      const rest = sug.slice(cur.length);
      const m = rest.match(/^\s*\S+/);
      if (m) this.input.value = cur + m[0] + (cur + m[0] === sug ? '' : ' ');
    }
  }

  /**
   * Append a log line (plain text or trusted html).
   *
   * @param {LogLine} line
   */
  append(line) {
    const div = document.createElement('div');
    if (line.cls) div.className = line.cls;
    if (line.html !== undefined) div.innerHTML = line.html;
    else div.textContent = line.text ?? '';
    this.logEl.appendChild(div);
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  clear() {
    this.logEl.replaceChildren();
  }

  /** Refresh the hint bar and placeholder from the current suggestion. */
  refreshHint() {
    const sug = this.opts.getSuggestion();
    if (sug) {
      this.hintEl.hidden = false;
      this.hintEl.innerHTML = `${escapeHtml(this.opts.nextLabel)}: <code>${escapeHtml(sug)}</code> · ${escapeHtml(this.opts.tabNote)}`;
      this.input.placeholder = this.opts.placeholder(sug);
    } else {
      this.hintEl.hidden = true;
      this.input.placeholder = this.opts.idlePlaceholder;
    }
  }

  focus() {
    this.input.focus();
  }
}
