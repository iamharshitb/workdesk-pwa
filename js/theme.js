// ── WorkDesk Theme System ─────────────────────────────────────────────────
// Two skins — Fair copy (light) and Azure (dark) — and a mode that picks
// between them: 'light', 'dark', or 'auto' (follow the device).
//
// The resolved skin is a class on <html> (`theme-light` / `theme-dark`); all
// colours and shapes live in css/themes.css as tokens. The user's choice is
// stored as `wd_mode`. The old six themes were retired: a saved legacy
// `wd_theme` is migrated once (dark-ish ones → dark, the rest → light) and then
// removed.

export const THEMES = [
  { id: 'light', name: 'Light', sub: 'Fair copy',  bg: '#FFFFFF' },
  { id: 'dark',  name: 'Dark',  sub: 'Azure',      bg: '#00000C' },
];
export const MODES = [
  { id: 'light', name: 'Light' },
  { id: 'dark',  name: 'Dark'  },
  { id: 'auto',  name: 'Auto'  },
];

const LEGACY_DARK = new Set(['neudark', 'glass', 'industrial', 'ember', 'matrix', 'ios']);
const MODE_KEY = 'wd_mode';
const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
const listeners = new Set();

function readMode() {
  try {
    const saved = localStorage.getItem(MODE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
    const legacy = localStorage.getItem('wd_theme');
    let mode = 'auto';
    if (legacy) {
      mode = LEGACY_DARK.has(legacy) ? 'dark' : 'light';
      localStorage.removeItem('wd_theme');
    }
    localStorage.setItem(MODE_KEY, mode);
    return mode;
  } catch { return 'auto'; }
}

let mode = readMode();

export function getMode() { return mode; }

export function resolvedTheme() {
  if (mode === 'light' || mode === 'dark') return mode;
  return mq && mq.matches ? 'dark' : 'light';
}

function paint() {
  const theme = resolvedTheme();
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark');
  root.classList.add('theme-' + theme);
  root.dataset.mode = mode;
  // keep the OS status bar / task-switcher header in step with the page
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = THEMES.find(t => t.id === theme).bg;
  document.querySelectorAll('[data-mode-opt]').forEach(el => {
    const on = el.dataset.modeOpt === mode;
    el.classList.toggle('on', on);
    el.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  listeners.forEach(cb => { try { cb(theme, mode); } catch { /* listener errors never block paint */ } });
}

export function setMode(next) {
  if (!MODES.some(m => m.id === next)) return;
  mode = next;
  try { localStorage.setItem(MODE_KEY, mode); } catch { /* private mode: keep in memory */ }
  paint();
}

// Kept for pages that still call it with a skin id.
export function applyTheme(themeId) {
  setMode(themeId === 'dark' ? 'dark' : themeId === 'light' ? 'light' : 'auto');
}

export function onThemeChange(cb) { listeners.add(cb); return () => listeners.delete(cb); }

export function initTheme() {
  paint();
  if (mq) {
    const follow = () => { if (mode === 'auto') paint(); };
    if (mq.addEventListener) mq.addEventListener('change', follow);
    else if (mq.addListener) mq.addListener(follow);
  }
}

// ── Appearance picker ─────────────────────────────────────────────────────
// Pages that don't have the profile sheet yet open this small sheet from their
// "Theme" button. The same three-way control is reused by the profile sheet in
// js/ui.js (it only needs the `data-mode-opt` attribute and `window.__setMode`).
window.__setMode = (id) => { if (navigator.vibrate) navigator.vibrate(8); setMode(id); };

export function appearanceControlHTML() {
  return `<div class="wd-seg" role="group" aria-label="Appearance">
    ${MODES.map(m => `<button type="button" data-mode-opt="${m.id}" aria-pressed="${m.id === mode}"
      class="${m.id === mode ? 'on' : ''}" onclick="window.__setMode('${m.id}')">${m.name}</button>`).join('')}
  </div>`;
}

function buildThemePanel() {
  const overlay = document.createElement('div');
  overlay.className = 'wd-scrim';
  overlay.id = 'theme-overlay';
  overlay.onclick = e => { if (e.target === overlay) closeThemePanel(); };
  overlay.innerHTML = `
    <div class="wd-sheet" role="dialog" aria-label="Appearance">
      <div class="wd-grab"></div>
      <div class="wd-sheet-title">Appearance</div>
      ${appearanceControlHTML()}
      <p class="wd-sheet-note">Auto follows your device's light or dark setting.</p>
    </div>`;
  document.body.appendChild(overlay);
}

export function toggleThemePanel() {
  let overlay = document.getElementById('theme-overlay');
  if (!overlay) { buildThemePanel(); overlay = document.getElementById('theme-overlay'); }
  overlay.classList.toggle('open');
}

function closeThemePanel() {
  const overlay = document.getElementById('theme-overlay');
  if (overlay) overlay.classList.remove('open');
}
