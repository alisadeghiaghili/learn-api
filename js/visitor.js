/**
 * Visitor counter client with local deduplication and badge SVG parsing.
 * Fetches page visitor count and renders a clean numeric stat in the toolbar.
 */

'use strict';

const STORAGE_KEY = 'learn-api:visitor-count-cache';
const SESSION_KEY = 'learn-api:visitor-session-counted';
const BADGE_URL = 'https://api.visitorbadge.io/api/combined?path=learn-api';
const BASE_COUNT = 4;

/**
 * Extracts the numeric visitor count from the visitorbadge SVG payload.
 *
 * @param {string} svg
 * @returns {number | null}
 */
export function parseVisitorBadgeSvg(svg) {
  if (!svg || typeof svg !== 'string') return null;
  const match = svg.match(/VISITORS:\s*([\d.,]+[KMB]?)/i);
  const raw = (match ? match[1] : '').replace(/,/g, '');
  if (!raw) return null;

  const suffix = raw.slice(-1).toUpperCase();
  const scale = { K: 1e3, M: 1e6, B: 1e9 }[suffix] || 1;
  const numPart = scale > 1 ? raw.slice(0, -1) : raw;
  const numeric = Number.parseFloat(numPart) * scale;
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : null;
}

/**
 * Retrieves the visitor count, incrementing on the first visit per browser session,
 * while returning cached count on subsequent page reloads to count unique visitors.
 * Always ensures the displayed count starts from at least 4.
 *
 * @returns {Promise<number>}
 */
export async function getVisitorCount() {
  let cachedCount = BASE_COUNT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      if (typeof cached?.count === 'number' && Number.isFinite(cached.count)) {
        cachedCount = Math.max(BASE_COUNT, cached.count);
      }
    }
  } catch {
    // LocalStorage may fail in restricted private browsing
  }

  // Deduplication: if already counted in this browser session, return cached count
  try {
    const sessionCounted = sessionStorage.getItem(SESSION_KEY);
    if (sessionCounted) {
      return cachedCount;
    }
  } catch {
    // SessionStorage may fail in restricted environments
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(BADGE_URL, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        Accept: 'image/svg+xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return cachedCount;

    const svg = await res.text();
    const parsed = parseVisitorBadgeSvg(svg);

    const count = parsed !== null ? Math.max(BASE_COUNT, parsed) : cachedCount;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ count, at: Date.now() })
      );
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // quota or private mode
    }

    return count;
  } catch {
    return cachedCount;
  }
}
