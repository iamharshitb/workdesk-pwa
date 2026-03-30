import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, onSnapshot, query, orderBy, serverTimestamp
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

// How many days after completion a task stays visible in the active view
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
// A task is "active" (shown in dashboard + all tasks) if:
//   - It is not done, OR
//   - It was completed within the last 90 days
// This runs client-side after fetching, keeping the Firestore query simple.
function isActiveTask(task) {
  if (task.status !== 'done') return true; // todo / inprog always visible

  // Done tasks: check completedAt
  const completedAt = task.completedAt;
  if (!completedAt) return true; // no completedAt recorded — keep visible

  // Firestore Timestamp has .toDate(), plain JS Date otherwise
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

// ── TASKS: full history (report page + date range filter) ─────────────────
// Returns ALL tasks ever — no archive filter applied.
// Used by: report.html, date range filter in input.html
export async function getTasks() {
  const snap = await getDocs(query(wsCol("tasks"), orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── TASKS: active only (dashboard + all tasks list) ───────────────────────
// Returns tasks that are not done, OR done within the last 90 days.
// Used by: index.html real-time listener, input.html task list
export function onTasksChanged(callback) {
  const q = query(wsCol("tasks"), orderBy("createdAt", "desc"));
  let isFirstSnapshot = true;

  const unsub = onSnapshot(q, (snap) => {
    // Full list from Firestore
    const allTasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Apply active filter — archived done tasks are excluded
    const tasks = allTasks.filter(isActiveTask);

    // Changes for sound triggers — only from non-first snapshots
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
    ...data,
    status: "todo",
    memberStatus,
    month,
    dueDate: data.dueDate || null,
    createdAt: serverTimestamp(),
    completedAt: null,
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
