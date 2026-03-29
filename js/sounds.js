// ── WorkDesk Sound System ─────────────────────────────────────────────────
// All sounds generated via Web Audio API — no files to host.

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function isMuted() { return localStorage.getItem('wd_muted') === 'true'; }
export function toggleMute() { const m = !isMuted(); localStorage.setItem('wd_muted', m); return m; }
export function getMuted() { return isMuted(); }

// Master volume multiplier — raise this to make everything louder
const VOL = 5;

function tone(freq, type, startTime, duration, gainVal, fadeOut = true) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(Math.min(gainVal * VOL, 1), startTime);
  if (fadeOut) gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function noise(startTime, duration, gainVal) {
  const c = getCtx();
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  source.buffer = buffer;
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 0.8;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  gain.gain.setValueAtTime(Math.min(gainVal * VOL, 1), startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  source.start(startTime);
  source.stop(startTime + duration);
}

// ── SOUND 1: TIMER DONE ───────────────────────────────────────────────────
export function playTimerDone() {
  if (isMuted()) return;
  const c = getCtx();
  const t = c.currentTime;
  tone(523.25, 'sine', t,       0.5,  0.55); // C5
  tone(659.25, 'sine', t + 0.2, 0.5,  0.55); // E5
  tone(783.99, 'sine', t + 0.4, 0.8,  0.65); // G5
  tone(1046.5, 'sine', t + 0.6, 1.0,  0.75); // C6
  tone(2093,   'sine', t + 0.6, 0.5,  0.15); // shimmer
}

// ── SOUND 2: TASK ASSIGNED ────────────────────────────────────────────────
export function playTaskAssigned() {
  if (isMuted()) return;
  const c = getCtx();
  const t = c.currentTime;
  tone(880,  'sine', t,        0.22, 0.5);
  tone(1760, 'sine', t,        0.15, 0.2);
  tone(988,  'sine', t + 0.22, 0.22, 0.45);
  tone(1976, 'sine', t + 0.22, 0.15, 0.18);
}

// ── SOUND 3: MARK DONE ────────────────────────────────────────────────────
export function playMarkDone() {
  if (isMuted()) return;
  const c = getCtx();
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.15);
  gain.gain.setValueAtTime(Math.min(0.45 * VOL, 1), t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc.start(t);
  osc.stop(t + 0.25);
  noise(t + 0.14, 0.08, 0.3);
  tone(1200, 'sine', t + 0.16, 0.14, 0.25);
}

// ── SOUND 4: REOPEN ───────────────────────────────────────────────────────
export function playReopen() {
  if (isMuted()) return;
  const c = getCtx();
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(700, t);
  osc.frequency.exponentialRampToValueAtTime(280, t + 0.2);
  gain.gain.setValueAtTime(Math.min(0.35 * VOL, 1), t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc.start(t);
  osc.stop(t + 0.25);
}

// ── INIT ──────────────────────────────────────────────────────────────────
export function initAudio() {
  const unlock = () => { getCtx(); };
  document.addEventListener('touchstart', unlock, { once: true });
  document.addEventListener('click', unlock, { once: true });
}
