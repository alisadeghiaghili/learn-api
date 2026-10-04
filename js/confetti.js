/**
 * Full-page confetti burst and audio fanfare for level celebration.
 * Client-side only; canvas renders with high z-index above modal dialogs.
 */

const COLORS = ['#009485', '#2DD4A8', '#F5C542', '#7C6AF7', '#276DC3', '#F07178', '#E8EDF5'];

/**
 * Launch full-page canvas confetti.
 *
 * @param {number} [durationMs=4800]
 * @returns {{ stop: () => void } | null}
 */
export function launchConfetti(durationMs = 4800) {
  if (typeof document === 'undefined') return null;

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (reduce) {
    const layer = document.createElement('div');
    layer.className = 'confetti-static';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    return {
      stop: () => layer.remove(),
    };
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);
  document.body.appendChild(canvas);

  /** @type {Array<{x: number, y: number, w: number, h: number, color: string, vx: number, vy: number, rot: number, vr: number, shape: 'rect'|'tri'|'ribbon'}>} */
  const pieces = [];

  const spawn = (count, fromSides = false) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < count; i++) {
      const shape = Math.random() < 0.35 ? 'ribbon' : Math.random() < 0.5 ? 'tri' : 'rect';
      pieces.push({
        x: fromSides ? (Math.random() < 0.5 ? -20 : w + 20) : w * 0.2 + Math.random() * w * 0.6,
        y: fromSides ? h * 0.35 + Math.random() * h * 0.3 : -20 - Math.random() * h * 0.35,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: fromSides ? (Math.random() < 0.5 ? 2.4 : -2.4) + (Math.random() - 0.5) : (Math.random() - 0.5) * 2.4,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.25,
        shape,
      });
    }
  };

  spawn(80);
  spawn(40, true);

  const started = performance.now();
  let raf = 0;
  let rainTimer = window.setInterval(() => {
    if (performance.now() - started > durationMs - 1200) {
      window.clearInterval(rainTimer);
      return;
    }
    spawn(18);
  }, 280);

  const frame = (now) => {
    const t = now - started;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p of pieces) {
      p.vy += 0.035;
      p.vx *= 0.995;
      p.x += p.vx + Math.sin((now + p.y) / 400) * 0.4;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = t > durationMs - 600 ? Math.max(0, (durationMs - t) / 600) : 1;

      if (p.shape === 'tri') {
        ctx.beginPath();
        ctx.moveTo(0, -p.h / 2);
        ctx.lineTo(p.w / 2, p.h / 2);
        ctx.lineTo(-p.w / 2, p.h / 2);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'ribbon') {
        ctx.fillRect(-p.w / 2, -p.h / 6, p.w, p.h / 3);
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();

      if (p.y > h + 40) {
        p.y = -20;
        p.x = Math.random() * window.innerWidth;
        p.vy = 2 + Math.random() * 2;
      }
    }

    if (t < durationMs) {
      raf = requestAnimationFrame(frame);
    } else {
      stop();
    }
  };

  const stop = () => {
    cancelAnimationFrame(raf);
    if (rainTimer !== undefined) window.clearInterval(rainTimer);
    window.removeEventListener('resize', resize);
    canvas.remove();
  };

  raf = requestAnimationFrame(frame);
  window.setTimeout(stop, durationMs + 400);
  return { stop };
}

/**
 * WebAudio fanfare for level completion without external audio files.
 */
export function playFanfare() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t0 = now + i * 0.09;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.08, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.25);
    });
    window.setTimeout(() => void ctx.close().catch(() => {}), 1200);
  } catch {
    /* Audio optional */
  }
}
