// Journal's existing shared settings contract, previously imported from Fitness.
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase.js";
import { getUid } from "../core.js";

const defaults = { theme: "honey", themeMode: "manual" };
const localKey = "fitness-local-settings";

export async function getSettings() {
  if (!auth.currentUser?.uid) {
    try { return JSON.parse(localStorage.getItem(localKey)) || { ...defaults }; }
    catch { return { ...defaults }; }
  }
  const snap = await getDoc(doc(db, "fitness", getUid(), "settings", "general"));
  return snap.exists() ? snap.data() : { ...defaults };
}

export async function saveSettings(settings) {
  if (!auth.currentUser?.uid) {
    try { localStorage.setItem(localKey, JSON.stringify(settings)); } catch {}
    return { ok: true };
  }
  await setDoc(doc(db, "fitness", getUid(), "settings", "general"), {
    ...settings, updated_at: serverTimestamp(),
  });
  return { ok: true };
}

