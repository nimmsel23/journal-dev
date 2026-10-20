// Copied from fuel-dev; Journal only needs the history reader.
import { collection, query, getDocs, orderBy, limit, documentId } from "firebase/firestore";
import { db } from "../../firebase.js";
import { getUid } from "../core.js";

export async function getSupplementsHistory(limitCount = 30) {
  const q = query(
    collection(db, "supplements", getUid(), "logs"),
    orderBy(documentId(), "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ date: d.id, ...d.data() }))
    .filter(log => (log.intakes || []).length > 0);
}


