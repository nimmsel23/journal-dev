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

const isCloudMode = () => typeof window !== 'undefined' && (window.location.hostname.includes("web.app") || window.location.hostname.includes("firebaseapp.com"));

export function isLocalMode() { return !isCloudMode(); }

export function getUid() {
  if (isLocalMode()) return "local";
  if (typeof window !== 'undefined' && window.__firebaseAuth) {
    return window.__firebaseAuth.currentUser?.uid || null;
  }
  return null;
}

export function watchAuth(callback) {
  if (isLocalMode()) {
    // Local dev: stub user
    const user = { displayName: "Local Host", email: "localhost", photoURL: null, uid: "local" };
    if (callback) callback(user);
    return () => {};
  }

  // Cloud: use Firebase Auth
  if (typeof window !== 'undefined' && window.__firebaseAuth) {
    return window.__firebaseAuth.onAuthStateChanged((user) => {
      if (callback) callback(user);
    });
  }
  console.warn("Firebase Auth not available");
  return () => {};
}

export async function signIn() {
  if (isLocalMode()) return { ok: true };
  try {
    if (!window.__firebaseAuth || !window.__googleProvider) {
      throw new Error("Firebase not initialized");
    }
    const { signInWithPopup } = await import("firebase/auth");
    const result = await signInWithPopup(window.__firebaseAuth, window.__googleProvider);
    return { ok: true, user: result.user };
  } catch (e) {
    console.error("Sign in failed:", e);
    throw e;
  }
}

export async function signOut() {
  if (isLocalMode()) return { ok: true };
  try {
    if (!window.__firebaseAuth) {
      throw new Error("Firebase not initialized");
    }
    const { signOut: fbSignOut } = await import("firebase/auth");
    await fbSignOut(window.__firebaseAuth);
    return { ok: true };
  } catch (e) {
    console.error("Sign out failed:", e);
    throw e;
  }
}

export async function signInEmail(email, pw)    { if (isLocalMode()) return { ok: true }; throw new Error("Email auth not implemented"); }
export async function signUpEmail(email, pw, n) { if (isLocalMode()) return { ok: true }; throw new Error("Email auth not implemented"); }

// Real Firebase exports for cloud mode; stubs for local
export const auth = isLocalMode()
  ? {
      currentUser: { displayName: "Local Host", email: "localhost", photoURL: null, uid: "local" },
      onAuthStateChanged: (cb) => { cb({ displayName: "Local Host", email: "localhost", photoURL: null, uid: "local" }); return () => {}; },
      authStateReady: async () => {},
    }
  : (typeof window !== 'undefined' && window.__firebaseAuth) ? window.__firebaseAuth : null;

export const db = isLocalMode() ? null : (typeof window !== 'undefined' && window.__firebaseDb) ? window.__firebaseDb : null;
