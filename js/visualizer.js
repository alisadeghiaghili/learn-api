/**
 * SVG visualizers: request pipeline and API surface map.
 *
 * Args:
 *   container — DOM node to render into
 *
 * Returns:
 *   controller with render / animatePacket methods
 */

const TRACK_COLORS = {
  fastapi: '#009485',
  plumber: '#276DC3',
  openapi: '#85CB33',
  http: '#8B9BB4',
  packet: '#7C6AF7',
  ok: '#2DD4A8',
  fail: '#F07178',
  line: '#1F2A3C',
  ink: '#E8EDF5',
  muted: '#8B9BB4',
  panel: '#111827',
};

const METHOD_COLORS = {
  GET: TRACK_COLORS.ok,
  POST: '#F5C542',
  PUT: TRACK_COLORS.packet,
  PATCH: TRACK_COLORS.plumber,
  DELETE: TRACK_COLORS.fail,
};

/**
 * @param {HTMLElement} container
 * @returns {{ render: (state: object) => void, animatePacket: (req: object, res: object) => Promise<void> }}
 */
export function createPipelineViz(container) {
  /** @type {SVGSVGElement|null} */
  let svg = null;
  /** @type {object|null} */
  let lastState = null;

  function render(state) {
    lastState = state;
    const routes = state.routes || [];
    const width = 720;
    const height = 280;
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Request pipeline visualization');
    svg.innerHTML = `
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="${TRACK_COLORS.line}" />
        </marker>
      </defs>
      <text class="viz-muted" x="24" y="28">client → router → handler → response</text>
    `;

    const stages = [
      { id: 'client', label: 'Client', x: 40 },
      { id: 'router', label: 'Router', x: 220 },
      { id: 'handler', label: 'Handler', x: 400 },
      { id: 'response', label: 'Response', x: 580 },
    ];
    const y = 140;
    const boxW = 110;
    const boxH = 56;

    stages.forEach((s, i) => {
      const g = el('g', { transform: `translate(${s.x},${y - boxH / 2})` });
      g.appendChild(
        el('rect', {
          x: 0,
          y: 0,
          width: boxW,
          height: boxH,
          rx: 8,
          class: `viz-node stage-${s.id}${state.liveStage === s.id ? ' live' : ''}`,
          fill: TRACK_COLORS.panel,
          stroke: state.liveStage === s.id ? TRACK_COLORS.packet : TRACK_COLORS.line,
          'stroke-width': 1,
        })
      );
      const t = el('text', {
        x: boxW / 2,
        y: boxH / 2,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        class: 'viz-text',
      });
      t.textContent = s.label;
      g.appendChild(t);
      if (s.id === 'handler' && state.handlerName) {
        const sub = el('text', {
          x: boxW / 2,
          y: boxH / 2 + 18,
          'text-anchor': 'middle',
          class: 'viz-muted',
        });
        sub.textContent = state.handlerName;
        g.appendChild(sub);
      }
      if (s.id === 'response' && state.lastStatus) {
        const sub = el('text', {
          x: boxW / 2,
          y: boxH / 2 + 18,
          'text-anchor': 'middle',
          class: 'viz-muted',
          fill: state.lastOk ? TRACK_COLORS.ok : TRACK_COLORS.fail,
        });
        sub.textContent = String(state.lastStatus);
        g.appendChild(sub);
      }
      svg.appendChild(g);

      if (i < stages.length - 1) {
        const x1 = s.x + boxW;
        const x2 = stages[i + 1].x;
        svg.appendChild(
          el('path', {
            d: `M ${x1} ${y} L ${x2 - 6} ${y}`,
            class: 'viz-edge',
            stroke: TRACK_COLORS.line,
            'marker-end': 'url(#arrow)',
          })
        );
      }
    });

    // Route inventory strip
    const listY = 210;
    svg.appendChild(
      el('text', { x: 24, y: listY - 8, class: 'viz-muted', textContent: `${routes.length} routes` })
    );
    let lx = 24;
    for (const r of routes.slice(0, 8)) {
      const label = `${r.method} ${r.path}`;
      const w = Math.min(160, 48 + label.length * 6.2);
      const g = el('g', { transform: `translate(${lx},${listY})` });
      g.appendChild(
        el('rect', {
          width: w,
          height: 28,
          rx: 6,
          fill: TRACK_COLORS.panel,
          stroke: METHOD_COLORS[r.method] || TRACK_COLORS.line,
        })
      );
      const t = el('text', {
        x: w / 2,
        y: 14,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        class: 'viz-mono',
        fill: METHOD_COLORS[r.method] || TRACK_COLORS.ink,
      });
      t.textContent = label;
      g.appendChild(t);
      svg.appendChild(g);
      lx += w + 8;
      if (lx > width - 40) break;
    }

    // Packet group (animated)
    const packet = el('circle', {
      id: 'packet-dot',
      r: 7,
      cx: -20,
      cy: y,
      class: 'viz-packet',
      fill: TRACK_COLORS.packet,
      opacity: 0,
    });
    const packetLabel = el('text', {
      id: 'packet-label',
      x: -20,
      y: y - 18,
      'text-anchor': 'middle',
      class: 'viz-mono',
      fill: TRACK_COLORS.packet,
      opacity: 0,
    });
    svg.appendChild(packet);
    svg.appendChild(packetLabel);

    container.replaceChildren(svg);
  }

  function animatePacket(req, res) {
    return new Promise((resolve) => {
      if (!svg || !lastState) {
        resolve();
        return;
      }
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const dot = svg.querySelector('#packet-dot');
      const label = svg.querySelector('#packet-label');
      if (!dot || !label) {
        resolve();
        return;
      }
      const text = `${req.method} ${req.path}`;
      label.textContent = text;
      const xs = [40 + 55, 220 + 55, 400 + 55, 580 + 55];
      const y = 140;
      let i = 0;

      const step = () => {
        if (i >= xs.length) {
          dot.setAttribute('opacity', '0');
          label.setAttribute('opacity', '0');
          lastState.lastStatus = res.status;
          lastState.lastOk = res.ok;
          lastState.handlerName = res.matched ? res.matched.handlerName : '';
          lastState.liveStage = null;
          render(lastState);
          resolve();
          return;
        }
        const x = xs[i];
        lastState.liveStage = ['client', 'router', 'handler', 'response'][i];
        render(lastState);
        const d = svg.querySelector('#packet-dot');
        const l = svg.querySelector('#packet-label');
        if (!d || !l) return resolve();
        d.setAttribute('cx', String(x));
        d.setAttribute('cy', String(y));
        d.setAttribute('opacity', '1');
        d.setAttribute('fill', TRACK_COLORS.packet);
        l.setAttribute('x', String(x));
        l.setAttribute('y', String(y - 20));
        l.setAttribute('opacity', '1');
        l.textContent = text;
        i++;
        setTimeout(step, reduce ? 0 : 380);
      };
      step();
    });
  }

  render(lastState || { routes: [] });
  return {
    render,
    animatePacket,
  };
}

/**
 * API surface map — endpoint nodes bloom in as routes are registered.
 *
 * @param {HTMLElement} container
 * @returns {{ render: (state: object) => void }}
 */
export function createSurfaceViz(container) {
  function render(state) {
    const routes = state.routes || [];
    const width = 720;
    const colW = 170;
    const rowH = 52;
    const height = Math.max(280, 40 + routes.length * rowH + 40);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'API surface map');

    const title = el('text', { x: 24, y: 28, class: 'viz-muted' });
    title.textContent = state.title ? `${state.title} · open surface` : 'API surface';
    svg.appendChild(title);

    // Server root
    const root = el('g', { transform: 'translate(40,48)' });
    root.appendChild(
      el('rect', {
        width: 120,
        height: 36,
        rx: 8,
        fill: TRACK_COLORS.panel,
        stroke: state.trackColor || TRACK_COLORS.packet,
        'stroke-width': 1.5,
      })
    );
    const rt = el('text', {
      x: 60,
      y: 18,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      class: 'viz-text',
    });
    rt.textContent = state.title || 'app';
    root.appendChild(rt);
    svg.appendChild(root);

    if (!routes.length) {
      const empty = el('text', {
        x: 40,
        y: 120,
        class: 'viz-muted',
      });
      empty.textContent = 'No routes yet — write handlers and press Run.';
      svg.appendChild(empty);
    }

    routes.forEach((r, idx) => {
      const y = 48 + 56 + idx * rowH;
      const g = el('g', {
        transform: `translate(200,${y})`,
        class: `viz-node method-${r.method.toLowerCase()}`,
      });
      // connector
      svg.appendChild(
        el('path', {
          d: `M 160 66 C 180 66, 180 ${y + 18}, 200 ${y + 18}`,
          fill: 'none',
          stroke: TRACK_COLORS.line,
          'stroke-width': 1,
        })
      );
      g.appendChild(
        el('rect', {
          width: 280,
          height: 40,
          rx: 8,
          fill: TRACK_COLORS.panel,
          stroke: METHOD_COLORS[r.method] || TRACK_COLORS.line,
          'stroke-width': 1.2,
        })
      );
      const meth = el('text', {
        x: 12,
        y: 20,
        'dominant-baseline': 'central',
        class: 'viz-mono',
        fill: METHOD_COLORS[r.method] || TRACK_COLORS.ink,
      });
      meth.textContent = r.method;
      g.appendChild(meth);
      const path = el('text', {
        x: 64,
        y: 20,
        'dominant-baseline': 'central',
        class: 'viz-mono',
      });
      path.textContent = r.path;
      g.appendChild(path);
      if (r.handlerName) {
        const h = el('text', {
          x: 300,
          y: 20,
          'dominant-baseline': 'central',
          class: 'viz-muted',
        });
        h.textContent = r.handlerName;
        g.appendChild(h);
      }
      svg.appendChild(g);
    });

    container.replaceChildren(svg);
  }

  render({ routes: [] });
  return { render };
}

/**
 * @param {string} tag
 * @param {Record<string, string|number>} attrs
 * @returns {SVGElement}
 */
function el(tag, attrs) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'textContent') node.textContent = String(v);
    else node.setAttribute(k, String(v));
  }
  return node;
}
