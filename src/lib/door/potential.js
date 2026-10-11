// Door > Potential — Facade: wählt pro Build/Host automatisch das Backend.
// - lokal (coach-Build, Browser auf diesem Rechner): REST gegen den aos
//   server (:7001) — Taskwarrior ist dort die SOT (aos/door Hot List).
// - cloud (Firebase Hosting, kein lokaler Server erreichbar): eigenständige
//   Firestore-native Hot List (fitness/{uid}/hotlist).
// Gleiche Funktionssignaturen auf beiden Seiten — PotentialView.jsx bleibt
// backend-agnostisch.
import { isCloudHost } from "./core.js";
import * as rest from "./potential.rest.js";
import * as cloud from "./potential.firestore.js";

function backend() {
  return isCloudHost() ? cloud : rest;
}

export const fetchHotlist = (...args) => backend().fetchHotlist(...args);
export const addHotlistItem = (...args) => backend().addHotlistItem(...args);
export const updateHotlistItem = (...args) => backend().updateHotlistItem(...args);
export const completeHotlistItem = (...args) => backend().completeHotlistItem(...args);
export const deleteHotlistItem = (...args) => backend().deleteHotlistItem(...args);
export const fetchHotlistNote = (...args) => backend().fetchHotlistNote(...args);
export const saveHotlistNote = (...args) => backend().saveHotlistNote(...args);
export const isPotentialCloudMode = isCloudHost;
