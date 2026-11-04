import { getFunctions, httpsCallable } from "firebase/functions";
import { app, auth } from "./firebase.js";
import { validateSmartAnalysis } from "./smartJournalApplyCore.js";

export function newSmartRequestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `smart_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

export async function analyzeSmartJournal({ text, date, habits = [], tags = [], requestId, expectedUid }) {
  if (!expectedUid || auth?.currentUser?.uid !== expectedUid) throw new Error("smart_account_changed");
  const request_id = requestId || newSmartRequestId();
  const call = httpsCallable(getFunctions(app, "europe-west1"), "analyzeSmartLog");
  const { data } = await call({ request_id, text: String(text), date, habits: habits.map(({ name }) => ({ name })), tags, expected_uid: expectedUid });
  return validateSmartAnalysis(data);
}
