import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── PASTE YOUR FIREBASE CONFIG HERE ──────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAYz6qdqMDgHmstAB-Dbh1ByJBMjjR8Fsw",
  authDomain: "workdesk-ba979.firebaseapp.com",
  projectId: "workdesk-ba979",
  storageBucket: "workdesk-ba979.firebasestorage.app",
  messagingSenderId: "300966370113",
  appId: "1:300966370113:web:c444bfaeaf4c28b2da5fc0"
};
// ─────────────────────────────────────────────────────────────────────────

// ── WORKSPACE & PASSWORD ──────────────────────────────────────────────────
const WORKSPACE_ID = "harshit-team-2026";
export const DELETE_PASSWORD = "workdesk@delete";
// ─────────────────────────────────────────────────────────────────────────

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

// ── TASKS ─────────────────────────────────────────────────────────────────
export async function getTasks() {
  const snap = await getDocs(query(wsCol("tasks"), orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * data.members = [ { id, name, role } ]
 * We also initialise memberStatus = { memberId: 'todo' } for each member
 * so individual progress can be tracked independently.
 */
export async function addTask(data) {
  const month = new Date().toISOString().slice(0, 7);
  // Build memberStatus map: each member starts as 'todo'
  const memberStatus = {};
  (data.members || []).forEach(m => { memberStatus[m.id] = 'todo'; });
  const ref = await addDoc(wsCol("tasks"), {
    ...data,
    status: "todo",
    memberStatus,
    month,
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

/**
 * Mark one member's respective task as done/todo independently.
 * Updates memberStatus.memberId only.
 * Also updates overall status to 'done' if ALL members are done.
 */
export async function updateMemberStatus(taskId, memberId, newStatus, allMemberIds) {
  const updates = {};
  updates[`memberStatus.${memberId}`] = newStatus;
  // If all members are done, mark overall task done too
  // We pass the full current memberStatus from the caller so we can check
  await updateDoc(wsDoc("tasks", taskId), updates);
}

export async function deleteTask(id, password) {
  if (password !== DELETE_PASSWORD) throw new Error("Incorrect password");
  await deleteDoc(wsDoc("tasks", id));
}
