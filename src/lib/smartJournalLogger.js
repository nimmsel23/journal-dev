import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase.js";
import { validateSmartAnalysis } from "./smartJournalApplyCore.js";

function newRequestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `smart_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

export async function analyzeSmartJournal({ text, habits = [], tags = [] }) {
  const request_id = newRequestId();
  const call = httpsCallable(getFunctions(app, "europe-west1"), "analyzeSmartLog");
  const { data } = await call({ request_id, text: String(text), habits, tags });
  return validateSmartAnalysis(data);
}
