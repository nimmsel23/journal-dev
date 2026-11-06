/**
 * habits-dev Standalone-@db — Doppelwrapper über den modularen
 * Firestore-Layer von fitness-dev (gleiches Muster wie vitalos
 * src/shell/db/ und journal-dev src/db/).
 *
 * Ersetzt den früheren Hard-Alias auf fitness-dev/src/db.firestore.js
 * (toter Monolith). Habits braucht nur den fitness-Layer — Habits,
 * Journal-Anteile, Auth, todayISO/localToday kommen alle von dort.
 *
 * Firebase-Init ist einmalig: src/lib/firebase.js (habits-eigen, guarded).
 * Der resolveId-Redirect in vite.config.cjs leitet fitness-dev/src/firebase.js
 * darauf um.
 */

// Init zuerst evaluieren, damit die fitness-Module dieselbe Instanz sehen.
import "../lib/firebase.js";
import {
  collection,
  doc,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { addDoc, getDoc, getDocs, setDoc, writeBatch } from "../lib/offline.js";
import { listSessionsForDate as listFitnessSessionsForDate } from "@fitness-db/index.firestore.js";
import { applyManualHabitTransaction } from "../views/Habits/manualHabitTransaction.js";

export * from "@fitness-db/index.firestore.js";
import { db, getUid } from "@fitness-db/index.firestore.js";
import { todayISO } from "@fitness-db/shared/utils.js";
import {
  DAILY_DIMENSIONS,
  createDailyExecutionSnapshot,
  dailyAssignmentsLocked,
  dailyExecutionScore,
  linkDailyExecutionRecord as applyDailyRecordLink,
  normalizeDailyAssignments,
  replaceDailyAssignments,
  setDailyDimensionCompleted as updateDailyDimension,
} from "../views/Habits/dailyExecutionModel.js";
import {
  dailyNutritionRecordOption,
  dailyRelaxSessionOption,
  hasDailySkillRecordData,
} from "../views/Habits/dailySkillRecordModel.js";
import {
  TRACKER_HABITS,
  TRACKER_KEYS,
  TRACKER_FREQUENCY,
  isTrackerActive,
  trackerDatesToWrite,
} from "../views/Habits/trackerHabitModel.js";

const PUSH_DEFAULTS = {
  enabled: false,
  tokens: [],
  token: null,
  types: { workout: true, habit: true, restday: true },
  reminderTime: "18:00",
};

// Habit notifications belong to VitalOS. The shared Firestore document keeps
// app-specific settings and device tokens separate from Fitness.
export async function getPushSettings() {
  const snap = await getDoc(doc(db, "fitness", getUid(), "settings", "push"));
  if (!snap.exists()) return PUSH_DEFAULTS;
  const stored = snap.data() || {};
  const legacy = { ...stored, tokens: [], token: null };
  delete legacy.apps;
  const settings = stored.apps?.vitalos || legacy;
  const tokens = Array.from(new Set([...(settings.tokens || []), ...(settings.token ? [settings.token] : [])].filter(Boolean)));
  return { ...PUSH_DEFAULTS, ...settings, tokens, token: tokens[0] || null };
}

export async function savePushSettings(settings) {
  const tokens = Array.from(new Set([...(settings?.tokens || []), ...(settings?.token ? [settings.token] : [])].filter(Boolean)));
  await setDoc(doc(db, "fitness", getUid(), "settings", "push"), {
    apps: { vitalos: { ...settings, tokens, token: tokens[0] || null } },
    updated_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}

// Der modulare fitness-app Firestore-Barrel exportiert aktuell keine
// Habit-CRUD-Helpers. Die alten Re-Exports aus vitalos/src/cloud führten in
// habits-dev aber zu gesplittetem Auth-State: watchAuth/signIn kamen aus dem
// modularen Core, getHabits/recordHabit aus dem Monolithen mit eigener
// currentUid-Variable. Deshalb hier ein lokaler Wrapper auf derselben
// Firestore/Auth-Linie wie der Rest von habits-dev.
export async function getHabits(days = 28) {
  const snap = await getDocs(collection(db, "fitness", getUid(), "habits"));
  const habits = snap.docs.map((entry) => ({ uuid: entry.id, ...entry.data() }));

  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - (days - 1));

  const recordsQuery = query(
    collection(db, "fitness", getUid(), "habitRecords"),
    where("date", ">=", startDate.toISOString().slice(0, 10)),
    where("date", "<=", todayISO()),
    orderBy("date", "desc"),
  );
  const recordsSnap = await getDocs(recordsQuery);
  const allRecords = recordsSnap.docs.map((entry) => entry.data());

  return habits
    .map((habit) => {
      const records = allRecords.filter((record) => record.habitId === habit.uuid);
      return {
        ...habit,
        records,
        hasRecord: (date) => records.some((record) => record.date === date && record.completion === "DONE"),
      };
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function updateHabit(uuid, newName, newIcon, newCategory = null, newFrequency = null) {
  await setDoc(doc(db, "fitness", getUid(), "habits", uuid), {
    name: newName,
    icon: newIcon,
    category: newCategory,
    frequency: newFrequency,
    updated_at: serverTimestamp(),
  }, { merge: true });
}

export async function addHabit(name, icon = "Activity", category = null, frequency = null) {
  return addDoc(collection(db, "fitness", getUid(), "habits"), {
    name,
    icon,
    category,
    frequency,
    created_at: serverTimestamp(),
  });
}

export async function deleteHabit(uuid) {
  await setDoc(doc(db, "fitness", getUid(), "habits", uuid), {
    deleted: true,
  }, { merge: true });
}

export async function getHabitRecordsForDate(date = todayISO()) {
  const recordsQuery = query(
    collection(db, "fitness", getUid(), "habitRecords"),
    where("date", "==", date),
    where("completion", "==", "DONE"),
  );
  const snap = await getDocs(recordsQuery);
  return snap.docs.map((entry) => entry.data().habitId);
}

const dailyConfigRef = (uid) => doc(db, "fitness", uid, "settings", "dailyExecution");
const dailySnapshotRef = (uid, date) => doc(db, "fitness", uid, "dailyExecution", date);
const habitRef = (uid, id) => doc(db, "fitness", uid, "habits", id);
const habitRecordRef = (uid, id, date) => doc(db, "fitness", uid, "habitRecords", `${id}_${date}`);

function emptyDailyExecution(date) {
  return {
    schemaVersion: 1,
    date,
    configured: false,
    score: 0,
    dimensions: Object.fromEntries(DAILY_DIMENSIONS.map(({ key }) => [key, null])),
  };
}

function nextLocalDate(date) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + 1);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

export async function getDailyExecutionConfig() {
  const snap = await getDoc(dailyConfigRef(getUid()));
  return snap.exists() ? (snap.data() || {}) : { assignments: {}, effectiveDate: todayISO() };
}

export async function getDailyExecution(date = todayISO()) {
  const uid = getUid();
  const dayRef = dailySnapshotRef(uid, date);
  const configRef = dailyConfigRef(uid);
  // Existing days can be read from the persistent cache. Creation and every
  // modification still use a server transaction to protect concurrent writes.
  const existing = await getDoc(dayRef);
  if (existing.exists()) return { ...existing.data(), configured: true, fromCache: existing.metadata?.fromCache === true };
  return runTransaction(db, async (transaction) => {
    const [daySnap, configSnap] = await Promise.all([transaction.get(dayRef), transaction.get(configRef)]);
    if (daySnap.exists()) return { ...daySnap.data(), configured: true };
    // Never invent history using today's habit names or current assignments.
    if (date !== todayISO()) return emptyDailyExecution(date);

    const config = configSnap.exists() ? configSnap.data() || {} : {};
    if (!config.assignments || !DAILY_DIMENSIONS.every(({ key }) => config.assignments[key])
        || date < (config.effectiveDate || todayISO())) return emptyDailyExecution(date);
    const assignments = normalizeDailyAssignments(config.assignments, DAILY_DIMENSIONS.map(({ key }) => ({
      uuid: config.assignments[key]?.habitId || config.assignments[key],
      name: "placeholder",
    })));
    const selectedIds = DAILY_DIMENSIONS.map(({ key }) => assignments[key].habitId);
    const habitSnaps = await Promise.all(selectedIds.map((id) => transaction.get(habitRef(uid, id))));
    const habits = habitSnaps.map((snap, index) => ({ uuid: selectedIds[index], ...(snap.data() || {}) }));
    if (habits.some((habit, index) => !habitSnaps[index].exists() || habit.deleted)) return emptyDailyExecution(date);

    const normalized = normalizeDailyAssignments(config.assignments, habits);
    const snapshot = createDailyExecutionSnapshot({ date, assignments: normalized, habits });
    // A legacy habit record can come from Smart Logging or another tracker.
    // Daily Four points require the explicit Daily Four confirmation below;
    // never infer them while creating a day's first snapshot.
    transaction.set(dayRef, { ...snapshot, score: dailyExecutionScore(snapshot), configured: true });
    return { ...snapshot, score: dailyExecutionScore(snapshot), configured: true };
  });
}

export async function getDailyFitnessSessionOptions(date = todayISO()) {
  const sessions = await listFitnessSessionsForDate(date);
  return (sessions || []).flatMap((session) => {
    const duration = Number(session.duration || session.duration_minutes || session.activity?.duration || session.activity?.minutes) || 0;
    const exerciseCount = Array.isArray(session.exercises) ? session.exercises.length : 0;
    const hasDetail = exerciseCount > 0 || duration > 0 || (session.activityAddons || []).length > 0;
    if (!hasDetail) return [];
    const recordId = session.session_id || session.id ? `${date}__${session.session_id || session.id}` : date;
    const title = String(session.block || session.activity?.type || session.trainingsart || "Training").slice(0, 120);
    const detail = [duration ? `${duration} Min.` : null, exerciseCount ? `${exerciseCount} Übungen` : null].filter(Boolean).join(" · ");
    return [{ recordId, date, title, detail }];
  });
}

export async function linkDailyFitnessSession(date, dimensionKey, recordId) {
  if (date > todayISO()) throw new Error("daily_future_completion_not_allowed");
  if (typeof recordId !== "string" || !recordId || recordId.length > 180 || recordId.includes("/")) {
    throw new Error("daily_fitness_record_invalid");
  }
  const uid = getUid();
  const dayRef = dailySnapshotRef(uid, date);
  const sessionRef = doc(db, "fitness", uid, "sessions", recordId);
  const loaded = await getDailyExecution(date);
  if (!loaded.configured) throw new Error("daily_execution_not_configured");

  return runTransaction(db, async (transaction) => {
    const [daySnap, sessionSnap] = await Promise.all([transaction.get(dayRef), transaction.get(sessionRef)]);
    if (!daySnap.exists() || !sessionSnap.exists()) throw new Error("daily_fitness_record_missing");
    const snapshot = daySnap.data();
    const session = sessionSnap.data() || {};
    if (session.date !== date) throw new Error("daily_fitness_record_date_mismatch");
    const exerciseCount = Array.isArray(session.exercises) ? session.exercises.length : 0;
    const duration = Number(session.duration || session.duration_minutes || session.activity?.duration || session.activity?.minutes) || 0;
    if (!exerciseCount && !duration && !(session.activityAddons || []).length) throw new Error("daily_fitness_record_empty");

    const title = String(session.block || session.activity?.type || session.trainingsart || "Training").slice(0, 120);
    const next = applyDailyRecordLink(snapshot, dimensionKey, {
      skill: "fitness",
      recordId,
      date,
      title,
    });
    const score = dailyExecutionScore(next);
    transaction.set(dayRef, { ...next, score, configured: true });
    const assigned = next.dimensions?.[dimensionKey];
    transaction.set(habitRecordRef(uid, assigned.habitId, date), {
      habitId: assigned.habitId,
      date,
      completion: "DONE",
      dailyDimension: dimensionKey,
      dailyHabitName: assigned.habitName,
      dailyExecutionDate: date,
      linkedRecords: assigned.linkedRecords,
      recorded_at: serverTimestamp(),
    }, { merge: true });
    return { ...next, score, configured: true };
  });
}

const DAILY_LINK_SKILLS = Object.freeze({
  nutrition: { collection: "nutrition", emptyError: "daily_nutrition_record_empty" },
  relax: { collection: "relax", emptyError: "daily_relax_record_empty" },
});

export async function getDailyNutritionLogOptions(date = todayISO()) {
  const snap = await getDoc(doc(db, "nutrition", getUid(), "logs", date));
  if (!snap.exists()) return [];
  const option = dailyNutritionRecordOption(date, snap.data() || {});
  return option ? [option] : [];
}

export async function getDailyRelaxSessionOptions(date = todayISO()) {
  const snap = await getDoc(doc(db, "relax", getUid(), "sessions", date));
  if (!snap.exists()) return [];
  const option = dailyRelaxSessionOption(date, snap.data() || {});
  return option ? [option] : [];
}

export async function linkDailySkillRecord(date, dimensionKey, skill, recordId) {
  if (date > todayISO()) throw new Error("daily_future_completion_not_allowed");
  const config = DAILY_LINK_SKILLS[skill];
  if (!config || recordId !== date) throw new Error("daily_link_record_invalid");
  const uid = getUid();
  const dayRef = dailySnapshotRef(uid, date);
  const sourceRef = doc(db, config.collection, uid, skill === "nutrition" ? "logs" : "sessions", recordId);
  const loaded = await getDailyExecution(date);
  if (!loaded.configured) throw new Error("daily_execution_not_configured");

  return runTransaction(db, async (transaction) => {
    const [daySnap, sourceSnap] = await Promise.all([transaction.get(dayRef), transaction.get(sourceRef)]);
    if (!daySnap.exists() || !sourceSnap.exists()) throw new Error("daily_link_record_missing");
    const source = sourceSnap.data() || {};
    if (source.date && source.date !== date) throw new Error("daily_link_record_date_mismatch");
    if (!hasDailySkillRecordData(skill, source)) throw new Error(config.emptyError);
    const label = skill === "nutrition" ? "Ernährungseintrag" : "Relax-Praxis";
    const next = applyDailyRecordLink(daySnap.data(), dimensionKey, { skill, recordId, date, title: label });
    const score = dailyExecutionScore(next);
    transaction.set(dayRef, { ...next, score, configured: true });
    const assigned = next.dimensions?.[dimensionKey];
    transaction.set(habitRecordRef(uid, assigned.habitId, date), {
      habitId: assigned.habitId,
      date,
      completion: "DONE",
      dailyDimension: dimensionKey,
      dailyHabitName: assigned.habitName,
      dailyExecutionDate: date,
      linkedRecords: assigned.linkedRecords,
      recorded_at: serverTimestamp(),
    }, { merge: true });
    return { ...next, score, configured: true };
  });
}

export async function saveDailyExecutionAssignments(assignments, habits, date = todayISO()) {
  if (date !== todayISO()) throw new Error("daily_assignments_change_today_only");
  const uid = getUid();
  const configRef = dailyConfigRef(uid);
  const dayRef = dailySnapshotRef(uid, date);
  normalizeDailyAssignments(assignments, habits);

  return runTransaction(db, async (transaction) => {
    if (date !== todayISO()) throw new Error("daily_assignments_change_today_only");
    const [daySnap, ...habitSnaps] = await Promise.all([
      transaction.get(dayRef),
      ...DAILY_DIMENSIONS.map(({ key }) => {
        const candidate = assignments[key];
        const id = typeof candidate === "string" ? candidate : candidate?.habitId;
        return transaction.get(habitRef(uid, id));
      }),
    ]);
    const selectedHabits = habitSnaps.map((snap, index) => {
      const candidate = assignments[DAILY_DIMENSIONS[index].key];
      const id = typeof candidate === "string" ? candidate : candidate?.habitId;
      return { uuid: id, ...(snap.data() || {}) };
    });
    if (habitSnaps.some((snap, index) => !snap.exists() || selectedHabits[index].deleted)) {
      throw new Error("daily_assignment_habit_unavailable");
    }
    const normalized = normalizeDailyAssignments(assignments, selectedHabits);
    const oldSnapshot = daySnap.exists() ? daySnap.data() : null;
    const hasActivity = dailyAssignmentsLocked(oldSnapshot);
    const effectiveDate = hasActivity ? nextLocalDate(date) : date;
    transaction.set(configRef, {
      schemaVersion: 1,
      assignments: normalized,
      effectiveDate,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    if (oldSnapshot && !hasActivity) {
      transaction.set(dayRef, {
        ...replaceDailyAssignments(oldSnapshot, { assignments: normalized, habits: selectedHabits }),
        score: 0,
        configured: true,
      });
    }
    return { ok: true, effectiveDate };
  });
}

export async function setDailyExecutionCompleted(date, dimensionKey, completed) {
  if (completed && date > todayISO()) throw new Error("daily_future_completion_not_allowed");
  const uid = getUid();
  const loaded = await getDailyExecution(date);
  if (!loaded.configured) throw new Error("daily_execution_not_configured");
  const dayRef = dailySnapshotRef(uid, date);

  return runTransaction(db, async (transaction) => {
    const daySnap = await transaction.get(dayRef);
    if (!daySnap.exists()) throw new Error("daily_execution_missing");
    const snapshot = daySnap.data();
    const dimension = snapshot.dimensions?.[dimensionKey];
    if (!dimension?.habitId) throw new Error("daily_dimension_not_configured");
    const recordRef = habitRecordRef(uid, dimension.habitId, date);
    const next = updateDailyDimension(snapshot, dimensionKey, completed);
    transaction.set(dayRef, { ...next, score: dailyExecutionScore(next), configured: true });
    transaction.set(recordRef, {
      habitId: dimension.habitId,
      date,
      completion: completed ? "DONE" : "MISSED",
      dailyDimension: dimensionKey,
      dailyHabitName: dimension.habitName,
      dailyExecutionDate: date,
      recorded_at: serverTimestamp(),
    }, { merge: true });
    return { ...next, score: dailyExecutionScore(next), configured: true };
  });
}

export async function recordHabit(uuid, date = todayISO()) {
  await setDoc(doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`), {
    habitId: uuid,
    date,
    completion: "DONE",
    recorded_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}

export async function setHabitCompletionFromHabits(uuid, date, completed) {
  if (completed && date > todayISO()) throw new Error("daily_future_completion_not_allowed");
  const uid = getUid();
  return applyManualHabitTransaction({ db, dayRef: dailySnapshotRef(uid, date), recordRef: habitRecordRef(uid, uuid, date),
    configRef: dailyConfigRef(uid), habitRef: (id) => habitRef(uid, id),
    habitId: uuid, date, today: todayISO(), completed, runTransaction, serverTimestamp });
}

export async function unrecordHabit(uuid, date = todayISO()) {
  await setDoc(doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`), {
    habitId: uuid,
    date,
    completion: "MISSED",
    recorded_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}

export async function saveHabitOrder(orderedUuids) {
  const batch = writeBatch(db);
  orderedUuids.forEach((uuid, idx) => {
    const ref = doc(db, "fitness", getUid(), "habits", uuid);
    batch.set(ref, { order: idx }, { merge: true });
  });
  await batch.commit();
}

// ── Tracker-Habits (Ur-Modell: alles ist ein umfunktioniertes Journal) ────────
// Unter der Haube bekommt jeder Tracker der Daily Four — Fitness (Sessions),
// Fuel (Mahlzeiten/Ernährung), Relax (Meditation) — ein verstecktes System-Habit
// (hidden:true, systemTracker:<key>). Tages-Aktivität wird als DONE-Record in
// habitRecords gespiegelt — nur additiv, mit systemTracker-Provenance; nichts
// wird je zurückgenommen. Memoirs (Journal/Habits) sind ohnehin direkt im
// Bestand. Damit gilt die Daily Four einheitlich im Habits-Modell und im
// Mindest-Log (src/lib/focus/). Konzept: docs/FOKUS-DAILY-FOUR-TRACKER-HABITS.md

function isoFromToday(offsetDays) {
  const value = new Date();
  value.setDate(value.getDate() + offsetDays);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

/** Legt die versteckten System-Habits je Tracker an (idempotent); liefert key → uuid. */
export async function ensureTrackerHabits() {
  const uid = getUid();
  const snap = await getDocs(collection(db, "fitness", uid, "habits"));
  const byTracker = {};
  for (const entry of snap.docs) {
    const key = entry.data()?.systemTracker;
    if (TRACKER_KEYS.includes(key) && !entry.data()?.deleted && !byTracker[key]) byTracker[key] = entry.id;
  }
  for (const tracker of TRACKER_HABITS) {
    if (byTracker[tracker.key]) continue;
    const ref = await addDoc(collection(db, "fitness", uid, "habits"), {
      name: tracker.name,
      icon: tracker.icon,
      category: null,
      frequency: TRACKER_FREQUENCY,
      hidden: true,
      systemTracker: tracker.key,
      created_at: serverTimestamp(),
    });
    byTracker[tracker.key] = ref.id;
  }
  return byTracker;
}

/**
 * Spiegelt Tracker-Aktivität der letzten `days` Tage als DONE-Records der
 * System-Habits (Backfill inklusive). Nur additiv: bestehende Records bleiben
 * unberührt, Tage ohne Aktivität werden nicht vermerkt. Für Fire-and-forget
 * beim App-Start gedacht — Netzfehler pro Tag werden ignoriert (Safe-Default).
 */
export async function syncTrackerHabits(days = 28) {
  const uid = getUid();
  const today = todayISO();
  const count = Math.max(1, Math.min(Number(days) || 28, 90));
  const byTracker = await ensureTrackerHabits();
  const uuidToTracker = new Map(Object.entries(byTracker).map(([key, uuid]) => [uuid, key]));
  const since = isoFromToday(-(count - 1));

  // Bestehende DONE-Tage je System-Habit im Fenster (ein Read).
  const doneByTracker = {};
  const recordsSnap = await getDocs(query(
    collection(db, "fitness", uid, "habitRecords"),
    where("date", ">=", since), where("date", "<=", today), orderBy("date", "desc")));
  for (const entry of recordsSnap.docs) {
    const data = entry.data() || {};
    const key = uuidToTracker.get(data.habitId);
    if (key && data.completion === "DONE") (doneByTracker[key] ||= new Set()).add(data.date);
  }

  // Tages-Datenstände der letzten `days` Tage: Sessions (Array), Ernährungs- und
  // Relax-Tagesdoc — dieselben Formen wie Daily-Four-Options/Mindest-Log.
  const range = Array.from({ length: count }, (_, i) => isoFromToday(-(count - 1 - i)));
  const dayData = await Promise.all(range.map(async (date) => {
    const [sessions, fuelSnap, relaxSnap] = await Promise.all([
      listFitnessSessionsForDate(date).catch(() => []),
      getDoc(doc(db, "nutrition", uid, "logs", date)).catch(() => null),
      getDoc(doc(db, "relax", uid, "sessions", date)).catch(() => null),
    ]);
    return {
      date,
      fitness: Array.isArray(sessions) ? sessions : [],
      fuel: fuelSnap?.exists?.() ? (fuelSnap.data() || {}) : null,
      relax: relaxSnap?.exists?.() ? (relaxSnap.data() || {}) : null,
    };
  }));

  // Diff je Tracker (pure Logik in trackerHabitModel) und additive Writes.
  let written = 0;
  for (const tracker of TRACKER_HABITS) {
    const days = Object.fromEntries(dayData.map(({ date, [tracker.key]: log }) => [date, log]));
    const dates = trackerDatesToWrite({
      trackerKey: tracker.key,
      days,
      doneDays: doneByTracker[tracker.key],
      today,
    });
    for (const date of dates) {
      const uuid = byTracker[tracker.key];
      await setDoc(habitRecordRef(uid, uuid, date), {
        habitId: uuid,
        date,
        completion: "DONE",
        systemTracker: tracker.key,
        recorded_at: serverTimestamp(),
      }, { merge: true });
      written++;
    }
  }
  return { ok: true, written, days: range.length };
}

// index.firestore.js hat bewusst keinen Fuel-Proxy mehr (learn-dev braucht
// @fuel nicht) — der eingebettete Journal-Tab (@journal → JournalTimeline)
// hier in habits-dev braucht Fuel-Daten aber schon, deshalb explizit:
export { getMealsHistory, getNutritionNotesHistory, getSupplementsHistory } from "@fuel/lib/db/firestore/index.js";
