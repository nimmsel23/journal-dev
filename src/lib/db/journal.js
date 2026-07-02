// journal.js — fitness-style journal (free-text per day, plus history).
// Reads/writes through Firestore via the existing firestore-db.js layer,
// so it works both in dev (Vite + cloud detection) and in firebase build.
//
// Routes data to: fitness/{uid}/journal/{date} (parity with fitness-dev).

import { api, localToday } from "./core.js";
import { db, auth } from "../firebase.js";
import {
  collection, doc, getDoc, getDocs, setDoc, query, orderBy, limit as fbLimit,
  serverTimestamp,
} from "firebase/firestore";

function uid() {
  const u = auth?.currentUser?.uid;
  if (!u) throw new Error("not authenticated");
  return u;
}

function journalCol(userId) {
  return collection(db, "fitness", userId, "journal");
}

export async function getJournal(date = localToday()) {
  try {
    const userId = uid();
    const snap = await getDoc(doc(journalCol(userId), date));
    if (!snap.exists()) return [];
    const data = snap.data();
    if (!data?.content) return [];
    return [{ id: date, date, text: data.content, time: data.updated_at?.toDate?.()?.toISOString?.() || date }];
  } catch {
    return [];
  }
}

export async function getJournalHistory(limitCount = 50) {
  try {
    const userId = uid();
    const q = query(journalCol(userId), orderBy("date", "desc"), fbLimit(limitCount));
    const snaps = await getDocs(q);
    return snaps.docs.map((s) => {
      const d = s.data();
      return {
        id: s.id,
        date: s.id,
        text: d.content || "",
        time: d.updated_at?.toDate?.()?.toISOString?.() || s.id,
      };
    });
  } catch {
    return [];
  }
}

export async function saveJournal(date = localToday(), text) {
  const content = String(text || "").trim();
  const userId = uid();
  await setDoc(doc(journalCol(userId), date), {
    content,
    updated_at: serverTimestamp(),
  }, { merge: true });
  return { id: date, date, text: content, time: new Date().toISOString() };
}

export async function updateJournal(id, text) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(id) ? id : localToday();
  return saveJournal(date, text);
}

export async function deleteJournal(id) {
  // Soft-delete by writing empty content.
  return saveJournal(id, "");
}

// ── Habit-journal cross-views (used by Journal/index.jsx) ────────────────────

export async function getAllHabitJournalsForDate(date) {
  try {
    const userId = uid();
    const habitsSnap = await getDocs(collection(db, "fitness", userId, "habits"));
    const out = [];
    for (const h of habitsSnap.docs) {
      const j = await getDoc(doc(db, "fitness", userId, "habits", h.id, "journal", date));
      if (j.exists() && j.data()?.text) {
        out.push({ id: `${h.id}_${date}`, habitId: h.id, date, text: j.data().text, type: "habit" });
      }
    }
    return out;
  } catch {
    return [];
  }
}

export async function getAllHabitJournalsHistory(limitCount = 50) {
  try {
    const userId = uid();
    const habitsSnap = await getDocs(collection(db, "fitness", userId, "habits"));
    const out = [];
    for (const h of habitsSnap.docs) {
      const jSnaps = await getDocs(
        query(collection(db, "fitness", userId, "habits", h.id, "journal"),
          orderBy("date", "desc"), fbLimit(limitCount))
      );
      jSnaps.docs.forEach((s) => {
        const d = s.data();
        if (d?.text) {
          out.push({
            id: `${h.id}_${s.id}`,
            habitId: h.id,
            date: s.id,
            text: d.text,
            type: "habit",
            time: d.updated_at?.toDate?.()?.toISOString?.() || s.id,
          });
        }
      });
    }
    return out
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limitCount);
  } catch {
    return [];
  }
}

