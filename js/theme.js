// ── WorkDesk Theme System ─────────────────────────────────────────────────
// Handles all 7 themes × 5 font combos. Persists to localStorage.

export const THEMES = [
  { id:'ios',        name:'iOS Glass',       sub:'Frosted · Liquid Glass',    dot:'#0a84ff', bg:'#1c1c1e' },
  { id:'bigsur',     name:'Big Sur',         sub:'macOS · Warm Coral Glass',  dot:'#5ac8fa', bg:'#1a0a0a' },
  { id:'ios-system', name:'iOS System Dark', sub:'Control Centre · Clean',    dot:'#0a84ff', bg:'#1c1c1e' },
  { id:'health',     name:'iOS Health',      sub:'Pastel · Airy · White',     dot:'#007aff', bg:'#f2f2f7' },
];

let currentTheme = localStorage.getItem('wd_theme') || 'neon';

export function applyTheme(themeId) {
  THEMES.forEach(t => document.body.classList.remove('theme-'+t.id));
  document.body.classList.add('theme-'+themeId);
  currentTheme = themeId;
  localStorage.setItem('wd_theme', themeId);
  updateSwatchActive();
}

export function initTheme() {
  applyTheme(currentTheme);
}

function updateSwatchActive() {
  document.querySelectorAll('.swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.theme === currentTheme);
  });
}

export function buildThemePanel() {
  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'theme-panel-overlay';
  overlay.id = 'theme-overlay';
  overlay.onclick = e => { if(e.target===overlay) closeThemePanel(); };

  // Panel
  const panel = document.createElement('div');
  panel.className = 'theme-panel';
  panel.innerHTML = `
    
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // Expose to window for onclick handlers
  window.__applyTheme = (id) => { applyTheme(id); updateSwatchActive(); };
  window.__applyFont  = (id) => { applyFont(id);  updateFontActive(); };
}

export function toggleThemePanel() {
  const overlay = document.getElementById('theme-overlay');
  if (!overlay) { buildThemePanel(); document.getElementById('theme-overlay').classList.add('open'); }
  else overlay.classList.toggle('open');
}

function closeThemePanel() {
  const overlay = document.getElementById('theme-overlay');
  if (overlay) overlay.classList.remove('open');
}
