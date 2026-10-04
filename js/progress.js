/**
 * Progress persistence: localStorage plus a cookie so a new browser session
 * on the same machine still resumes.
 */

import { LEVELS, getLocalizedLevel } from './levels.js';
import { getLocale } from './i18n/index.js';

export const STORAGE_KEY = 'learnapi.progress.v2';
export const COOKIE_KEY = 'learnapi_progress';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

/**
 * @typedef {{ solved: boolean, bestCommands?: number }} LevelProgress
 */

/** @returns {string|null} */
function readCookie() {
  if (typeof document === 'undefined') return null;
  for (const part of document.cookie.split(';')) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (rawKey !== COOKIE_KEY) continue;
    try {
      return decodeURIComponent(rest.join('='));
    } catch {
      return rest.join('=');
    }
  }
  return null;
}

/** @param {string} payload */
function writeCookie(payload) {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(payload)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * @param {string|null} raw
 * @returns {Record<string, LevelProgress>|null}
 */
function parseBlob(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && 'progress' in parsed ? parsed.progress || {} : parsed;
  } catch {
    return null;
  }
}

/**
 * Merge cookie + localStorage (+ the legacy solved list) into one map.
 *
 * @returns {Record<string, LevelProgress>}
 */
export function loadProgress() {
  /** @type {Record<string, LevelProgress>} */
  const merged = {};
  let fromLocal = null;
  try {
    fromLocal = parseBlob(localStorage.getItem(STORAGE_KEY));
    const legacy = JSON.parse(localStorage.getItem('learnapi.solved') || '[]');
    for (const id of legacy) merged[id] = { solved: true };
  } catch {
    /* private mode */
  }
  for (const src of [parseBlob(readCookie()) || {}, fromLocal || {}]) {
    for (const [id, prog] of Object.entries(src)) {
      if (!prog) continue;
      const prev = merged[id];
      const best = [prev?.bestCommands, prog.bestCommands].filter((n) => typeof n === 'number');
      merged[id] = {
        solved: Boolean(prog.solved || prev?.solved),
        bestCommands: best.length ? Math.min(...best) : undefined,
      };
    }
  }
  return merged;
}

/** @param {Record<string, LevelProgress>} progress */
export function saveProgress(progress) {
  const payload = JSON.stringify({ progress, savedAt: new Date().toISOString() });
  try {
    localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    /* quota or private mode; the cookie still helps */
  }
  writeCookie(payload);
}

/**
 * @typedef {Object} CurriculumSummary
 * @property {number} solvedCount
 * @property {number} total
 * @property {number} percent
 * @property {{ id: string, name: string }[]} learned
 * @property {{ id: string, name: string }|null} next
 */

/**
 * @param {Record<string, LevelProgress>} progress
 * @returns {CurriculumSummary}
 */
export function summarize(progress) {
  const lang = getLocale();
  const view = LEVELS.map((l) => getLocalizedLevel(l, lang));
  const learned = view.filter((l) => progress[l.id]?.solved).map((l) => ({ id: l.id, name: l.name }));
  const nextLevel = view.find((l) => !progress[l.id]?.solved);
  return {
    solvedCount: learned.length,
    total: view.length,
    percent: view.length ? Math.round((learned.length / view.length) * 100) : 0,
    learned,
    next: nextLevel ? { id: nextLevel.id, name: nextLevel.name } : null,
  };
}
