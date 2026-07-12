// db.js — Package-Barrel (@vos/journal, exports ".").
// Der Vite-Alias @db des journal-Standalone-Builds zeigt NICHT hierher,
// sondern auf src/db/index.js (Doppelwrapper über die modularen
// Firestore-Layer der Nachbar-Repos). Dieses Barrel ist die Export-Surface
// für Consumer, die journal-dev als Package einbinden.
export * from "./lib/db/core.js";
export * from "./lib/db/journal.js";

// Stub — journal-dev has no workout sessions; fitness-dev provides the real impl via @db
export async function getSessionHistory(_limit) { return []; }

// Stub — journal-dev has no nutrition logs; cloud/db.firestore.js provides the real impl
export async function getMealsHistory(_limit) { return []; }
