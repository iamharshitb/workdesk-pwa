import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, onSnapshot, query, orderBy, serverTimestamp, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── CONFIG ────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAYz6qdqMDgHmstAB-Dbh1ByJBMjjR8Fsw",
  authDomain: "workdesk-ba979.firebaseapp.com",
  projectId: "workdesk-ba979",
  storageBucket: "workdesk-ba979.firebasestorage.app",
  messagingSenderId: "300966370113",
  appId: "1:300966370113:web:c444bfaeaf4c28b2da5fc0"
};
const WORKSPACE_ID = "harshit-team-2026";
export const DELETE_PASSWORD = "workdesk@delete";
const ARCHIVE_AFTER_DAYS = 90;

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

export function onUserReady(cb) {
  onAuthStateChanged(auth, user => {
    if (user) cb(user);
    else signInAnonymously(auth);
  });
}

function wsCol(name) { return collection(db, "workspaces", WORKSPACE_ID, name); }
function wsDoc(name, id) { return doc(db, "workspaces", WORKSPACE_ID, name, id); }

// ── ACTIVE TASK FILTER ────────────────────────────────────────────────────
function isActiveTask(task) {
  if (task.status !== 'done') return true;
  const completedAt = task.completedAt;
  if (!completedAt) return true;
  const completedDate = completedAt.toDate ? completedAt.toDate() : new Date(completedAt);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - ARCHIVE_AFTER_DAYS);
  return completedDate >= cutoff;
}

// ── MEMBERS ───────────────────────────────────────────────────────────────
export async function getMembers() {
  const snap = await getDocs(query(wsCol("members"), orderBy("createdAt")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function addMember(name) {
  const ref = await addDoc(wsCol("members"), { name, createdAt: serverTimestamp() });
  return ref.id;
}
export async function deleteMember(id) {
  await deleteDoc(wsDoc("members", id));
}

// ── TASKS: full history ───────────────────────────────────────────────────
export async function getTasks() {
  const snap = await getDocs(query(wsCol("tasks"), orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── TASKS: real-time active listener ─────────────────────────────────────
export function onTasksChanged(callback) {
  const q = query(wsCol("tasks"), orderBy("createdAt", "desc"));
  let isFirstSnapshot = true;
  const unsub = onSnapshot(q, (snap) => {
    const allTasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const tasks = allTasks.filter(isActiveTask);
    const changes = isFirstSnapshot
      ? []
      : snap.docChanges().map(change => ({
          type: change.type,
          task: { id: change.doc.id, ...change.doc.data() }
        }));
    isFirstSnapshot = false;
    callback({ tasks, changes });
  });
  return unsub;
}

// ── WRITE OPERATIONS ──────────────────────────────────────────────────────
export async function addTask(data) {
  const month = new Date().toISOString().slice(0, 7);
  const memberStatus = {};
  (data.members || []).forEach(m => { memberStatus[m.id] = 'todo'; });
  const ref = await addDoc(wsCol("tasks"), {
    ...data, status: "todo", memberStatus, month,
    dueDate: data.dueDate || null,
    createdAt: serverTimestamp(), completedAt: null,
  });
  return ref.id;
}

export async function updateTask(id, data) {
  const upd = { ...data };
  if (data.status === "done") upd.completedAt = serverTimestamp();
  await updateDoc(wsDoc("tasks", id), upd);
}

export async function deleteTask(id, password) {
  if (password !== DELETE_PASSWORD) throw new Error("Incorrect password");
  await deleteDoc(wsDoc("tasks", id));
}

// ── USER DATA: notes + timer (synced per user across devices) ─────────────
// Stored at: /workspaces/{id}/users/{userName}
// Contains: { notes: string, timer: { total, left, running, savedAt } }

function userDoc(userName) {
  // Use lowercase trimmed name as document ID
  return doc(db, "workspaces", WORKSPACE_ID, "users", userName.toLowerCase().trim());
}

export async function getUserData(userName) {
  if (!userName) return {};
  try {
    const snap = await getDoc(userDoc(userName));
    return snap.exists() ? snap.data() : {};
  } catch(e) {
    console.warn('getUserData failed:', e);
    return {};
  }
}

export async function saveUserData(userName, data) {
  if (!userName) return;
  // setDoc with merge:true creates the doc if it doesn't exist,
  // or merges the fields if it does — no separate create/update needed
  await setDoc(userDoc(userName), data, { merge: true });
}

// Real-time listener for user data (notes update across devices instantly)
export function onUserDataChanged(userName, callback) {
  if (!userName) return () => {};
  const unsub = onSnapshot(userDoc(userName), (snap) => {
    callback(snap.exists() ? snap.data() : {});
  });
  return unsub;
}

// ── STREAK ────────────────────────────────────────────────────────────────
// Stored at: /workspaces/{id}/streak
// { currentStreak, lastCompletedDate (YYYY-MM-DD), longestStreak }
function streakDoc() {
  return doc(db, "workspaces", WORKSPACE_ID, "meta", "streak");
}

export async function getStreak() {
  try {
    const snap = await getDoc(streakDoc());
    return snap.exists() ? snap.data() : { currentStreak: 0, lastCompletedDate: null, longestStreak: 0 };
  } catch(e) { return { currentStreak: 0, lastCompletedDate: null, longestStreak: 0 }; }
}

export async function recordTaskCompletion() {
  const today = new Date().toISOString().slice(0, 10);
  const data = await getStreak();
  const last = data.lastCompletedDate;
  if (last === today) return data; // already recorded today

  // Weekend-aware streak: find last expected workday before today
  // Walk backwards from yesterday, skip Sat(6) and Sun(0)
  function lastWorkday(fromDateStr) {
    const d = new Date(fromDateStr);
    d.setDate(d.getDate() - 1);
    while (d.getDay() === 0 || d.getDay() === 6) {
      d.setDate(d.getDate() - 1);
    }
    return d.toISOString().slice(0, 10);
  }

  const prevWorkday = lastWorkday(today);
  // Streak continues if last completion was yesterday (any day)
  // OR if today is Mon/Tue and last was Fri/Thu (weekend gap forgiven)
  const streakContinues = last === prevWorkday ||
    (last && last >= lastWorkday(prevWorkday + 'T00:00:00'));
    // also forgive if last was within the skipped weekend window

  // Simpler: streak continues if last was the most recent workday
  const newStreak = (last === prevWorkday) ? (data.currentStreak || 0) + 1 : 1;
  const longest = Math.max(newStreak, data.longestStreak || 0);
  // Track top 3 all-time streaks with who achieved them
  const topStreaks = data.topStreaks || [];
  // Check if this streak should be in the hall of fame
  if (newStreak > 1) {
    const existing = topStreaks.findIndex(s => s.name === 'Team');
    const entry = { streak: newStreak, date: today };
    if (existing === -1) {
      topStreaks.push(entry);
    } else if (newStreak > topStreaks[existing].streak) {
      topStreaks[existing] = entry;
    }
    topStreaks.sort((a,b) => b.streak - a.streak);
    topStreaks.splice(3); // keep top 3
  }

  const updated = { currentStreak: newStreak, lastCompletedDate: today, longestStreak: longest, topStreaks };
  await setDoc(streakDoc(), updated, { merge: true });
  return updated;
}

// ── TASK COMMENTS ─────────────────────────────────────────────────────────
// Stored at: /workspaces/{id}/tasks/{taskId}/comments
function commentsCol(taskId) {
  return collection(db, "workspaces", WORKSPACE_ID, "tasks", taskId, "comments");
}

export async function addComment(taskId, author, text) {
  await addDoc(commentsCol(taskId), {
    author, text: text.slice(0, 200),
    createdAt: serverTimestamp()
  });
}

export async function updateComment(taskId, commentId, newText) {
  await updateDoc(
    doc(db, "workspaces", WORKSPACE_ID, "tasks", taskId, "comments", commentId),
    { text: newText.slice(0, 200), editedAt: serverTimestamp() }
  );
}

export async function deleteComment(taskId, commentId) {
  await deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "tasks", taskId, "comments", commentId));
}

export function onCommentsChanged(taskId, callback) {
  const q = query(commentsCol(taskId), orderBy("createdAt", "asc"));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// ── REMINDER ──────────────────────────────────────────────────────────────
// Stored as a field on the task: reminder: { date, time, snoozedUntil, active }
export async function setReminder(taskId, date, time, setBy) {
  await updateDoc(doc(db, "workspaces", WORKSPACE_ID, "tasks", taskId), {
    reminder: { date, time, active: true, snoozedUntil: null, setBy: setBy || '' }
  });
}

export async function snoozeReminder(taskId, newDate, newTime) {
  await updateDoc(doc(db, "workspaces", WORKSPACE_ID, "tasks", taskId), {
    'reminder.snoozedUntil': `${newDate}T${newTime}`,
    'reminder.date': newDate,
    'reminder.time': newTime,
    'reminder.active': true
  });
}

export async function dismissReminder(taskId) {
  await updateDoc(doc(db, "workspaces", WORKSPACE_ID, "tasks", taskId), {
    'reminder.active': false
  });
}

// ── CALENDAR: dedicated collection ───────────────────────────────────────────
// Stored at: /workspaces/{id}/calendar/shared
// This avoids permission issues with the users subcollection

function calendarDoc() {
  return doc(db, "workspaces", WORKSPACE_ID, "calendar", "shared");
}

export async function saveCalendarData(events) {
  await setDoc(calendarDoc(), { comms_calendar: JSON.stringify(events) }, { merge: true });
}

export function onCalendarDataChanged(callback) {
  return onSnapshot(calendarDoc(), (snap) => {
    if (!snap.exists()) { callback({}); return; }
    try {
      const data = snap.data();
      callback(data.comms_calendar ? JSON.parse(data.comms_calendar) : {});
    } catch(e) { callback({}); }
  });
}

// ── CALENDAR: read-only access for other pages ─────────────────────────────
// Calendar is stored under users/__calendar__ as JSON string
export async function getCalendarEvents() {
  try {
    const snap = await getDoc(calendarDoc());
    if (!snap.exists()) return {};
    const data = snap.data();
    return data.comms_calendar ? JSON.parse(data.comms_calendar) : {};
  } catch(e) {
    console.warn('getCalendarEvents failed:', e);
    return {};
  }
}

export function onCalendarChanged(callback) {
  return onCalendarDataChanged(callback);
}

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────
// Stored at: /workspaces/{id}/meta/announcement
// { text, postedBy, postedAt, id }

function announcementDoc() {
  return doc(db, "workspaces", WORKSPACE_ID, "meta", "announcement");
}

export async function postAnnouncement(text, author) {
  const id = Date.now().toString();
  const data = { text, author, postedAt: serverTimestamp(), id };
  // Save as current announcement
  await setDoc(announcementDoc(), data);
  // Also save to history (keep last 5)
  const histCol = collection(db, "workspaces", WORKSPACE_ID, "meta", "announcement", "history");
  await setDoc(doc(histCol, id), data);
  // Trim history to last 5
  try {
    const snap = await getDocs(query(histCol, orderBy("postedAt", "desc")));
    const toDelete = snap.docs.slice(5);
    for (const d of toDelete) await deleteDoc(d.ref);
  } catch(e) {}
}

export async function getAnnouncementHistory() {
  try {
    const histCol = collection(db, "workspaces", WORKSPACE_ID, "meta", "announcement", "history");
    const snap = await getDocs(query(histCol, orderBy("postedAt", "desc")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { return []; }
}

export async function clearAnnouncement() {
  await setDoc(announcementDoc(), { text: '', author: '', id: '' }, { merge: false });
}

export function onAnnouncementChanged(callback) {
  return onSnapshot(announcementDoc(), snap => {
    callback(snap.exists() ? snap.data() : null);
  });
}

// ── BACKUP & RESTORE ──────────────────────────────────────────────────────

export async function exportBackup() {
  // Fetch all tasks (no date filter — full history)
  const tasksSnap = await getDocs(collection(db, "workspaces", WORKSPACE_ID, "tasks"));
  const tasks = [];
  for (const taskDoc of tasksSnap.docs) {
    const task = { id: taskDoc.id, ...taskDoc.data() };
    // Also fetch comments for each task
    const commentsSnap = await getDocs(collection(db, "workspaces", WORKSPACE_ID, "tasks", taskDoc.id, "comments"));
    task._comments = commentsSnap.docs.map(c => ({ id: c.id, ...c.data() }));
    tasks.push(task);
  }

  // Fetch members
  const membersSnap = await getDocs(collection(db, "workspaces", WORKSPACE_ID, "members"));
  const members = membersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Fetch user data (avatars, badges, notes)
  const usersSnap = await getDocs(collection(db, "workspaces", WORKSPACE_ID, "users"));
  const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Fetch calendar
  const calSnap = await getDoc(doc(db, "workspaces", WORKSPACE_ID, "calendar", "shared"));
  const calendar = calSnap.exists() ? calSnap.data() : {};

  // Fetch streak
  const streakSnap = await getDoc(doc(db, "workspaces", WORKSPACE_ID, "meta", "streak"));
  const streak = streakSnap.exists() ? streakSnap.data() : {};

  // Fetch announcement
  const annSnap = await getDoc(doc(db, "workspaces", WORKSPACE_ID, "meta", "announcement"));
  const announcement = annSnap.exists() ? annSnap.data() : {};

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    workspaceId: WORKSPACE_ID,
    tasks,
    members,
    users,
    calendar,
    streak,
    announcement,
  };
}

export async function restoreBackup(backup) {
  if (!backup || backup.workspaceId !== WORKSPACE_ID) {
    throw new Error('Invalid backup file or wrong workspace');
  }

  const results = { tasks: 0, members: 0, users: 0, calendar: false, errors: [] };

  // Restore tasks (setDoc with merge to avoid overwriting newer data)
  for (const task of (backup.tasks || [])) {
    try {
      const { id, _comments, ...taskData } = task;
      // Convert any plain timestamp objects back (they serialize as {seconds, nanoseconds})
      await setDoc(doc(db, "workspaces", WORKSPACE_ID, "tasks", id), taskData, { merge: true });
      // Restore comments
      for (const comment of (_comments || [])) {
        const { id: cid, ...cData } = comment;
        await setDoc(doc(db, "workspaces", WORKSPACE_ID, "tasks", id, "comments", cid), cData, { merge: true });
      }
      results.tasks++;
    } catch(e) {
      results.errors.push(`Task ${task.id}: ${e.message}`);
    }
  }

  // Restore members
  for (const member of (backup.members || [])) {
    try {
      const { id, ...mData } = member;
      await setDoc(doc(db, "workspaces", WORKSPACE_ID, "members", id), mData, { merge: true });
      results.members++;
    } catch(e) {
      results.errors.push(`Member ${member.id}: ${e.message}`);
    }
  }

  // Restore user data
  for (const user of (backup.users || [])) {
    try {
      const { id, ...uData } = user;
      await setDoc(doc(db, "workspaces", WORKSPACE_ID, "users", id), uData, { merge: true });
      results.users++;
    } catch(e) {
      results.errors.push(`User ${user.id}: ${e.message}`);
    }
  }

  // Restore calendar
  if (backup.calendar && Object.keys(backup.calendar).length) {
    await setDoc(doc(db, "workspaces", WORKSPACE_ID, "calendar", "shared"), backup.calendar, { merge: true });
    results.calendar = true;
  }

  return results;
}
