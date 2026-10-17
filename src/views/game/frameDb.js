// frameDb.js — Frame Map je Domain im Firestore des Nutzers: journal/{uid}/frame/{domain}.
// Felder = YAML-Schlüssel aus ~/aos/game/frame/cli.py (FRAME_QUESTIONS), damit Abgleich mit dem Pillar möglich bleibt.
// Rules: `match /journal/{uid}/{document=**}` in ~/vitalos/firestore.rules (projektglobal, manuell deployen).
import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase.js";

export const FRAME_DOMAINS = ["body", "being", "balance", "business"];
export const FRAME_QUESTIONS = [
  ["where_am_i_now", "Where am I now?"],
  ["how_did_i_get_here", "How did I get here?"],
  ["how_do_i_feel_about_where_i_am", "How do I feel about where I am?"],
  ["what_is_working_about_where_i_am_now", "What is working about where I am now?"],
  ["what_is_not_working_about_where_i_am", "What is not working about where I am?"],
];

/** → {body: {questions:{…}}, …} (fehlende Domains = leer) */
export async function fetchFrames(uid) {
  const snap = await getDocs(collection(db, "journal", uid, "frame"));
  const out = Object.fromEntries(FRAME_DOMAINS.map((d) => [d, { questions: {} }]));
  snap.forEach((d) => { if (out[d.id]) out[d.id] = { questions: {}, ...d.data() }; });
  return out;
}

export async function saveFrameAnswer(uid, domain, key, value) {
  await setDoc(doc(db, "journal", uid, "frame", domain), { domain, questions: { [key]: value }, updated: serverTimestamp() }, { merge: true });
}
