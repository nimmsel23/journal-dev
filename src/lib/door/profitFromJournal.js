// profitFromJournal.js — Journal-Einträge mit +p, +profit oder +review landen im Profit-Panel (Door v2).
// Quelle-unabhängig: journal/{uid}/profit/{journalEntryId} (Doc-ID = Eintrags-ID → Bearbeiten aktualisiert,
// kein Duplikat, kein Marker nötig). Rule: journal/{uid}/** (Besitzer). Angezeigt unter „Reviews“ im Profit.
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { weekKey } from "./warstack.js";
import { hotTitle } from "./hotFromJournal.js";

export const PROFIT_TAGS = ["p", "profit", "review"];
export const hasProfitTag = (tags) => (tags || []).some((t) => PROFIT_TAGS.includes(String(t).replace(/^\+/, "").toLowerCase()));

const ref = (uid, id) => doc(db, "journal", uid, "profit", id);

export async function saveProfitReview(uid, id, { text, date, tags }) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(date || "") ? date : new Date().toISOString().slice(0, 10);
  await setDoc(ref(uid, id), {
    title: hotTitle(text), text, date: d, week: weekKey(new Date(`${d}T12:00:00`)), tags: tags || [], updated: serverTimestamp(),
  }, { merge: true });
}
export const removeProfitReview = (uid, id) => deleteDoc(ref(uid, id));

export async function fetchProfitReviews(uid) {
  const snap = await getDocs(collection(db, "journal", uid, "profit"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}
