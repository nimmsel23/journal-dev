/**
 * Firestore Data Layer — Fuel Centre (Multi-User)
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut as fbSignOut
} from "firebase/auth";
import { db, auth, googleProvider } from "./firebase.js";

// ── Auth ──────────────────────────────────────────────────────────────────────

export function watchAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    console.log(`[Auth] User status changed: ${user ? user.email : "logged out"}`);
    callback(user);
  });
}

export async function signIn() {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Login Fehler:", error);
    throw error;
  }
}

export async function signOut() {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error("Logout Fehler:", error);
    throw error;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getUid() {
  if (!auth.currentUser) throw new Error("User not authenticated");
  return auth.currentUser.uid;
}

export { serverTimestamp, db };

export const MICRO_KEYS = [
  "vitamin_a_ug", "vitamin_d_ug", "vitamin_e_mg", "vitamin_k_ug",
  "vitamin_c_mg", "vitamin_b1_mg", "vitamin_b2_mg", "vitamin_b3_mg",
  "vitamin_b5_mg", "vitamin_b6_mg", "vitamin_b7_ug", "folate_ug", "vitamin_b12_ug",
  "calcium_mg", "phosphorus_mg", "magnesium_mg", "iron_mg", "zinc_mg",
  "selenium_ug", "iodine_ug", "potassium_mg", "sodium_mg",
  "omega3_mg",
];

export function zeroMicros() {
  return Object.fromEntries(MICRO_KEYS.map((k) => [k, 0]));
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function localToday() { return todayISO(); }

function randomId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function getWeekDates(year, week) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(ISOweekStart);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getUserSettings() {
  const snap = await getDoc(doc(db, "users", getUid(), "meta", "settings"));
  return snap.exists() ? snap.data() : null;
}

export async function saveUserSettings(settings) {
  await setDoc(doc(db, "users", getUid(), "meta", "settings"), {
    ...settings,
    updated_at: serverTimestamp(),
  });
}

// ── Nutrition ─────────────────────────────────────────────────────────────────

export async function getNutritionCatalog() {
  const ref = doc(db, "nutrition", getUid(), "meta", "catalog");
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().items || []) : [];
}

export async function getMicrosCatalog() {
  const ref = doc(db, "nutrition", "public", "meta", "micros");
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().items || []) : [];
}

export async function getNutritionLog(date = todayISO()) {
  const snap = await getDoc(doc(db, "nutrition", getUid(), "logs", date));
  return snap.exists() ? snap.data() : { date, meals: [], water_ml: 0 };
}

export async function saveNutritionLog(date, data) {
  await setDoc(doc(db, "nutrition", getUid(), "logs", date), {
    ...data,
    updated_at: serverTimestamp(),
  }, { merge: true });
}

export async function getNutritionLogsInRange(dates) {
  const q = query(
    collection(db, "nutrition", getUid(), "logs"),
    where("date", "in", dates)
  );
  const snap = await getDocs(q);
  const map = {};
  snap.forEach(d => { map[d.id] = d.data(); });
  return map;
}

export async function searchNutritionCatalog(q, limit = 20) {
  const items = await getNutritionCatalog();
  const lowerQ = q.toLowerCase();
  return items
    .filter(i => i.name.toLowerCase().includes(lowerQ))
    .slice(0, limit);
}

export async function getWeeklyMicros(year, week) {
  const dates = getWeekDates(year, week);
  const logsMap = await getNutritionLogsInRange(dates);
  const suppLogsSnap = await getDocs(query(collection(db, "supplements", getUid(), "logs"), where("date", "in", dates)));
  const suppLogsMap = {};
  suppLogsSnap.forEach(d => { suppLogsMap[d.id] = d.data(); });

  const catalog = await getNutritionCatalog();
  const suppCatalog = await getSupplementsCatalog();
  const microsCatalog = await getMicrosCatalog();
  
  const suppCatalogMap = Object.fromEntries(suppCatalog.map(i => [i.id, i]));
  const microsMap = Object.fromEntries(microsCatalog.map(i => [i.meal_name, i]));

  const weekTotals = zeroMicros();
  const dayBreakdown = {};

  for (const date of dates) {
    const log = logsMap[date] || { meals: [] };
    const dayTotals = zeroMicros();

    for (const meal of log.meals || []) {
      const catalogEntry = catalog.find(i => (meal.catalog_id && i.id === meal.catalog_id) || i.name === meal.description);
      const lookupName = catalogEntry?.name || meal.description;
      const micros = microsMap[lookupName];

      if (micros) {
        for (const k of MICRO_KEYS) {
          dayTotals[k] = Math.round((dayTotals[k] + (micros[k] || 0)) * 10) / 10;
        }
      }
    }

    const suppLog = suppLogsMap[date] || { intakes: [] };
    for (const intake of suppLog.intakes || []) {
      const entry = suppCatalogMap[intake.supplement_id];
      if (entry?.micros) {
        for (const k of MICRO_KEYS) {
          if (entry.micros[k]) {
            dayTotals[k] = Math.round((dayTotals[k] + entry.micros[k]) * 10) / 10;
          }
        }
      }
    }

    dayBreakdown[date] = dayTotals;
    for (const k of MICRO_KEYS) {
      weekTotals[k] = Math.round((weekTotals[k] + dayTotals[k]) * 10) / 10;
    }
  }

  // Comparison logic is handled by the caller or we can import it, but shared/config/dach.mjs is ESM
  // Since we are in the client, we can just import it.
  const { DACH, getStatus } = await import("../shared/config/dach.mjs");
  const rda_comparison = {};
  for (const [key, dach] of Object.entries(DACH)) {
    const avg = weekTotals[key] / 7;
    rda_comparison[key] = {
      dach: dach.value,
      unit: dach.unit,
      total_week: Math.round(weekTotals[key] * 10) / 10,
      avg_daily: Math.round(avg * 10) / 10,
      percent_of_dach: Math.round((avg / dach.value) * 100),
      status: getStatus(avg, dach.value),
    };
  }

  return { ok: true, year, week, dates, week_totals: weekTotals, rda_comparison, day_breakdown };
}

// ── Journal ───────────────────────────────────────────────────────────────────

export async function getJournal(date = todayISO()) {
  const snap = await getDoc(doc(db, "nutrition", getUid(), "journal", date));
  return snap.exists() ? snap.data().content : "";
}

export async function saveJournal(date = todayISO(), content) {
  await setDoc(doc(db, "nutrition", getUid(), "journal", date), {
    date,
    content,
    updated_at: serverTimestamp(),
  });
}

// ── Supplements ───────────────────────────────────────────────────────────────

export async function getSupplementsCatalog() {
  const ref = doc(db, "supplements", getUid(), "meta", "catalog");
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().items || []) : [];
}

export async function getSupplementLog(date = todayISO()) {
  const snap = await getDoc(doc(db, "supplements", getUid(), "logs", date));
  return snap.exists() ? snap.data() : { date, intakes: [] };
}

export async function getSupplementStats(anchorDate, days = 30) {
  const anchor = new Date(anchorDate);
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(anchor);
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  });

  const snap = await getDocs(query(collection(db, "supplements", getUid(), "logs"), orderBy("date", "desc"), limit(days)));
  const logsMap = {};
  snap.forEach(doc => { logsMap[doc.id] = doc.data(); });

  const catalog = await getSupplementsCatalog();
  const stats = {};

  // Initialize stats from intakes found in logs
  Object.values(logsMap).forEach(log => {
    (log.intakes || []).forEach(intake => {
      const suppId = intake.supplement_id;
      if (!stats[suppId]) {
        const catalogItem = catalog.find(i => i.id === suppId);
        stats[suppId] = {
          supplement: catalogItem || { id: suppId, name: intake.name || suppId },
          days_taken: 0,
          current_streak: 0,
        };
      }
      stats[suppId].days_taken += 1;
    });
  });

  // Calculate streaks
  const todayStr = todayISO();
  for (const suppId in stats) {
    let streak = 0;
    for (const dateStr of dates) {
      const log = logsMap[dateStr];
      const hasIntake = log && (log.intakes || []).some(i => i.supplement_id === suppId);
      if (hasIntake) {
        streak += 1;
      } else if (dateStr === todayStr) {
        continue; // Don't break streak if today isn't logged yet
      } else {
        break;
      }
    }
    stats[suppId].current_streak = streak;
  }

  return { ok: true, anchor: anchorDate, days, stats: Object.values(stats) };
}
