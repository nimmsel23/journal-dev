// db.js — @db barrel for the local/dev build.
// Vite alias '@db' resolves to either this file (default) or
// ./db.firestore.js (firebase mode).
export * from "./lib/db/core.js";
export * from "./lib/db/journal.js";
export * from "./lib/db/habits.js";
export * from "./lib/db/nutrition.js";
export * from "./lib/db/supplements.js";
export * from "./lib/db/user.js";
export * from "./lib/db/utils.js";
