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

## Current UI (Oct 2026 redesign) — READ THIS FIRST

**Status:** all eight app pages (Home, Add, Calendar, Projects, Report, Help, Backup, Ideas) were rebuilt on one shared component layer. Where the older sections further down (Design System, Navigation Structure, Key Features markup details, Known Issues #16) describe the retired themes, the Alive layer, the top nav bar, the colour picker or old class names, **this section wins**. The lower sections are still the reference for data model, Firestore, gamification, duplicate detection, report maths and other logic — none of that changed.

**Goal the user set:** "doesn't look cluttered at all and should look clean and pleasant to viewers." One idea per row, folds for anything secondary, no decoration that doesn't carry meaning.

### Look: two themes plus Auto

| | Fair copy (light) | Azure (dark) |
|---|---|---|
| Class on `<html>` | `theme-light` (also the `:root` default, so first paint is never unstyled) | `theme-dark` |
| Font | Hanken Grotesk | Plus Jakarta Sans (400–800) |
| Surfaces | paper `#FFFFFF`, mist `#F5F7FA`, rule `#E3E7EE` | midnight page `#00000C`, navy cards and sheets `--bg2 #171D3D`, chips and off-toggles `--bg3 #222A52`, no shadows |
| Text | ink `#1F2B47`, pencil `#5C6883` | `#FFFFFF`, `--text2 #A9B2D6`, `--text3 #8590BC`; text that sits on the glow is `#E6EDFF` |
| Accent | ink (no accent colour) | `--blue #2F6FE0` for fills that carry white text, `--neon #5C93F5` for text, icons and strokes on navy |
| Late | red-pen `#D4332B` — **red only ever means late** | coral `--late #FF9E8F` — **coral only ever means late** |
| Project colour | `--hue-blue #2F6FED`, `--hue-amber #C77D0A`, `--hue-fern #2E9A6B`, `--hue-violet #7A5AE0` — **glyphs and dots only** | all four `--hue-*` equal `#A9B2D6` (colour is dropped; shape and position carry meaning) |
| The one loud thing | none | the blue glow at the top of the page and the glass hero that shares its light source |

Design rules that follow from this: **shape is status** (the four glyphs), **colour is project** (Light), **red (Light) / coral (Dark) is only "late"**, **blue (Dark) means "you can act on this" or "this is selected"**. Don't add a new accent colour, and never use a project hue as a fill or text colour.

**Azure, in one paragraph (Oct 2026):** `html.theme-dark body` is transparent over a 400px `body::before` radial glow (brightest at the top right, `radial-gradient(110% 100% at 88% 0%, …)`). Home's summary is a glass hero (`.wd-sum`): a small "Week slots" label (`.lab`), a 60px numeral (`.num`, e.g. 6/10), ten slot bars (`.wd-slots`, filled white, free at 40% white), one status line and a smaller line under it. Under it sit four round blue quick actions (`.wd-qa-b`: Focus timer, Quick notes, Plan week, Ideas, wired by `quickAction()` in `index.html`). Task groups are one navy card each (`.wd-tasks`, radius 24; `.flat` is the borderless variant inside Team's member rows) with the status glyph leading each row. The bottom bar is docked full-width with a blue marker over the active page. Selected tabs, chips and folds are blue; on the glow itself selected filter chips are white because blue would vanish. Projects shows two stat cards (`.prj-stat`: Done and In progress, a pale-yellow `#F1EE9F` track, blue fill and a % pill). All the extra hero/stat/quick-action markup is `display:none` outside `html.theme-dark`, so Light renders exactly as before.

- Appearance is **Light / Dark / Auto**, stored in `localStorage.wd_mode`. `js/theme.js` migrates the legacy `wd_theme` once (old dark themes → dark, everything else → light) and then deletes it. The six old themes and "Run of show" are retired; `themes.css` is now ~240 lines defining only these two skins plus token re-pointing for the legacy components still in `style.css`.
- Fonts come from the `@import` at the top of `themes.css`. Load order on every page: `style.css` → `themes.css` → `ui.css`.
- `<meta name="theme-color">` is kept in sync by `theme.js` when the resolved theme changes. `manifest.json` `theme_color` and `background_color` are both Azure's page `#00000C` (a manifest can't follow the theme, and the icon is built for the dark canvas).

**Brand: the Desk ring (Oct 2026).** The icon is a progress ring (the same ring Home draws) resting on a desk line, on the Azure glow gradient, so the icon and the dark theme share one light source. One glyph, three tunings, all in `icons/`:

| File | Use |
|---|---|
| `icon-mark.svg` | Rounded tile. The app-bar mark (`img.wd-mark`) and the splash |
| `favicon.svg`, `favicon.ico` (16/32/48), `favicon-16/32.png` | Browser tab. Heavier strokes than the mark so the ring survives 16px |
| `icon-192.png`, `icon-512.png` | Manifest `any`. Rounded, transparent corners |
| `maskable-192.png`, `maskable-512.png` | Manifest `maskable`. Full bleed square, glyph scaled to 88% so it sits inside the 80% safe circle |
| `apple-touch-icon.png` | 180px full-bleed square. iOS rounds it itself |

The app-bar lockup is `a.wd-brand` > `img.wd-mark` + `span.wd-name` (`<b>Work</b><i>Desk</i>`), set in Plus Jakarta Sans 800 / 500 so it is live text, crisp in both themes, and needs no filter or blend mode. "Desk" is `#2B66D8` in Light (4.8:1 on the mist pages, 5.3:1 on white) and the pale `#E6EDFF` in Dark, because blue text would fall under 4.5:1 on the glow. On Home the anchor keeps `id="nav-brand-tap"` (the five-tap Snake egg). To change the artwork, edit the glyph in one place and re-export every size from it; don't hand-edit a PNG. Every app page carries the same three head links (`favicon.ico`, `favicon.svg`, `apple-touch-icon.png`).

### Shared layer (the files you'll actually edit)

| File | Role |
|---|---|
| `css/ui.css` (~1000 lines) | All `wd-*` components (page frame, tabs, segmented control, summary line + ring, groups and task rows, folds `.wd-disc`, bottom nav `.wd-nav`, sheets, buttons, chips, forms, skeleton) plus one clearly banner-commented block per page: Calendar, Report (`.rpt-*`, **reused by Projects/Ideas/Backup**), Projects (`.prj-*`, merge sheet `.mg-*`), Help (`.hlp-*`), Backup (`.bk-*`), Ideas (`.idea*`). Add new page CSS as a new banner block at the bottom, not in the pages. |
| `js/ui.js` | Pure helpers, no Firebase: `esc`, `initials`, `ICON`, `glyphSVG(status,size)`, `STATUS_LABEL`, `ringHTML(pct,size,stroke,label)` (draws no foreground arc at 0%), `openSheet/closeSheet/sheetBody`, `showUndo(msg,onUndo,ms)`, `showNote`, `profileSheetHTML/openProfileSheet`, date helpers (`localDateStr`, `dateFromStr`, `dayDiff`, `dueLabel`, `shortDate`, `longDate`, `dayMonth`), `projHue(name)`, `urgencyClass(status,due)`, `PRIO_ORDER/PRIO_LABEL`, `othersText`. |
| `js/shell.js` | `initShell()` — used by every page except Home: theme, audio, avatar initials on `#me-btn`, and the profile sheet (Sound toggle, Ideas, Help, Backup and restore). |
| `js/theme.js` | Mode storage and resolution (`getMode/setMode/resolvedTheme/initTheme/onThemeChange`, `appearanceControlHTML`). `toggleThemePanel` is still exported only because Home's import list names it. |
| `css/style.css` | Legacy component CSS. Kept because the easter-egg game pages and a few legacy classes still depend on it. Don't extend it. |

**Page chrome (every page):** `header.wd-appbar` (logo → Home, avatar button `#me-btn`) and the bottom `nav.wd-nav` with five items — **Home / Add / Calendar / Projects / Report**. Ideas, Help and Backup are no longer in the nav; they live in the avatar's profile sheet. The old top nav bar, 💡 FAB and 🎮 hint icon are gone.

### Pages

- **Home (`index.html`)** — title "This week" (tap = greeting easter egg), search toggle + India/Germany clocks, `Mine | Team` tabs (Team replaces the old By Member view; under each person's open tasks a quiet **Done** row opens their finished work, newest first, via `memberDoneEntries`), summary line with ring, task groups by urgency. **"This week" is the Weekly Sprint**: tasks pinned from the **Backlog** fold (max 10 active, completing one frees a slot, resets every Monday; **on Saturday and Sunday `getWeekKey()` already returns the coming Monday's week, so weekend pins plan next week** and the list shows empty until Monday; `getWeekKey` exists in both `index.html` and `input.html`, keep them identical) are what the main list shows; On hold and Done are their own folds. The pin list is stored per person in Firestore user data (`sprint: {week, ids}` via `getUserData/onUserDataChanged`), **not** localStorage. Tapping a **status glyph** marks *your part* done with an **Undo toast**; tapping a row opens the task sheet (`task-sheet`; editing is a second sheet). The focus-timer pill appears in the appbar only while the timer runs; timer, quick notes, announcements, reminders, streak and the Hall of Fame/easter eggs are **Home-only** and live in sheets/overlays. Home's profile sheet is richer than `shell.js`'s (adds Task notifications, Focus timer, Quick notes and admin Post-an-announcement rows).
- **Routines (added Oct 2026):** a task with `routine: true` repeats every week. No templates, no spawned copies: it is the same task, reset lazily. Fields: `routine`, `routineWeek` (the week key its current state belongs to), `routineDoneWeeks` (weeks it was finished, newest last, max 104). `js/routines.js` holds `isRoutine`, `weekKeyOf(date)` (same Sat/Sun roll-forward as `getWeekKey`), `routineOn()/ROUTINE_OFF`, `routineDoneCount` and `rolloverRoutines(tasks, updateTask)`. Rollover runs on every task snapshot on Home and Add and at midnight on Home: any routine whose `routineWeek` is not the current week goes back to `todo` (On hold stays), `memberStatus` all `todo`, `completedAt` null, and the old week is appended to the history if it was done. If it was already completed this very week by another page it is just restamped. Routines have `taskDueDate: null` so they never read late; rows show "Every week". They sit in their own **Routine** group at the top of This week (Home) and are excluded from Backlog, from the pin list and from `activeSprintCount` (both pages), so they never use a slot. The hero numeral and slot bars count pinned tasks only; the sub line adds "N of M routines done" and the ring counts routines on top of the slots (identical to before when there are none). Switch: chip "Repeats every week" on Add (hides Due), chip in Home's edit sheet, and "Repeat every week / Stop repeating" in Home's task sheet (assignees or admin; has Undo). Done history shows as "done N weeks so far".
- **Deleting and the week count (Oct 2026):** `activeSprintCount` (both pages) skips ids whose task no longer exists once the first snapshot has arrived (`_tasksReady`; before that they still count so the number never dips on load), so a deleted task frees its slot even if another person deleted it. Deleting from Home or Add also removes the id from your own week and saves it. Home's task sheet has a **Delete task** button (`openDeleteTask` → `task-del` password sheet → `fbDeleteTask`, same password rule as Add). The admin's **Add to / Remove from X's week** buttons show for **every** assignee (no cap of three) in Home's task sheet and in Add's task sheet (Add carries a port of `memberSprintCache`/`loadMemberSprintCache`/`toggleMemberSprintTask`); both sheets load the cache when they open.
- **Edit lives in the expanded view, not on the row (Oct 2026):** Home's rows carry no edit control (a pencil on every row was tried and rejected as clutter). **Edit details** is the first button in the task sheet's grid (Home and Add). Add's project dropdown lists only projects that still have a **live** task (`tasks`, not `allTasksHistory`): finished tasks older than 90 days are archived, a merge only renames live tasks, and the history would bring merged-away names back. Dropdown items select on `click` (never `pointerdown`, which picked whatever was under your finger when you started a scroll) and `.wd-drop` has `touch-action: pan-y; overscroll-behavior: contain`.
- **Add (`input.html`)** — MBC / Individual toggle, project field with smart dropdown, member chips, priority chips, dates, duplicate-detection sheet (`_doSave`, `window.forceSaveTask`), `?project=` pre-fill. The full task list is a **folded "All tasks" row** at the bottom with the date-range filter inside it. Delete uses a confirmation sheet.
- **Calendar (`calendar.html`)** — month grid, event-type filter chips, portrait/landscape toggle (`localStorage.calView`), Year History fold, add/edit event sheet with the auto-task option.
- **Projects (`projects.html`)** — chip row (one chip per active project, overdue dot via `.prj-late`), one panel for the selected project (ring, stats, health, per-member breakdown, task folds), "Completed projects" fold at the bottom, New/Edit project sheet. Portrait/landscape toggle (`localStorage.projView`, grid under `body.proj-wide`). Data model unchanged (`projectMeta/{btoa(name)}`, `keyFor`, `getProjects/setProjectComplete/reopenProject`) **except colour: the 8-colour picker was removed on purpose.** A project's colour is now `projHue(name)` — a stable hash into the four hues. `projectMeta.color` is no longer read or written; existing values just sit unused in Firestore. Ticking a task's glyph here uses the same Undo pattern.
  **Merge (added Oct 2026, replaced Groups):** the **Merge** link under the title opens a sheet (`openOrganise` in `projects.html`, kept under its old name because the link calls it): tick two or more active projects, or tap *Review* on a suggestion (earlier groups first, then names that start with the same word, via `suggestMerges`), type the merged name (prefilled from the shared leading words, else the biggest project's name; description and target date prefilled from the biggest project) and confirm. A project page also has **Merge into another project** (`openMergeInto`; the chosen project keeps its name, details and date; same-first-word projects are listed first and the biggest of them is pre-picked). `mergeProjects(sources, target, {description, targetDate})` does the work: (1) `updateTask(id, {project: target})` for every task of the merged-away names, including routine and Individual tasks (any failed write is rolled back and nothing else happens); (2) sets the target's `projectMeta` doc (`group` cleared), **deletes the old names' `projectMeta` docs and completion docs** (a project is listed if tasks, projectMeta or the completion collection mention it, so leftovers would appear as ghost projects). The merged project is always open. **Undo (8s) restores task names, meta docs and completion docs from a snapshot; after that a merge is permanent**, so there is no Unmerge. Names that others later type into Add, and Calendar's auto-tasks (`<type> Communications`), can recreate an old name as a new project. The old Groups UI is gone; a legacy `projectMeta.group` value is only read to suggest a merge and is cleared when merged. Backup restore would bring old names back.
- **Report (`report.html`)** — Quarterly (default) / Monthly / Weekly / Performance behind the same tab control; Chart.js loaded from the CDN; PDF/Share/Copy exports unchanged in behaviour.
  **Create slide (added Oct 2026):** the **Slide** button in the title row (icon-only below 360px) opens a two-step sheet from `js/slide.js` (`openSlideBuilder(allTasks)`). Step 1: period (Month / Quarter / Custom) and the person ranks up to 4 projects by tapping them in order (rank is chosen per report, never stored on the project), plus a switch that groups the rest as "Other work". Step 2: a scaled HTML preview (`slideHTML`, a 1280x720 twin of the file), an editable headline, and a fold "Edit task wording" (per-task text and Hide, held in `state.edits`; app tasks are never changed). Only tasks finished in the period appear (`completedAt`, falling back to the middle of `month`; MBC tasks only, routines excluded); each box also shows up to 2 open tasks as "Still in progress" (in progress first, created on or before the period end, current status). Box sizes come from fixed `LAYOUTS` keyed by rank count (`'4o'` = 4 plus Other); colours come from `SCHEMES` (7 named sets, Indigo first; each has 5 pairs: rank 1 to 4 and "Other work"; every pair 5.18:1 or better; don't use project hues or theme colours, a slide must look the same in both themes). **Colour rotation (Oct 2026):** each finished download moves to the next scheme, so one only returns after six others. The index is in `localStorage.wd_slide_scheme` (this device only) and the switch "New colours with every download" is `wd_slide_auto` ('0' = off); a swatch row in the preview picks one by hand. Add new schemes at the END of `SCHEMES` so the order never shifts, and check every pair's contrast. **Effort split (Oct 2026):** the title is "Where the team's effort went in <month>" (no year for a month in the current year; shrinks to fit one line), a 30px strip under it is split by share of finished tasks (largest-remainder percentages that add to 100; `buildStrip`; in the file one editable shape per segment, end segments are a rounded shape over a square block), and each box reads "N tasks finished · P% of the team's effort" (`subText`, counted in `contentHeight` because it can wrap). Unranked work gets a neutral segment even when "Other work" is off. The line under the title is automatic ("N tasks finished across P projects, in order of priority") until you type your own. The share counts finished tasks, so a big project and a quick one weigh the same. Text is fitted by measuring with Arial on a canvas (wider than Calibri), line height 1.3, 13px minimum, then tasks are dropped and "+N more" is added. Output: PptxGenJS 3.12.0 loaded on demand from jsDelivr, **`LAYOUT_WIDE` (13.33x7.5in; `LAYOUT_16x9` is only 10in wide and crops the slide)**, one `roundRect` text shape per box with real editable text, file `WorkDesk-slide-<period>.pptx`. To check the file, convert it with LibreOffice and look at the page; don't trust the HTML preview alone.
- **Help (`help.html`)** — rewritten as folded sections (`.hlp-fold`) with a glyph legend. Keep wording accurate: timer, notes and streak exist on **Home only**, not in every profile sheet.
- **Backup (`backup.html`)** — Export / Restore / History (`localStorage.wd_backup_history`), confirm sheet `bk-confirm`. Listeners are attached with `addEventListener` (the old inline `onchange` was unreachable from a module).
- **Ideas (`ideas.html`)** — quick capture, status chips with counts, expandable ideas with threaded notes, sheets `idea-form` and `idea-del`; Firestore `ideas` and `ideas/{id}/notes`.

### Conventions and gotchas

1. **`[hidden]` is overridden by any class that sets `display:flex/grid`.** Every such component needs its own `.cls[hidden]{display:none}` rule. This bit us repeatedly (chip rows, folds, sheets).
2. **Light-theme fold stacking:** consecutive `.wd-disc` rows are tightened into one run of hairlines with `html.theme-light … { margin-top:0 }`. If a new fold sits next to existing ones, add its sibling selector to that rule, and add a `tight` class when it follows a fold (see `renderPanel` in Projects). When overriding in a page block, match the specificity (`html.theme-light body.proj-wide …`) or the light rule will beat you.
3. **Don't style by `:first-of-type` for these sections** — it never matched; use the adjacent-sibling pattern (`.wd-sub + .hlp-fold`).
4. **Dark mode can't use colour for state, except coral for "late".** Project hues are all one grey, so anything that was "a coloured dot" needs `currentColor` or a lightness change in dark (e.g. `.prj-late`). `--late` is the only dark-mode colour that carries meaning.
5. **Empty states say less:** omit labels that would repeat ("No tasks yet" three times) and leave the right-hand column empty.
6. **Skeleton first:** pages ship a `.wd-skel` block as initial HTML; real render replaces it.
7. **Service worker:** `sw.js` (labelled v12) is pass-through — it deletes caches on activate and never serves stale files, so CSS/JS changes need **no service-worker bump**. But browsers (and GitHub Pages, ~10 min) cache `css/ui.css`, which once left a phone with the new HTML and an old stylesheet (the Create-slide sheet showed unstyled). Every page therefore links `css/ui.css?v=YYYYMMDD`: **change that date on all pages (`sed -i`) whenever you edit `ui.css`**. JS modules are fetched fresh by import and don't need it.
8. **Firebase and sounds modules are the user's own** — `js/firebase.js` and `js/sounds.js` were never changed or regenerated by the redesign; every page imports them as before.
9. **Pre-existing quirks deliberately left alone:** `recordTaskCompletion(MY_NAME)` credits the *viewer* when an admin ticks a teammate's part; `calendarEvents` is never populated on Home.
10. **Dark task rows: one card per group, never overlapping pills.** An earlier dark skin stacked pills with a negative margin and it read as clutter on a phone. In Azure, `html.theme-dark .wd-tasks` is a single navy card (radius 24) holding the group's rows, rows are `min-height: 66px` with a two-line title clamp, and urgency is written in the due label (coral and bold when late, bold white when due today) rather than in a fill. No drop shadows. Don't reintroduce overlap or a fixed row height. Light theme rows are untouched (verified pixel-identical).
11. **The glow and the hero share one light source.** Both are brightest at the top right; the left, where the text sits, stays at or below `#2A5CC8`. If you move one, move the other, and re-run the contrast probe: white text on the hero and `#E6EDFF` text on the glow must stay at 4.5:1 (3:1 for the 60px numeral).
12. **Dark nav is a docked bar, not a capsule.** `html.theme-dark .wd-nav` is full width, 11.5px labels always visible, and the active item gets a blue 3px marker (`a.on::before`) and blue text. A new nav item must keep the shape SVG, then label text.
13. **Accessibility is part of the skin, not an afterthought.** Keep these: focus ring is `--focus` (white in dark, blue in light) and field focus is a 2px ring; `html { scroll-padding-bottom: 104px }` so the fixed bar never covers a focused control; small controls get their hit area from a `::after` (`.wd-av`, `.wd-link`), never from min-height, which would change the layout; `openSheet` names the dialog (from `.wd-sheet-title`, else `SHEET_NAMES` in `ui.js`), moves focus into it, traps Tab, closes on Esc and returns focus to the opener; the page wrapper is `role="main"`; toasts are `role="status"`; Add's placeholder-only inputs carry `aria-label`; `.prj-acts` wraps so nothing scrolls sideways at 320px.

### Working on this UI (how it was built and checked)

- The redesign was produced by small **re-runnable Python build scripts**, one per page (`build/<page>/`), that took the previous page, dropped its `<style>` block and spliced in `body.html`, the page's JS module, the SW registration script and the bottom nav. Edit the output HTML directly from here on; the scripts are not part of the repo.
- Verification was done in **real Chromium via Playwright** (not jsdom): every page in both themes, zero console errors, interaction tests for sheets, undo, folds, project create/complete, backup restore, idea create/delete and Add's delete sheet. The harness stubs `js/firebase.js`/`sounds.js`, blocks the service worker, serves fonts locally and routes the Chart.js CDN. If you rebuild that, hide the fixed `.wd-nav` before full-page screenshots.

### Left for later

- The old Home's **Follow-up** tab was not carried over. The older Home notes further down (Sprint, Known Issues #9, #12, #15, #17) describe markup that no longer exists — `myTaskCard`, `renderMyTasks`, `toggleTaskExpand`, `_animatedCards` and `_firstPaintDone` are gone; `_openEditId`/`_editDraft` remain and still protect an open edit sheet from live-sync re-renders. The Firestore and logic behaviour they describe is still valid.
- **Easter-egg pages** (`cards.html`, `snake.html`, `quiz.html`, `space.html`) were not part of the redesign and have not been checked against the two new themes — they load `style.css` + `themes.css`, whose old theme selectors are gone.
- Light stays Fair copy. It was kept deliberately; don't restyle it without approval, and check any shared-CSS change against it pixel-for-pixel.
- Files in this folder are only the ones that changed; `manifest.json`, `js/firebase.js`, `js/sounds.js` and the game pages stay as they are in the repo.

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
├── index.html          — Home ("This week": Mine / Team)
├── input.html          — Add task, with duplicate detection and a folded "All tasks" list
├── calendar.html       — Communications calendar
├── projects.html       — Projects (chip row + one panel per project)
├── report.html         — Reports (Quarterly / Monthly / Weekly / Performance)
├── ideas.html          — Ideas
├── help.html           — Help (folded sections)
├── backup.html         — Backup & restore
├── cards.html          — Player Cards (easter egg; not part of the redesign)
├── snake.html          — Snake game (easter egg; not part of the redesign)
├── quiz.html           — Comms Trivia Quiz (easter egg; not part of the redesign)
├── space.html          — Space Defender game (easter egg; not part of the redesign)
├── CLAUDE.md           — This file
├── manifest.json       — PWA manifest (Azure colours; any + maskable icons)
├── icons/              — Desk ring: icon-mark.svg, favicon.svg/.ico/.png, icon-192/512, maskable-192/512, apple-touch-icon
├── sw.js               — Service worker v12 (pass-through, no caching)
├── css/
│   ├── style.css       — Legacy component CSS (still needed by the game pages; don't extend)
│   ├── themes.css      — Fair copy (light) + Azure (dark) tokens
│   └── ui.css          — Shared wd-* components + one block per page
└── js/
    ├── firebase.js     — All Firestore functions and exports (user's file, untouched by the redesign)
    ├── sounds.js       — Audio functions (user's file, untouched by the redesign)
    ├── routines.js     — Routine helpers: weekKeyOf, isRoutine, rolloverRoutines (weekly reset), history count
    ├── slide.js        — Report "Create slide": ranking sheet, preview, PowerPoint export (PptxGenJS from jsDelivr)
    ├── theme.js        — Light / Dark / Auto mode (wd_mode)
    ├── ui.js           — Shared helpers: glyphs, rings, sheets, undo toast, dates, projHue
    └── shell.js        — initShell(): theme, audio, avatar and profile sheet (all pages except Home)
```

---

## Design System

> **SUPERSEDED (Oct 2026 redesign).** The CSS variables, six-theme material rules, Glass/Alive layer, splash and shadow notes below describe the previous look. The live design system is in "Current UI" at the top of this file. Kept as history, and because `style.css` still serves the game pages. Still valid: motion tokens' reduced-motion rule, tap-target and haptics notes, and the task-notification design (Home only).


**Status bar colour:** `applyTheme()` now also calls `syncStatusBarColor()`, which writes the active theme's `bg` (already defined per-theme for the picker swatch) into `<meta name="theme-color">`. Previously this was a static dark value hardcoded in each page's `<head>`, which looked fine for the old dark-default themes but would clash badly with Neumorphism/Light's bright backgrounds. Don't hardcode `theme-color` in new pages — it's now managed at runtime.
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

**Glass only works if something is behind it.** Azure's frosted look depends on the glow on `body::before` (and `html.theme-dark body { background: transparent }`). If you flatten the body background, every `backdrop-filter` becomes a no-op that still costs a compositing layer.

Glass is applied to: `.nav`, `.bottom-nav`, `.panel`, `.prog-wrap`, `.toast`, `.install-banner`. It is deliberately **not** applied to `.task-card` / `.task-row-compact` — those are plain translucent fills that composite over the panel's frost. Giving each card its own `backdrop-filter` stacks a blur layer per card and gets expensive on mid-range Android past ~20 tasks.

### Alive layer (bottom of style.css)

**Bug that shipped and was fixed:** an earlier version of this section added `.panel { animation: panel-rise ... backwards; }` as a blanket entrance animation. The app already had a working entrance system — `.fi` (`animation: fu ... forwards`), applied per-element with hand-placed `animation-delay` (e.g. `class="panel fi" style="animation-delay:.11s"` on Dashboard's Task Tracker panel and Input's task/summary panels). Both rules have equal specificity (single class) and set the `animation` shorthand on the same elements; `.panel`, being later in the file, won — but its `backwards` fill-mode doesn't persist the end state like `.fi`'s `forwards` does. Once the animation finished, those panels snapped back to `.fi`'s static `opacity:0`, **permanently**. This silently blanked the entire Task Tracker panel (search bar, tabs, My Tasks list, Sprint section) on Dashboard and the task/summary panels on Input — looked exactly like "tasks aren't loading" but was 100% CSS, not a data or Firestore issue.

**Rule going forward:** don't add a competing entrance animation on the bare `.panel` selector — `.fi` already owns that job everywhere it's used. If a new panel needs to fade in and doesn't have `.fi` on it already, add `.fi` to its class list rather than inventing a second entrance system. More generally: before adding an `animation` shorthand to any bare class selector, `grep` for that class combined with `fi` (or any other class that already sets `animation`) — same-specificity shorthand conflicts are cascade-order-dependent and any fill-mode other than `forwards`/`both` will not persist the end state.



Theme-agnostic motion/light effects: progress-bar shine sweep, button sheen on hover (`.send-btn`/`.mark-done-btn`/`.t-go` — these now have `overflow:hidden`, so nothing inside them can poke outside the pill), press-compress physics, stat-pill hover lift, task-detail unfold, nav icon spring, staggered panel entrance, animated gradient on the greeting name (`.g-name`, with `@supports` fallback), sprint 🎯 breathe, and `.just-done` settle (applied by `toggleIndividualDone`, self-removes on animationend). Haptics: `navigator.vibrate` on task-done (12ms) and sprint-add (10ms) — no-ops where unsupported, including all of iOS Safari.

Rules: effects here must only use tokens, white-gradient overlays, and transform/opacity animations (GPU-cheap). Every ambient loop added here must also be switched off in BOTH `prefers-reduced-motion` blocks in style.css. The nav active indicator is `.bn-item.active::after` and carries `translateX(-50%)` — any animation on it must include that transform in its keyframes or the line jumps off-centre.

### Splash screen (index.html only)

Plays once per session on Dashboard load — the app's actual PWA `start_url`, per `manifest.json`. Markup + gating script sit immediately after `<body>`; CSS is in the head `<style>` block (`.splash-screen` etc). Sequence: the Desk ring mark (`icons/icon-mark.svg`, 64px) springs in → a small dot appears → pulses once → **blooms** (`transform:scale(1→120)`) until it fully covers the viewport in the active theme's accent colour → whole overlay fades to reveal the real dashboard, which has been loading/rendering behind it the entire time.

Gating (in the inline script, not CSS, so it never even paints for these cases):
- `prefers-reduced-motion: reduce` → element is removed outright before first paint.
- `sessionStorage.wd_splash_shown` → only plays once per session, not on every bottom-nav tap back to Dashboard.
- Tap anywhere to skip early.

Don't add the splash to other pages — Dashboard is the intentional single entry point. The splash and the app bar both point at `icons/icon-mark.svg`, so there is nothing to keep in sync.

### Skeleton loading

`.skel-block` (generic shimmer, used inline via `style="width:..;height:.."`) and `.stat-pill.skel` (stat number placeholders) — both in the "SKELETON LOADING" block in index.html's `<style>`. Two call sites:
- Stat pills start with class `skel` in the static HTML; `renderStats()` removes it from all four on its first real call. Safe to call every render — `classList.remove` no-ops once already cleared.
- `#my-tasks-list` ships with 3 static skeleton rows as its initial HTML. Nothing removes them explicitly — `renderMyTasks()`'s `innerHTML = ...` wholesale-replaces the container the first time real data renders, so they're just gone.

If you add a new panel that loads async data, follow the same pattern: static skeleton markup as the initial HTML, let the real render's `innerHTML` assignment replace it — don't write extra removal code.

### Tap targets

A few controls were visually small but functionally fine — extended via an invisible `::before`/`::after` hit-area (`position:absolute; inset:-Npx`) rather than inflating the visible element, which would've looked oversized in a compact row. Done: `.trc-expand` (task row chevron, 28px visual → 44px tappable) and `.ann-perm-toggle` (announcement permission switch, 36×20 visual → 44px tappable). If you find another small interactive control, same pattern: add `position:relative` to the base rule, then a pseudo-element with `content:''; position:absolute; inset:-Npx` sized to reach 44px — don't resize the visible element itself.

### Task notifications (index.html only)

**"Lighter" version, deliberately** — no backend, no Firebase Cloud Messaging, no Cloud Functions, no Blaze billing plan. Piggybacks on the `onTasksChanged` Firestore listener that's already running, so it only fires while WorkDesk's JS is alive somewhere on that device (foreground, background tab, or an installed PWA that hasn't been fully closed/swiped away). **It will not wake a locked phone or fire from a fully-closed app** — that needs real push (FCM + Cloud Functions), which was scoped out as a separate, heavier build. If that's ever wanted later, the tradeoffs (Blaze plan, Cloud Console access requirements, the iOS Add-to-Home-Screen requirement for push specifically) were already researched — ask before rebuilding from scratch.

**Critical implementation detail:** notifications are shown via `navigator.serviceWorker.ready.then(reg => reg.showNotification(...))`, **not** `new Notification(...)`. MDN is explicit that the plain constructor throws a `TypeError` on nearly all mobile browsers, including Android Chrome — this is the majority platform for this team, so getting this wrong would have meant the feature silently never worked on anyone's phone while appearing to work fine in desktop testing. `sw.js` (v11+) has a `notificationclick` handler that focuses an existing WorkDesk tab or opens a new one at the dashboard.

Two independent "off" states, both checked by `notifEnabled()`:
- Browser-level: `Notification.permission` (`'granted'`/`'denied'`/`'default'`) — can't be programmatically overridden once denied, only by the person via their browser/site settings.
- App-level: `localStorage.wd_notif_enabled` — lets someone who already granted browser permission mute WorkDesk specifically without touching browser settings. Toggled via the 🔔/🔕 nav button (`handleNotifToggle`), which mirrors the existing mute-button pattern (`updateMuteBtn`/`handleMuteToggle`) right next to it.

Fires from inside `onTasksChanged`'s existing `type === 'added'` + `assignedToMe` branch (the same one that already plays a sound and shows a toast) via `maybeShowTaskNotification(task)` — added as one extra call alongside those, not a separate detection path. Skips itself (returns quietly, not an error) if `document.visibilityState === 'visible'`, since the toast already covers "person is currently looking at WorkDesk."

**Scope limitation:** only wired up on `index.html` (Dashboard). If someone has `input.html` or another page open instead, they won't get notified even if `tasks` changes underneath them — Dashboard was judged the natural "left open" tab. Extending to other pages would mean duplicating the permission UI + `maybeShowTaskNotification` there too.

### Haptics

`navigator.vibrate(ms)` — no-op where unsupported (all of iOS Safari, some Android browsers), so no feature-detection branching needed, just call it. Current touchpoints, all short (8–15ms) and reserved for **state changes**, not routine taps: task marked done (12ms, `toggleIndividualDone`), added to sprint (10ms, `toggleSprintTask`), theme switch (8ms, `js/theme.js` — deliberately on the swatch **click** handler, not inside `applyTheme()` itself, since that also runs on every page load via `initTheme()` and would buzz on every app open), and picking your name on the welcome screen (8ms, `selectWelcomeMember`). Keep new haptics this sparing — vibrating on every tap reads as gimmicky and drains battery; reserve it for moments that deserve a confirmation.

### Shadow tokens

`--shadow-card` / `--shadow-elevated` / `--shadow-neon`, layered (contact + ambient) and **tinted to the surface**, not black.

⚠️ **Any light-background theme MUST override `--shadow-elevated`.** The `:root` default in `style.css` is a dark-palette fallback (`rgba(0,0,0,.6)`); Fair copy overrides it, Azure sets it to `none`. A new light skin that forgets it paints a 60%-black smudge under toasts and hovered cards.

---

## Themes

Two only: **Fair copy** (`theme-light`) and **Azure** (`theme-dark`), chosen with Light / Dark / Auto (`wd_mode`). Tokens live in `css/themes.css`, shape and surface overrides in `css/ui.css`. Every other theme that was tried is gone; `theme.js` maps any leftover `wd_theme` value to light or dark once and deletes it.

---

## Navigation Structure

**Bottom nav (all app pages):** Home / Add / Calendar / Projects / Report (`nav.wd-nav`).  
**Top bar (all app pages):** logo (to Home) and an avatar button. The avatar opens the profile sheet: Appearance (Light / Dark / Auto), Sound, **Ideas**, **Help**, **Backup and restore**. Home's sheet adds Focus timer, Quick notes, Task notifications and, for admins, Post an announcement.  
**Games:** type `snake`, `quiz` or `space` in Home's search, or tap the logo 5× for Snake.

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

> **Note (Oct 2026):** feature *logic* below is current; *markup and interaction details* (tabs, FABs, filter dropdowns, project colour picker, tab strip, nav icons) were replaced by the redesign — see "Current UI" at the top. Specifically: Projects no longer has per-project colours (`projHue(name)`), the 🗂 nav icon and tab strip are now a chip row, and the Home items about Filters button / My Tasks sections / FABs / Follow-up are superseded.

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
- `?project=<name>` query param pre-fills the Project field on load — used by projects.html's "＋ Add task to this project" action
- Member chips + role per member
- Priority chips: Critical / High / Medium / Low
- Start date + due date pickers
- **Duplicate detection** — fuzzy similarity (token overlap + bigram scoring, threshold 38%). Shows warning bottom sheet with matching tasks before save. `_doSave()` handles actual save. `window.forceSaveTask()` for confirmed save
- Existing task list below form

### Report (report.html)
- Tabs, in display order: **Quarterly** (first, and the default tab on open) / Monthly / Weekly / Performance (formerly "My Report")
- Default state lives in 3 places that all had to move together when Quarterly became first/default: `activeRptTab='quarterly'` (JS), `tab-quarterly`/`panel-quarterly` carry the static `active` class in the HTML (not `tab-monthly`/`panel-monthly` anymore), and tab button order in the `.rpt-tabs` markup. `renderActiveTab()` branches on `activeRptTab` and is called at bootstrap (both the top-level call and inside `onUserReady`), so it picks up whichever tab is marked default automatically — no separate "load quarterly on start" call needed. Verified the quarter/year `<select>`s populate before that first render fires: `initQuarterSelectors()` is a synchronous IIFE, `onUserReady`'s callback only fires later via Firebase's async `onAuthStateChanged`, so ordering is safe by construction, not by luck.
- Monthly: ⚙ Filters button (hidden by default), progress ring, 4 Chart.js charts, project sections, Mark Complete, PDF export
- Weekly: digest + Copy for WhatsApp
- **Performance** — gauges either a member's or a project's completion, across Week / Month / Quarter / Overall:
  - `perfMode` state ('member'|'project') toggled via `.perf-mode-btn` → `setPerfMode()`. Swaps the dropdown between members and projects (project mode uses the project **name** as the select value, not an id — projects don't have ids the way members do).
  - `getMyReportTasks(id)` and `renderMyReport()` both branch on `perfMode`. Member mode is unchanged from before; project mode filters `t.project===id` instead of member assignment, and groups results by **contributor** instead of by project (there's only one project in that view).
  - `isDoneForMember(t, memberName)` — extracted helper, respects per-member status on shared tasks (`t.memberStatus[memberId]`) when present, falling back to `t.status`. **This is reliable in real data** — `js/firebase.js` (`addTask`) always initializes `memberStatus[m.id]='todo'` for every assigned member on creation, and `index.html`'s status-cycling functions keep it in sync — so don't skip populating it if you ever add a new task-creation path.
  - `exportMyReportPDF()` also branches on `perfMode` via a shared template (`doneCheck`, `byGroup`, `entityName`/`entityIcon`) rather than duplicating the whole function.
  - Non-admins can only select their own name in member mode (unchanged). Project mode has no such restriction — project completion isn't private the way an individual's performance is, and everyone already sees all tasks/projects on the dashboard.
- **Quarterly** — the flagship, management-facing report. On-screen magazine-style preview (`.qr-*` CSS classes) plus a separate **Share Report** export.
  - Convention: a task "belongs" to quarter Q of year Y if its `.month` (YYYY-MM) falls in that quarter's 3 months (`getQuarterMonths`). Only `taskType 'mbc'` counts, matching Monthly/Performance.
  - `computeQuarterStats(tasks, year, q)` returns: completion %, on-time delivery rate (of *done* tasks that had a due date — tasks with no due date are excluded from that specific rate, not counted against it), critical resolved/open, project count, **leaderboard** (sorted by tasks *done*, not raw %, so a 1/1 person doesn't outrank a 40/45 person), **project spotlight** (completed projects first, via `projectsData[btoa(name)].completedMonth` falling inside the quarter), and a 3-month trend for the bar chart.
  - `generateHeadline()` auto-writes the magazine's opening sentence by comparing to `getPrevQuarter()` (handles the Q1→Q4-of-previous-year wraparound).
  - **Share Report** (`exportQuarterlyPDF`) reuses the same `window.open + document.write + window.print()` pattern as the existing Monthly/Performance PDF exports — a fully self-contained inline-styled HTML document (no access to this page's stylesheet, no Chart.js canvas — the trend is hand-drawn as CSS bar divs instead) that the person can Print → Save as PDF and send directly to management.
  - **Copy Summary** (`copyQuarterlySummary`) writes a short WhatsApp/Slack-ready text blurb via `navigator.clipboard.writeText`, falling back to `window.prompt()` if clipboard access is denied.
  - report.html has its own local `toast()` (it has no access to index.html's) — reuses the shared `.toast` CSS class from `css/style.css`, which is already linked.

### Calendar (calendar.html)
- Monthly grid, 7 event types colour-coded
- Auto-task checkbox (assigns Harshit + Godly)
- **View toggle** — Portrait (default, 80px cells) ↔ Landscape (140px cells, up to 4 events/day instead of 2) via `setCalView()`. Persisted in `localStorage['calView']` and restored on load.
- **Event-type filter bar** — chip row (`setFilter()`) between the legend and grid; filtering to one type mutes (dims, disables click) days with no matching events via `.filter-muted`. `activeFilter` defaults to `'All'`.

### Projects (projects.html)
- Browser-tab-style navigation: one tab per project name pulled from `t.project` on tasks. No project IDs — a project **is** its name string, matching how `project` has always worked everywhere else in the app (Input's dropdown, the purple task-card pill, Monthly's project sections, Performance's By Project mode).
- **Data model — deliberately additive, nothing existing was touched:**
  - Task↔project linkage: unchanged (`t.project` string field).
  - Completion state: unchanged — reuses the existing `getProjects()` / `setProjectComplete(name, month)` / `reopenProject(name)` from `firebase.js`. A project counts as completed if `projectsData[btoa(name)]` exists (same convention report.html's Monthly tab already used). Marking complete from this page stamps the *current* month, since there's no "viewed month" context here the way Monthly has one.
  - **New:** a lightweight `projectMeta` Firestore collection (`workspaces/{WORKSPACE_ID}/projectMeta/{btoa(name)}`) holds only what didn't already have a home — `color`, `description`, `targetDate`. Read/written directly with the Firebase v10.12 modular SDK inside projects.html itself (same pattern as `ideas.html`'s own `ideas` collection) — **firebase.js was not modified.**
  - `keyFor(name)` = plain `btoa(name)`, matching report.html's existing `projectsData[btoa(projName)]` key convention exactly — this must stay identical or completion state silently stops lining up with projects already marked complete from Monthly.
- **Tab strip** — active projects only; each tab shows a health dot. Completed projects move into a separate collapsed "Completed Projects" section below (same collapsible pattern as Calendar's Year History), not shown in the main strip.
- **Health** is purely due-date-driven off the tasks already in memory (no reliance on any activity/updatedAt timestamp, which isn't guaranteed to exist on every task): Completed → grey · any overdue task → red "N overdue" · else any task due ≤3 days → amber "N due soon" · 0 tasks → grey "No tasks yet" · else → green "On track".
- **Per-project panel** (rich, per the build brief): completion ring + 4-stat row (Total/Done/In Prog/Overdue), a member-gauge row (per-member done/total within *this* project only, respecting `t.memberStatus` the same way report.html's Performance tab does), and tasks grouped by status (In Progress / To Do / On Hold / Done) — each group collapsible, Done collapsed by default.
- **New/Edit Project modal** — name (locked once created — renaming isn't supported, since it would require rewriting `project` on every task that references it), one of 8 preset colours, optional description, optional target date. Colour currently only accents this page (tab underline, panel dot, member bars) — it does **not** retint the purple project pill used elsewhere in the app; extending it app-wide would be a separate follow-up.
- **View toggle** — same portrait/landscape pattern as Calendar (`setProjView()`, own `localStorage['projView']` key, independent of calendar's). Landscape widens `.page` to full width and splits the active project's panel into two CSS-grid columns (`.proj-panel-left`: header/stats/ring/members · `.proj-panel-right`: task groups, 2-up instead of 1-up) via `body.proj-landscape` — `renderActivePanel()` always emits both wrapper divs; only the CSS reacts to the mode, so no separate landscape render path exists to fall out of sync.
- No delete action for a project — only complete/reopen — to avoid the ambiguity of whether deleting a project should also delete its tasks.
- **Completing a project with open tasks (added Oct 2026):** *Mark complete* opens a `prj-close` sheet when `openTasksOf(name)` is not empty: *Mark N tasks done and complete* (sets `status:'done'` and every `memberStatus.<id>` to done through `updateTask`, deliberately **not** `recordTaskCompletion`, so a bulk close never feeds streaks), *Complete the project only* (the old behaviour), or Cancel. Undo (8s) reopens the project and restores each task's previous `status`/`memberStatus` from a snapshot taken before the write. Reopening a project by hand does not reopen its tasks.
- **Add Task quick action** jumps to `input.html?project=<name>`, which now pre-fills the Project field on load (see Input section below).
- Added as a 5th bottom-nav icon (🗂) on every page that has a bottom nav: index, input, calendar, projects, report, ideas, help, backup.

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
    projectMeta/         — Per-project description/targetDate (colour and group are legacy, unused except to suggest merges), keyed by btoa(name) — added for projects.html, read/written directly there via the modular SDK (not through firebase.js)
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

> **Redesign note (Oct 2026):** the data rules here still apply — per-person Firestore storage, the 10-active-task cap, the Monday reset. In the new Home the Sprint *is* the "This week" list, fed from a **Backlog** fold. The widget markup, class names and some of the admin/manager controls described below were re-laid-out, so check `index.html` before relying on a specific control or element id.

**Per-user, synced via Firestore** (changed from localStorage — see below). Each person's "This Week" list lives on their own Firestore user doc, the same doc used for Quick Notes and `broadcastEnabled`:

```
workspaces/{WORKSPACE_ID}/users/{userNameLowercase}
  { notes, broadcastEnabled, sprint: { week: 'YYYY-Www', ids: ['taskId1', ...] } }
```

Because it's keyed by lowercase name (not device), the same person's sprint syncs across all their devices, while staying completely separate from every other team member's list — nobody sees anyone else's "This Week" selections.

**Sort order:** in-progress tasks bubble to the top of the sprint list (`renderMyTasks()`, right after `sprintTasks` is built, before the search/filter predicate runs). Stable sort — everything else keeps its existing relative order, only `status==='inprog'` tasks get pulled to the front. This runs on the *unfiltered* `sprintTasks`, before `sprintTasksVisible` is derived, so it applies regardless of any active search/filter.

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

### The 10-cap counts active tasks only

**Fixed a real behavioural bug, not just a preference.** Completing a task's id was never removed from the sprint Set (only explicit "✕ Remove" does that — see `toggleSprintTask` above), so `idsSet.size` alone always counted done tasks too. This meant filling all 10 slots, then finishing one, still showed "10/10 full" and blocked adding anything new — the cap behaved like a lifetime-per-week limit rather than a working-capacity limit, which defeats the point of a weekly focus list.

Fixed via one shared helper, used everywhere the cap is checked so it can't drift out of sync across the now-5 places it's enforced:

```javascript
function activeSprintCount(idsSet) {
  // counts only ids whose task.status !== 'done'
}
```

Call sites: `toggleSprintTask` (your own sprint), `toggleMemberSprintTask` (admin path, on `current`), the sprint header's `isFull`/badge (on `sprintTasks.length`, which is already active-only by construction), `myTaskCard`'s button state (`_mySprintFull`), `memberTaskCard`'s button state (`sprintFull`), and the ported copy in `input.html`.

Two related, deliberate semantic splits — don't collapse them back together:
- **Capacity badge** ("X / 10" in the header) now shows `sprintTasks.length` (active count) — this is what's actually being capped.
- **Progress bar** ("X/Y done") still uses `sprintCount = sprintTaskIds.size` (total ever pinned this week, active + done) as its denominator — this is a *different* metric (weekly completion rate), unaffected by the cap logic change, and still meaningful as a historical number even as slots get freed and refilled.

Verified via jsdom: filled 10 active slots, 11th correctly blocked; completed one of the 10; 11th then succeeded; header badge correctly showed "10/10" afterward (t2-t11, t1 now excluded since done).

### Manager's gauge of teammates' This Week (open/done)

In `renderByMember()`, each member card header shows `🎯 This Week: {open} open · {done} done` when they have anything pinned to the current week — computed from the same sprint-data sources the per-task toggle button already uses (live `sprintTaskIds` for your own card, `memberSprintCache` for a teammate's), so no new Firestore reads were needed. Only rendered when `mSprintTotal > 0` — no point showing "0 open · 0 done" for someone with nothing pinned. `.member-sprint-gauge` CSS lives next to `.member-cnt` in `css/style.css`.

### Admin control of teammates' sprints

The manager (`ADMIN_NAME`, currently `'Harshit'`) can add/remove tasks from **any** teammate's "This Week" list, not just their own — from the **By Member** tab, on a task-by-task basis. Teammates keep the ability to manage their own sprint themselves (unchanged, via `toggleSprintTask` above).

**This is admin-only, not peer-to-peer** — a non-admin teammate cannot do this for anyone but themselves. Gating is `canAct = isMyCard || isAdmin` in `memberTaskCard()`: `isMyCard` lets anyone act on their own card, `isAdmin` (hardcoded to `ADMIN_NAME`) is what additionally unlocks every *other* card. If asked to open this up to all teammates acting on each other, that's a real change (remove/alter the `isAdmin` check), not a config toggle — confirm before making it, since it changes who can see/edit whose sprint.

The core challenge: sprint data lives in each person's own Firestore doc (async to fetch), but `memberTaskCard()` needs to know **synchronously** whether a given task is already in a teammate's sprint, to render the button's correct state. Solved the same way `cachedBadges` solves an analogous problem — fetch once, cache, let the render that's already happening on every task change (`renderAll()` → `renderByMember()`) pick up the resolved data:

```javascript
let memberSprintCache = {};           // { [lowercaseName]: Set(taskIds) }
let _memberSprintCacheLoaded = false; // guards it to load once, same pattern as _sprintInitialized

loadMemberSprintCache()               // admin-only, called from renderByMember() the
                                      // first time it runs; Promise.all over every
                                      // member's getUserData(), then re-renders itself
window.toggleMemberSprintTask(memberId, taskId)
                                      // memberId, not memberName — names can contain
                                      // apostrophes and would break the inline onclick
                                      // string; resolves the name internally via
                                      // members.find(), matching how
                                      // setMemberStatusWindow() already does this
```

`toggleMemberSprintTask` special-cases the admin acting on **their own** card: it detects `memberName.toLowerCase() === MY_NAME.toLowerCase()` and delegates straight to the existing `toggleSprintTask()` instead of the generic cache-based path — that one already owns the live `sprintTaskIds`/`expandedTasks`/listener state correctly, and running both paths for the same person would risk them drifting out of sync with each other.

Writes are optimistic (cache updates immediately, UI re-renders, *then* `saveUserData` fires) with a rollback path if the write actually fails — matches the pattern used elsewhere in this app rather than blocking the UI on the network round-trip.

Verified via the jsdom harness end-to-end: admin toggling a teammate's task writes to *that teammate's* mock Firestore doc (not the admin's), the button state flips correctly after re-render, and the admin's own card correctly routes through the pre-existing sprint path instead of the generic one.

### Done This Week — full sub-section inside the Sprint widget

**Superseded the "This Week" stat approach below (kept for history — don't reintroduce it, it was explicitly removed).** ~~The Done section header showed `✅ Done (N) · 🎯 X/Y This Week` as a count-only stat.~~ Replaced with a proper collapsible sub-section, showing full task cards, nested inside the Sprint widget itself rather than referenced from the bottom Done section:

```
🎯 This Week's Sprint
  [progress bar — X/Y done, unchanged, pre-existing]
  [active sprint tasks — sprintTasksVisible, in-progress sorted first]
  ✅ Done This Week (N)          ← collapsible, collapsed by default
    [full task cards — sprintDoneTasksVisible]
  Resets {date}
```

- `sprintDoneTasks` (full array, not a count) = `tasks.filter(t => sprintTaskIds.has(t.id) && t.status==='done')`; `sprintDoneTasksVisible` applies the same `matchesRefineFilters` predicate the active list and the main task list both use, so search stays consistent here too. `sprintDone`/`sprintCount` are still kept as plain numbers (`sprintDoneTasks.length` / `sprintTaskIds.size`) since the header's progress bar wants counts, not arrays.
- Toggle (`toggleSprintDoneSection`) mirrors `toggleDoneSection`'s exact pattern — a lightweight DOM class-toggle on `#sprint-done-body`/`#sprint-done-arrow`, not a full re-render.
- **A completed sprint task now renders in *two* places** — this sub-section, and the main bottom Done section (which was never filtered to exclude sprint tasks, matching how *active* sprint tasks already double-render in both Sprint and Active/On Hold). This is intentional, consistent with the rest of the app's "Sprint is a pinned overlay, not an exclusive move" design — but it does mean every completed-and-pinned task hits the duplicate-id situation documented earlier (`toggleTaskExpand` syncing all copies via `querySelectorAll`). Verified via the jsdom harness: completing a sprint task correctly produces exactly 2 card instances (not more), and clicking either copy opens both.
- Empty-state logic has 3 distinct cases, not 2 — worth preserving the exact branching if you touch this: truly empty sprint (no active, no done) → "add tasks" prompt; sprint has items but *all* are done (active list would otherwise be empty) → render nothing in the active area, since a misleading "no tasks match this filter" would show even with zero filters active; active items exist but search/filter hides all of them → the actual "no match" message.

### (Removed) Done section "This Week" completion stat

The Done section header (`renderMyTasks()`, where `doneHTML` is built) briefly showed `✅ Done (N) · 🎯 X/Y This Week` — reused `sprintDone`/`sprintCount` computed for the Sprint section's own header. Explicitly removed one turn later in favour of the full sub-section above, which shows the actual tasks rather than just a count. `.done-week-stat` CSS was removed along with it — don't re-add it without checking this isn't wanted back in stat form specifically.

### "This Week" toggle ported to input.html

Input's task list had no concept of "who's using this page" at all — no `MY_NAME`, no sprint state, nothing. All of it had to be added, not just a button:

```javascript
// Near the top of input.html's module script, alongside `let members = [], tasks = [];`
const MY_NAME = localStorage.getItem('wd_myname') || '';   // one-time read, unlike index.html
const SPRINT_MAX = 10;
let sprintTaskIds = new Set();
let _sprintInitialized = false;
// + getWeekKey(), activeSprintCount(), initSprint(), saveSprint(), window.toggleSprintTask
```

Each is a direct port of the index.html versions (same Firestore doc, same field shape, same active-only cap logic) — `initSprint()` is called from inside `onTasksChanged`'s callback (self-guarded, safe to call on every snapshot, same pattern as index.html).

**Deliberately self-service only** — the button only appears on tasks assigned to `MY_NAME`, using `sprintTaskIds` directly. The admin-controls-teammates machinery (`memberSprintCache`, `toggleMemberSprintTask`) was **not** ported here — Input's task list isn't structured per-member the way By Member is (it's one flat list of everyone's tasks), so there was no natural per-member cache-loading trigger the way `renderByMember()` provides in index.html. If admin control from this page is wanted later, port that machinery in rather than rebuilding it — it's a known, tested pattern (see "Admin control of teammates' sprints" above), it just needs a sensible trigger point in Input's render flow.

`.sprint-task-btn` CSS also had to be copied in — it only existed in index.html's own inline `<style>`, not the shared `css/style.css`, so input.html never had access to it despite loading the same shared stylesheet.

Verified via a second jsdom harness built specifically for input.html (separate skeleton/stub setup — its Firebase import list differs from index.html's): button only renders on the current user's own tasks, toggling writes to the correct Firestore-equivalent doc, button state updates correctly after toggle.

### Duplicate-task detection was far too sensitive (real bug, not tuning nitpick)

Reported as "tasks not getting added if a similarly named task is identified." Two separate systems in `input.html`, both affected:

1. **`findDuplicates()`** (blocks submission with a confirmation modal until the user clicks "Save Anyway") — threshold was `0.38`.
2. **`checkSimilarTasks()`** (live hint list while typing, non-blocking) — threshold was `0.35`, different scoring formula (`similarityScore`, word-overlap + partial-substring credit).

Root cause: both use word/bigram overlap on the **whole title**, and this app's task titles are short and templated ("Review PR for X", "Fix X bug", "Prepare QX report", "Schedule X meeting"). When only 3-4 words total, sharing 3 of 4 is unavoidable when a single word carries all the distinguishing meaning — so "Review PR for login flow" vs "Review PR for **signup** flow" scored 71% "similar" under the old threshold, despite being entirely different tasks. This isn't a threshold typo, it's a structural mismatch between the algorithm (word-overlap) and the data (short, templated titles) — raising the threshold is the correct fix, not a workaround, because there's no clever word-boundary tweak that fixes it (tested stripping stop-words from the bigram calculation specifically — barely moved the numbers).

**Retuned against a real test set** (9 pairs of genuinely different tasks that happen to share a verb/structure, 5 pairs of true near-duplicates — typos, minor rewording, exact repeats):

| System | Old threshold | New threshold | False positives eliminated | True duplicates still caught |
|---|---|---|---|---|
| `findDuplicates` (blocking) | 0.38 | **0.72** | 8/9 | 4/5 |
| `checkSimilarTasks` (hint) | 0.35 | **0.70** | 4/5 | 2/3 |

If retuning either of these again, don't guess — the test pairs are worth reconstructing (or ask for them) and sweeping a threshold range like the fix above did; the two systems use different formulas so a threshold that works for one doesn't transfer to the other. Verified end-to-end via jsdom: submitting a genuinely different task now saves directly with no modal; submitting a near-exact repeat of an existing task still triggers the warning correctly.

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
9. **Sprint duplicate-render glitch (fixed, narrowly — see #15 for the full fix)** — a task added to "This Week" renders a second time inside the Sprint section via the same `myTaskCard()` function, producing duplicate DOM ids (`trc-`, `trx-`, `trd-` + taskId). `toggleSprintTask()` calls `expandedTasks.delete(taskId)` before re-rendering so the card collapses instead of staying stuck open. This only handled the one interaction (adding to sprint); the general problem (any duplicated task, clicked from its non-first copy) wasn't fixed until #15.
10. **PWA install prompt** — index.html now has custom install-banner logic (`#install-banner` + script near the bottom) instead of relying on the browser's automatic mini-infobar. iOS Safari never fires `beforeinstallprompt` — the banner shows manual "Add to Home Screen" instructions there instead. Android/desktop Chrome shows a real Install button via the captured `beforeinstallprompt` event. Dismissal is remembered in localStorage (`wd_install_dismissed_at`) for 14 days
11. **`toast()` scope** — `toast()` is defined inside the `<script type="module">` block in index.html and is explicitly assigned to `window.toast` so plain (non-module) `<script>` blocks lower on the page can call it. Any future module-scoped helper that needs to be called from a plain script must be exposed on `window` the same way
12. **Re-render cascade (fixed)** — `renderMyTasks()` rebuilds the entire list with `el.innerHTML = ...` and is reached from `renderAll()`, which fires on **every task change by any teammate** via `onTasksChanged`. Two consequences were fixed:
    - Every card replayed its `.fi` staggered fade-up on each sync, so a colleague marking a task done made your whole screen flicker. Cards now animate only on first mount, gated by `_animatedCards`; the stagger itself is gated by `_firstPaintDone` so later arrivals appear immediately.
    - The inline edit panel's open state lived only in the DOM (`classList.toggle('open')`) and inputs rendered from the task object, so a background sync closed the editor and **discarded unsaved typing**. Open state is now `_openEditId`, keystrokes go to `_editDraft`, priority to `_editPriority`, and `_captureEditFocus()`/`_restoreEditFocus()` preserve caret position across the rebuild.

    If you touch `renderMyTasks`, keep all four (`_animatedCards`, `_firstPaintDone`, `_openEditId`, `_editDraft`) intact — they're the only thing making live sync non-destructive. The real long-term fix is keyed DOM reconciliation instead of `innerHTML`.
13. **CSS load order** — `style.css` no longer `@import`s `themes.css`. Every page already has its own `<link>` for both, so importing it too loaded 56KB twice and made the cascade ambiguous (which is likely why themes accumulated ~100 `!important` overrides). Order is now: `style.css` (base + tokens) → `themes.css` (overrides). **Don't re-add the `@import`.** Note `quiz.html`, `snake.html`, `space.html` load neither stylesheet — they're standalone.
14. **Backticks inside template literals** — `myTaskCard()` is one big template literal. An HTML comment inside it containing a backtick (e.g. writing `` `t` ``) silently terminates the string and throws a confusing `Unexpected identifier` at a line number far from the real problem. Always `node --check` the extracted module script after editing that function.
15. **Duplicate-id click/search bugs (fixed properly this time)** — reported as "on-hold tasks don't show up when searched, and clicking them doesn't expand." Root cause was the general case #9 only partially fixed: **any task in both the sprint list and its normal status section (Active or On Hold) renders twice**, sharing `trc-`/`trx-`/`trd-` ids, because `sprintTasks` is filtered from `tasks` independently of `activeTasks`/`onholdTasks` and nothing excludes overlap. Two distinct bugs came from this, both fixed:
    - **Click-to-expand silently hit the wrong copy.** `toggleTaskExpand()` used `getElementById`, which always resolves to the *first* matching id in the document (the Sprint copy, since that section renders first) — so clicking a task's On Hold copy expanded/collapsed the Sprint copy instead, and nothing visibly happened where the person clicked. Fixed by switching to `querySelectorAll('[id="trd-"+id]')` and syncing **every** copy to the same open/closed state, not just one — this also prevents two copies of the same task ending up visually disagreeing with each other (e.g. open the Sprint copy, then click the On Hold copy — both should reflect the same `expandedTasks` boolean, and now do).
    - **The Sprint section completely ignored search and all other filters.** `sprintTasks` was built straight from `sprintTaskIds` with zero filtering, so it always showed every sprint task regardless of what was being searched — while the *real* search-filtered copy in Active/On Hold correctly hid or matched. This made it look like on-hold tasks "weren't showing up" in search: the one visible copy was sitting unfiltered up in Sprint, not down in On Hold where the person was looking. Fixed via a new shared predicate, `matchesRefineFilters(t)` (priority/status/due/search, all in one place) — used by both the Sprint section (`sprintTasksVisible`) and the main list, so they can't drift out of sync again. Sprint's header stats (`X/10`, done count) intentionally still reflect the *unfiltered* full sprint list — only which cards are drawn is filtered, since "6/10 this week" shouldn't change just because you're searching.
    - **Bonus find while debugging this (unrelated root cause, same symptoms neighborhood):** the status-tag maps (`stTag`/`stLbl` — appears 4 places: twice in `myTaskCard`/`memberTaskCard` in index.html, twice in `taskCard` in input.html) never had an `'onhold'` entry, and no `.t-onhold` CSS class existed in `style.css` — so every on-hold task has *always* rendered a literal `<span class="tag undefined">undefined</span>` status tag, in every theme, since this app was built. Fixed all 4 map sites plus added the missing `.t-onhold` rule to `css/style.css` (using `var(--purple)`, matching the on-hold accent already used elsewhere). Interestingly, `body.theme-editorial .t-onhold` already existed in `css/themes.css` with the right colors — someone (an earlier session) had already anticipated this class and built its override, it just never fired because the JS never emitted the class. Neu/Glass/Skeu need no per-theme override — they inherit the base rule via their own `--purple`.
    - **How this was actually found:** reading the code suggested it *should* work — the bug only reproduces when a task is simultaneously on-hold and sprint-pinned. Installed `jsdom`, stubbed `firebase.js`/`theme.js`/`sounds.js`, loaded the real extracted module script into a real DOM, and ran the actual render + click functions against realistic mock data (including dispatching genuine click events, not calling functions directly) — don't trust a code read alone for rendering-order-dependent bugs like this one; simulate it.
16. **In-progress/due-today pulse strengthened** — the edge-accent indicators (added when the flat colour washes were removed — see the theme-health/Due-Today-In-Progress redesign history above) were judged too subtle to notice without deliberately looking. Widened the bar (3px→4px), widened the opacity swing (was ~.45–1, now ~.45–.5 trough to 1 peak), and switched from a static `box-shadow` to one that animates in the same keyframe (small glow at the trough, wide glow at the peak) so the *glow itself* pulses, not just the bar's opacity. Sped up slightly too (1.8s/1.6s → 1.4s/1.3s). Same treatment applied to `.due-today-badge`'s `pulse-badge` (added a `scale(1.08)` at the peak, not just opacity) and to `.task-card.status-inprog::before` (the shimmer bar used where `.task-card` renders instead of `.task-row-compact`). **`input.html` had its own separate, outdated copy** of `.task-row-compact.status-inprog` still using the old flat background-wash style from before that redesign — it was never migrated when index.html's was. Brought it in line with the same accent-edge treatment (own local `inprog-pulse` keyframe + reduced-motion guard, since input.html doesn't share index.html's `<style>` block). If a future prominence request comes in for `due-soon-badge` too, note it currently has **no animation at all** (unlike `due-today-badge`) — that was a deliberate original distinction between due-today urgency and due-soon awareness, not an oversight.
17. **Sprint sort — in-progress bubbles to top** — `renderMyTasks()` sorts `sprintTasks` (stable sort, `status==='inprog'` first) immediately after building it and before `sprintTasksVisible` is derived from it via `matchesRefineFilters`. Verified via the jsdom harness with a real status change through `onTasksChanged`, not just the sort call in isolation.
18. **Quarterly is now the default/first Report tab** — see the Report section above for the 3 places this required changing in lockstep (`activeRptTab`, the static `active` class on `tab-quarterly`/`panel-quarterly`, and tab button order).
20. **`[hidden]` vs `display:flex/grid`** (redesign) — a class with an explicit `display` beats the `hidden` attribute. Every component that is toggled with `hidden` needs its own `[hidden]{display:none}` rule in `ui.css`.
21. **Light-theme fold stacking** (redesign) — consecutive `.wd-disc` rows are collapsed into one run of hairlines by `html.theme-light … { margin-top:0 }`. Page-level overrides must match that specificity (e.g. `html.theme-light body.proj-wide …`) or the light rule wins.
22. **No colour for state in dark** (redesign) — the dark palette has no warning colour and all `--hue-*` tokens are one grey. Use `currentColor` or lightness for markers such as `.prj-late`.
23. **Old inline handlers don't work from modules** — Backup's `onchange="…"` was silently dead; new code uses `addEventListener`, or assigns to `window.*` for `onclick=` in markup.

---

## Developer Preferences

- **Single-file deliverables** — never split into multiple files unless absolutely necessary
- **No build tools** — no webpack, no npm, no bundlers
- **Always syntax check** before sharing files using `node --check`
- **Test UI changes in a real browser** (Playwright/Chromium), not only jsdom, in both Light and Dark — layout, `[hidden]` and stacking bugs don't show up in jsdom
- **Show visuals before big UI changes** — the user likes to approve a mock first
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
