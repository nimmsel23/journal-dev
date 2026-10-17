// source.js — Datenquelle der Door-v2-Ansicht: "backend" (REST/Firestore wie bisher)
// oder "gtasks" (Google Tasks). Persistiert in localStorage `dv2:source`.
import * as pot from "./potential.js";
import * as plan from "./plan.js";
import * as prod from "./production.js";
import * as profit from "./profit.js";
import * as gt from "./gtasks.door.js";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db as fdb } from "../firebase.js";

const KEY = "dv2:source";

/** Registry der Datenquellen. Weitere Backends (z. B. Taskwarrior) = Eintrag hier + Funktionsset unten. */
export const SOURCES = [
  { id: "backend", label: "Backend" },
  { id: "gtasks", label: "Google Tasks", auth: "google" },
];
const valid = (s) => SOURCES.some((x) => x.id === s);

// localStorage = schneller Cache, Firestore (fitness/{uid}/settings/door) = Wahrheit pro Nutzer
export const getSource = () => {
  try { const s = localStorage.getItem(KEY); return valid(s) ? s : "backend"; } catch { return "backend"; }
};
export const setSource = (s, uid) => {
  try { localStorage.setItem(KEY, s); } catch {}
  if (uid) setDoc(doc(fdb, "fitness", uid, "settings", "door"), { source: s }, { merge: true }).catch(() => {});
};
/** Nutzer-Einstellung aus Firestore; undefined wenn keine gespeichert/erreichbar. */
export const loadRemoteSource = async (uid) => {
  try {
    const snap = await getDoc(doc(fdb, "fitness", uid, "settings", "door"));
    const s = snap.exists() ? snap.data().source : null;
    if (valid(s)) { try { localStorage.setItem(KEY, s); } catch {} return s; }
  } catch {}
  return undefined;
};

const backend = {
  fetchHotlist: pot.fetchHotlist, addHotlistItem: pot.addHotlistItem,
  completeHotlistItem: pot.completeHotlistItem, deleteHotlistItem: pot.deleteHotlistItem,
  fetchDoorWar: plan.fetchDoorWar, selectWeeklyDoor: plan.selectWeeklyDoor, assignQuadrant: plan.assignQuadrant,
  fetchDailyWeek: prod.fetchDailyWeek, toggleDailyHit: prod.toggleDailyHit, fetchHitsWeek: prod.fetchHitsWeek,
  fetchProfitWeek: profit.fetchProfitWeek, fetchCompletedWarstacks: profit.fetchCompletedWarstacks,
  fetchReflections: profit.fetchReflections,
};

/** Funktionsset der gewählten Quelle (gleiche Signaturen/Formen). */
export const door = (source) => ({ gtasks: gt }[source] || backend);
