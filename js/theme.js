// ── WorkDesk Theme System ─────────────────────────────────────────────────
// Handles all 7 themes × 5 font combos. Persists to localStorage.

export const THEMES = [
  { id:'neon',      name:'Neon Dark',     sub:'Teal on Black',         dot:'#00e5b8', bg:'#07090f' },
  { id:'midnight',  name:'Midnight Blue', sub:'Navy + Electric Blue',  dot:'#4d9fff', bg:'#060c1a' },
  { id:'synthwave', name:'Synthwave',     sub:'Purple + Pink',         dot:'#ff4fa3', bg:'#0a0614' },
  { id:'forest',    name:'Forest',        sub:'Dark Green + Lime',     dot:'#39d353', bg:'#040c08' },
  { id:'slate',     name:'Slate',         sub:'Cool Grays + White',    dot:'#94a3b8', bg:'#0f1117' },
  { id:'warm',      name:'Warm Dark',     sub:'Brown + Amber + Gold',  dot:'#f5a800', bg:'#0f0a06' },
  { id:'arctic',    name:'Arctic',        sub:'White + Ice Blue',      dot:'#0077cc', bg:'#f0f6ff' },
  { id:'retro',     name:'Retro',         sub:'Black & White · CRT',   dot:'#ffffff', bg:'#0a0a0a' },
  { id:'ios',       name:'iOS Glass',     sub:'Frosted · Liquid Glass',dot:'#0a84ff', bg:'#1c1c1e' },
  { id:'pixel',     name:'Material Pixel',sub:'Google M3 · Bold',      dot:'#c8b6ff', bg:'#1a1c2e' },
  { id:'ios-light', name:'iOS Glass Light',sub:'Frosted · Luminous White',dot:'#007aff', bg:'#f2f2f7' },
];

export const FONTS = [
  { id:'spartan', name:'League Spartan',  sub:'+ IBM Plex Mono' },
  { id:'grotesk', name:'Space Grotesk',   sub:'+ JetBrains Mono' },
  { id:'syne',    name:'Syne',            sub:'+ Share Tech Mono' },
  { id:'bebas',   name:'Bebas Style',     sub:'+ Share Tech Mono' },
  { id:'outfit',  name:'Outfit',          sub:'+ Fira Code' },
];

let currentTheme = localStorage.getItem('wd_theme') || 'neon';
let currentFont  = localStorage.getItem('wd_font')  || 'spartan';

export function applyTheme(themeId) {
  THEMES.forEach(t => document.body.classList.remove('theme-'+t.id));
  document.body.classList.add('theme-'+themeId);
  currentTheme = themeId;
  localStorage.setItem('wd_theme', themeId);
  updateSwatchActive();
}

export function applyFont(fontId) {
  FONTS.forEach(f => document.body.classList.remove('font-'+f.id));
  document.body.classList.add('font-'+fontId);
  currentFont = fontId;
  localStorage.setItem('wd_font', fontId);
  updateFontActive();
}

export function initTheme() {
  applyTheme(currentTheme);
  applyFont(currentFont);
}

function updateSwatchActive() {
  document.querySelectorAll('.swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.theme === currentTheme);
  });
}

function updateFontActive() {
  document.querySelectorAll('.font-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.font === currentFont);
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
    <div class="tp-title">🎨 Appearance</div>

    <div class="tp-section">
      <div class="tp-title" style="margin-bottom:7px">Theme</div>
      <div class="theme-swatches">
        ${THEMES.map(t=>`
          <div class="swatch${t.id===currentTheme?' active':''}" data-theme="${t.id}"
            onclick="window.__applyTheme('${t.id}')">
            <div class="swatch-dot" style="background:${t.dot};border-color:${t.bg}"></div>
            <div>
              <div class="swatch-name">${t.name}</div>
              <div class="swatch-sub">${t.sub}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div class="tp-section" style="margin-bottom:0">
      <div class="tp-title" style="margin-bottom:7px">Font</div>
      <div class="font-pills">
        ${FONTS.map(f=>`
          <div class="font-pill${f.id===currentFont?' active':''}" data-font="${f.id}"
            onclick="window.__applyFont('${f.id}')">
            ${f.name}
          </div>`).join('')}
      </div>
    </div>
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
