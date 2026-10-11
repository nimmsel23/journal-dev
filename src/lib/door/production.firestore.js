/**
 * Door > Production — Firestore-natives Gegenstück zu production.rest.js.
 * Wöchentlicher Daily-Hit-Plan (Mon–Fri), abgeleitet aus dem War Stack der
 * in Plan gewählten Door der Woche.
 *
 * Shape: fitness/{uid}/door-production/{week}
 */
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { getUid } from "../db/core.js";
import { weekKey } from "./warstack.js";
import { fetchDoorWar, fetchWarstacks } from "./plan.firestore.js";

const DAYS = ["mon", "tue", "wed", "thu", "fri"];

function planRef(week) {
  return doc(db, "fitness", getUid(), "door-production", week);
}

function basePlan(week) {
  return { week, days: Object.fromEntries(DAYS.map((d) => [d, []])), meta: {} };
}

async function ensurePlan(week) {
  const snap = await getDoc(planRef(week));
  if (snap.exists()) return snap.data();

  const { selected } = await fetchDoorWar();
  const warstacks = await fetchWarstacks();
  const warstack = warstacks.find((w) => w.week === week && w.source_selector === selected?.selector) || null;

  const bigEntries = (warstack?.hits || []).slice(0, 4).map((hit) => ({
    id: crypto.randomUUID(),
    kind: "big",
    label: hit.fact,
    source_hit_id: hit.id,
    warstack_id: warstack?.id || "",
    door_title: warstack?.door_title || "",
    fact: hit.fact, obstacle: hit.obstacle, strike: hit.strike, responsibility: hit.responsibility,
    done: Boolean(hit.done), completed_at: hit.done ? hit.completed_at : null,
  }));
  const littleEntries = Array.from({ length: Math.max(0, 20 - bigEntries.length) }, () => ({
    id: crypto.randomUUID(), kind: "little", label: "", source_hit_id: "",
    warstack_id: "", door_title: warstack?.door_title || "",
    fact: "", obstacle: "", strike: "", responsibility: "", done: false, completed_at: null,
  }));

  const plan = basePlan(week);
  plan.meta = { selected_selector: selected?.selector || "", warstack_id: warstack?.id || "", door_title: warstack?.door_title || "" };
  const all = [...bigEntries, ...littleEntries];
  let i = 0;
  for (const day of DAYS) {
    plan.days[day] = all.slice(i, i + 4);
    i += 4;
  }
  await setDoc(planRef(week), plan);
  return plan;
}

export async function fetchDailyWeek(week = "") {
  const w = week || weekKey();
  return ensurePlan(w);
}

export async function toggleDailyHit(id, week = "") {
  const w = week || weekKey();
  const plan = await ensurePlan(w);
  let found = null;
  for (const day of DAYS) {
    const item = (plan.days[day] || []).find((entry) => entry.id === id);
    if (item) { found = item; break; }
  }
  if (!found) throw new Error("daily_hit_not_found");
  found.done = !found.done;
  found.completed_at = found.done ? new Date().toISOString() : null;
  await setDoc(planRef(w), plan);
  return { plan, hit: found };
}

export async function fetchHitsWeek() {
  const plan = await ensurePlan(weekKey());
  const all = DAYS.flatMap((d) => plan.days[d] || []);
  const completed = all.filter((h) => h.done).length;
  return {
    week: plan.week, total_hits: all.length, completed_hits: completed,
    open_hits: all.length - completed,
    completion_rate: all.length ? Number((completed / all.length).toFixed(4)) : 0,
  };
}

export async function fetchHits() {
  const plan = await ensurePlan(weekKey());
  return { week: plan.week, hits: DAYS.flatMap((d) => plan.days[d] || []) };
}

export async function toggleHit(id) {
  const { hit } = await toggleDailyHit(id);
  return hit;
}
