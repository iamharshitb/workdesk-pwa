// ── WorkDesk page shell ───────────────────────────────────────────────────
// What every page except Home shares: theme, sound, and the profile button in
// the top bar (appearance, sound, Ideas, Help, Backup). Home has its own,
// richer profile sheet because it also holds the timer, notes and
// announcements.
import { initTheme } from './theme.js';
import { initAudio, getMuted, toggleMute } from './sounds.js';
import { openSheet, profileSheetHTML, initials, ICON } from './ui.js';

const myName = () => localStorage.getItem('wd_myname') || '';

function profileRows() {
  return [
    { id: 'sound', icon: 'sound', label: 'Sound', toggle: { on: !getMuted(), action: '__shellSound' } },
    { id: 'ideas', icon: 'idea', label: 'Ideas', href: 'ideas.html' },
    { id: 'help', icon: 'help', label: 'Help', href: 'help.html' },
    { id: 'backup', icon: 'backup', label: 'Backup and restore', href: 'backup.html' },
  ];
}
function openProfile() {
  openSheet('wd-profile', profileSheetHTML({ name: myName() || 'You', line: '', rows: profileRows() }));
}

export function initShell() {
  initTheme();
  initAudio();
  window.__shellSound = () => { toggleMute(); openProfile(); };
  const btn = document.getElementById('me-btn');
  if (btn) {
    btn.textContent = myName() ? initials(myName()) : '·';
    btn.addEventListener('click', openProfile);
  }
}
export { ICON };
