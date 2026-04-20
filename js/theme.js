// ── WorkDesk Theme System ─────────────────────────────────────────────────

export const THEMES = [
  { id:'',           name:'Standard',      sub:'Dark · Ambient Neon',       dot:'#00d2a8', bg:'#0c0c0f' },
  { id:'frosted',    name:'Frosted Glass', sub:'Heavy blur · Translucent',  dot:'#a78bfa', bg:'#0f0720' },
  { id:'bigsur',     name:'iOS Fans',      sub:'macOS · Warm Coral Glass',  dot:'#5ac8fa', bg:'#1a0a0a' },
  { id:'ios-system', name:'Dark',          sub:'iOS System · Clean',        dot:'#0a84ff', bg:'#1c1c1e' },
  { id:'health',     name:'Light',         sub:'iOS Health · Pastel White', dot:'#007aff', bg:'#f2f2f7' },
  { id:'neon',       name:'Neon',          sub:'Retro Neon · Modern Dark',  dot:'#00f5d4', bg:'#070b12' },
];

// Default to ios if no saved theme, or if saved theme no longer exists
function getValidTheme() {
  const saved = localStorage.getItem('wd_theme');
  // 'ios' was the old default — migrate to Standard ('')
  if (!saved || saved === 'ios') {
    localStorage.setItem('wd_theme', ''); // persist migration immediately
    return '';
  }
  return THEMES.find(t => t.id === saved) ? saved : '';
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

  window.__applyTheme = (id) => { applyTheme(id); };
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
