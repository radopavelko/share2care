// firebase-init.js — initialises Firebase (Auth + Firestore + Storage) and
// exposes a small async API on window.S2 for the (Babel) app to use.
//
// Loaded as a native ES module from index.html so it can import the modular
// Firebase v10 SDK from the CDN. The React/Babel app code runs as classic
// scripts, so everything it needs is hung off window.S2.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, setDoc, addDoc, updateDoc,
  onSnapshot, query, orderBy, serverTimestamp, runTransaction,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage, ref as storageRef, uploadBytes, getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJsCrsz6DcgsL1g3443A8S2pWsKGepBHg",
  authDomain: "share2care-7bb3a.firebaseapp.com",
  projectId: "share2care-7bb3a",
  storageBucket: "share2care-7bb3a.firebasestorage.app",
  messagingSenderId: "713799208527",
  appId: "1:713799208527:web:faacd5fe6039684190e43a",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// Deterministic warm colour from a uid, so each member gets a stable avatar tint.
const AVATAR_COLORS = [
  "#C2693F", "#7C9A6B", "#B5728A", "#6E84A3", "#B7913F",
  "#8A6FA8", "#C77F55", "#5E8C7D", "#A86A6A", "#9A7BB0", "#5F8AA0",
];
function colorFor(uid) {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// Make sure a users/{uid} profile doc exists / is fresh on each sign-in.
async function ensureUserDoc(user) {
  const uref = doc(db, "users", user.uid);
  const snap = await getDoc(uref);
  const base = {
    name: (user.displayName || user.email || "Member").split(" ")[0],
    full: user.displayName || user.email || "Member",
    email: user.email || "",
    photoURL: user.photoURL || "",
    color: colorFor(user.uid),
  };
  if (!snap.exists()) {
    await setDoc(uref, { ...base, createdAt: serverTimestamp() });
  } else {
    // keep name/photo in sync with Google, but don't clobber createdAt
    await setDoc(uref, base, { merge: true });
  }
  return { id: user.uid, you: true, ...base };
}

// Downscale an image file in the browser before upload (max edge 1280px, JPEG).
function downscaleImage(file, maxEdge = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const scale = Math.min(1, maxEdge / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image load failed")); };
    img.src = url;
  });
}

// ── Public API consumed by the app (all promise-based) ─────────────
window.S2 = {
  ready: false,

  // auth
  signIn: () => signInWithPopup(auth, provider),
  signOut: () => signOut(auth),
  onAuth: (cb) => onAuthStateChanged(auth, cb),
  ensureUserDoc,
  currentUid: () => (auth.currentUser ? auth.currentUser.uid : null),

  // live subscriptions — return an unsubscribe function
  subItems: (cb) => onSnapshot(
    query(collection(db, "items"), orderBy("createdAt", "desc")),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.error("subItems", err)
  ),
  subRequests: (cb) => onSnapshot(
    query(collection(db, "requests"), orderBy("createdAt", "desc")),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.error("subRequests", err)
  ),
  subUsers: (cb) => onSnapshot(
    collection(db, "users"),
    (snap) => {
      const m = {};
      snap.docs.forEach((d) => { m[d.id] = { id: d.id, ...d.data() }; });
      cb(m);
    },
    (err) => console.error("subUsers", err)
  ),

  // writes
  addItem: (data) => addDoc(collection(db, "items"), {
    ...data, createdAt: serverTimestamp(),
  }),
  updateItem: (id, patch) => updateDoc(doc(db, "items", id), patch),
  addRequest: (data) => addDoc(collection(db, "requests"), {
    ...data, createdAt: serverTimestamp(),
  }),
  updateRequest: (id, patch) => updateDoc(doc(db, "requests", id), patch),

  // borrow request + item flip done atomically
  approveRequest: async (reqId, itemId, borrowerUid, due) => {
    await runTransaction(db, async (tx) => {
      tx.update(doc(db, "requests", reqId), { status: "approved" });
      tx.update(doc(db, "items", itemId), { status: "out", borrowerUid, due });
    });
  },

  // photo upload → returns a download URL
  uploadPhoto: async (file, uid) => {
    const blob = await downscaleImage(file);
    const path = `items/${uid}/${Date.now()}.jpg`;
    const r = storageRef(storage, path);
    await uploadBytes(r, blob, { contentType: "image/jpeg" });
    return getDownloadURL(r);
  },

  serverTimestamp,
};

// Let the app know the SDK + window.S2 API is wired up.
window.S2.ready = true;
window.dispatchEvent(new Event("s2-ready"));
