// core.js — api wrapper, auth stubs (local mode).
// Mirror of fitness-dev/src/lib/db/core.js, plus shim re-exports for the
// fuel-dev runtime (fetchJson/postJson/patchJson/deleteJson) so views can
// import everything from "@db" instead of "../lib/api.js".

import * as legacyApi from "../api.js";
import {
  signIn as fbSignIn,
  signOut as fbSignOut,
  watchAuth as fbWatchAuth,
} from "../firestore-db.js";
import { auth } from "../firebase.js";

const BASE = import.meta.env.VITE_API_BASE || "";

function apiFetch(url, opts) {
  const fn = typeof window !== "undefined" && window.aosOfflineQueue?.fetch
    ? window.aosOfflineQueue.fetch
    : fetch;
  return fn(url, opts);
}

export const api = {
  async get(path) {
    const res = await apiFetch(BASE + path, { cache: "no-store" });
    const fromOffline = res.headers?.get?.("X-Source")?.startsWith("offline");
    if (!res.ok && !fromOffline) throw new Error(`GET ${path} → ${res.status}`);
    try {
      return await res.json();
    } catch (e) {
      if (fromOffline) return null;
      throw new Error(`GET ${path} → invalid JSON`, { cause: e });
    }
  },
  async post(path, data) {
    const res = await apiFetch(BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok && res.status !== 202) throw new Error(`POST ${path} → ${res.status}`);
    return res.json();
  },
  async delete(path) {
    const res = await apiFetch(BASE + path, { method: "DELETE" });
    if (!res.ok && res.status !== 202) throw new Error(`DELETE ${path} → ${res.status}`);
    return res.json();
  },
};

export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// We're "local mode" in dev (Fastify proxy + Firestore fallback). The cloud
// build swaps the whole @db alias to db.firestore.js — there isLocalMode=false.
export function isLocalMode() { return true; }

export function getUid() {
  try { return auth?.currentUser?.uid || "local"; }
  catch { return "local"; }
}

// Auth — pass through to firestore-db for parity with fitness-dev.
export const watchAuth = fbWatchAuth;
export const signIn = fbSignIn;
export const signOut = fbSignOut;

// Stubs to mirror fitness-dev public API.
export async function signInEmail(email, pw) { return { ok: true }; }
export async function signUpEmail(email, pw, name) { return { ok: true }; }

// ── Shim re-exports for the fuel-dev runtime ────────────────────────────────
// These let views import { fetchJson, postJson, patchJson, deleteJson } from
// "@db" — exact behaviour comes from src/lib/api.js (cloud-aware Fastify ↔
// Firestore dispatcher).
export const fetchJson = legacyApi.fetchJson;
export const postJson = legacyApi.postJson;
export const patchJson = legacyApi.patchJson;
export const deleteJson = legacyApi.deleteJson;
