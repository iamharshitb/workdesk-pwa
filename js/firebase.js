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

// ── TASKS: one-time fetch (still used for report page) ────────────────────
export async function getTasks() {
  const snap = await getDocs(query(wsCol("tasks"), orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── TASKS: real-time listener ─────────────────────────────────────────────
// Returns an unsubscribe function. Call it to stop listening.
//
// onTasksChanged(callback) — fires immediately with full task list,
// then fires again every time any task is added, modified or deleted.
//
// The callback receives:
//   { tasks, changes }
//   tasks   — full current array of all tasks (sorted newest first)
//   changes — array of { type: 'added'|'modified'|'removed', task }
//             so callers can react specifically to new tasks landing
//
export function onTasksChanged(callback) {
  const q = query(wsCol("tasks"), orderBy("createdAt", "desc"));
  let isFirstSnapshot = true;

  const unsub = onSnapshot(q, (snap) => {
    const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // On the very first snapshot, treat all docs as initial load — no sounds
    // On subsequent snapshots, report what actually changed
    const changes = isFirstSnapshot
      ? []
      : snap.docChanges().map(change => ({
          type: change.type,          // 'added' | 'modified' | 'removed'
          task: { id: change.doc.id, ...change.doc.data() }
        }));

    isFirstSnapshot = false;
    callback({ tasks, changes });
  });

  return unsub; // call this to detach the listener when page unloads
}

// ── WRITE OPERATIONS (unchanged) ──────────────────────────────────────────
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
