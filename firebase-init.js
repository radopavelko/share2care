// firebase-init.js — initialises Firebase (Auth + Firestore + Storage) and
// exposes a small async API on window.S2 for the (Babel) app to use.
//
// Loaded as a native ES module from index.html so it can import the modular
// Firebase v10 SDK from the CDN. The React/Babel app code runs as classic
// scripts, so everything it needs is hung off window.S2.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  getRedirectResult, signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, arrayUnion, arrayRemove,
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
provider.setCustomParameters({ prompt: "select_account" });

// Home-screen web apps on iOS can't open popups, so sign in via redirect there.
const isStandalone = () =>
  (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
  window.navigator.standalone === true;

// Popup first (works on desktop and in mobile browsers); if the environment
// blocks it, fall back to the redirect flow.
async function signIn() {
  if (isStandalone()) return signInWithRedirect(auth, provider);
  try {
    return await signInWithPopup(auth, provider);
  } catch (e) {
    const c = e && e.code;
    if (c === "auth/popup-blocked" || c === "auth/operation-not-supported-in-this-environment") {
      return signInWithRedirect(auth, provider);
    }
    throw e;
  }
}
// Complete a redirect sign-in if we're returning from one.
getRedirectResult(auth).catch((e) => console.error("redirect sign-in", e));

// Deterministic brand colour from a uid, so each member gets a stable avatar tint.
const AVATAR_COLORS = [
  "#111111", "#3B6D11", "#B07A00", "#444444", "#6B6B6B",
  "#2E4E1E", "#7A5A23", "#5A5A5A", "#3F5A2A", "#8A6D1F",
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
  // include existing doc fields (e.g. the onboarded flag) under the fresh base
  return { id: user.uid, you: true, ...(snap.exists() ? snap.data() : {}), ...base };
}

// Short, human-friendly join code (no ambiguous chars like O/0, I/1).
function makeCode(n = 6) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < n; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
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
  signIn,
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
  subUsers: (cb) => onSnapshot(
    collection(db, "users"),
    (snap) => {
      const m = {};
      snap.docs.forEach((d) => { m[d.id] = { id: d.id, ...d.data() }; });
      cb(m);
    },
    (err) => console.error("subUsers", err)
  ),
  subGroups: (cb) => onSnapshot(
    collection(db, "groups"),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.error("subGroups", err)
  ),

  // ── Groups ──────────────────────────────────────────────────
  createGroup: async (name, uid) => {
    const ref = await addDoc(collection(db, "groups"), {
      name, code: makeCode(), ownerUid: uid,
      memberUids: [uid], invitedEmails: [], createdAt: serverTimestamp(),
    });
    return ref.id;
  },
  // Join by code, using a client-side list of groups (open read in this MVP).
  joinGroupById: (groupId, uid) =>
    updateDoc(doc(db, "groups", groupId), { memberUids: arrayUnion(uid) }),
  addEmailInvite: (groupId, email) =>
    updateDoc(doc(db, "groups", groupId), { invitedEmails: arrayUnion(email.trim().toLowerCase()) }),
  removeEmailInvite: (groupId, email) =>
    updateDoc(doc(db, "groups", groupId), { invitedEmails: arrayRemove(email.trim().toLowerCase()) }),
  // When a user signs in, turn any email invites for them into real membership.
  claimEmailInvite: (groupId, uid, email) =>
    updateDoc(doc(db, "groups", groupId), {
      memberUids: arrayUnion(uid), invitedEmails: arrayRemove(email.trim().toLowerCase()),
    }),
  shareItemToGroup: (itemId, groupId) =>
    updateDoc(doc(db, "items", itemId), { groups: arrayUnion(groupId) }),
  unshareItemFromGroup: (itemId, groupId) =>
    updateDoc(doc(db, "items", itemId), { groups: arrayRemove(groupId) }),

  // writes
  addItem: (data) => addDoc(collection(db, "items"), {
    ...data, createdAt: serverTimestamp(),
  }),
  updateItem: (id, patch) => updateDoc(doc(db, "items", id), patch),
  deleteItem: (id) => deleteDoc(doc(db, "items", id)),
  // Who-has-what changes. `closed` is the loan being completed (if any), kept
  // on the item as a small history log: { holderUid, from, to }.
  lendItem: (id, memberUid, closed) => updateDoc(doc(db, "items", id), {
    holderUid: memberUid, takenAt: serverTimestamp(), status: "out", borrowerUid: memberUid,
    ...(closed ? { history: arrayUnion(closed) } : {}),
  }),
  returnItem: (id, closed) => updateDoc(doc(db, "items", id), {
    holderUid: null, takenAt: null, status: "available", borrowerUid: null, due: null,
    ...(closed ? { history: arrayUnion(closed) } : {}),
  }),

  // photo upload → returns a download URL
  uploadPhoto: async (file, uid) => {
    let blob, ext = "jpg", type = "image/jpeg";
    try {
      blob = await downscaleImage(file);
    } catch (e) {
      // e.g. an iPhone HEIC on a browser that can't decode it — send the original
      console.warn("downscale failed, uploading original", e);
      blob = file;
      ext = (file.name && file.name.includes(".")) ? file.name.split(".").pop().toLowerCase() : "jpg";
      type = file.type || ((ext === "heic" || ext === "heif") ? "image/heic" : "image/jpeg");
    }
    const r = storageRef(storage, `items/${uid}/${Date.now()}.${ext}`);
    await uploadBytes(r, blob, { contentType: type });
    return getDownloadURL(r);
  },

  serverTimestamp,
};

// Let the app know the SDK + window.S2 API is wired up.
window.S2.ready = true;
window.dispatchEvent(new Event("s2-ready"));
