// Journal-owned database facade. No sibling repositories are required.
import { collection, doc, getDocs, onSnapshot, orderBy, query, runTransaction, serverTimestamp, setDoc, where } from "firebase/firestore";

import { db } from "../lib/firebase.js";
import { getUid, localToday } from "../lib/db/core.js";
import { track } from "../lib/offline.js";
import { mergeSmartNutritionLog } from "../lib/smartJournalApplyCore.js";
import { mergeSmartRelaxItems, shouldCreateSmartRecord } from "../lib/smartSkillReplay.js";
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

// Habit-Records: lokal sofort fertig, Abgleich im Hintergrund (track) – nie auf die Server-Bestätigung warten,
// sonst hängt das Abhaken offline ewig.
export async function recordHabit(uuid, date = localToday(), provenance = {}) {
  const ref = doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`);
  const record = {
    habitId: uuid,
    date,
    completion: "DONE",
    recorded_at: serverTimestamp(),
  };
  if (provenance.sourceJournalId) record.sourceJournalId = provenance.sourceJournalId;
  if (provenance.requestId) record.sourceRequestId = provenance.requestId;
  track(setDoc(ref, record, { merge: true }));
  return { ok: true };
}

export async function unrecordHabit(uuid, date = localToday()) {
  const ref = doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`);
  track(setDoc(ref, {
    habitId: uuid,
    date,
    completion: "MISSED",
    recorded_at: serverTimestamp(),
  }, { merge: true }));
  return { ok: true };
}

// Local nutrition layer (Firestore access to Fuel's nutrition logs)
export {
  getMealsHistory,
  getNutritionLog,
  getNutritionNotesHistory,
  saveNutritionLog,
} from "../lib/db/firestore/nutrition.js";

// A single Smart-Log apply may be retried after a partial failure. Stable meal
// IDs plus a Firestore transaction make the nutrition write idempotent.
export async function applySmartNutrition({ date, requestId, sourceJournalId, meals = [], water_ml = 0 }) {
  const ref = doc(db, "nutrition", getUid(), "logs", date);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const merged = mergeSmartNutritionLog(snapshot.exists() ? snapshot.data() : null, { date, requestId, journalId: sourceJournalId, meals, water_ml });
    if (merged.changed) {
      transaction.set(ref, {
        ...merged.data,
        updated_at: serverTimestamp(),
      }, { merge: true });
    }
    return merged.applied;
  });
}

// Journal's Smart Log adapters write only the existing, owner-defined skill paths.
// IDs derive from the analysis request so re-applying cannot create duplicate sessions.
export async function applySmartFitness({ date, requestId, sourceJournalId, sessions = [] }) {
  const uid = getUid();
  let created = 0;
  for (const [index, session] of sessions.entries()) {
    const sessionDate = session.date || date;
    const id = `${sessionDate}__smart_${requestId}_${index}`;
    const ref = doc(db, "fitness", uid, "sessions", id);
    const activity = session.activity_type === "strength" ? null : {
      type: session.activity_type,
      duration: session.duration_minutes == null ? "" : String(session.duration_minutes),
      notes: session.notes || "",
    };
    const inserted = await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!shouldCreateSmartRecord(snapshot.exists() ? snapshot.data() : null, { requestId, sourceJournalId })) return false;
      transaction.set(ref, {
        date: sessionDate,
        session_id: `smart_${requestId}_${index}`,
        sessionMode: session.activity_type === "strength" ? "strength" : "cardio",
        block: session.activity_type === "strength" ? "Krafttraining" : "",
        activity,
        exercises: [],
        notes: session.activity_type === "strength" ? session.notes || "Krafttraining" : "",
        duration_minutes: session.duration_minutes,
        session_time: session.time,
        started_at: session.time ? new Date(`${sessionDate}T${session.time}:00`).toISOString() : null,
        finished_at: null,
        sourceJournalId,
        sourceRequestId: requestId,
        smartLog: true,
        saved_at: serverTimestamp(),
      });
      return true;
    });
    if (inserted) created += 1;
  }
  return created;
}

export async function applySmartRelax({ date, requestId, sourceJournalId, sessions = [] }) {
  if (!sessions.length) return 0;
  const groups = new Map();
  sessions.forEach((session, index) => {
    const targetDate = session.date || date;
    groups.set(targetDate, [...(groups.get(targetDate) || []), { ...session, _smartIndex: index }]);
  });
  let created = 0;
  for (const [targetDate, group] of groups) {
    const ref = doc(db, "relax", getUid(), "sessions", targetDate);
    created += await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(ref);
      const current = snapshot.exists() ? snapshot.data() || {} : {};
      const merged = mergeSmartRelaxItems(current.items, group, { requestId, sourceJournalId });
      if (merged.created) transaction.set(ref, { ...current, date: targetDate, items: merged.items, saved_at: serverTimestamp() }, { merge: true });
      return merged.created;
    });
  }
  return created;
}

export { getSupplementsHistory } from "../lib/db/firestore/supplements.js";

export { getRelaxSessionHistory } from "../lib/db/firestore/relax.js";

