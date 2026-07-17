# WorkDesk PWA — Claude Context File

This file gives Claude full context about the WorkDesk app so any new chat session can pick up exactly where the last one left off. Always read this before making any changes.

---

## Project Overview

**App name:** WorkDesk — Internal Communications Team Task Tracker  
**Team:** MBC-IN / BBM-IN, Bosch Mobility India  
**Live URL:** https://iamharshitb.github.io/workdesk-pwa/  
**Custom domain also works:** https://iamharshit.com/workdesk-pwa/  
**GitHub repo:** https://github.com/iamharshitb/workdesk-pwa  
**Firebase project:** workdesk-ba979  
**Firebase WORKSPACE_ID:** `"harshit-team-2026"`  
**Firebase region:** asia-south1 (Mumbai)  
**Stack:** Vanilla HTML/CSS/JS — no build tools, no frameworks  
**Hosting:** GitHub Pages (main branch, root folder)  
**Auth:** Firebase Anonymous Auth only — no email/password  
**Database:** Firebase Firestore  

---

## Team Members

| Name | Role |
|------|------|
| Harshit | Admin — Assistant Manager, Marketing & Comms |
| Godly | Team member |
| Bhuvan | Team member |
| Sriram | Team member |
| Amrutha | Team member |

**Admin name constant:** `const ADMIN_NAME = 'Harshit'`  
**Delete password:** `workdesk@delete`  

---

## Firebase Authorized Domains

- `iamharshitb.github.io`
- `iamharshit.com`
- `localhost`
- `workdesk-ba979.firebaseapp.com`
- `workdesk-ba979.web.app`

If the app stops loading (spinner never completes), check Firebase Console → Authentication → Settings → Authorized Domains first.

---

## File Structure

```
workdesk-pwa/
├── index.html          — Dashboard (main page)
├── input.html          — Task input with duplicate detection
├── report.html         — Reports (Monthly / Weekly / My Report)
├── calendar.html       — Communications calendar
├── timeline.html       — Gantt-style project tracker
├── ideas.html          — Ideas management
├── backup.html         — Backup & restore
├── cards.html          — Player Cards (easter egg)
├── snake.html          — Snake game (easter egg)
├── quiz.html           — Comms Trivia Quiz (easter egg)
├── space.html          — Space Defender game (easter egg)
├── CLAUDE.md           — This file
├── manifest.json       — PWA manifest
├── sw.js               — Service worker (pass-through, no caching)
├── css/
│   ├── style.css       — Main design system and variables
│   └── themes.css      — All theme overrides
└── js/
    ├── firebase.js     — All Firestore functions and exports
    ├── theme.js        — Theme management (THEMES array + initTheme)
    └── sounds.js       — Audio functions
```

---

## Design System

**Default theme:** Light / Health (`theme-health`) — `#f2f2f7` background, iOS blue `#007aff` primary  
**CSS variables (from style.css):**
- `--bg`, `--bg2`, `--bg3`, `--bg4` — background layers
- `--panel` — card/panel background
- `--border`, `--border2`, `--border3` — border colours
- `--neon` — primary accent (blue)
- `--text`, `--text2`, `--text3` — text hierarchy
- `--red`, `--amber`, `--green`, `--purple` — semantic colours
- `--rr` — large border radius (cards), `--r` — small border radius
- `--sans` — DM Sans, `--mono` — JetBrains Mono

**Fonts:** DM Sans (body), Syne (headings), JetBrains Mono (numbers/timers), Inter + Roboto Mono (Editorial theme only)

---

## Themes (7 total)

| ID | Name | Description |
|----|------|-------------|
| `` (empty) | Standard | Dark, ambient neon |
| `frosted` | Frosted Glass | Heavy blur, translucent |
| `bigsur` | iOS Fans | macOS warm coral glass |
| `ios-system` | Dark | iOS system clean |
| `health` | Light | iOS Health pastel white (default) |
| `neon` | Neon | Retro neon modern dark |
| `editorial` | Editorial | Inter font, #F3F3F5 bg, Linear/Notion style |

Themes are in `css/themes.css`. The THEMES array is in `js/theme.js`. Applied as body class e.g. `body.theme-editorial`.

---

## Navigation Structure

**Bottom nav (all pages):** Dashboard / Input / Calendar / Timeline / Report  
**Ideas:** Accessible via purple 💡 FAB button on dashboard (not in nav)  
**Backup:** Accessible from Report page or direct URL  

---

## Task Status System

4 states in order: `todo` → `inprog` → `onhold` → `done`

- **Todo** — neutral
- **In Progress** — amber
- **On Hold** — purple (clusters in a separate "⏸ On Hold" section)
- **Done** — green (grouped by month, collapsed)

Status cycles via button in expanded task card:  
`▶ Start` → `⏸ On Hold` → `↩ Resume` → back to Todo

---

## Key Features

### Dashboard (index.html)
- World clock strip (IST India + CET/CEST Germany, auto-DST)
- ⏱ Focus Timer — hidden by default, tap icon in clock strip to expand. 30m/45m/custom presets. Persists via localStorage. Auto-expands if timer is running on page load
- Greeting bar (personalised, streak 🔥 badge, quote, due this week / done this month)
- Stats pills: Total / In Prog / Done / Critical (tappable to filter)
- **Weekly Sprint** — "🎯 This Week's Sprint" section at top of My Tasks. Max 10 tasks/week. Resets every Monday. Stored in `localStorage` key `wd_sprint` as `{week:'YYYY-Www', ids:[...]}`. Add via "🎯 This Week" button in expanded task card
- **Filters button** — dropdown with Due Date (Today / This Week / 2 Weeks) and Priority (Critical/High/Medium/Low). Active filter shown as pill next to button. Filter dropdown is `position:fixed` at body level to avoid clipping
- Progress bar (team completion %)
- Task Tracker tabs: My Tasks / By Member / Follow-up
- My Tasks sections: Active → ⏸ On Hold → ✅ Done (by month)
- Inline task edit from dashboard
- Quick Notes (synced to Firestore)
- Announcements overlay
- Reminders (rich overlay, snooze options)
- Welcome screen (replaces browser prompt — shows member chips)
- 💡 Ideas FAB (purple, bottom right, above nav)
- 🎮 hint icon near Quick Notes (focuses search bar)
- Games: type "snake"/"quiz"/"space" in search, or tap logo 5× for Snake

### Input (input.html)
- MBC / Individual task toggle with blue info box explanation
- Project field — smart dropdown with existing projects, type to filter, create new
- Member chips + role per member
- Priority chips: Critical / High / Medium / Low
- Start date + due date pickers
- **Duplicate detection** — fuzzy similarity (token overlap + bigram scoring, threshold 38%). Shows warning bottom sheet with matching tasks before save. `_doSave()` handles actual save. `window.forceSaveTask()` for confirmed save
- Existing task list below form

### Report (report.html)
- Tabs: Monthly / Weekly / My Report
- Monthly: ⚙ Filters button (hidden by default), progress ring, 4 Chart.js charts, project sections, Mark Complete, PDF export
- Weekly: digest + Copy for WhatsApp
- My Report: period picker + PDF

### Calendar (calendar.html)
- Fixed monthly grid, 7 event types colour-coded
- Auto-task checkbox (assigns Harshit + Godly)

### Timeline (timeline.html)
- 1–3 projects, Gantt-style per project
- Excel-style Gantt — HTML table, sticky task name column, day columns, month header, weekends shaded, today line (red)
- Dual progress bars: task completion % + time elapsed %
- Task detail right-side drawer (Mark Done / On Hold / Resume / Edit / Delete)
- WorkDesk tasks matching project name auto-appear on Gantt (one-way pull from WorkDesk → Timeline)
- Timeline tasks auto-push to WorkDesk dashboard (one-way: Timeline → WorkDesk)
- Project Notes — collapsible threaded notes per project (Firestore subcollection)
- ⬇ Excel export (SheetJS, one sheet per project)
- Mobile: Gantt hidden by default, tap "📊 Show Gantt" to expand
- Max width 1100px

### Ideas (ideas.html)
- Quick capture bar at top (type + Enter → instant Ideation status)
- Status tabs: All / 🌱 Ideation / 🔄 In Progress / ✅ Implemented / 🅿 Parked
- 7 categories: Content / Campaign / Process / Tool / Event / Brand / Other
- Threaded notes per idea (real-time Firestore sync)
- Imports `getDb()` and `WORKSPACE_ID` from firebase.js

---

## firebase.js — All Exports

```javascript
export const WORKSPACE_ID
export function getDb()           // returns Firestore db instance
export function onUserReady(cb)   // Firebase anonymous auth ready callback
export function getMembers()
export function addMember(name)
export function deleteMember(id)
export function getTasks()
export function onTasksChanged(callback)
export function addTask(data)
export function updateTask(id, data)
export function deleteTask(id)
export function getUserData(userName)
export function saveUserData(userName, data)
export function onUserDataChanged(userName, cb)
export function getStreak(userName)
export function recordTaskCompletion(completedBy)
export function addComment(taskId, text, author)
export function updateComment(taskId, commentId, text)
export function deleteComment(taskId, commentId)
export function onCommentsChanged(taskId, cb)
export function setReminder(taskId, date, time, setBy)
export function snoozeReminder(taskId, minutes)
export function dismissReminder(taskId)
export function saveCalendarData(data)
export function onCalendarDataChanged(cb)
export function getCalendarEvents()
export function onCalendarChanged(cb)
export function postAnnouncement(text, by)
export function getAnnouncementHistory()
export function clearAnnouncement()
export function onAnnouncementChanged(cb)
export function exportBackup()
export function restoreBackup(data)
export function getProjects()
export function setProjectComplete(projectName)
export function reopenProject(projectName)
```

---

## Firestore Collections

```
workspaces/
  harshit-team-2026/
    tasks/              — All tasks
    members/            — Team members
    calendar/           — Calendar events (single doc)
    announcements/      — Broadcast announcements
    userData/           — Per-user data (streaks, prefs)
    timeline_projects/  — Timeline projects
      {projectId}/
        tasks/          — Timeline tasks
        notes/          — Project notes
```

---

## Gamification

- **Streak** — daily completion streak, weekend-aware. 🔥 badge on greeting bar
- **Hall of Fame** — top 3 streaks. Access: tap streak badge 5×
- **Player Cards** — holographic cards, 13 badges, rarity tiers. Access: cards.html
- **Konami Code** — confetti cannon
- **Snake** — type "snake" in search or tap logo 5×
- **Comms Quiz** — 36 questions, type "quiz" in search
- **Space Defender** — auto-fire shooter, type "space" in search

---

## Weekly Sprint Details

```javascript
// localStorage key
'wd_sprint' → { week: 'YYYY-Www', ids: ['taskId1', 'taskId2', ...] }

// Key functions
getWeekKey()           // returns 'YYYY-Www' based on Monday
loadSprint()           // loads from localStorage, resets if new week
saveSprint()           // saves to localStorage
window.toggleSprintTask(taskId)  // add/remove task from sprint
window.toggleSprintPanel()       // collapse/expand sprint section

// Constants
const SPRINT_MAX = 10
let sprintTaskIds = new Set()  // MUST be declared before loadSprint() is called
let sprintOpen = true
```

**Critical:** `sprintTaskIds` and `sprintOpen` must be declared **before** `loadSprint()` is called, otherwise you get `ReferenceError: Cannot access 'sprintTaskIds' before initialization`.

---

## Known Issues & Lessons Learned

1. **Firebase auth** — if page loads but shows all zeros, check Authorized Domains in Firebase Console
2. **Service worker caching** — if changes don't appear after upload, clear browser cache + cookies. The sw.js uses pass-through (no caching) with `self.skipWaiting()`
3. **Filter dropdown z-index** — the dropdown is at body level (not inside .filter-wrap) using `position:fixed` to avoid being clipped by parent containers
4. **Sprint variable order** — `sprintTaskIds` must be declared before `loadSprint()` call
5. **ideas.html Firebase** — uses `getDb()` from firebase.js + direct Firestore CDN imports. Does NOT re-initialise Firebase app
6. **_doSave function** — in input.html, handles actual task save. Called directly for new tasks, or via `window.forceSaveTask()` after duplicate confirmation
7. **Python str_replace failures** — exact string matching is sensitive to whitespace. Always read the exact content with sed/grep before replacing
8. **iamharshit.com** — this is Harshit's personal portfolio domain. WorkDesk is at iamharshitb.github.io/workdesk-pwa. Both resolve but GitHub Pages is the source of truth

---

## Developer Preferences

- **Single-file deliverables** — never split into multiple files unless absolutely necessary
- **No build tools** — no webpack, no npm, no bundlers
- **Always syntax check** before sharing files using `node --check`
- **Preserve all existing functionality** when adding new features
- **Firebase CDN version:** `10.12.0` — use consistently across all files
- **Git workflow:** Upload files via GitHub web UI (Add file → Upload files). No VS Code access on this system currently
- **Test URL:** https://iamharshitb.github.io/workdesk-pwa/
- **Harshit's GitHub username:** iamharshitb

---

## How to Start a New Chat

1. Share this file with Claude at the start of the conversation
2. Upload the specific HTML/JS/CSS file you want to modify
3. Describe what you want to change
4. Claude will read the file, make the change, syntax check it, and share it back

Example opener:
> "I'm continuing development on WorkDesk PWA. Here is the CLAUDE.md with full context [attach file]. I want to modify [filename] to [description of change]. Here is the current file [attach file]."
