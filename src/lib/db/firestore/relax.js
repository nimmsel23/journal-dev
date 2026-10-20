// Copied from relax-dev; keeps the existing collection and result shape.
import { collection, query, getDocs, orderBy, limit as fbLimit } from "firebase/firestore";
import { db } from "../../firebase.js";
import { getUid } from "../core.js";

export async function getRelaxSessionHistory(n = 30) {
  const q = query(
    collection(db, "relax", getUid(), "sessions"),
    orderBy("date", "desc"),
    fbLimit(n),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() || {};
    return { date: data.date || d.id, items: Array.isArray(data.items) ? data.items : [], saved_at: data.saved_at };
  });
}


