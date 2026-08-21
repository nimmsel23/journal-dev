// journal-dev Unified DB wrapper (wie fuel-dev)
// Imports the entire fitness-dev database layer (auth, habits, general journal, sessions)
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { db } from "../lib/firebase.js";
import { getUid, localToday } from "../lib/db/core.js";

export * from "@fitness-db/index.firestore.js";

// Der fruehere Fallback auf ../../../src/cloud/db.firestore.js zog den
// VitalOS-Shell-Firebase-Layer in den Standalone-Build und brach den
// deploy-hook. Journal braucht hier nur getHabits fuer die Timeline.
export async function getHabits(days = 28) {
  const habitsSnap = await getDocs(collection(db, "fitness", getUid(), "habits"));
  const habits = habitsSnap.docs.map((docSnap) => ({ uuid: docSnap.id, ...docSnap.data() }));

  const today = localToday();
  const startDate = new Date(`${today}T12:00:00`);
  startDate.setDate(startDate.getDate() - (days - 1));
  const start = startDate.toISOString().slice(0, 10);

  const recordsQuery = query(
    collection(db, "fitness", getUid(), "habitRecords"),
    where("date", ">=", start),
    where("date", "<=", today),
    orderBy("date", "desc"),
  );
  const recordsSnap = await getDocs(recordsQuery);
  const allRecords = recordsSnap.docs.map((docSnap) => docSnap.data());

  return habits.map((habit) => {
    const habitRecords = allRecords.filter((record) => record.habitId === habit.uuid);
    return {
      ...habit,
      records: habitRecords,
      hasRecord: (date) => habitRecords.some((record) => record.date === date && record.completion === "DONE"),
    };
  });
}

export async function getHabitRecordsForDate(date = localToday()) {
  const recordsQuery = query(
    collection(db, "fitness", getUid(), "habitRecords"),
    where("date", "==", date),
    where("completion", "==", "DONE"),
  );
  const recordsSnap = await getDocs(recordsQuery);
  return recordsSnap.docs.map((docSnap) => docSnap.data().habitId);
}

export async function recordHabit(uuid, date = localToday()) {
  const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
  const ref = doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`);
  await setDoc(ref, {
    habitId: uuid,
    date,
    completion: "DONE",
    recorded_at: serverTimestamp(),
  });
  return { ok: true };
}

export async function unrecordHabit(uuid, date = localToday()) {
  const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
  const ref = doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`);
  await setDoc(ref, {
    habitId: uuid,
    date,
    completion: "MISSED",
    recorded_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}

// Local nutrition layer (Firestore access to Fuel's nutrition logs)
export {
  getMealsHistory,
  getNutritionLog,
  getNutritionNotesHistory,
  saveNutritionLog,
} from "../lib/db/firestore/nutrition.js";

// Supplements — kein eigenes journal-dev-Modul dafür, direkt aus fuel-dev
export { getSupplementsHistory } from "@fuel/lib/db/firestore/supplements.js";

// Relax — kein eigenes journal-dev-Modul dafür, direkt aus relax-dev
export { getRelaxSessionHistory } from "@relax/lib/db/firestore/sessions.js";
