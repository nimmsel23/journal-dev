/**
 * Door > Profit — Firestore-natives Gegenstück zu profit.rest.js.
 * Wochenabschluss: Review der Door der Woche + Reflexion.
 *
 * Shape: fitness/{uid}/door-reflections/{id}
 */
import { collection, doc, setDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { track } from "../offline.js";
import { getUid } from "../db/core.js";
import { weekKey } from "./warstack.js";
import { fetchDoorWar, fetchWarstacks } from "./plan.firestore.js";

function reflectionsCol() {
  return collection(db, "fitness", getUid(), "door-reflections");
}

export async function fetchProfitWeek(week = "") {
  const w = week || weekKey();
  const { selected } = await fetchDoorWar();
  const warstacks = await fetchWarstacks();
  const warstack = warstacks.find((ws) => ws.week === w && ws.source_selector === selected?.selector) || null;
  const hitDone = (warstack?.hits || []).filter((h) => h.done).length;
  return {
    week: w,
    selected,
    warstack: warstack
      ? {
          id: warstack.id, door_title: warstack.door_title, week: warstack.week, created_at: warstack.created_at,
          hit_count: warstack.hits?.length || 0, hit_done_count: hitDone,
          opened: (warstack.hits?.length || 0) > 0 && hitDone === warstack.hits.length,
          hits: warstack.hits || [],
        }
      : null,
  };
}

export async function fetchCompletedWarstacks() {
  const warstacks = await fetchWarstacks();
  return warstacks
    .filter((ws) => Array.isArray(ws.hits) && ws.hits.length > 0 && ws.hits.every((h) => h.done))
    .map((ws) => ({
      id: ws.id, door_title: ws.door_title, week: ws.week, created_at: ws.created_at,
      completed_at: ws.hits.reduce((latest, h) => (h.completed_at > latest ? h.completed_at : latest), ""),
      hit_count: ws.hits.length,
    }))
    .sort((a, b) => String(b.completed_at).localeCompare(String(a.completed_at)));
}

export async function saveReflection(fields) {
  const ref = doc(reflectionsCol()); // Id lokal erzeugen, kein Netz
  track(setDoc(ref, {
    door_title: fields.door_title || fields.title || "",
    reflection: fields.reflection || fields.text || fields.body || "",
    week: fields.week || weekKey(),
    created_at: serverTimestamp(),
  }));
  return ref.id;
}

export async function fetchReflections() {
  const snap = await getDocs(reflectionsCol());
  return snap.docs
    .map((d) => {
      const data = d.data();
      return { id: d.id, ...data, created_at: data.created_at?.toDate?.()?.toISOString?.() || "" };
    })
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
}
