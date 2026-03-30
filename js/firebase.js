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
  try {
    // setDoc with merge:true creates the doc if it doesn't exist,
    // or merges the fields if it does — no separate create/update needed
    await setDoc(userDoc(userName), data, { merge: true });
  } catch(e) {
    console.warn('saveUserData failed:', e);
  }
}

// Real-time listener for user data (notes update across devices instantly)
export function onUserDataChanged(userName, callback) {
  if (!userName) return () => {};
  const unsub = onSnapshot(userDoc(userName), (snap) => {
    callback(snap.exists() ? snap.data() : {});
  });
  return unsub;
}
