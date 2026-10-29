// ── WorkDesk shared UI ────────────────────────────────────────────────────
// Glyphs, rings, icons, bottom sheets and the profile ("You") sheet. Pure
// presentation: nothing in here knows about Firestore or tasks, so every page
// can use it. Styles live in css/ui.css; colours and shapes in css/themes.css.

import { appearanceControlHTML } from './theme.js';

// ── tiny helpers ──────────────────────────────────────────────────────────
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const initials = name => String(name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

// ── icons (24px grid, 1.6 stroke — same family as the bottom nav) ─────────
const S = (inner, extra = '') => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ${extra}>${inner}</svg>`;
// A small filled star in front of a strategic task's title. Shape, not colour: it takes the text colour,
// so it needs no new accent in either theme.
export const STAR_MARK = '<svg class="wd-star" width="14" height="14" viewBox="0 0 24 24" role="img" aria-label="Strategic"><path fill="currentColor" d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.8l-5.3 2.9 1.1-6L3.4 9.5l6-.8z"/></svg>';
export const starOf = t => (t && t.strategic === true ? STAR_MARK : '');

export const ICON = {
  home:     S('<path d="M3.5 11 12 4l8.5 7M5.5 9.5V20h13V9.5"/>'),
  add:      S('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M12 8v8M8 12h8"/>'),
  calendar: S('<rect x="3.5" y="5" width="17" height="15.5" rx="4"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  repeat:   S('<path d="M4.5 11.5V10a3 3 0 0 1 3-3h10.5M15 4l3 3-3 3M19.5 12.5V14a3 3 0 0 1-3 3H6M9 20l-3-3 3-3"/>'),
  projects: S('<path d="M3.5 8.5a2.5 2.5 0 0 1 2.5-2.5h3.6l2 2.2H18a2.5 2.5 0 0 1 2.5 2.5V17a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 17z"/>'),
  report:   S('<path d="M5.5 20V12M12 20V4.5M18.5 20v-6.5"/>'),
  search:   S('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'),
  close:    S('<path d="M6 6l12 12M18 6L6 18"/>'),
  check:    S('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 'stroke-width="2.2"'),
  chevron:  S('<path d="M9 6l6 6-6 6"/>'),
  sound:    S('<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  bell:     S('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15zM10 20.5h4"/>'),
  timer:    S('<circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.8l2.4 1.4M9.5 3.5h5"/>'),
  notes:    S('<path d="M6 3.5h9l3.5 3.5v13.5H6z"/><path d="M14.5 3.5V7.5h4M9 12h6M9 15.5h6"/>'),
  idea:     S('<path d="M9 17.5h6M10 20.5h4M12 3.5a6 6 0 0 0-3.4 10.9c.6.5.9 1.1.9 1.6v.5h5v-.5c0-.5.3-1.1.9-1.6A6 6 0 0 0 12 3.5z"/>'),
  help:     S('<circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.6a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.1.9-1.1 1.7M12 16.8v.1"/>'),
  backup:   S('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>'),
  announce: S('<path d="M4 10v4h3l6.5 4V6L7 10zM17 9.5a3.5 3.5 0 0 1 0 5"/>'),
  fire:     S('<path d="M12 3.5c.4 3-2.8 4.4-2.8 8a2.8 2.8 0 0 0 5.6 0c0-1-.4-1.8-.4-2.7 2.2 1.4 3.6 3.4 3.6 6A6 6 0 0 1 12 20.5a6 6 0 0 1-6-6c0-3.6 2.6-5.4 4-7.6.6-1 1.5-2.2 2-3.4z"/>'),
  bin:      S('<path d="M5 7h14M9.5 7V4.5h5V7M7 7l.8 12.5h8.4L17 7"/>'),
  edit:     S('<path d="M4.5 19.5l1-4L16.5 4.5l3 3L8.5 18.5z"/>'),
  bellz:    S('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15zM10 20.5h4"/>'),
  share:    S('<path d="M12 15V4M8 7.5l4-4 4 4M5 12v7.5h14V12"/>'),
  copy:     S('<rect x="8.5" y="8.5" width="11" height="11" rx="3"/><path d="M15.5 8.5V6.5a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h2"/>'),
  print:    S('<path d="M7 9V3.5h10V9M7 17H4.5v-7a1.5 1.5 0 0 1 1.5-1.5h12a1.5 1.5 0 0 1 1.5 1.5v7H17M7 14h10v6.5H7z"/>'),
  star:     S('<path d="M12 4l2.4 5 5.4.7-4 3.8 1 5.4L12 16.3 7.2 18.9l1-5.4-4-3.8 5.4-.7z"/>'),
};

// ── status glyphs: shape is status ────────────────────────────────────────
//  todo = empty ring · inprog = half-filled · onhold = dashed ring · done = disc + tick
const GLYPH = {
  todo:   '<circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.75"/>',
  inprog: '<circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="M10 5.25A4.75 4.75 0 0 1 10 14.75Z" fill="currentColor"/>',
  onhold: '<circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.75" stroke-dasharray="3.4 2.88" stroke-dashoffset="1.7"/>',
  done:   '<circle cx="10" cy="10" r="9" fill="currentColor"/><path d="M6.1 10.3l2.6 2.6 5.2-5.5" fill="none" stroke="var(--chk)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
};
export const STATUS_LABEL = { todo: 'To do', inprog: 'In progress', onhold: 'On hold', done: 'Done' };
export function glyphSVG(status, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" aria-hidden="true">${GLYPH[status] || GLYPH.todo}</svg>`;
}

// ── progress ring (pct 0–100) ─────────────────────────────────────────────
export function ringHTML(pct, size = 46, stroke = 4, label = '') {
  const r = (size - stroke) / 2, L = 2 * Math.PI * r, c = size / 2;
  const p = Math.max(0, Math.min(100, pct || 0));
  return `<div class="wd-ring" style="width:${size}px;height:${size}px" role="img" aria-label="${Math.round(p)} percent">
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle class="trk" cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${stroke}"/>
      ${p > 0 ? `<circle class="fg" cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${(L * p / 100).toFixed(2)} ${L.toFixed(2)}"/>` : ''}
    </svg><b>${esc(label)}</b></div>`;
}

// ── bottom sheets ─────────────────────────────────────────────────────────
// One scrim host per sheet id. The sheet's content is replaced on every open.
const openStack = [];
// names for sheets that have no visible title of their own
const SHEET_NAMES = {
  'wd-profile': 'Profile and settings', 'task-sheet': 'Task', 'add-sheet': 'Task', 'cal-day': 'Day',
  'prj-form': 'Project', 'prj-grp': 'Project group', 'prj-org': 'Organise projects',
  'rpt-share': 'Share report', 'bk-confirm': 'Restore backup', 'idea-form': 'Idea', 'idea-del': 'Delete idea',
};
export function openSheet(id, html, { onClose } = {}) {
  let scrim = document.getElementById(id);
  if (!scrim) {
    scrim = document.createElement('div');
    scrim.className = 'wd-scrim';
    scrim.id = id;
    scrim.innerHTML = '<div class="wd-sheet" role="dialog" aria-modal="true"></div>';
    scrim.addEventListener('click', e => { if (e.target === scrim) closeSheet(id); });
    document.body.appendChild(scrim);
  }
  scrim._onClose = onClose || null;
  const sheet = scrim.querySelector('.wd-sheet');
  sheet.innerHTML = '<div class="wd-grab"></div>' + html;
  sheet.scrollTop = 0;
  // the dialog is named by its title, and keyboard focus moves into it
  const title = sheet.querySelector('.wd-sheet-title');
  if (title) { title.id = title.id || id + '-title'; sheet.setAttribute('aria-labelledby', title.id); sheet.removeAttribute('aria-label'); }
  else sheet.setAttribute('aria-label', SHEET_NAMES[id] || 'Dialog');
  sheet.tabIndex = -1;
  if (!scrim.classList.contains('open')) scrim._opener = document.activeElement;
  // two frames so the transition runs from the closed state
  requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('open'); sheet.focus({ preventScroll: true }); }));
  if (!openStack.includes(id)) openStack.push(id);
  return sheet;
}
export function closeSheet(id) {
  const scrim = document.getElementById(id);
  if (!scrim) return;
  scrim.classList.remove('open');
  const i = openStack.indexOf(id); if (i >= 0) openStack.splice(i, 1);
  const cb = scrim._onClose; scrim._onClose = null;
  const back = scrim._opener; scrim._opener = null;
  if (back && back.isConnected && back.focus) back.focus({ preventScroll: true });
  if (cb) cb();
}
export function sheetBody(id) { return document.querySelector('#' + id + ' .wd-sheet'); }
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
document.addEventListener('keydown', e => {
  if (!openStack.length) return;
  if (e.key === 'Escape') { closeSheet(openStack[openStack.length - 1]); return; }
  if (e.key !== 'Tab') return;
  // keep Tab inside the open sheet
  const sheet = sheetBody(openStack[openStack.length - 1]);
  if (!sheet) return;
  const f = [...sheet.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
  if (!f.length) { e.preventDefault(); sheet.focus(); return; }
  const first = f[0], last = f[f.length - 1], a = document.activeElement;
  if (!sheet.contains(a)) { e.preventDefault(); first.focus(); }
  else if (e.shiftKey && (a === first || a === sheet)) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
});

// ── undo toast ────────────────────────────────────────────────────────────
let undoTimer = null;
export function showUndo(message, onUndo, ms = 5000) {
  let el = document.getElementById('wd-undo');
  if (!el) {
    el = document.createElement('div');
    el.id = 'wd-undo'; el.className = 'wd-undo'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.classList.remove('plain');
  el.innerHTML = `<span>${esc(message)}</span><button type="button">Undo</button>`;
  el.querySelector('button').onclick = () => { hideUndo(); onUndo && onUndo(); };
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(undoTimer);
  undoTimer = setTimeout(hideUndo, ms);
}
// the same toast without the Undo button: a short confirmation or a failure note
export function showNote(message, ms = 2800) {
  let el = document.getElementById('wd-undo');
  if (!el) {
    el = document.createElement('div');
    el.id = 'wd-undo'; el.className = 'wd-undo'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.classList.add('plain');
  el.innerHTML = `<span>${esc(message)}</span>`;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(undoTimer);
  undoTimer = setTimeout(hideUndo, ms);
}
export function hideUndo() {
  clearTimeout(undoTimer);
  const el = document.getElementById('wd-undo');
  if (el) el.classList.remove('show');
}

// ── profile ("You") sheet ─────────────────────────────────────────────────
// rows: [{ icon, label, value?, badge?, tag?, href?, action?, toggle? }]
//   action  → name of a window function to call on tap
//   toggle  → { on:boolean, action:'windowFnName' } renders a switch
export function profileSheetHTML({ name, line, rows = [] }) {
  const row = r => {
    const inner = `${ICON[r.icon] || ''}<span>${esc(r.label)}</span>${r.tag ? `<span class="wd-tag">${esc(r.tag)}</span>` : ''}` +
      (r.toggle ? `<span class="wd-sw${r.toggle.on ? ' on' : ''}" role="switch" aria-checked="${!!r.toggle.on}"></span>`
        : r.badge != null ? `<span class="wd-badge">${esc(r.badge)}</span>`
        : r.value ? `<span class="v">${esc(r.value)}</span>` : '');
    if (r.href) return `<a class="wd-mrow" href="${esc(r.href)}">${inner}</a>`;
    return `<button type="button" class="wd-mrow" data-row="${esc(r.id || r.label)}" onclick="${esc((r.toggle ? r.toggle.action : r.action) || '')}()">${inner}</button>`;
  };
  return `
    <div class="wd-ppl" style="border:0;padding-top:2px">
      <div class="wd-av lg in-sheet">${esc(initials(name))}</div>
      <div class="who"><b style="font-size:19px">${esc(name || 'You')}</b><span class="r">${esc(line || '')}</span></div>
    </div>
    <div class="wd-lab">Appearance</div>
    ${appearanceControlHTML()}
    <div style="height:8px"></div>
    ${rows.map(row).join('')}`;
}
export function openProfileSheet(opts) { return openSheet('wd-profile', profileSheetHTML(opts)); }

// ── dates, labels, project colour (shared by every page that lists tasks) ──
const WD_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const PRIO_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
export const PRIO_LABEL = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };

// Local calendar date as YYYY-MM-DD (toISOString is UTC and is a day off for
// anyone east or west of Greenwich in the early/late hours).
export function localDateStr(d = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
export function dateFromStr(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
// whole days from today to a YYYY-MM-DD string (negative = in the past)
export function dayDiff(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const now = new Date();
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
}
// "2 days late" · Today · Tomorrow · "Mon 26" (this week) · "26 Oct"
export function dueLabel(dateStr) {
  const diff = dayDiff(dateStr);
  if (diff == null) return '';
  if (diff < 0) return (-diff) + (diff === -1 ? ' day late' : ' days late');
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  const d = dateFromStr(dateStr);
  if (diff <= 6) return WD_NAMES[d.getDay()] + ' ' + d.getDate();
  return d.getDate() + ' ' + MON_NAMES[d.getMonth()];
}
export function shortDate(dateStr) { const d = dateFromStr(dateStr); return WD_NAMES[d.getDay()] + ' ' + d.getDate() + ' ' + MON_NAMES[d.getMonth()]; }
export function longDate(dateStr) { const d = dateFromStr(dateStr); return WD_NAMES[d.getDay()] + ' ' + d.getDate() + ' ' + MON_NAMES[d.getMonth()] + ' ' + d.getFullYear(); }
export function dayMonth(dateStr) { const d = dateFromStr(dateStr); return d.getDate() + ' ' + MON_NAMES[d.getMonth()]; }

// stable pick from the four project hues (used for glyphs and dots only)
export function projHue(name) {
  if (!name) return 'var(--text2)';
  let h = 0; for (const c of String(name).toLowerCase()) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ['var(--hue-blue)', 'var(--hue-amber)', 'var(--hue-fern)', 'var(--hue-violet)'][Math.abs(h) % 4];
}
// urgency class for a row: done / hold / late / today / later
export function urgencyClass(status, dueDate) {
  if (status === 'done') return 'u-done';
  if (status === 'onhold') return 'u-hold';
  const diff = dayDiff(dueDate);
  if (diff != null && diff < 0) return 'u-late';
  if (diff === 0) return 'u-today';
  return 'u-later';
}
export function othersText(t, viewerName) {
  const v = String(viewerName || '').trim().toLowerCase();
  const others = (t.members || []).map(m => m.name).filter(n => n && String(n).trim().toLowerCase() !== v);
  if (!others.length) return '';
  return 'with ' + (others.length <= 2 ? others.join(' and ') : others[0] + ' and ' + (others.length - 1) + ' others');
}

/* ── Sideways rows ───────────────────────────────────────────────────────────
   A row of chips or tabs that scrolls sideways gets a soft fade on the edge that
   has more, so a cut-off "Performan" reads as "scroll me". Classes fade-l / fade-r
   are toggled here; the mask itself lives in ui.css. */
const FADE_SEL = '.wd-filter-chips, .rpt-tabs';
function updateFade(el) {
  const max = el.scrollWidth - el.clientWidth;
  el.classList.toggle('fade-r', max > 2 && el.scrollLeft < max - 2);
  el.classList.toggle('fade-l', max > 2 && el.scrollLeft > 2);
}
if (typeof document !== 'undefined') {
  let pending = false;
  const scan = () => { pending = false; document.querySelectorAll(FADE_SEL).forEach(updateFade); };
  const soon = () => { if (!pending) { pending = true; requestAnimationFrame(scan); } };
  document.addEventListener('scroll', e => { if (e.target.matches && e.target.matches(FADE_SEL)) updateFade(e.target); }, true);
  addEventListener('resize', soon);
  addEventListener('load', soon);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
  new MutationObserver(soon).observe(document.documentElement, { childList: true, subtree: true });
  soon();
}
