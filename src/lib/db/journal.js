// journal.js — Journal + HabitJournal DB-Layer (Firestore).
// journal-dev besitzt dieses Modul; fitness-dev re-exportiert es als
// src/lib/db/local/journal.js (via @journal-Alias).
//
// Schema ist kanonisch identisch mit fitness-dev src/lib/db/firestore/journal.js:
//   fitness/{uid}/journal           ein Doc PRO EINTRAG (addDoc, auto-ID)
//                                   { date, text, tags, time, created_at }
//   fitness/{uid}/habitJournals     Doc-ID `${habitId}_${date}`
//                                   { habitId, date, text, updated_at }
//
// Lese-Kompat: Docs des früheren 1-Doc-pro-Tag-Formats (Doc-ID = Datum,
// Feld `content`) werden beim Lesen auf { text, date, time } gemappt.

import { localToday } from "./core.js";
import { db, auth } from "../firebase.js";
import {
  collection, doc, addDoc, setDoc, getDocs,
  query, where, orderBy, limit as fbLimit, serverTimestamp,
} from "firebase/firestore";

async function uid() {
  // Wait for auth state to be ready before giving up
  await auth?.authStateReady?.();
  const u = auth?.currentUser?.uid;
  if (!u) throw new Error("not authenticated");
  return u;
}

const DATE_ID = /^\d{4}-\d{2}-\d{2}$/;

function normalizeEntry(snap) {
  const d = snap.data() || {};
  return {
    id: snap.id,
    ...d,
    text: d.text ?? d.content ?? "",
    date: d.date || (DATE_ID.test(snap.id) ? snap.id : localToday()),
    time: d.time || d.updated_at?.toDate?.()?.toISOString?.() || d.date || snap.id,
  };
}

function journalCol(userId) {
  return collection(db, "fitness", userId, "journal");
}

// ── Journal ───────────────────────────────────────────────────────────────────

export async function getJournal(date = localToday()) {
  try {
    const userId = await uid();
    const q = query(journalCol(userId), where("date", "==", date));
    const snap = await getDocs(q);
    return snap.docs
      .map(normalizeEntry)
      .filter((e) => e.text)
      .sort((a, b) => (b.time || "").localeCompare(a.time || ""));
  } catch {
    return [];
  }
}

export async function getJournalHistory(limitCount = 50) {
  try {
    const userId = await uid();
    const q = query(journalCol(userId), orderBy("date", "desc"), fbLimit(limitCount));
    const snap = await getDocs(q);
    return snap.docs
      .map(normalizeEntry)
      .filter((e) => e.text)
      .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.time || "").localeCompare(a.time || ""));
  } catch {
    return [];
  }
}

export async function saveJournal(date = localToday(), text, tags = []) {
  const userId = await uid();
  const content = String(text || "").trim();
  const time = new Date().toISOString();
  const ref = await addDoc(journalCol(userId), {
    date,
    text: content,
    tags,
    time,
    created_at: serverTimestamp(),
  });
  return { id: ref.id, date, text: content, time };
}

export async function updateJournal(id, text) {
  const userId = await uid();
  const content = String(text || "").trim();
  const patch = { text: content, updated_at: serverTimestamp() };
  // Alt-Doc (Doc-ID = Datum): date-Feld nachziehen, damit where("date")-Queries es finden
  if (DATE_ID.test(id)) patch.date = id;
  await setDoc(doc(journalCol(userId), id), patch, { merge: true });
  return { ok: true, id, text: content };
}

// ── HabitJournal Timeline-Reads ───────────────────────────────────────────────
// Nur Aggregat-Reads für die Journal-Timeline. Das HabitJournal-CRUD
// (getHabitJournal/saveHabitJournal/getHabitJournalHistory) besitzt die
// Habit-Domain: habits-dev (local) bzw. fitness-dev firestore/journal.js —
// hier NICHT exportieren, sonst kollidiert `export *` im fitness-Barrel.

function habitJournalCol(userId) {
  return collection(db, "fitness", userId, "habitJournals");
}

export async function getAllHabitJournalsHistory(limitCount = 50) {
  try {
    const userId = await uid();
    const q = query(habitJournalCol(userId), orderBy("date", "desc"), fbLimit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data(), type: "habit" }));
  } catch {
    return [];
  }
}

export async function getAllHabitJournalsForDate(date) {
  try {
    const userId = await uid();
    const q = query(habitJournalCol(userId), where("date", "==", date));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data(), type: "habit" }));
  } catch {
    return [];
  }
}

