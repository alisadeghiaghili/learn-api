/**
 * Locale manager: runtime language switching, document direction, and copy access.
 */

import { en } from './en.js';
import { fa } from './fa.js';
import { de } from './de.js';

const STORAGE_KEY = 'learnapi.locale';
const catalogs = { en, fa, de };
export const LOCALES = ['en', 'fa', 'de'];

let current = 'en';

/**
 * Detect user locale from localStorage or browser.
 * @returns {'en'|'fa'|'de'}
 */
export function detectLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'fa' || saved === 'de') return saved;
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : '';
  if (nav) {
    const l = nav.toLowerCase();
    if (l.startsWith('fa') || l.startsWith('pe')) return 'fa';
    if (l.startsWith('de')) return 'de';
  }
  return 'en';
}

/**
 * Get active locale.
 * @returns {'en'|'fa'|'de'}
 */
export function getLocale() {
  return current;
}

/**
 * Set active locale.
 * @param {'en'|'fa'|'de'} locale
 */
export function setLocale(locale) {
  if (locale !== 'en' && locale !== 'fa' && locale !== 'de') return;
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
 * @returns {'en'|'fa'|'de'}
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
