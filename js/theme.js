// ── WorkDesk Theme System ─────────────────────────────────────────────────

export const THEMES = [
  { id:'editorial',  name:'Editorial',     sub:'Inter · Clean · Minimal',   dot:'#16171A', bg:'#F3F3F5' },
  { id:'neu',        name:'Neumorphism',   sub:'Soft UI · Sculpted light',  dot:'#2d56d8', bg:'#e0e5ec' },
  { id:'glass',      name:'Glassmorphism', sub:'Aurora · Deep frost',       dot:'#22d3ee', bg:'#0b1023' },
  { id:'skeu',       name:'Skeuomorphism', sub:'Leather · Paper · Tactile', dot:'#8b4a2b', bg:'#e8dcc2' },
];

// Default to Neumorphism if no saved theme, or if saved theme no longer exists
function getValidTheme() {
  const saved = localStorage.getItem('wd_theme');
  // 'ios' was the old default — migrate to current default (Neumorphism)
  if (!saved || saved === 'ios') {
    localStorage.setItem('wd_theme', 'neu');
    return 'neu';
  }
  return THEMES.find(t => t.id === saved) ? saved : 'neu';
}

let currentTheme = getValidTheme();

export function applyTheme(themeId) {
  // Remove all theme classes
  THEMES.forEach(t => document.body.classList.remove('theme-' + t.id));
  // Also remove the empty 'theme-' class from previous sessions
  document.body.classList.remove('theme-');
  if (themeId) {
    document.body.classList.add('theme-' + themeId);
  }
  currentTheme = themeId;
  localStorage.setItem('wd_theme', themeId);
  updateSwatchActive();
  syncStatusBarColor(themeId);
}

// The <meta name="theme-color"> tag colours the OS status bar / task-switcher
// header. It was previously a static dark value in the HTML, which looked
// fine for the old dark-default themes but clashes badly now that
// Neumorphism (light clay) is the default. Each theme already carries a `bg`
// value for its picker swatch — reuse that instead of hardcoding a second
// copy of every theme's background colour here.
function syncStatusBarColor(themeId) {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return;
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = theme.bg;
}

export function initTheme() {
  applyTheme(currentTheme);
}

function updateSwatchActive() {
  document.querySelectorAll('.swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.theme === currentTheme);
  });
}

function buildThemePanel() {
  const overlay = document.createElement('div');
  overlay.className = 'theme-panel-overlay';
  overlay.id = 'theme-overlay';
  overlay.onclick = e => { if (e.target === overlay) closeThemePanel(); };

  const panel = document.createElement('div');
  panel.className = 'theme-panel';
  panel.innerHTML = `
    <div class="tp-title">🎨 Theme</div>
    <div class="theme-swatches">
      ${THEMES.map(t => `
        <div class="swatch${t.id === currentTheme ? ' active' : ''}" data-theme="${t.id}"
          onclick="window.__applyTheme('${t.id}')">
          <div class="swatch-dot" style="background:${t.dot};border-color:${t.bg}"></div>
          <div>
            <div class="swatch-name">${t.name}</div>
            <div class="swatch-sub">${t.sub}</div>
          </div>
        </div>`).join('')}
    </div>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  window.__applyTheme = (id) => { if (navigator.vibrate) navigator.vibrate(8); applyTheme(id); };
}

export function toggleThemePanel() {
  let overlay = document.getElementById('theme-overlay');
  if (!overlay) {
    buildThemePanel();
    overlay = document.getElementById('theme-overlay');
  }
  overlay.classList.toggle('open');
}

function closeThemePanel() {
  const overlay = document.getElementById('theme-overlay');
  if (overlay) overlay.classList.remove('open');
}
