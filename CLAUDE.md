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

**Default theme:** Light / Health (`theme-health`) — `#eef0f6` base + gradient mesh, iOS blue `#007aff` primary  
**CSS variables (from style.css `:root`):**
- `--bg`, `--bg2`, `--bg3` — background layers
- `--panel` — card/panel background
- `--border`, `--border2` — border colours
- `--neon` — primary accent (blue)
- `--text`, `--text2`, `--text3` — text hierarchy
- `--red`, `--amber`, `--green`, `--purple` — semantic colours
- `--rr` — large border radius (cards), `--r` — small border radius
- `--sans` — Inter, `--mono` — DM Mono

**Fonts:** Inter (body/headings), DM Mono (numbers/timers). Loaded via `@import` at the top of `style.css`. *(Earlier versions of this doc claimed DM Sans / Syne / JetBrains Mono — that was never what the code loaded.)*

### Motion tokens — use these, don't hardcode timings

```
--dur-fast   .15s   colour / opacity only (no travel)
--dur-base   .24s   anything that moves or scales
--dur-slow   .36s   panels, sheets, layout shifts
--ease-out     cubic-bezier(.22,1,.36,1)     default — entrances & most UI
--ease-spring  cubic-bezier(.34,1.56,.64,1)  confirmations & taps (slight overshoot)
--ease-inout   cubic-bezier(.4,0,.2,1)       looping ambient animations
```

Every `transition` in `style.css` and `index.html` now routes through these. Previously 46 transitions were hardcoded `.15s` — snappy but characterless, and the reason the app felt utilitarian rather than polished. **If you add a transition, use a token.**

`@media (prefers-reduced-motion: reduce)` in style.css kills all motion and switches ambient loops off entirely. Any new ambient/looping animation should be added to that block's selector list.

### Glass tokens

```
--glass-bg     surface fill (translucent)
--glass-blur   blur(20px) saturate(180%)
--glass-edge   inset highlight along the top edge
```

**Glass only works if something is behind it.** Light theme's `body` has a three-stop radial gradient mesh (`background-attachment:fixed`) specifically so translucent surfaces have something to reveal. Before this, `theme-health` set `background-image:none` over a flat `#f2f2f7` and made panels `#fff` opaque — so every `backdrop-filter` in the theme was a no-op costing a compositing layer for zero visual gain. **If you ever flatten the body background, the glass silently dies.**

Glass is applied to: `.nav`, `.bottom-nav`, `.panel`, `.prog-wrap`, `.toast`, `.install-banner`. It is deliberately **not** applied to `.task-card` / `.task-row-compact` — those are plain translucent fills that composite over the panel's frost. Giving each card its own `backdrop-filter` stacks a blur layer per card and gets expensive on mid-range Android past ~20 tasks.

### Alive layer (bottom of style.css)

Theme-agnostic motion/light effects: progress-bar shine sweep, button sheen on hover (`.send-btn`/`.mark-done-btn`/`.t-go` — these now have `overflow:hidden`, so nothing inside them can poke outside the pill), press-compress physics, stat-pill hover lift, task-detail unfold, nav icon spring, staggered panel entrance, animated gradient on the greeting name (`.g-name`, with `@supports` fallback), sprint 🎯 breathe, and `.just-done` settle (applied by `toggleIndividualDone`, self-removes on animationend). Haptics: `navigator.vibrate` on task-done (12ms) and sprint-add (10ms) — no-ops where unsupported, including all of iOS Safari.

Rules: effects here must only use tokens, white-gradient overlays, and transform/opacity animations (GPU-cheap). Every ambient loop added here must also be switched off in BOTH `prefers-reduced-motion` blocks in style.css. The nav active indicator is `.bn-item.active::after` and carries `translateX(-50%)` — any animation on it must include that transform in its keyframes or the line jumps off-centre.

### Shadow tokens

`--shadow-card` / `--shadow-elevated` / `--shadow-neon`, layered (contact + ambient) and **tinted to the surface**, not black.

⚠️ **Light themes MUST override `--shadow-elevated`.** The `:root` default is `rgba(0,0,0,.6)` — built for the old near-black Standard theme. It used to leak into Light theme (which only overrode `--shadow-card`), painting a 60%-black shadow on a white page — it read as a grey smudge on `.task-card:hover` and `.toast`. `:root` is still a dark palette that no selectable theme uses; treat it as the fallback layer, and assume anything a theme doesn't override falls through to dark values.

---

## Themes (5 total)

| ID | Name | Description |
|----|------|-------------|
| `health` | Light | iOS Health pastel white + gradient mesh (default) |
| `frosted` | Frosted Glass | Heavy blur, translucent |
| `editorial` | Editorial | Inter font, #F3F3F5 bg, Linear/Notion style |
| `neu` | Neumorphism | Soft UI on #e0e5ec clay; `--neu-out`/`--neu-in` shadow pairs define raised vs pressed — no borders anywhere, `--glass-blur:none` (opaque material), body background MUST stay flat or the light model breaks. Contrast is the style's endemic weakness: text alphas (.85/.8) and accent #2d56d8 are measured AA minimums — don't lighten them |
| `glass` | Glassmorphism | Showcase glass: aurora blobs drift on `body::before` (transform-only animation, `position:fixed` for free parallax), panels get a `::after` refraction streak. Task cards deliberately have NO backdrop-filter (per-card blur cost — see theme-health note) |

Themes are in `css/themes.css`. The THEMES array is in `js/theme.js`. Applied as body class e.g. `body.theme-editorial`.

**Removed (previously 7 total):** Standard (empty id), iOS Fans (`bigsur`), Dark (`ios-system`), and Neon (`neon`) were removed from the picker and stripped out of `css/themes.css`. A few orphaned/unused theme blocks (`theme-ios`, `theme-ember`, `theme-matrix`) still sit in `css/themes.css` from earlier iterations but are unreachable from the UI — leave alone unless asked to clean up further.

---

## Navigation Structure

**Bottom nav (all pages):** Dashboard / Input / Calendar / Report  
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
```

**Deprecated:** `timeline_projects/` (and its `tasks/`/`notes/` subcollections) is orphaned data left over from the removed Timeline page. Nothing in the app reads or writes it anymore — safe to ignore, or delete manually in the Firebase Console if you want to tidy up.

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

**Per-user, synced via Firestore** (changed from localStorage — see below). Each person's "This Week" list lives on their own Firestore user doc, the same doc used for Quick Notes and `broadcastEnabled`:

```
workspaces/{WORKSPACE_ID}/users/{userNameLowercase}
  { notes, broadcastEnabled, sprint: { week: 'YYYY-Www', ids: ['taskId1', ...] } }
```

Because it's keyed by lowercase name (not device), the same person's sprint syncs across all their devices, while staying completely separate from every other team member's list — nobody sees anyone else's "This Week" selections.

```javascript
// Key functions
getWeekKey()           // returns 'YYYY-Www' based on Monday
initSprint()           // call once MY_NAME is confirmed — loads from Firestore
                       // + wires onUserDataChanged live listener (guarded by
                       // _sprintInitialized so it only wires once, even though
                       // the surrounding onTasksChanged block re-fires on every
                       // task update — see "loader re-fire" note below)
saveSprint()           // writes { sprint: {week, ids} } to this user's Firestore doc
window.toggleSprintTask(taskId)  // add/remove task from sprint
window.toggleSprintPanel()       // collapse/expand sprint section (local UI state only)

// Constants
const SPRINT_MAX = 10
let sprintTaskIds = new Set()
let sprintOpen = true
```

**"Loader re-fire" gotcha:** the block that calls `initNotes()` / `initSprint()` lives inside the `onTasksChanged` callback, gated by `if (loader) {...}` — but `loader.style.display='none'` never actually removes the element, so that whole block (including `initNotes()` and `onAnnouncementChanged(...)`) re-runs on **every** task snapshot, not just once. `initNotes()` already re-attaches its textarea listener each time (pre-existing, harmless-ish). `initSprint()` is explicitly guarded with `_sprintInitialized` so it only calls `getUserData`/`onUserDataChanged` once per session — don't remove that guard, or sprint sync will pile up duplicate Firestore listeners over a long session.

**Previously (until [this session]):** sprint data was stored in `localStorage` under `wd_sprint` — per-device, not per-person, and never synced. Migrated to Firestore because tasks marked "This Week" on one device weren't showing up on the same person's other devices.

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
9. **Sprint duplicate-render glitch (fixed)** — a task added to "This Week" renders a second time inside the Sprint section via the same `myTaskCard()` function, producing duplicate DOM ids (`trc-`, `trx-`, `trd-` + taskId). `toggleSprintTask()` now calls `expandedTasks.delete(taskId)` before re-rendering so the card collapses instead of staying stuck open. If more sprint-related glitches show up, this duplicate-id situation is the likely root cause
10. **PWA install prompt** — index.html now has custom install-banner logic (`#install-banner` + script near the bottom) instead of relying on the browser's automatic mini-infobar. iOS Safari never fires `beforeinstallprompt` — the banner shows manual "Add to Home Screen" instructions there instead. Android/desktop Chrome shows a real Install button via the captured `beforeinstallprompt` event. Dismissal is remembered in localStorage (`wd_install_dismissed_at`) for 14 days
11. **`toast()` scope** — `toast()` is defined inside the `<script type="module">` block in index.html and is explicitly assigned to `window.toast` so plain (non-module) `<script>` blocks lower on the page can call it. Any future module-scoped helper that needs to be called from a plain script must be exposed on `window` the same way
12. **Re-render cascade (fixed)** — `renderMyTasks()` rebuilds the entire list with `el.innerHTML = ...` and is reached from `renderAll()`, which fires on **every task change by any teammate** via `onTasksChanged`. Two consequences were fixed:
    - Every card replayed its `.fi` staggered fade-up on each sync, so a colleague marking a task done made your whole screen flicker. Cards now animate only on first mount, gated by `_animatedCards`; the stagger itself is gated by `_firstPaintDone` so later arrivals appear immediately.
    - The inline edit panel's open state lived only in the DOM (`classList.toggle('open')`) and inputs rendered from the task object, so a background sync closed the editor and **discarded unsaved typing**. Open state is now `_openEditId`, keystrokes go to `_editDraft`, priority to `_editPriority`, and `_captureEditFocus()`/`_restoreEditFocus()` preserve caret position across the rebuild.

    If you touch `renderMyTasks`, keep all four (`_animatedCards`, `_firstPaintDone`, `_openEditId`, `_editDraft`) intact — they're the only thing making live sync non-destructive. The real long-term fix is keyed DOM reconciliation instead of `innerHTML`.
13. **CSS load order** — `style.css` no longer `@import`s `themes.css`. Every page already has its own `<link>` for both, so importing it too loaded 56KB twice and made the cascade ambiguous (which is likely why themes accumulated ~100 `!important` overrides). Order is now: `style.css` (base + tokens) → `themes.css` (overrides). **Don't re-add the `@import`.** Note `quiz.html`, `snake.html`, `space.html` load neither stylesheet — they're standalone.
14. **Backticks inside template literals** — `myTaskCard()` is one big template literal. An HTML comment inside it containing a backtick (e.g. writing `` `t` ``) silently terminates the string and throws a confusing `Unexpected identifier` at a line number far from the real problem. Always `node --check` the extracted module script after editing that function.

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
