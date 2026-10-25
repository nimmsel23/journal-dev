// hotFromJournal.js — Journal-Einträge mit +hot (auch +potential, +door) landen automatisch in Door › Potential (Hot List).
// Aufgerufen aus lib/db/journal.js (saveJournal/updateJournal); Ziel ist die in Door v2 gewählte Quelle
// (Backend, Google Tasks oder Taskwarrior – source.js). Erster Satz bzw. erste Zeile = Titel.
import { door, getSource } from "./source.js";

// +hot, +potential und +door legen alle ein Potential-Item an.
export const HOT_TAGS = ["hot", "potential", "door"];
export const hasHotTag = (tags) => (tags || []).some((t) => HOT_TAGS.includes(String(t).replace(/^\+/, "").toLowerCase()));

export function hotTitle(text) {
  const line = String(text || "").split("\n").map((l) => l.trim()).find(Boolean) || "";
  return line.replace(/(^|\s)\+[\p{L}\p{N}_-]+/gu, " ").replace(/\s+/g, " ").trim().slice(0, 200);
}

/** Legt den Eintrag als Potential-Item an (wirft bei Fehler; die Quelle entscheidet über Verfügbarkeit). */
export async function addToPotential(text) {
  const title = hotTitle(text);
  if (!title) return false;
  await door(getSource()).addHotlistItem(title);
  return true;
}
