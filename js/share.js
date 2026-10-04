/**
 * Share helpers: build social post URLs and copy text to the clipboard.
 */

import { ui } from './i18n/index.js';

export const LIVE_URL = 'https://alisadeghiaghili.github.io/learn-api/';
export const REPO_URL = 'https://github.com/alisadeghiaghili/learn-api';
export const COFFEE_URL = 'https://www.buymeacoffee.com/alisadeghil';
export const COFFEE_BUTTON_HTML = `<a href="${COFFEE_URL}" target="_blank" rel="noopener noreferrer"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=alisadeghil&button_colour=2a3a4a&font_colour=ffffff&font_family=Cookie&outline_colour=ffffff&coffee_colour=FFDD00" alt="Buy me a coffee" /></a>`;

/**
 * @typedef {Object} ShareTargets
 * @property {string} text
 * @property {string} linkedin
 * @property {string} x
 * @property {string} facebook
 */

/**
 * @param {{ levelName: string, solvedCount: number, total: number }} ctx
 * @returns {ShareTargets}
 */
export function buildShareTargets(ctx) {
  const u = ui();
  const text = `${u.shareText(ctx.levelName, ctx.solvedCount, ctx.total)}\n${u.shareCta}: ${LIVE_URL}`;
  const short = `${u.shareText(ctx.levelName, ctx.solvedCount, ctx.total)} ${LIVE_URL}`.slice(0, 275);
  return {
    text,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(LIVE_URL)}&title=${encodeURIComponent(u.shareHeadline)}&summary=${encodeURIComponent(text)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(short)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(LIVE_URL)}&quote=${encodeURIComponent(text)}`,
  };
}

/**
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * Open a share window (or copy), copying the text first as a fallback.
 *
 * @param {'linkedin'|'x'|'facebook'|'copy'} kind
 * @param {ShareTargets} targets
 * @returns {Promise<{ copied: boolean }>}
 */
export async function share(kind, targets) {
  const copied = await copyText(targets.text);
  if (kind !== 'copy') {
    window.open(targets[kind], '_blank', 'noopener,noreferrer,width=720,height=640');
  }
  return { copied };
}
