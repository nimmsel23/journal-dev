// Journal-owned database facade. No sibling repositories are required.
import { collection, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";

import { db } from "../lib/firebase.js";
import { getUid, localToday } from "../lib/db/core.js";
export { deleteJournal } from "../lib/db/journal.js";

export * from "../lib/db/core.js";
export * from "../lib/db/firestore/legacyJournal.js";
export { getSettings, saveSettings } from "../lib/db/firestore/settings.js";

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

const withRecords = (habitDocs, recordDocs) => {
  const habits = habitDocs.map((d) => ({ uuid: d.id, ...d.data() }));
  const allRecords = recordDocs.map((d) => d.data());
  return habits.map((habit) => {
    const habitRecords = allRecords.filter((record) => record.habitId === habit.uuid);
    return { ...habit, records: habitRecords, hasRecord: (date) => habitRecords.some((r) => r.date === date && r.completion === "DONE") };
  });
};

/** Wie getHabits, aber cache-first mit Listenern: sofort lokaler Stand (offline), Änderungen vom Server im Hintergrund. */
export function watchHabits(days, onNext, onError) {
  const today = localToday();
  const startDate = new Date(`${today}T12:00:00`);
  startDate.setDate(startDate.getDate() - (days - 1));
  const start = startDate.toISOString().slice(0, 10);
  const uid = getUid();
  let h; let r;
  const emit = () => { if (h && r) onNext(withRecords(h, r)); };
  const offH = onSnapshot(collection(db, "fitness", uid, "habits"), (s) => { h = s.docs; emit(); }, onError);
  const offR = onSnapshot(query(collection(db, "fitness", uid, "habitRecords"), where("date", ">=", start), where("date", "<=", today), orderBy("date", "desc")),
    (s) => { r = s.docs; emit(); }, onError);
  return () => { offH(); offR(); };
}

export async function getSessionHistory(days = 28) {
  const today = localToday();
  const startDate = new Date(`${today}T12:00:00`);
  startDate.setDate(startDate.getDate() - (days - 1));
  const start = startDate.toISOString().slice(0, 10);

  const sessionsQuery = query(
    collection(db, "fitness", getUid(), "sessions"),
    where("date", ">=", start),
    where("date", "<=", today),
    orderBy("date", "desc"),
  );
  const sessionsSnap = await getDocs(sessionsQuery);
  return sessionsSnap.docs.map((docSnap) => {
    const data = docSnap.data() || {};
    const suffix = docSnap.id.includes("__") ? docSnap.id.split("__")[1] : null;
    return {
      id: suffix,
      ...data,
      exercises: Array.isArray(data.exercises) ? data.exercises : [],
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

export { getSupplementsHistory } from "../lib/db/firestore/supplements.js";

export { getRelaxSessionHistory } from "../lib/db/firestore/relax.js";

