/**
 * Visitor counter client with local caching. Reads a public badge and
 * extracts the number; failures are silent and the stat stays hidden.
 */

const STORAGE_KEY = 'learnapi:visitor-count-cache';
const BADGE_URL = 'https://api.visitorbadge.io/api/combined?path=learn-api';

/**
 * Extract the visitor count from the badge SVG payload.
 *
 * @param {string} svg
 * @returns {number|null}
 */
export function parseVisitorBadgeSvg(svg) {
  const title = svg.match(/VISITORS:\s*([\d.,]+[KMB]?)/i);
  const raw = (title ? title[1] : '').replace(/,/g, '');
  if (!raw) return null;
  const suffix = raw.slice(-1).toUpperCase();
  const scale = { K: 1e3, M: 1e6, B: 1e9 }[suffix] || 1;
  const numeric = Number.parseFloat(scale > 1 ? raw.slice(0, -1) : raw) * scale;
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : null;
}

/**
 * @returns {Promise<number|null>}
 */
export async function getVisitorCount() {
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (cached && Number.isFinite(cached.count)) return cached.count;
  } catch {
    /* ignore */
  }
  try {
    const res = await fetch(BADGE_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    const count = parseVisitorBadgeSvg(await res.text());
    if (count !== null) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, at: Date.now() }));
      } catch {
        /* ignore */
      }
    }
    return count;
  } catch {
    return null;
  }
}
