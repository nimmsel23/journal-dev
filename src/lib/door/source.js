// source.js — Datenquelle der Door-v2-Ansicht: "backend" (REST/Firestore wie bisher)
// oder "gtasks" (Google Tasks). Persistiert in localStorage `dv2:source`.
import * as pot from "./potential.js";
import * as plan from "./plan.js";
import * as prod from "./production.js";
import * as profit from "./profit.js";
import * as gt from "./gtasks.door.js";

const KEY = "dv2:source";
export const getSource = () => {
  try { return localStorage.getItem(KEY) === "gtasks" ? "gtasks" : "backend"; } catch { return "backend"; }
};
export const setSource = (s) => { try { localStorage.setItem(KEY, s); } catch {} };

const backend = {
  fetchHotlist: pot.fetchHotlist, addHotlistItem: pot.addHotlistItem,
  completeHotlistItem: pot.completeHotlistItem, deleteHotlistItem: pot.deleteHotlistItem,
  fetchDoorWar: plan.fetchDoorWar, selectWeeklyDoor: plan.selectWeeklyDoor, assignQuadrant: plan.assignQuadrant,
  fetchDailyWeek: prod.fetchDailyWeek, toggleDailyHit: prod.toggleDailyHit, fetchHitsWeek: prod.fetchHitsWeek,
  fetchProfitWeek: profit.fetchProfitWeek, fetchCompletedWarstacks: profit.fetchCompletedWarstacks,
  fetchReflections: profit.fetchReflections,
};

/** Funktionsset der gewählten Quelle (gleiche Signaturen/Formen). */
export const door = (source) => (source === "gtasks" ? gt : backend);
