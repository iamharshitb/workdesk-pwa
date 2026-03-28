# WorkDesk PWA — Complete Setup Guide

This guide takes you from zero to a fully deployed, shareable WorkDesk app in about 20 minutes.

---

## Before You Start — What You Need

- GitHub account (free) → https://github.com
- Google account for Firebase (free) → https://firebase.google.com
- Git installed → https://git-scm.com/downloads
- VS Code → https://code.visualstudio.com

---

## PART 1 — FIREBASE SETUP

### Step 1.1 — Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add project" → name it `workdesk` → Continue
3. Disable Google Analytics → "Create project" → Continue

### Step 1.2 — Enable Firestore
1. Left sidebar → Build → Firestore Database → "Create database"
2. Select "Start in test mode" → Next
3. Choose region closest to you (e.g. asia-south1 for India) → Enable

### Step 1.3 — Enable Anonymous Auth
1. Left sidebar → Build → Authentication → "Get started"
2. Sign-in method tab → Anonymous → Enable → Save

### Step 1.4 — Get Your Config
1. Gear icon (top left) → Project settings
2. Scroll to "Your apps" → click </> (Web)
3. Nickname: workdesk-web → Register app
4. Copy the entire firebaseConfig object shown
5. Click "Continue to console"

### Step 1.5 — Paste Config into the App
1. Open workdesk-pwa/js/firebase.js in VS Code
2. Replace the placeholder firebaseConfig block (lines 8-15) with your copied config
3. Line 23: change WORKSPACE_ID to something unique like "yourname-team-2026"
4. Line 27: change DELETE_PASSWORD to your chosen delete password
   REMEMBER THIS PASSWORD — you need it to delete tasks.

### Step 1.6 — Firestore Security Rules
1. Firebase Console → Firestore Database → Rules tab
2. Replace with:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /workspaces/{workspaceId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

3. Click Publish

---

## PART 2 — GITHUB + DEPLOYMENT

### Step 2.1 — Create GitHub Repo
1. Go to https://github.com/new
2. Name: workdesk-pwa
3. Visibility: Public (required for free GitHub Pages)
4. Do NOT add README
5. Create repository

### Step 2.2 — Push Code
Open terminal in the workdesk-pwa folder:

  git init
  git add .
  git commit -m "Initial WorkDesk PWA"
  git remote add origin https://github.com/YOUR_USERNAME/workdesk-pwa.git
  git branch -M main
  git push -u origin main

Replace YOUR_USERNAME with your GitHub username.

### Step 2.3 — Enable GitHub Pages
1. Your repo on GitHub → Settings → Pages (left sidebar)
2. Source: "Deploy from a branch"
3. Branch: main / folder: / (root) → Save
4. Wait 1-2 min. Your URL appears: https://YOUR_USERNAME.github.io/workdesk-pwa

### Step 2.4 — Fix PWA Start URL
1. Open manifest.json
2. Change "start_url" to "/workdesk-pwa/index.html"
3. Push:
   git add manifest.json
   git commit -m "Fix start_url"
   git push

---

## PART 3 — SHARING

Share this URL with anyone:
  https://YOUR_USERNAME.github.io/workdesk-pwa

Everyone sees the same live data. They can add/edit/update tasks.
To delete a task they need the DELETE_PASSWORD you set in Step 1.5.

---

## PART 4 — INSTALL AS PWA

1. Open the URL in Chrome or Edge
2. Click the install icon (circle with +) in the address bar
3. Click Install → Pin to taskbar
4. Snap to 1/3 screen: Win + left arrow, then resize

---

## PART 5 — ADD ICONS (optional)

1. Go to https://favicon.io/favicon-generator/
2. Text: WD, Background: #04070f, Font color: #00f5c8
3. Download → rename to icon-192.png and icon-512.png
4. Put both in the icons/ folder
5. git add icons/ && git commit -m "Add icons" && git push

---

## FUTURE UPDATES

Any code change:
  git add .
  git commit -m "what you changed"
  git push

GitHub Pages auto-redeploys in ~1 minute.

---

## QUICK REFERENCE

| What               | Where                                              |
|--------------------|----------------------------------------------------|
| Live app URL       | https://YOUR_USERNAME.github.io/workdesk-pwa       |
| Firebase Console   | https://console.firebase.google.com                |
| Workspace ID       | js/firebase.js line 23                             |
| Delete password    | js/firebase.js line 27                             |

---

## TROUBLESHOOTING

"Permission denied" from Firestore
  → Check Firestore Rules are published (Step 1.6)

App loads but no data
  → Press F12, check console. Firebase config error = re-check js/firebase.js

Changes not showing after push
  → Wait 2 min, hard refresh Ctrl+Shift+R

Delete password not working
  → It's case-sensitive. Check DELETE_PASSWORD in js/firebase.js

PWA install button not showing
  → Must be on HTTPS (GitHub Pages handles this). Also check manifest.json start_url.
