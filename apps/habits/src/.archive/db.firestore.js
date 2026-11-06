import {
  collection, doc, addDoc, setDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup, getRedirectResult,
  signOut as fbSignOut,
} from "firebase/auth";
import { db, auth, googleProvider } from "./lib/firebase.js";

export { db, auth };

export function isLocalMode() { return false; }

export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function todayISO() { return localToday(); }

function getUid() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Nicht eingeloggt");
  return uid;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

let _lastProfileKey = null;

export function watchAuth(callback) {
  getRedirectResult(auth).catch(() => {});
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profileKey = `${user.uid}:${user.email}:${user.displayName}`;
      if (profileKey !== _lastProfileKey) {
        _lastProfileKey = profileKey;
        try {
          await setDoc(doc(db, "fitness", user.uid, "profile", "metadata"), {
            email: user.email || "",
            displayName: user.displayName || "",
            updated_at: serverTimestamp(),
          }, { merge: true });
        } catch (e) {
          console.error("Profile sync error:", e);
        }
      }
    }
    callback?.(user);
  });
}

export async function signIn() {
  await signInWithPopup(auth, googleProvider);
}

export async function signOut() { await fbSignOut(auth); }

// ── Habits ────────────────────────────────────────────────────────────────────

export async function getHabits(days = 28) {
  const snap = await getDocs(collection(db, "fitness", getUid(), "habits"));
  const habits = snap.docs.map(d => ({ uuid: d.id, ...d.data() }));

  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - (days - 1));

  const q = query(
    collection(db, "fitness", getUid(), "habitRecords"),
    where("date", ">=", startDate.toISOString().slice(0, 10)),
    where("date", "<=", todayISO()),
    orderBy("date", "desc"),
  );
  const recordsSnap = await getDocs(q);
  const allRecords = recordsSnap.docs.map(d => d.data());

  return habits.map(h => {
    const habitRecords = allRecords.filter(r => r.habitId === h.uuid);
    return {
      ...h,
      records: habitRecords,
      hasRecord: (date) => habitRecords.some(r => r.date === date && r.completion === "DONE"),
    };
  });
}

export async function updateHabit(uuid, newName, newIcon) {
  await setDoc(doc(db, "fitness", getUid(), "habits", uuid), {
    name: newName,
    icon: newIcon,
    updated_at: serverTimestamp(),
  }, { merge: true });
}

export async function addHabit(name, icon = "Activity") {
  return await addDoc(collection(db, "fitness", getUid(), "habits"), {
    name,
    created_at: serverTimestamp(),
  });
}

export async function deleteHabit(uuid) {
  await setDoc(doc(db, "fitness", getUid(), "habits", uuid), { deleted: true }, { merge: true });
}

export async function getHabitRecordsForDate(date = todayISO()) {
  const q = query(
    collection(db, "fitness", getUid(), "habitRecords"),
    where("date", "==", date),
    where("completion", "==", "DONE"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().habitId);
}

export async function recordHabit(uuid, date = todayISO()) {
  const ref = doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`);
  await setDoc(ref, {
    habitId: uuid,
    date,
    completion: "DONE",
    recorded_at: serverTimestamp(),
  });
  return { ok: true };
}

export async function unrecordHabit(uuid, date = todayISO()) {
  const ref = doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`);
  await setDoc(ref, {
    habitId: uuid,
    date,
    completion: "MISSED",
    recorded_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}

// ── Habit Journals ────────────────────────────────────────────────────────────

export async function getHabitJournal(habitId, date) {
  const q = query(
    collection(db, "fitness", getUid(), "habitJournals"),
    where("habitId", "==", habitId),
    where("date", "==", date),
    limit(1),
  );
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].data();
}

export async function getHabitJournalHistory(habitId) {
  const q = query(
    collection(db, "fitness", getUid(), "habitJournals"),
    where("habitId", "==", habitId),
    orderBy("date", "desc"),
    limit(20),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function getAllHabitJournalsHistory(limitCount = 50) {
  const q = query(
    collection(db, "fitness", getUid(), "habitJournals"),
    orderBy("date", "desc"),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data(), type: "habit" }));
}

export async function saveHabitJournal(habitId, date, text) {
  const ref = doc(db, "fitness", getUid(), "habitJournals", `${habitId}_${date}`);
  await setDoc(ref, {
    habitId,
    date,
    text: text.trim(),
    updated_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}
