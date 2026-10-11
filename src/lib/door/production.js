// Door > Production — Facade: REST (Door-Node-Server :6400) lokal,
// Firestore-native (fitness/{uid}/door-production/*) in der Cloud.
import { isCloudHost } from "./core.js";
import * as rest from "./production.rest.js";
import * as cloud from "./production.firestore.js";

function backend() {
  return isCloudHost() ? cloud : rest;
}

export const fetchDailyWeek = (...args) => backend().fetchDailyWeek(...args);
export const toggleDailyHit = (...args) => backend().toggleDailyHit(...args);
export const fetchHitsWeek = (...args) => backend().fetchHitsWeek(...args);
export const fetchHits = (...args) => backend().fetchHits(...args);
export const toggleHit = (...args) => backend().toggleHit(...args);
export const isProductionCloudMode = isCloudHost;
