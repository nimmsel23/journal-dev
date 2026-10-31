// fastDocs.js — getDocs, das bei schlechter Verbindung nicht hängt (offline-first).
// Plain getDocs wartet bei „online, aber langsam“ auf den Server (Sekunden bis ~10 s, solange der Client den Server noch
// für erreichbar hält). Hier: antwortet der Server innerhalb von `ms` → Serverstand; sonst sofort der lokale Stand
// (Firestore-Persistenz, IndexedDB) und der Serverstand kommt über `onLate(snap)` nach. Ist der Cache leer und das Netz
// grundsätzlich da, wird wie bisher auf den Server gewartet (sonst würde eine leere Liste fälschlich „leer“ zeigen).
import { getDocs, getDocsFromCache } from "firebase/firestore";

const SLOW = Symbol("slow");
const FAIL = Symbol("fail");

export async function getDocsFast(q, onLate, ms = 1200) {
  const server = getDocs(q);
  server.catch(() => {}); // verspätete Ablehnung nicht als unbehandelt melden
  let timer;
  const slow = new Promise((resolve) => { timer = setTimeout(() => resolve(SLOW), ms); });
  const first = await Promise.race([server.catch(() => FAIL), slow]);
  clearTimeout(timer);
  if (first !== SLOW && first !== FAIL) return first;

  let cached = null;
  try { cached = await getDocsFromCache(q); } catch { /* kein lokaler Stand */ }
  const offline = typeof navigator !== "undefined" && navigator.onLine === false;
  if (cached && (!cached.empty || first === FAIL || offline)) {
    if (first === SLOW && onLate) server.then(onLate, () => {});
    return cached;
  }
  return server; // leerer Cache: auf den Server warten (oder ablehnen, der Aufrufer fängt das ab)
}
