// habitsDb.js — Habit anlegen/archivieren für Journal v2.
// Gleiche Pfade/Felder wie habits-dev (src/db/index.js): fitness/{uid}/habits,
// Archivieren = deleted:true (Records bleiben erhalten).
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase.js";
import { getUid } from "../../lib/db/core.js";

export async function addHabit(name) {
  const clean = String(name || "").trim();
  if (!clean) return null;
  const ref = await addDoc(collection(db, "fitness", getUid(), "habits"), {
    name: clean,
    icon: "Activity",
    category: null,
    frequency: null,
    created_at: serverTimestamp(),
  });
  return ref.id;
}

export async function archiveHabit(uuid) {
  await setDoc(doc(db, "fitness", getUid(), "habits", uuid), { deleted: true }, { merge: true });
}
