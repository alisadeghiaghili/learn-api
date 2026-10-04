/**
 * Locale manager: runtime language switching, document direction, and copy access.
 */

import { en } from './en.js';
import { fa } from './fa.js';

const STORAGE_KEY = 'learnapi.locale';
const catalogs = { en, fa };
export const LOCALES = ['en', 'fa'];

let current = 'en';

/**
 * Detect user locale from localStorage or browser.
 * @returns {'en'|'fa'}
 */
export function detectLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'fa') return saved;
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : '';
  if (nav && (nav.toLowerCase().startsWith('fa') || nav.toLowerCase().startsWith('pe'))) {
    return 'fa';
  }
  return 'en';
}

/**
 * Get active locale.
 * @returns {'en'|'fa'}
 */
export function getLocale() {
  return current;
}

/**
 * Set active locale.
 * @param {'en'|'fa'} locale
 */
export function setLocale(locale) {
  if (locale !== 'en' && locale !== 'fa') return;
  current = locale;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  applyDocumentLocale();
}

/**
 * Apply dir and lang to documentElement.
 */
export function applyDocumentLocale() {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = current;
  document.documentElement.dir = catalogs[current].dir;
}

/**
 * Initialize locale on boot.
 * @returns {'en'|'fa'}
 */
export function initLocale() {
  current = detectLocale();
  applyDocumentLocale();
  return current;
}

/**
 * Get current UI strings.
 * @returns {typeof en.ui}
 */
export function ui() {
  return catalogs[current].ui;
}

/**
 * Get document direction.
 * @returns {'ltr'|'rtl'}
 */
export function getDir() {
  return catalogs[current].dir;
}
