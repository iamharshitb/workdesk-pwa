// ── WorkDesk Theme System ─────────────────────────────────────────────────

export const THEMES = [
  { id:'ios',        name:'iOS Glass',       sub:'Frosted · Liquid Glass',   dot:'#0a84ff', bg:'#1c1c1e' },
  { id:'bigsur',     name:'Big Sur',         sub:'macOS · Warm Coral Glass', dot:'#5ac8fa', bg:'#1a0a0a' },
  { id:'ios-system', name:'iOS System Dark', sub:'Control Centre · Clean',   dot:'#0a84ff', bg:'#1c1c1e' },
  { id:'health',     name:'iOS Health',      sub:'Pastel · Airy · White',    dot:'#007aff', bg:'#f2f2f7' },
];

// Default to ios if no saved theme, or if saved theme no longer exists
function getValidTheme() {
  const saved = localStorage.getItem('wd_theme') || 'ios';
  return THEMES.find(t => t.id === saved) ? saved : 'ios';
}

let currentTheme = getValidTheme();

export function applyTheme(themeId) {
  THEMES.forEach(t => document.body.classList.remove('theme-' + t.id));
  document.body.classList.add('theme-' + themeId);
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
