// Journal-owned access to the shared Habits schema. Never replace unrelated
// icon/order/metadata when editing or archiving a habit.
import { addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';
import { getUid } from '../../lib/db/core.js';
import { habitFields } from './habitsModel.js';

export async function getHabitsRange(from, to) {
  const uid = getUid();
  const [habitSnap, recordSnap] = await Promise.all([
    getDocs(collection(db, 'fitness', uid, 'habits')),
    getDocs(query(collection(db, 'fitness', uid, 'habitRecords'), where('date', '>=', from), where('date', '<=', to))),
  ]);
  const byHabit = new Map();
  for (const snap of recordSnap.docs) {
    const record = snap.data();
    byHabit.set(record.habitId, [...(byHabit.get(record.habitId) || []), record]);
  }
  return habitSnap.docs.map((snap) => {
    const habit = { ...snap.data(), uuid: snap.id };
    const records = byHabit.get(habit.uuid) || [];
    return { ...habit, records, hasRecord: (date) => records.some((r) => r.date === date && r.completion === 'DONE') };
  }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.name).localeCompare(String(b.name)));
}

export async function addHabit(draft) {
  const fields = habitFields(typeof draft === 'string' ? { name: draft } : draft);
  const ref = await addDoc(collection(db, 'fitness', getUid(), 'habits'), { ...fields, icon: 'Activity', created_at: serverTimestamp() });
  return ref.id;
}

export async function updateHabit(uuid, draft) {
  await setDoc(doc(db, 'fitness', getUid(), 'habits', uuid), { ...habitFields(draft), updated_at: serverTimestamp() }, { merge: true });
}

export async function setHabitArchived(uuid, deleted) {
  await setDoc(doc(db, 'fitness', getUid(), 'habits', uuid), { deleted, updated_at: serverTimestamp() }, { merge: true });
}
