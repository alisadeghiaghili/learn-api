/**
 * Modal dialogs and a small markdown subset (headings, fences, lists,
 * bold, inline code).
 */

/**
 * @param {string} s
 * @returns {string}
 */
export function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Inline markdown: `code` and **bold**, after escaping.
 *
 * @param {string} raw
 * @returns {string}
 */
export function renderInline(raw) {
  // Keep trusted <a>…</a> HTML (Buy Me a Coffee button, links) as real markup.
  const slots = [];
  const parts = raw.split(/(<a\b[\s\S]*?<\/a>)/gi);
  const mapped = parts
    .map((part, i) => {
      if (i % 2 === 1) {
        slots.push(part);
        return '@@HTML' + (slots.length - 1) + '@@';
      }
      let t = escapeHtml(part);
      t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
      t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      t = t.replace(
        /\[([^\]]+)\]\(([^)\s]+)\)/g,
        (_m, label, href) =>
          `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`,
      );
      return t;
    })
    .join('');
  return mapped.replace(/@@HTML(\d+)@@/g, (_m, i) => slots[Number(i)] ?? '');
}

/**
 * Render a markdown subset to HTML.
 *
 * @param {string} md
 * @returns {string}
 */
export function renderMarkdown(md) {
  const blocks = md.split(/```/);
  let html = '';
  blocks.forEach((block, i) => {
    if (i % 2 === 1) {
      html += `<pre>${escapeHtml(block.replace(/^\w*\n/, '').replace(/\n$/, ''))}</pre>`;
      return;
    }
    /** @type {string[]} */
    let list = [];
    const flush = () => {
      if (list.length) html += `<ul>${list.join('')}</ul>`;
      list = [];
    };
    for (const line of block.split('\n')) {
      const t = line.trim();
      if (!t) {
        flush();
        continue;
      }
      if (/^[-*]\s+/.test(t)) {
        list.push(`<li>${renderInline(t.replace(/^[-*]\s+/, ''))}</li>`);
        continue;
      }
      flush();
      const h = t.match(/^#{1,3}\s+(.*)$/);
      html += h ? `<h3>${renderInline(h[1])}</h3>` : `<p>${renderInline(t)}</p>`;
    }
    flush();
  });
  return html;
}

/**
 * @typedef {Object} ModalAction
 * @property {string} label
 * @property {string} [className]
 * @property {() => void} onClick
 */

/**
 * Show a modal overlay.
 *
 * @param {{ title: string, titleHtml?: string, bodyHtml: string, actions?: ModalAction[], onClose?: () => void, variant?: 'default'|'celebrate', closeLabel?: string }} opts
 * @returns {{ close: () => void, el: HTMLElement }}
 */
export function showModal(opts) {
  const celebrate = opts.variant === 'celebrate';
  const overlay = document.createElement('div');
  overlay.className = `overlay${celebrate ? ' overlay-celebrate' : ''}`;
  overlay.innerHTML = `
    <div class="modal${celebrate ? ' modal-celebrate' : ''}" role="dialog" aria-modal="true" aria-label="${escapeHtml(opts.title)}">
      <h2${celebrate ? ' class="visually-hidden"' : ''}>${opts.titleHtml ?? escapeHtml(opts.title)}</h2>
      <div class="markdown">${opts.bodyHtml}</div>
      <div class="modal-actions"></div>
    </div>`;
  const actionsEl = overlay.querySelector('.modal-actions');
  let closed = false;
  const onKey = (e) => {
    if (e.key === 'Escape') close();
  };
  const close = () => {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    opts.onClose?.();
  };
  const actions = opts.actions?.length
    ? opts.actions
    : [{ label: opts.closeLabel || 'Close', onClick: () => {} }];
  for (const action of actions) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = action.className ?? '';
    btn.textContent = action.label;
    btn.addEventListener('click', () => {
      close();
      action.onClick();
    });
    actionsEl.appendChild(btn);
  }
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(overlay);
  const modalEl = overlay.querySelector('.modal');
  modalEl.tabIndex = -1;
  requestAnimationFrame(() => modalEl.focus());
  return { close, el: overlay };
}
