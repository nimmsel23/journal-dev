// Door > Plan — Facade: REST (Door-Node-Server :6400) lokal, Firestore-native
// (fitness/{uid}/door/*) in der Cloud. Siehe potential.js für dasselbe Muster.
import { isCloudHost } from "./core.js";
import * as rest from "./plan.rest.js";
import * as cloud from "./plan.firestore.js";

function backend() {
  return isCloudHost() ? cloud : rest;
}

export const fetchDoorWar = (...args) => backend().fetchDoorWar(...args);
export const selectWeeklyDoor = (...args) => backend().selectWeeklyDoor(...args);
export const assignQuadrant = (...args) => backend().assignQuadrant(...args);
export const fetchWarstacks = (...args) => backend().fetchWarstacks(...args);
export const startWarstack = (...args) => backend().startWarstack(...args);
export const answerWarstack = (...args) => backend().answerWarstack(...args);
export const fetchWarstackSessions = (...args) => backend().fetchWarstackSessions(...args);
export const isPlanCloudMode = isCloudHost;
