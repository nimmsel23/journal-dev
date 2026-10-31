// Journal-owned access to the shared Habits schema. Never replace unrelated
// icon/order/metadata when editing or archiving a habit.
import { collection, doc, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';
import { getUid } from '../../lib/db/core.js';
import { habitFields } from './habitsModel.js';
import { track } from '../../lib/offline.js';
import { getDocsFast } from '../../lib/db/fastDocs.js';

// cache-first (fastDocs.js): bei schlechter Verbindung sofort der lokale Stand; `onLate(habits)` liefert den Serverstand nach.
export async function getHabitsRange(from, to, onLate) {
  const uid = getUid();
  let again = null;
  if (onLate) { let fired = false; again = () => { if (fired) return; fired = true; getHabitsRange(from, to).then(onLate, () => {}); }; }
  const [habitSnap, recordSnap] = await Promise.all([
    getDocsFast(collection(db, 'fitness', uid, 'habits'), again),
    getDocsFast(query(collection(db, 'fitness', uid, 'habitRecords'), where('date', '>=', from), where('date', '<=', to)), again),
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
  // lokal sofort fertig (ID wird clientseitig vergeben), Abgleich im Hintergrund – nie auf den Server warten
  const ref = doc(collection(db, 'fitness', getUid(), 'habits'));
  track(setDoc(ref, { ...fields, icon: 'Activity', created_at: serverTimestamp() }));
  return ref.id;
}

export async function updateHabit(uuid, draft) {
  track(setDoc(doc(db, 'fitness', getUid(), 'habits', uuid), { ...habitFields(draft), updated_at: serverTimestamp() }, { merge: true }));
}

export async function setHabitArchived(uuid, deleted) {
  track(setDoc(doc(db, 'fitness', getUid(), 'habits', uuid), { deleted, updated_at: serverTimestamp() }, { merge: true }));
}
