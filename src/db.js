// db.js — @db barrel for the local/dev build.
// Vite alias '@db' resolves to either this file (default) or
// ./db.firestore.js (firebase mode).
export * from "./lib/db/core.js";
export * from "./lib/db/journal.js";
export * from "./lib/db/habits.js";
export * from "./lib/db/user.js";
export * from "./lib/db/utils.js";

// Stub — journal-dev has no workout sessions; fitness-dev provides the real impl via @db
export async function getSessionHistory(_limit) { return []; }
