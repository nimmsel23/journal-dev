// habits.js — Firestore-backed habits (collection: fitness/{uid}/habits).
// Mirrors fitness-dev's habits API surface as expected by HabitVosView.

import { localToday } from "./core.js";
import { db, auth } from "../firebase.js";
import {
  collection, doc, addDoc, getDoc, getDocs, setDoc, deleteDoc,
  serverTimestamp, query, orderBy, limit as fbLimit,
} from "firebase/firestore";

function uid() {
  const u = auth?.currentUser?.uid;
  if (!u) throw new Error("not authenticated");
  return u;
}

function habitsCol(userId) {
  return collection(db, "fitness", userId, "habits");
}

function normalizeRecord(record) {
  const date = record?.date
    || (record?.epochDay !== undefined
        ? new Date(Number(record.epochDay) * 86400000).toISOString().slice(0, 10)
        : null);
  if (!date) return null;
  return { ...record, date, completion: record?.completion || (record?.done ? "DONE" : "MISSED") };
}

async function mapHabitDoc(snap) {
  const data = snap.data() || {};
  const records = (data.records || []).map(normalizeRecord).filter(Boolean);
  return {
    uuid: snap.id,
    name: data.name || "",
    icon: data.icon || "Activity",
    deleted: !!data.deleted,
    source: data.source || "user",
    records,
    hasRecord: (date) => records.some((x) => x.date === date && x.completion === "DONE"),
  };
}

export async function getHabits() {
  try {
    const userId = uid();
    const snaps = await getDocs(habitsCol(userId));
    const habits = await Promise.all(snaps.docs.map(mapHabitDoc));
    return habits.filter((h) => !h.deleted);
  } catch {
    return [];
  }
}

export async function addHabit(name, icon = "Activity") {
  const userId = uid();
  const ref = await addDoc(habitsCol(userId), {
    name: String(name || "").trim(),
    icon,
    deleted: false,
    source: "user",
    records: [],
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return { ok: true, uuid: ref.id };
}

export async function deleteHabit(uuid_) {
  const userId = uid();
  await setDoc(doc(habitsCol(userId), uuid_), { deleted: true, updated_at: serverTimestamp() }, { merge: true });
  return { ok: true };
}

export async function updateHabit(uuid_, newName, newIcon) {
  const userId = uid();
  await setDoc(doc(habitsCol(userId), uuid_), {
    name: String(newName || "").trim(),
    icon: newIcon || "Activity",
    updated_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}

async function toggleRecord(uuid_, date, want) {
  const userId = uid();
  const ref = doc(habitsCol(userId), uuid_);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { ok: false };
  const data = snap.data();
  const records = (data.records || []).filter((r) => r?.date !== date);
  if (want) records.push({ date, completion: "DONE", logged_at: new Date().toISOString() });
  await setDoc(ref, { records, updated_at: serverTimestamp() }, { merge: true });
  return { ok: true };
}

export async function recordHabit(uuid_, date = localToday()) {
  return toggleRecord(uuid_, date, true);
}

export async function unrecordHabit(uuid_, date = localToday()) {
  return toggleRecord(uuid_, date, false);
}

export async function getHabitRecordsForDate(date = localToday()) {
  const habits = await getHabits();
  return habits.filter((h) => h.hasRecord(date)).map((h) => h.uuid);
}

// ── Habit journals (memoirs) ────────────────────────────────────────────────

function habitJournalDoc(userId, habitId, date) {
  return doc(db, "fitness", userId, "habits", habitId, "journal", date);
}

export async function getHabitJournal(habitId, date) {
  try {
    const userId = uid();
    const snap = await getDoc(habitJournalDoc(userId, habitId, date));
    if (!snap.exists()) return null;
    const d = snap.data();
    return { date, text: d?.text || "", updated_at: d?.updated_at?.toDate?.()?.toISOString?.() };
  } catch {
    return null;
  }
}

export async function getHabitJournalHistory(habitId) {
  try {
    const userId = uid();
    const snaps = await getDocs(
      query(collection(db, "fitness", userId, "habits", habitId, "journal"),
        orderBy("date", "desc"), fbLimit(60))
    );
    return snaps.docs.map((s) => ({
      date: s.id,
      text: s.data()?.text || "",
      updated_at: s.data()?.updated_at?.toDate?.()?.toISOString?.() || s.id,
    }));
  } catch {
    return [];
  }
}

export async function saveHabitJournal(habitId, date, text) {
  try {
    const userId = uid();
    await setDoc(habitJournalDoc(userId, habitId, date), {
      text: String(text || "").trim(),
      updated_at: serverTimestamp(),
    }, { merge: true });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
