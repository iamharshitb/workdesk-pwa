// ── WorkDesk Sound System ─────────────────────────────────────────────────
// All sounds generated via Web Audio API — no files to host.
// Sounds respect a mute toggle stored in localStorage.

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function isMuted() {
  return localStorage.getItem('wd_muted') === 'true';
}

export function toggleMute() {
  const muted = !isMuted();
  localStorage.setItem('wd_muted', muted);
  return muted;
}

export function getMuted() { return isMuted(); }

// ── UTILITY: play a tone ──────────────────────────────────────────────────
function tone(freq, type, startTime, duration, gainVal, fadeOut = true) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(gainVal, startTime);
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
  gain.gain.setValueAtTime(gainVal, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  source.start(startTime);
  source.stop(startTime + duration);
}

// ── SOUND 1: TIMER DONE ───────────────────────────────────────────────────
// Three ascending chimes — like a countdown completing
export function playTimerDone() {
  if (isMuted()) return;
  const c = getCtx();
  const t = c.currentTime;
  // Rising chord sequence
  tone(523.25, 'sine', t,       0.5,  0.25); // C5
  tone(659.25, 'sine', t + 0.2, 0.5,  0.25); // E5
  tone(783.99, 'sine', t + 0.4, 0.8,  0.3);  // G5
  tone(1046.5, 'sine', t + 0.6, 1.0,  0.35); // C6 — final high note
  // Subtle shimmer on top
  tone(2093,   'sine', t + 0.6, 0.5,  0.06);
}

// ── SOUND 2: TASK ASSIGNED TO YOU ─────────────────────────────────────────
// Soft double-ping — like a notification landing
export function playTaskAssigned() {
  if (isMuted()) return;
  const c = getCtx();
  const t = c.currentTime;
  // First ping
  tone(880, 'sine', t,      0.18, 0.2);
  tone(1760,'sine', t,      0.12, 0.08);
  // Second ping (slightly higher, slightly later)
  tone(988, 'sine', t + 0.2, 0.18, 0.18);
  tone(1976,'sine', t + 0.2, 0.10, 0.07);
}

// ── SOUND 3: MARK DONE ────────────────────────────────────────────────────
// Satisfying upward swoosh + soft click — like checking off a list
export function playMarkDone() {
  if (isMuted()) return;
  const c = getCtx();
  const t = c.currentTime;
  // Upward sweep
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.15);
  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  osc.start(t);
  osc.stop(t + 0.22);
  // Confirmation click
  noise(t + 0.14, 0.06, 0.12);
  tone(1200, 'sine', t + 0.16, 0.12, 0.08);
}

// ── SOUND 4: TASK REOPENED (undo mark done) ────────────────────────────────
// Downward swoosh — reverse of mark done
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
  osc.frequency.exponentialRampToValueAtTime(280, t + 0.18);
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  osc.start(t);
  osc.stop(t + 0.22);
}

// ── INIT: unlock audio context on first user gesture ──────────────────────
// iOS and some browsers require a user gesture before audio can play.
export function initAudio() {
  const unlock = () => {
    getCtx();
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('click', unlock);
  };
  document.addEventListener('touchstart', unlock, { once: true });
  document.addEventListener('click', unlock, { once: true });
}
