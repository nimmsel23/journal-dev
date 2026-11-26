// VOICE-GPT (Backend: ~/dev/backend/functions/journal/voice-agent.js).
// Interaktiv: Callable voiceReflect. Auto-Modus: Opt-in journal/{uid}/settings/voice.auto,
// Ergebnisse unter journal/{uid}/voiceReflections (vom Server geschrieben).
import { getFunctions, httpsCallable } from "firebase/functions";
import { collection, deleteField, doc, limit, onSnapshot, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { app, auth, db } from "./firebase.js";
import { track } from "./offline.js";

export const VOICE_AUTO_WORDS = 250;

export async function voiceReflect({ mode = "reflect", stage, date, context, history = [], expectedUid }) {
  if (!expectedUid || auth?.currentUser?.uid !== expectedUid) throw new Error("voice_account_changed");
  const call = httpsCallable(getFunctions(app, "europe-west1"), "voiceReflect", { timeout: 95000 });
  const { data } = await call({ mode, stage, date, context, history, expected_uid: expectedUid });
  if (typeof data?.reply !== "string" || !data.reply.trim()) throw new Error("voice_empty_reply");
  return data.reply;
}

const settingsRef = (uid) => doc(db, "journal", uid, "settings", "voice");

export function watchVoiceAuto(uid, onNext) {
  return onSnapshot(settingsRef(uid), (snap) => onNext(snap.data()?.auto === true), () => onNext(false));
}

export function setVoiceAuto(uid, auto) {
  track(setDoc(settingsRef(uid), { auto: !!auto, updatedAt: new Date() }, { merge: true }));
}

export function watchVoiceReflections(uid, onNext, max = 10) {
  const q = query(collection(db, "journal", uid, "voiceReflections"), orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(q, (snap) => onNext(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => onNext([]));
}

export function markVoiceReflectionRead(uid, id) {
  track(updateDoc(doc(db, "journal", uid, "voiceReflections", id), { read: true }));
}

// BYOK: eigener Gemini-Key, liest nur der Server (journal/{uid}/settings/ai, Owner-Rule).
const aiRef = (uid) => doc(db, "journal", uid, "settings", "ai");
export const maskKey = (key) => (key ? `${key.slice(0, 4)}…${key.slice(-4)}` : "");
export function watchOwnKey(uid, onNext) {
  return onSnapshot(aiRef(uid), (snap) => onNext(String(snap.data()?.geminiKey || "")), () => onNext(""));
}
export function setOwnKey(uid, key) {
  return setDoc(aiRef(uid), { geminiKey: key ? String(key).trim() : deleteField(), updatedAt: new Date() }, { merge: true });
}
export async function pingOwnKey(expectedUid) {
  if (!expectedUid || auth?.currentUser?.uid !== expectedUid) throw new Error("voice_account_changed");
  const { data } = await httpsCallable(getFunctions(app, "europe-west1"), "voiceReflect", { timeout: 30000 })({ mode: "ping", expected_uid: expectedUid });
  return data;
}

export function voiceErrorText(error) {
  const m = String(error?.message || error || "");
  if (/quota_reached|resource-exhausted/.test(m)) return "Das heutige KI-Kontingent ist aufgebraucht (geteilt mit dem Smart Logger).";
  if (/own_key_missing/.test(m)) return "Kein eigener Key gespeichert.";
  if (/provider_rejected|HTTP 40[0-3]/.test(m)) return "Gemini lehnt den Key ab. Prüfe, ob er vollständig und aktiv ist.";
  if (/provider_not_configured/.test(m)) return "VOICE-GPT ist am Server noch nicht eingerichtet.";
  if (/account_changed/.test(m)) return "Das Konto hat sich geändert. Bitte neu anmelden.";
  if (/unavailable|network|offline|unreachable/i.test(m)) return "Keine Verbindung zu VOICE-GPT. Deine Antworten bleiben lokal gespeichert.";
  return m || "VOICE-GPT hat nicht geantwortet.";
}
