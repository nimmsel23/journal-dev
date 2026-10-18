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
  collection, doc, addDoc, setDoc, getDoc, getDocs, deleteDoc,
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

// +hot im Journal → Door › Potential. Marker `hot_potential` am Eintrag verhindert Doppel-Anlage bei
// späterem Bearbeiten; scheitert die Quelle (z. B. Taskwarrior nicht verbunden), bleibt der Marker aus
// und der nächste Speichervorgang des Eintrags versucht es erneut. Journal-Speichern bleibt unberührt.
async function hotToPotential(userId, id, text, tags) {
  try {
    const { hasHotTag, addToPotential } = await import("../door/hotFromJournal.js");
    if (!hasHotTag(tags)) return;
    const ref = doc(journalCol(userId), id);
    if ((await getDoc(ref)).data()?.hot_potential) return;
    if (await addToPotential(text)) await setDoc(ref, { hot_potential: true }, { merge: true });
  } catch (e) {
    console.warn("+hot → Potential fehlgeschlagen:", e?.message || e);
  }
}

// +p / +profit / +review im Journal → Door › Profit (Reviews). Doc-ID = Eintrags-ID, daher idempotent.
async function profitReview(userId, id, text, tags, date) {
  try {
    const m = await import("../door/profitFromJournal.js");
    if (!m.hasProfitTag(tags)) return;
    let d = date;
    if (!d) d = (await getDoc(doc(journalCol(userId), id))).data()?.date;
    await m.saveProfitReview(userId, id, { text, date: d, tags });
  } catch (e) {
    console.warn("+profit → Profit-Review fehlgeschlagen:", e?.message || e);
  }
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

// Range-Query: get journal entries within date range (for UI display)
export async function getJournalRange(startDate, endDate) {
  try {
    const userId = await uid();
    const q = query(
      journalCol(userId),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(normalizeEntry)
      .filter((e) => e.text);
  } catch (error) {
    console.error("Error fetching journal range:", error);
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

export async function saveJournal(date = localToday(), text, opts = {}) {
  const userId = await uid();
  const content = String(text || "").trim();
  const time = new Date().toISOString();
  const { tags = [], startDate, endDate } = opts;
  const docData = {
    date,
    text: content,
    tags,
    time,
    created_at: serverTimestamp(),
  };
  if (startDate) docData.startDate = startDate;
  if (endDate) docData.endDate = endDate;
  const ref = await addDoc(journalCol(userId), docData);
  void hotToPotential(userId, ref.id, content, tags);
  void profitReview(userId, ref.id, content, tags, date);
  return { id: ref.id, date, text: content, time, startDate, endDate };
}

export async function updateJournal(id, text, opts = {}) {
  const userId = await uid();
  const content = String(text || "").trim();
  const { startDate, endDate, tags } = opts;
  const patch = { text: content, updated_at: serverTimestamp() };
  // Alt-Doc (Doc-ID = Datum): date-Feld nachziehen, damit where("date")-Queries es finden
  if (DATE_ID.test(id)) patch.date = id;
  patch.startDate = startDate || null;
  patch.endDate = endDate || null;
  if (tags) patch.tags = tags;
  await setDoc(doc(journalCol(userId), id), patch, { merge: true });
  if (tags) { void hotToPotential(userId, id, content, tags); void profitReview(userId, id, content, tags); }
  return { ok: true, id, text: content, startDate, endDate, tags };
}

// Uhrzeit eines Eintrags ändern (Journal v2: Drag auf die Timeline). `time` ist
// ein ISO-String (UTC), `date` bleibt unverändert.
export async function setJournalTime(id, isoTime) {
  const userId = await uid();
  await setDoc(doc(journalCol(userId), id), { time: isoTime, updated_at: serverTimestamp() }, { merge: true });
  return { ok: true, id, time: isoTime };
}

export async function deleteJournal(id) {
  const userId = await uid();
  await deleteDoc(doc(journalCol(userId), id));
  // zugehörige Profit-Review (+profit/+review/+p) mit entfernen – best effort
  import("../door/profitFromJournal.js").then((m) => m.removeProfitReview(userId, id)).catch(() => {});
  return { ok: true, id };
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
