// Door-Framework (aos/door): gemeinsame Basis für Potential/Plan/Production/Profit.
// - lokal (coach-Build): REST gegen den aos server (:7001, Potential/Taskwarrior)
//   bzw. den Door-Node-Server (:6400, Plan/Production/Profit, kanonisch laut
//   ~/aos/lib/door_routes.yaml).
// - cloud (Firebase Hosting, kein lokaler Server erreichbar): eigenständige
//   Firestore-native Daten unter fitness/{uid}/door/*.
// Alle vier Phasen-Module teilen sich isCloudHost() und restRequest(), damit
// das Backend-Umschaltmuster an einer Stelle lebt statt viermal kopiert zu sein.

export function isCloudHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host.includes("web.app") || host.includes("firebaseapp.com");
}

export async function restRequest(base, method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: body != null ? { "Content-Type": "application/json" } : undefined,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload?.ok === false) {
    throw new Error(payload?.error || `${method} ${path} → ${res.status}`);
  }
  return payload;
}
