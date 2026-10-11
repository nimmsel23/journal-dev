// Door > Profit — Facade: REST (Door-Node-Server :6400) lokal, Firestore-
// native (fitness/{uid}/door-reflections/*) in der Cloud.
import { isCloudHost } from "./core.js";
import * as rest from "./profit.rest.js";
import * as cloud from "./profit.firestore.js";

function backend() {
  return isCloudHost() ? cloud : rest;
}

export const fetchProfitWeek = (...args) => backend().fetchProfitWeek(...args);
export const fetchCompletedWarstacks = (...args) => backend().fetchCompletedWarstacks(...args);
export const saveReflection = (...args) => backend().saveReflection(...args);
export const fetchReflections = (...args) => backend().fetchReflections(...args);
export const isProfitCloudMode = isCloudHost;
