// ── WorkDesk "Create slide" ───────────────────────────────────────────────
// Turns a period's finished work into one management slide: the projects you
// rank get boxes sized by importance, with their finished tasks written inside.
// Pure browser code: the ranking sheet, a live preview, and an editable
// PowerPoint file built with PptxGenJS (loaded only when you press Download).
//
// Ranking is per report, never stored on the project: next month you rank again.

import { esc, openSheet, closeSheet, showNote } from './ui.js';
import { isRoutine } from './routines.js';

const PPTX_URL = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MAX_RANKED = 4;
const SHEET = 'slide-sheet';

// ── look ───────────────────────────────────────────────────────────────────
// Rank decides the colour inside a scheme: box 1 is the deep anchor, 2 the bright
// one, 3 the mid tone, 4 the soft one, and "Other work" is always the quiet neutral.
// Every text/background pair in every scheme passes 5.18:1 (checked by script when
// they were chosen). A new download moves on to the next scheme, so the same one
// only comes back after six others. Add schemes at the END so the order of the
// existing ones (and where each person is in the rotation) never shifts.
export const SCHEMES = [
  { name: 'Indigo', colors: [
    { bg: '#1F3A93', fg: '#FFFFFF' }, { bg: '#F4C95D', fg: '#2B2100' }, { bg: '#1F7A6B', fg: '#FFFFFF' },
    { bg: '#F2B8D2', fg: '#3A1228' }, { bg: '#DDE3EC', fg: '#1F2B47' }] },
  { name: 'Forest', colors: [
    { bg: '#1E5B45', fg: '#FFFFFF' }, { bg: '#F2A65A', fg: '#2E1800' }, { bg: '#2F6E9E', fg: '#FFFFFF' },
    { bg: '#CDE7C9', fg: '#173018' }, { bg: '#E3E8E0', fg: '#2A3328' }] },
  { name: 'Plum', colors: [
    { bg: '#5B2A86', fg: '#FFFFFF' }, { bg: '#FFB4A2', fg: '#3D1208' }, { bg: '#0F6E7A', fg: '#FFFFFF' },
    { bg: '#E6D5F5', fg: '#34154F' }, { bg: '#E8E5EE', fg: '#2D2740' }] },
  { name: 'Petrol', colors: [
    { bg: '#0E4F5C', fg: '#FFFFFF' }, { bg: '#F4A6A0', fg: '#3A0F0C' }, { bg: '#6B4FA0', fg: '#FFFFFF' },
    { bg: '#BFE3E0', fg: '#0E3B3B' }, { bg: '#E2EAEC', fg: '#1F3A40' }] },
  { name: 'Berry', colors: [
    { bg: '#8E2A5C', fg: '#FFFFFF' }, { bg: '#F6D365', fg: '#2B2100' }, { bg: '#2C6E91', fg: '#FFFFFF' },
    { bg: '#D8E8B0', fg: '#26330E' }, { bg: '#EDE4E8', fg: '#3A2430' }] },
  { name: 'Graphite', colors: [
    { bg: '#2E3A4E', fg: '#FFFFFF' }, { bg: '#FF9F68', fg: '#2E1300' }, { bg: '#2D786C', fg: '#FFFFFF' },
    { bg: '#F6E3A1', fg: '#332800' }, { bg: '#E3E6EB', fg: '#262E3D' }] },
  { name: 'Earth', colors: [
    { bg: '#4F5F26', fg: '#FFFFFF' }, { bg: '#F2D08C', fg: '#33260A' }, { bg: '#8A4B2F', fg: '#FFFFFF' },
    { bg: '#D9E4C4', fg: '#27331A' }, { bg: '#EAE6DA', fg: '#37321F' }] },
];
export const PALETTE = SCHEMES[0].colors;
const SCHEME_KEY = 'wd_slide_scheme', AUTO_KEY = 'wd_slide_auto';      // this device only
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode: rotation just restarts */ } };
const loadScheme = () => { const n = parseInt(lsGet(SCHEME_KEY), 10); return n >= 0 && n < SCHEMES.length ? n : 0; };
const loadAuto = () => lsGet(AUTO_KEY) !== '0';

const INK = '#14213D', PENCIL = '#4A5878', PAPER = '#F3F5F9';
const FONT = 'Calibri';                 // what PowerPoint opens with
const MEASURE_FONT = 'Arial';           // wider than Calibri, so text that fits here fits there
const SLIDE_W = 1280, SLIDE_H = 720;    // px; 96 px = 1 inch, so 13.33 x 7.5 in
const STRIP = { x: 40, y: 126, w: 1200, h: 30, r: 12, gap: 3 };   // the effort split under the title
const AREA = { x: 40, y: 170, w: 1200, h: 500 };
const LH = 1.3;                         // line height used when fitting (generous)
const MIN_TS = 13;                      // smallest task text, px (about 10 pt)

// boxes in rank order, then "Other work"; sizes in px inside AREA
const LAYOUTS = {
  '4o': [r(0, 0, 594, 500, 42, 24), r(606, 0, 594, 244, 31, 19), r(606, 256, 291, 244, 26, 16), r(909, 256, 291, 151, 22, 15), r(909, 419, 291, 81, 17, 14)],
  '4':  [r(0, 0, 594, 500, 42, 24), r(606, 0, 594, 244, 31, 19), r(606, 256, 291, 244, 26, 16), r(909, 256, 291, 244, 26, 16)],
  '3o': [r(0, 0, 594, 500, 42, 24), r(606, 0, 594, 244, 31, 19), r(606, 256, 366, 244, 26, 17), r(984, 256, 216, 244, 20, 14)],
  '3':  [r(0, 0, 594, 500, 42, 24), r(606, 0, 594, 244, 31, 19), r(606, 256, 594, 244, 31, 19)],
  '2o': [r(0, 0, 594, 500, 42, 24), r(606, 0, 594, 333, 34, 20), r(606, 345, 594, 155, 22, 15)],
  '2':  [r(0, 0, 594, 500, 42, 24), r(606, 0, 594, 500, 42, 24)],
  '1o': [r(0, 0, 1200, 345, 46, 26), r(0, 357, 1200, 143, 22, 16)],
  '1':  [r(0, 0, 1200, 500, 46, 26)],
};
function r(x, y, w, h, hs, ts) { return { x, y, w, h, hs, ts }; }
const padFor = b => Math.round(Math.min(36, Math.max(18, Math.min(b.w, b.h) * 0.075)));

// ── data ───────────────────────────────────────────────────────────────────
const toDate = c => { if (!c) return null; const d = typeof c.toDate === 'function' ? c.toDate() : new Date(c); return isNaN(d.getTime()) ? null : d; };
// the day a task was finished; tasks that never got a timestamp fall back to the middle of their month
function doneDate(t) {
  const d = toDate(t.completedAt);
  if (d) return d;
  return t.month ? new Date(t.month + '-15T12:00:00') : null;
}
const isTeamTask = t => (t.taskType || 'mbc') === 'mbc' && !isRoutine(t);
const pad2 = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const dayMonth = s => { const [y, m, d] = s.split('-'); return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1].slice(0, 3)}`; };

export function periodRange(p) {
  if (p.kind === 'quarter') {
    const m0 = (p.quarter - 1) * 3;
    return { from: new Date(p.year, m0, 1), to: new Date(p.year, m0 + 3, 0, 23, 59, 59), label: `Q${p.quarter} ${p.year}`, file: `Q${p.quarter}-${p.year}` };
  }
  if (p.kind === 'custom') {
    const from = new Date((p.from || ymd(new Date())) + 'T00:00:00'), to = new Date((p.to || p.from || ymd(new Date())) + 'T23:59:59');
    const fy = from.getFullYear(), ty = to.getFullYear();
    return { from, to, label: `${dayMonth(ymd(from))}${fy !== ty ? ' ' + fy : ''} to ${dayMonth(ymd(to))} ${ty}`, file: `${ymd(from)}-to-${ymd(to)}` };
  }
  const [y, m] = p.month.split('-').map(Number);
  return { from: new Date(y, m - 1, 1), to: new Date(y, m, 0, 23, 59, 59), label: `${MONTHS[m - 1]} ${y}`, file: `${MONTHS[m - 1]}-${y}` };
}

// finished work in the period, grouped by project (most tasks first)
export function projectRows(tasks, period) {
  const { from, to } = periodRange(period);
  const by = new Map();
  for (const t of tasks) {
    if (!isTeamTask(t) || t.status !== 'done') continue;
    const d = doneDate(t); if (!d || d < from || d > to) continue;
    const name = t.project || 'No project';
    if (!by.has(name)) by.set(name, []);
    by.get(name).push(t);
  }
  return [...by.entries()].map(([name, list]) => ({ name, tasks: list.sort((a, b) => doneDate(a) - doneDate(b)) }))
    .sort((a, b) => b.tasks.length - a.tasks.length || a.name.localeCompare(b.name));
}

// up to two tasks of a project that are still open: in progress first, then planned
function openTasksOf(tasks, name, period) {
  const { to } = periodRange(period);
  const rank = t => (t.status === 'inprog' ? 0 : 1);
  return tasks.filter(t => isTeamTask(t) && (t.project || 'No project') === name && (t.status === 'inprog' || (t.status || 'todo') === 'todo')
      && (!toDate(t.createdAt) || toDate(t.createdAt) <= to))
    .sort((a, b) => (rank(a) - rank(b)) || String(a.taskDueDate || '9999').localeCompare(String(b.taskDueDate || '9999')))
    .slice(0, 2);
}

// ── measuring and fitting text ─────────────────────────────────────────────
let _ctx;
function width(text, px, bold) {
  _ctx ||= document.createElement('canvas').getContext('2d');
  _ctx.font = `${bold ? '700' : '400'} ${px}px ${MEASURE_FONT}`;
  return _ctx.measureText(text).width;
}
function lines(text, px, maxW, bold) {
  const words = String(text).split(/\s+/); let n = 1, cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (width(next, px, bold) <= maxW || !cur) cur = next; else { n++; cur = w; }
  }
  return n;
}
// "6 tasks finished · 16% of the team's effort" (the share counts finished tasks)
const fmtPct = p => (p < 1 ? '<1%' : p + '%');
const subText = b => `${b.n} ${b.n === 1 ? 'task' : 'tasks'} finished · ${fmtPct(b.pct)} of the team's effort`;
// whole percentages that add up to exactly 100 (largest remainder), so the strip never reads 99 or 101
function shares(ns) {
  const tot = ns.reduce((a, b) => a + b, 0);
  if (!tot) return ns.map(() => 0);
  const raw = ns.map(n => n * 100 / tot), fl = raw.map(Math.floor);
  const left = 100 - fl.reduce((a, b) => a + b, 0);
  raw.map((v, i) => [v - fl[i], i]).sort((a, b) => b[0] - a[0]).slice(0, left).forEach(([, i]) => fl[i]++);
  return fl;
}

// text height of a box for a given task size; tasks = [{text, open}]
function contentHeight(b, ts, done, open, extra) {
  const pad = padFor(b), inner = b.w - pad * 2, ind = ts + 8;
  const hs = b.hs;
  let h = pad * 2 + lines(b.name, hs, inner, true) * hs * 1.15;
  if (!b.other) { const sp = Math.max(12, ts - 2); h += 6 + lines(subText(b), sp, inner, true) * sp * 1.2; }   // "N tasks finished · P% ..." may wrap
  const gap = Math.max(5, Math.round(ts / 3));
  h += Math.max(8, Math.round(ts / 2));
  for (const t of done) h += gap + lines(t, ts, inner - ind, false) * ts * LH;
  if (extra) h += gap + ts * LH;
  if (open.length) {
    h += Math.round(ts * 0.9) + (ts - 2) * 1.3;                            // "Still in progress"
    for (const t of open) h += gap + lines(t, ts, inner - ind, false) * ts * LH;
  }
  return h;
}
function fitBox(b, doneTexts, openTexts) {
  let ts = b.ts, done = doneTexts, extra = 0;
  const fits = (s, d, e) => contentHeight(b, s, d, openTexts, e) <= b.h;
  while (ts > MIN_TS && !fits(ts, done, extra)) ts -= 1;
  while (done.length > 1 && !fits(ts, done, extra)) { done = done.slice(0, -1); extra = doneTexts.length - done.length; }
  return { ts, done, more: extra, lastFits: fits(ts, done, extra) };
}

// ── the slide model (shared by the preview and the PowerPoint file) ───────
// The title runs on one line; shrink it until it fits (measured in Arial, wider than Calibri)
function fitTitle(text) {
  let fs = 46;
  while (fs > 32 && width(text, fs, true) > 1030) fs -= 1;
  return fs;
}
// the effort strip: one segment per box, widths in proportion to finished tasks
function buildStrip(items) {
  const k = items.length, tot = items.reduce((a, b) => a + b.n, 0) || 1;
  const usable = STRIP.w - STRIP.gap * (k - 1);
  let x = 0;
  return items.map((it, i) => {
    const w = Math.max(6, Math.round(usable * it.n / tot * 10) / 10);
    const seg = { x, w, bg: it.bg, fg: it.fg, label: fmtPct(it.pct), first: i === 0, last: i === k - 1 };
    if (width(seg.label, 15, true) + 14 > w) seg.label = '';          // too narrow to print the number
    x += w + STRIP.gap;
    return seg;
  });
}

export function buildModel(tasks, state) {
  const period = periodRange(state);
  const rows = projectRows(tasks, state);
  const ranked = state.ranked.map(n => rows.find(x => x.name === n)).filter(Boolean).slice(0, MAX_RANKED);
  const rest = rows.filter(x => !ranked.includes(x));
  const hasOther = state.group && rest.length > 0;
  const layout = LAYOUTS[ranked.length + (hasOther ? 'o' : '')] || [];
  const colors = (SCHEMES[state.scheme] || SCHEMES[0]).colors;
  const txt = t => { const e = state.edits[t.id]; return e && e.text != null && e.text.trim() ? e.text.trim() : t.label; };
  const shown = t => !(state.edits[t.id] && state.edits[t.id].hidden);
  const restN = rest.reduce((s, x) => s + x.tasks.length, 0);
  const pcts = shares([...ranked.map(x => x.tasks.length), ...(restN ? [restN] : [])]);   // last one is everything not ranked
  const boxes = ranked.map((row, i) => {
    const open = openTasksOf(tasks, row.name, state);
    const doneAll = row.tasks.filter(shown);
    const box = { ...layout[i], name: row.name, n: row.tasks.length, pct: pcts[i], other: false, ...colors[i], tasksAll: row.tasks, openAll: open };
    const f = fitBox(box, doneAll.map(txt), open.filter(shown).map(txt));
    return { ...box, ts: f.ts, done: f.done, more: f.more, open: open.filter(shown).map(txt) };
  });
  if (hasOther) {
    boxes.push({ ...layout[ranked.length], name: 'Other work', n: restN, pct: pcts[ranked.length], other: true, ...colors[4], done: [`${restN} ${restN === 1 ? 'task' : 'tasks'} across ${rest.length} other ${rest.length === 1 ? 'project' : 'projects'}`], open: [], more: 0, tasksAll: [], openAll: [] });
  }
  // finished work that was not ranked still takes part of the effort, so it gets a (neutral) segment even without a box
  const stripItems = boxes.map(b => ({ n: b.n, pct: b.pct, bg: b.bg, fg: b.fg }));
  if (!hasOther && restN) stripItems.push({ n: restN, pct: pcts[ranked.length], ...colors[4] });
  const total = rows.reduce((s, x) => s + x.tasks.length, 0);
  // a month in the current year needs no year in the title
  const label = state.kind === 'month' && +state.month.slice(0, 4) === new Date().getFullYear() ? MONTHS[+state.month.slice(5) - 1] : period.label;
  const title = `Where the team's effort went in ${label}`;
  const auto = `${total} ${total === 1 ? 'task' : 'tasks'} finished across ${rows.length} ${rows.length === 1 ? 'project' : 'projects'}${ranked.length > 1 ? ', in order of priority' : ''}`;
  return { title, titleFs: fitTitle(title), period: period.label, file: period.file, subtitle: (state.subtitle || '').trim() || auto, autoSubtitle: auto, total, projects: rows.length, boxes, strip: buildStrip(stripItems), scheme: (SCHEMES[state.scheme] || SCHEMES[0]).name };
}

// ── preview (HTML twin of the PowerPoint slide) ───────────────────────────
function slideHTML(m) {
  const px = n => `${n}px`;
  const boxes = m.boxes.map(b => {
    const pad = padFor(b), ts = b.ts, gap = Math.max(5, Math.round(ts / 3));
    const item = (t, glyph) => `<div style="margin-top:${gap}px;font-size:${px(ts)};line-height:${LH};padding-left:${ts + 8}px;text-indent:-${ts + 8}px">${glyph}&nbsp;&nbsp;${esc(t)}</div>`;
    const body = b.other
      ? `<div style="margin-top:6px;font-size:${px(ts)}">${esc(b.done[0])}</div>`
      : b.done.map(t => item(t, '✓')).join('') + (b.more ? `<div style="margin-top:${gap}px;font-size:${px(ts)};font-weight:700;opacity:.9">+ ${b.more} more</div>` : '')
        + (b.open.length ? `<div style="margin-top:${Math.round(ts * 0.9)}px;font-size:${px(Math.max(12, ts - 2))};font-weight:700;opacity:.85">Still in progress</div>` + b.open.map(t => item(t, '○')).join('') : '');
    const sub = b.other ? '' : `<div style="margin-top:5px;font-size:${px(Math.max(12, ts - 2))};font-weight:600;line-height:1.2;opacity:.85">${esc(subText(b))}</div>`;
    return `<div style="position:absolute;left:${AREA.x + b.x}px;top:${AREA.y + b.y}px;width:${b.w}px;height:${b.h}px;background:${b.bg};color:${b.fg};border-radius:20px;padding:${pad}px;box-sizing:border-box;overflow:hidden"><div style="font-size:${px(b.hs)};font-weight:800;letter-spacing:-.01em;line-height:1.15">${esc(b.name)}</div>${sub}<div style="margin-top:${Math.max(8, Math.round(ts / 2))}px">${body}</div></div>`;
  }).join('');
  const strip = m.strip.map(g => {
    const R = STRIP.r, rad = g.first && g.last ? `${R}px` : g.first ? `${R}px 0 0 ${R}px` : g.last ? `0 ${R}px ${R}px 0` : '0';
    return `<div style="position:absolute;left:${STRIP.x + g.x}px;top:${STRIP.y}px;width:${g.w}px;height:${STRIP.h}px;background:${g.bg};color:${g.fg};border-radius:${rad};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden">${esc(g.label)}</div>`;
  }).join('');
  return `<div style="width:${SLIDE_W}px;height:${SLIDE_H}px;position:relative;background:${PAPER};font-family:${FONT},${MEASURE_FONT},sans-serif;color:${INK};overflow:hidden">`
    + `<div style="position:absolute;left:40px;top:34px"><div style="font-size:${m.titleFs}px;font-weight:800;letter-spacing:-.02em;line-height:1;white-space:nowrap">${esc(m.title)}</div><div style="margin-top:10px;font-size:20px;color:${PENCIL}">${esc(m.subtitle)}</div></div>`
    + `<div style="position:absolute;right:40px;top:30px;text-align:right"><div style="font-size:54px;font-weight:800;line-height:1;letter-spacing:-.02em">${m.total}</div><div style="margin-top:6px;font-size:16px;color:${PENCIL}">${m.total === 1 ? 'task' : 'tasks'} finished across ${m.projects} ${m.projects === 1 ? 'project' : 'projects'}</div></div>`
    + strip
    + boxes
    + `<div style="position:absolute;left:40px;bottom:16px;font-size:13px;color:${PENCIL}">MBC-IN Internal Communications, Bosch Mobility India</div></div>`;
}

// ── PowerPoint ─────────────────────────────────────────────────────────────
let _pptxLoad;
function loadPptx() {
  if (window.PptxGenJS) return Promise.resolve();
  _pptxLoad ||= new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = PPTX_URL;
    s.onload = ok; s.onerror = () => { _pptxLoad = null; no(new Error('Could not load the PowerPoint library')); };
    document.head.appendChild(s);
  });
  return _pptxLoad;
}
const inch = n => n / 96, pt = n => Math.round(n * 0.75 * 10) / 10;
const hex = c => c.replace('#', '');

export async function downloadPptx(m) {
  await loadPptx();
  const pptx = new window.PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';        // 13.33 x 7.5 in
  pptx.title = `${m.title}: ${m.subtitle}`;
  pptx.company = 'MBC-IN Internal Communications';
  const s = pptx.addSlide();
  s.background = { color: hex(PAPER) };
  const text = (t, o) => s.addText(t, { fontFace: FONT, margin: 0, valign: 'top', ...o });
  text(m.title, { x: inch(40), y: inch(30), w: inch(1060), h: inch(56), fontSize: pt(m.titleFs), bold: true, color: hex(INK), fit: 'none' });
  text(m.subtitle, { x: inch(40), y: inch(88), w: inch(760), h: inch(30), fontSize: pt(20), color: hex(PENCIL) });
  text(String(m.total), { x: inch(840), y: inch(24), w: inch(400), h: inch(64), fontSize: pt(54), bold: true, color: hex(INK), align: 'right' });
  text(`${m.total === 1 ? 'task' : 'tasks'} finished across ${m.projects} ${m.projects === 1 ? 'project' : 'projects'}`, { x: inch(740), y: inch(92), w: inch(500), h: inch(24), fontSize: pt(16), color: hex(PENCIL), align: 'right' });
  // effort strip: one editable shape per segment. The end segments are a rounded shape with a square
  // block behind their inner half, so only the outer corners are round.
  const R = STRIP.r;
  m.strip.forEach(g => {
    const x = STRIP.x + g.x, at = { y: inch(STRIP.y), h: inch(STRIP.h) };
    const fill = { fill: { color: hex(g.bg) }, line: { type: 'none' } };
    const rounded = g.first || g.last;
    if (rounded && !(g.first && g.last) && g.w > R) {
      const bx = g.first ? x + R : x, bw = g.w - R;
      s.addShape(pptx.ShapeType.rect, { x: inch(bx), w: inch(bw), ...at, ...fill });
    }
    s.addText(g.label || ' ', {
      shape: rounded ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, rectRadius: inch(R), ...fill,
      x: inch(x), w: inch(g.w), ...at, margin: 0, align: 'center', valign: 'middle', fontFace: FONT, fontSize: pt(15), bold: true, color: hex(g.fg), fit: 'none',
    });
  });
  for (const b of m.boxes) {
    const padPt = padFor(b) * 0.75, ts = b.ts, gap = Math.max(5, Math.round(ts / 3)) * 0.75;
    const runs = [{ text: b.name, options: { fontSize: pt(b.hs), bold: true, color: hex(b.fg), breakLine: true } }];
    if (b.other) {
      runs.push({ text: b.done[0], options: { fontSize: pt(ts), color: hex(b.fg), paraSpaceBefore: 6 } });
    } else {
      runs.push({ text: subText(b), options: { fontSize: pt(Math.max(12, ts - 2)), bold: true, color: hex(b.fg), breakLine: true, paraSpaceBefore: 4 } });
      b.done.forEach((t, i) => runs.push({ text: t, options: { fontSize: pt(ts), color: hex(b.fg), breakLine: true, bullet: { code: '2713', indent: pt(ts + 8) }, paraSpaceBefore: i === 0 ? Math.round(ts / 2 * 0.75) : gap } }));
      if (b.more) runs.push({ text: `+ ${b.more} more`, options: { fontSize: pt(ts), bold: true, color: hex(b.fg), breakLine: true, paraSpaceBefore: gap } });
      if (b.open.length) {
        runs.push({ text: 'Still in progress', options: { fontSize: pt(Math.max(12, ts - 2)), bold: true, color: hex(b.fg), breakLine: true, paraSpaceBefore: Math.round(ts * 0.9 * 0.75) } });
        b.open.forEach(t => runs.push({ text: t, options: { fontSize: pt(ts), color: hex(b.fg), breakLine: true, bullet: { code: '25CB', indent: pt(ts + 8) }, paraSpaceBefore: gap } }));
      }
    }
    s.addText(runs, {
      shape: pptx.ShapeType.roundRect, rectRadius: 0.2, fill: { color: hex(b.bg) }, line: { type: 'none' },
      x: inch(AREA.x + b.x), y: inch(AREA.y + b.y), w: inch(b.w), h: inch(b.h), margin: padPt, valign: 'top', fontFace: FONT, fit: 'none',
    });
  }
  text('MBC-IN Internal Communications, Bosch Mobility India', { x: inch(40), y: inch(690), w: inch(700), h: inch(20), fontSize: pt(13), color: hex(PENCIL) });
  await pptx.writeFile({ fileName: `WorkDesk-slide-${m.file}.pptx` });
}

// ── the sheet ──────────────────────────────────────────────────────────────
export function openSlideBuilder(allTasks) {
  const now = new Date();
  const monthKey = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
  const state = {
    kind: 'month', month: monthKey(now), quarter: Math.floor(now.getMonth() / 3) + 1, year: now.getFullYear(),
    from: ymd(new Date(now.getFullYear(), now.getMonth(), 1)), to: ymd(now),
    ranked: [], group: true, subtitle: '', edits: {}, step: 'rank', editOpen: false,
    scheme: loadScheme(), auto: loadAuto(),
  };
  // months that have finished work, plus the current month
  const monthOpts = (() => {
    const set = new Set([monthKey(now)]);
    allTasks.forEach(t => { if (isTeamTask(t) && t.status === 'done') { const d = doneDate(t); if (d) set.add(monthKey(d)); } });
    return [...set].sort().reverse();
  })();
  const years = [...new Set([now.getFullYear(), now.getFullYear() - 1, ...monthOpts.map(k => +k.slice(0, 4))])].sort().reverse();
  const monthName = k => `${MONTHS[+k.slice(5) - 1]} ${k.slice(0, 4)}`;

  let _ro;
  const render = () => {
    sheet.innerHTML = '<div class="wd-grab"></div>' + (state.step === 'rank' ? rankHTML() : previewHTML());
    // the thumbnail is the real 1280 px slide, scaled to whatever width the sheet has
    const t = sheet.querySelector('.rs-thumb');
    if (_ro) _ro.disconnect();
    if (t && window.ResizeObserver) { _ro = new ResizeObserver(() => { const w = t.clientWidth; if (w) t.firstElementChild.style.transform = `scale(${w / SLIDE_W})`; }); _ro.observe(t); }
  };
  // a fresh sheet every time, so listeners from an earlier visit never stack up
  closeSheet(SHEET); document.getElementById(SHEET)?.remove();
  const sheet = openSheet(SHEET, '');
  const rowsNow = () => projectRows(allTasks, state);

  function periodControls() {
    const seg = ['month', 'quarter', 'custom'].map(k => `<button type="button" class="${state.kind === k ? 'on' : ''}" aria-pressed="${state.kind === k}" data-act="kind" data-v="${k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('');
    let ctl = '';
    if (state.kind === 'month') ctl = `<select class="wd-select rs-wide" aria-label="Month" data-act="month">${monthOpts.map(k => `<option value="${k}"${k === state.month ? ' selected' : ''}>${monthName(k)}</option>`).join('')}</select>`;
    if (state.kind === 'quarter') ctl = `<div class="rs-two"><select class="wd-select" aria-label="Quarter" data-act="quarter">${[1, 2, 3, 4].map(q => `<option value="${q}"${q === state.quarter ? ' selected' : ''}>Q${q} (${MONTHS[(q - 1) * 3].slice(0, 3)} to ${MONTHS[(q - 1) * 3 + 2].slice(0, 3)})</option>`).join('')}</select><select class="wd-select" aria-label="Year" data-act="year">${years.map(y => `<option${y === state.year ? ' selected' : ''}>${y}</option>`).join('')}</select></div>`;
    if (state.kind === 'custom') ctl = `<div class="rs-two"><input type="date" class="wd-field" aria-label="From" data-act="from" value="${state.from}"><input type="date" class="wd-field" aria-label="To" data-act="to" value="${state.to}"></div>`;
    return `<div class="wd-seg" role="group" aria-label="Period">${seg}</div>${ctl}`;
  }

  function rankHTML() {
    const rows = rowsNow();
    state.ranked = state.ranked.filter(n => rows.some(x => x.name === n));
    const list = rows.length ? rows.map(x => {
      const i = state.ranked.indexOf(x.name);
      const full = i < 0 && state.ranked.length >= MAX_RANKED;
      return `<button type="button" class="rs-row${i >= 0 ? ' on' : ''}" data-act="rank" data-name="${esc(x.name)}" aria-pressed="${i >= 0}"${full ? ' aria-disabled="true"' : ''}>
        <span class="rs-rk">${i >= 0 ? i + 1 : ''}</span><span class="rs-nm"><b>${esc(x.name)}</b><span>${x.tasks.length} ${x.tasks.length === 1 ? 'task' : 'tasks'} finished</span></span></button>`;
    }).join('') : `<div class="wd-empty"><b>Nothing finished in this period</b>Pick another month or range.</div>`;
    const rest = rows.length - state.ranked.length;
    return `<h2 class="wd-sheet-title">Create slide</h2>
      <div class="wd-sheet-sub">Pick the period, then rank what mattered most.</div>
      <div class="wd-lab">Period</div>${periodControls()}
      <div class="wd-lab">Rank the projects <span class="opt">tap in order, biggest first, up to ${MAX_RANKED}</span></div>
      <div class="rs-list">${list}</div>
      ${rows.length ? `<button type="button" class="rs-tog" data-act="group" role="switch" aria-checked="${state.group}"><span>Group the rest as “Other work”${rest > 0 ? `<small>${rest} ${rest === 1 ? 'project' : 'projects'}</small>` : ''}</span><i class="rs-sw${state.group ? ' on' : ''}"></i></button>` : ''}
      <button type="button" class="wd-btn p" data-act="preview"${state.ranked.length ? '' : ' disabled'}>Preview slide</button>`;
  }

  const model = () => buildModel(allTasks, state);
  function editRows() {
    const out = [];
    const m = model();
    for (const b of m.boxes) {
      if (b.other) continue;
      out.push(`<div class="wd-lab">${esc(b.name)}</div>`);
      [...b.tasksAll.map(t => [t, '✓']), ...b.openAll.map(t => [t, '○'])].forEach(([t, g]) => {
        const e = state.edits[t.id] || {}, hid = !!e.hidden;
        out.push(`<div class="rs-ed${hid ? ' off' : ''}"><span class="g" aria-hidden="true">${g}</span><input class="wd-field" aria-label="Wording on the slide" data-act="text" data-id="${esc(t.id)}" value="${esc(e.text != null ? e.text : t.label)}"${hid ? ' disabled' : ''}>
          <button type="button" class="wd-link" data-act="hide" data-id="${esc(t.id)}">${hid ? 'Show' : 'Hide'}</button></div>`);
      });
    }
    return out.join('');
  }
  function previewHTML() {
    const m = model();
    return `<h2 class="wd-sheet-title">Your slide</h2>
      <div class="wd-sheet-sub">${esc(m.period)}, ${m.boxes.filter(b => !b.other).length} ranked ${m.boxes.filter(b => !b.other).length === 1 ? 'project' : 'projects'}</div>
      <div class="rs-thumb" id="rs-thumb"><div>${slideHTML(m)}</div></div>
      <div class="wd-lab">Colours <span class="opt">${esc(m.scheme)}</span></div>
      <div class="rs-sch" role="group" aria-label="Colour scheme">${SCHEMES.map((sc, i) => `<button type="button" class="rs-swatch${i === state.scheme ? ' on' : ''}" data-act="scheme" data-i="${i}" aria-pressed="${i === state.scheme}" aria-label="${esc(sc.name)}">${sc.colors.slice(0, 4).map(c => `<i style="background:${c.bg}"></i>`).join('')}</button>`).join('')}</div>
      <button type="button" class="rs-tog" data-act="auto" role="switch" aria-checked="${state.auto}"><span>New colours with every download<small>${state.auto ? `Next one: ${esc(SCHEMES[(state.scheme + 1) % SCHEMES.length].name)}` : 'Always this scheme'}</small></span><i class="rs-sw${state.auto ? ' on' : ''}"></i></button>
      <div class="wd-lab">Line under the title</div>
      <input class="wd-field" aria-label="Line under the title" data-act="subtitle" value="${esc(state.subtitle)}" placeholder="${esc(m.autoSubtitle)}" maxlength="70">
      <button type="button" class="wd-disc" data-act="editToggle" aria-expanded="${state.editOpen}"><span>Edit task wording</span><span class="n"></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>
      <div class="wd-disc-body" id="rs-edit"${state.editOpen ? '' : ' hidden'}>${editRows()}</div>
      <div class="wd-btns" style="margin-top:18px"><button type="button" class="wd-btn s" data-act="back">Back to ranking</button><button type="button" class="wd-btn p" data-act="download">Download slide</button></div>
      <p class="rs-note">Opens in PowerPoint with every box and line of text editable. Changes here only affect the slide, not your tasks.</p>`;
  }
  const keepScroll = () => { const y = sheet.scrollTop; render(); sheet.scrollTop = y; };
  const refreshThumb = () => { const t = sheet.querySelector('#rs-thumb > div'); if (t) t.innerHTML = slideHTML(model()); };

  sheet.addEventListener('click', async e => {
    const el = e.target.closest('[data-act]'); if (!el || el.tagName === 'SELECT' || el.tagName === 'INPUT') return;
    const act = el.dataset.act;
    if (act === 'kind') { state.kind = el.dataset.v; state.ranked = []; render(); }
    else if (act === 'rank') {
      const n = el.dataset.name, i = state.ranked.indexOf(n);
      if (i >= 0) state.ranked.splice(i, 1);
      else if (state.ranked.length < MAX_RANKED) state.ranked.push(n);
      else { showNote(`Four at most. Tap one you have ranked to remove it.`); return; }
      render();
    }
    else if (act === 'group') { state.group = !state.group; render(); }
    else if (act === 'scheme') { state.scheme = +el.dataset.i; lsSet(SCHEME_KEY, String(state.scheme)); keepScroll(); }
    else if (act === 'auto') { state.auto = !state.auto; lsSet(AUTO_KEY, state.auto ? '1' : '0'); keepScroll(); }
    else if (act === 'preview') { state.step = 'preview'; render(); sheet.scrollTop = 0; }
    else if (act === 'back') { state.step = 'rank'; render(); }
    else if (act === 'editToggle') { state.editOpen = !state.editOpen; const b = sheet.querySelector('#rs-edit'); b.hidden = !state.editOpen; el.setAttribute('aria-expanded', String(state.editOpen)); }
    else if (act === 'hide') { const id = el.dataset.id; (state.edits[id] ||= {}).hidden = !state.edits[id].hidden; render(); }
    else if (act === 'download') {
      el.disabled = true; const old = el.textContent; el.textContent = 'Building…';
      let ok = false;
      try { await downloadPptx(model()); ok = true; showNote('Slide downloaded'); }
      catch (err) { console.warn(err); showNote('Could not build the slide. Check your connection and try again.'); }
      // the next download gets the next colour scheme (only a finished download moves it on)
      if (ok && state.auto) { state.scheme = (state.scheme + 1) % SCHEMES.length; lsSet(SCHEME_KEY, String(state.scheme)); keepScroll(); }
      else { el.disabled = false; el.textContent = old; }
    }
  });
  sheet.addEventListener('change', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const v = el.value;
    if (el.dataset.act === 'month') state.month = v;
    else if (el.dataset.act === 'quarter') state.quarter = +v;
    else if (el.dataset.act === 'year') state.year = +v;
    else if (el.dataset.act === 'from') state.from = v;
    else if (el.dataset.act === 'to') state.to = v;
    else return;
    if (['month', 'quarter', 'year', 'from', 'to'].includes(el.dataset.act)) { state.ranked = []; render(); }
  });
  sheet.addEventListener('input', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    if (el.dataset.act === 'subtitle') { state.subtitle = el.value; refreshThumb(); }
    else if (el.dataset.act === 'text') { (state.edits[el.dataset.id] ||= {}).text = el.value; refreshThumb(); }
  });
  render();
}
