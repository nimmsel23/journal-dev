/**
 * Journal Nutrition — Direct Firestore access to Fuel's nutrition logs
 *
 * Collections: nutrition/{uid}/logs/{date}
 */

import {
  collection, query, orderBy, limit, getDocs, getDoc, doc
} from "firebase/firestore";
import { db } from "../../firebase.js";
import { getUid } from "../core.js";

export async function getMealsHistory(limitCount = 30) {
  try {
    const q = query(
      collection(db, "nutrition", getUid(), "logs"),
      orderBy("updated_at", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ date: d.id, ...d.data() }))
      .filter(log => (log.meals || []).length > 0);
  } catch (error) {
    console.error("[getMealsHistory] Query failed, fallback to unordered:", error);
    // Fallback: alle Logs laden, ungeordnet
    const snap = await getDocs(collection(db, "nutrition", getUid(), "logs"));
    return snap.docs
      .map(d => ({ date: d.id, ...d.data() }))
      .filter(log => (log.meals || []).length > 0)
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }
}

export async function getNutritionLog(date) {
  const snap = await getDoc(doc(db, "nutrition", getUid(), "logs", date));
  return snap.exists() ? snap.data() : { date, meals: [], water_ml: 0 };
}

// Nutrition Journal (Freitext-Notizen neben Meal-Logs)
// Optional feature — Fallback auf [] in JournalTimeline wenn nicht verfügbar
export async function getNutritionJournalHistory(limitCount = 30) {
  return [];
}
