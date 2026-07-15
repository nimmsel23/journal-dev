import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { db, auth, googleProvider } from "../firebase.js";

export { db, auth, googleProvider };

const BASE = import.meta.env.VITE_API_BASE || ''

function apiFetch(url, opts) {
  const fn = window.aosOfflineQueue?.fetch ?? fetch
  return fn(url, opts)
}

export const api = {
  async get(path) {
    const res = await apiFetch(BASE + path, { cache: 'no-store' })
    const fromOffline = res.headers?.get?.('X-Source')?.startsWith('offline')
    if (!res.ok && !fromOffline) throw new Error(`GET ${path} → ${res.status}`)
    try {
      return await res.json()
    } catch (e) {
      if (fromOffline) return null
      throw new Error(`GET ${path} → invalid JSON`, { cause: e })
    }
  },
  async post(path, data) {
    const res = await apiFetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok && res.status !== 202) throw new Error(`POST ${path} → ${res.status}`)
    return res.json()
  },
  async delete(path) {
    const res = await apiFetch(BASE + path, {
      method: 'DELETE',
    })
    if (!res.ok && res.status !== 202) throw new Error(`DELETE ${path} → ${res.status}`)
    return res.json()
  }
}

export function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function isLocalMode() { return false; }

let currentUid = null;

export function getUid() {
  if (!auth?.currentUser?.uid) throw new Error("not authenticated");
  return auth.currentUser.uid;
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    currentUid = user ? user.uid : null;
    callback?.(user);
  });
}

export async function signIn() {
  console.log("[signIn] Starting...", { auth: !!auth, googleProvider: !!googleProvider });
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("[signIn] Success:", result.user.email);
    return result;
  } catch (error) {
    console.error("[signIn] Failed:", error.code, error.message);
    throw error;
  }
}

export async function signOut() {
  console.log("[signOut] Starting...");
  try {
    await fbSignOut(auth);
    console.log("[signOut] Success");
  } catch (error) {
    console.error("[signOut] Failed:", error.message);
    throw error;
  }
}

export async function signInEmail(email, pw) {
  throw new Error("Email auth not implemented");
}

export async function signUpEmail(email, pw, n) {
  throw new Error("Email auth not implemented");
}
