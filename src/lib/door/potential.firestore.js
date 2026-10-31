/**
 * Door > Potential — Firestore-native Gegenstück zu potential.rest.js (REST
 * gegen den aos server :7001, Taskwarrior-SOT). Für den cloud channel
 * (Firebase Hosting), wo kein lokaler aos server erreichbar ist: eigene,
 * eigenständige Hot List unter fitness/{uid}/hotlist — kein
 * Taskwarrior-Mirror, aber dasselbe Item-Shape wie die REST-Seite (id,
 * title, status, created_at, …), damit PotentialView.jsx backend-agnostisch
 * bleibt.
 *
 * Collection: fitness/{uid}/hotlist/{docId} — bereits durch die bestehende
 * Firestore-Rule `match /fitness/{uid}/{document=**}` abgedeckt.
 */

import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { track } from "../offline.js";

import { getUid } from "../db/core.js";

function hotlistCol() {
  return collection(db, "fitness", getUid(), "hotlist");
}

function normalize(snap) {
  const d = snap.data() || {};
  return {
    id: snap.id,
    selector: snap.id,
    title: d.title || "Untitled",
    description: d.description || "",
    source: d.source || "firestore",
    status: d.status || "active",
    phase: "potential",
    created_at: d.created_at?.toDate?.()?.toISOString?.() || d.created_at_iso || "",
    task_status: d.status === "done" ? "completed" : d.status === "deleted" ? "deleted" : "pending",
    task_uuid: null,
  };
}

export async function fetchHotlist(mode = "active") {
  const q = query(hotlistCol(), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  const items = snap.docs.map(normalize);
  const key = String(mode || "active").toLowerCase();
  if (key === "all" || key === "*") return items;
  if (key === "done" || key === "completed") return items.filter((i) => i.status === "done");
  if (key === "deleted" || key === "removed") return items.filter((i) => i.status === "deleted");
  return items.filter((i) => i.status === "active");
}

export async function addHotlistItem(text) {
  const title = String(text || "").trim();
  if (!title) throw new Error("title_required");
  const ref = doc(hotlistCol()); // Id lokal erzeugen, kein Netz
  track(setDoc(ref, {
    title,
    description: "",
    status: "active",
    source: "firestore",
    created_at: serverTimestamp(),
  }));
  const snap = await getDoc(ref); // aus dem lokalen Cache (inkl. ausstehendem Schreibzugriff)
  return normalize(snap);
}

export async function updateHotlistItem(selector, title) {
  const ref = doc(hotlistCol(), selector);
  track(setDoc(ref, { title: String(title || "").trim(), updated_at: serverTimestamp() }, { merge: true }));
  const snap = await getDoc(ref);
  return normalize(snap);
}

export async function completeHotlistItem(selector) {
  const ref = doc(hotlistCol(), selector);
  track(setDoc(ref, { status: "done", updated_at: serverTimestamp() }, { merge: true }));
  const snap = await getDoc(ref);
  return normalize(snap);
}

export async function deleteHotlistItem(selector) {
  // Soft-Delete — identisch zum Taskwarrior-Verhalten (status bleibt
  // sichtbar im "Gelöscht"-Filter, kein Hard-Remove).
  const ref = doc(hotlistCol(), selector);
  track(setDoc(ref, { status: "deleted", updated_at: serverTimestamp() }, { merge: true }));
  const snap = await getDoc(ref);
  return normalize(snap);
}

export async function fetchHotlistNote(selector) {
  const snap = await getDoc(doc(hotlistCol(), selector));
  return snap.exists() ? snap.data()?.note || "" : "";
}

export async function saveHotlistNote(selector, note) {
  const ref = doc(hotlistCol(), selector);
  track(setDoc(ref, { note: String(note || "").trim(), updated_at: serverTimestamp() }, { merge: true }));
  return String(note || "").trim();
}
