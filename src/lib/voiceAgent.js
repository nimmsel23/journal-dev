// VOICE-GPT (Backend: ~/dev/backend/functions/journal/voice-agent.js).
// Interaktiv: Callable voiceReflect. Auto-Modus: Opt-in fitness/{uid}/settings/voice.auto,
// Ergebnisse unter fitness/{uid}/voiceReflections (vom Server geschrieben).
import { getFunctions, httpsCallable } from "firebase/functions";
import { collection, doc, limit, onSnapshot, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
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

const settingsRef = (uid) => doc(db, "fitness", uid, "settings", "voice");

export function watchVoiceAuto(uid, onNext) {
  return onSnapshot(settingsRef(uid), (snap) => onNext(snap.data()?.auto === true), () => onNext(false));
}

export function setVoiceAuto(uid, auto) {
  track(setDoc(settingsRef(uid), { auto: !!auto, updatedAt: new Date() }, { merge: true }));
}

export function watchVoiceReflections(uid, onNext, max = 10) {
  const q = query(collection(db, "fitness", uid, "voiceReflections"), orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(q, (snap) => onNext(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => onNext([]));
}

export function markVoiceReflectionRead(uid, id) {
  track(updateDoc(doc(db, "fitness", uid, "voiceReflections", id), { read: true }));
}

export function voiceErrorText(error) {
  const m = String(error?.message || error || "");
  if (/quota_reached|resource-exhausted/.test(m)) return "Das heutige KI-Kontingent ist aufgebraucht (geteilt mit dem Smart Logger).";
  if (/provider_not_configured/.test(m)) return "VOICE-GPT ist am Server noch nicht eingerichtet.";
  if (/account_changed/.test(m)) return "Das Konto hat sich geändert. Bitte neu anmelden.";
  if (/unavailable|network|offline|unreachable/i.test(m)) return "Keine Verbindung zu VOICE-GPT. Deine Antworten bleiben lokal gespeichert.";
  return m || "VOICE-GPT hat nicht geantwortet.";
}
