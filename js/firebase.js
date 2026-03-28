import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, setDoc, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── PASTE YOUR FIREBASE CONFIG HERE ─────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAYz6qdqMDgHmstAB-Dbh1ByJBMjjR8Fsw",
  authDomain: "workdesk-ba979.firebaseapp.com",
  projectId: "workdesk-ba979",
  storageBucket: "workdesk-ba979.firebasestorage.app",
  messagingSenderId: "300966370113",
  appId: "1:300966370113:web:c444bfaeaf4c28b2da5fc0"
};
// ─────────────────────────────────────────────────────────────────────────

// ── WORKSPACE ID ─────────────────────────────────────────────────────────
// This single ID is shared by everyone using the app.
// Everyone who opens the link reads/writes to the same Firestore path.
// Change this to any unique string you like (e.g. your team name).
const WORKSPACE_ID = "harshit-team-2026";
// ─────────────────────────────────────────────────────────────────────────

// ── DELETE PASSWORD ───────────────────────────────────────────────────────
// Set your delete password here. Anyone who knows this can delete tasks.
// For extra security you can also store this in Firestore (see README).
export const DELETE_PASSWORD = "abc@123";
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

// All data lives under /workspaces/{WORKSPACE_ID}/
function wsCol(name) {
  return collection(db, "workspaces", WORKSPACE_ID, name);
}
function wsDoc(name, id) {
  return doc(db, "workspaces", WORKSPACE_ID, name, id);
}

// ── MEMBERS ──────────────────────────────────────────────────────────────
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

export async function addTask(data) {
  const month = new Date().toISOString().slice(0, 7);
  const ref = await addDoc(wsCol("tasks"), {
    ...data,
    status: "todo",
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

// Password is verified client-side against DELETE_PASSWORD constant above.
// For a stricter approach, move the password into a Firestore doc that only
// you can read — see README for instructions.
export async function deleteTask(id, password) {
  if (password !== DELETE_PASSWORD) {
    throw new Error("Incorrect password");
  }
  await deleteDoc(wsDoc("tasks", id));
}
