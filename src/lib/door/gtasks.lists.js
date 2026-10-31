// gtasks.lists.js — welche Google-Tasks-Liste gehört zu einem Door-Titel? Rein (kein Netz, kein Firebase),
// getestet in tests/gtasks-lists.test.mjs.
//
// Mehrere Origins/Geräte (journal, v2, door, vitalos-Shell …) starten offline-first unabhängig voneinander.
// Findet ein Client "Door · Production" nicht, legt er sie an — zwei Clients gleichzeitig ergäben zwei Listen
// mit demselben Titel. Deshalb:
//  - Die Liste wird nur angelegt, wenn der Abruf ERFOLGREICH und VOLLSTÄNDIG (alle Seiten) keine Liste mit dem
//    Titel fand. Ein Fehler (offline, Timeout, 5xx) legt nie etwas an.
//  - Gibt es mehrere Treffer, gewinnt deterministisch die Liste mit der lexikografisch kleinsten id — alle
//    Clients wählen dieselbe, egal in welcher Reihenfolge Google sie liefert.
//  - Nach dem Anlegen wird einmal neu gelesen und erneut die kleinste id gewählt, damit auch zwei Clients,
//    die gleichzeitig angelegt haben, auf derselben Liste landen.
//  - Doppelte Listen werden nie gelöscht (Inhalt könnte darin liegen); sie bleiben für den Nutzer sichtbar.

/** Treffer mit gleichem Titel → die mit der kleinsten id (stabil, unabhängig von der Reihenfolge). */
export function pickList(items, title) {
  let best = null;
  for (const l of items || []) {
    if (l?.title !== title || !l.id) continue;
    if (!best || l.id < best.id) best = l;
  }
  return best;
}

async function scan(fetchPage, title) {
  const matches = [];
  let pageToken;
  do {
    const data = await fetchPage(pageToken); // wirft bei Fehler → Aufrufer legt nichts an
    for (const l of data?.items || []) if (l?.title === title) matches.push(l);
    pageToken = data?.nextPageToken;
  } while (pageToken);
  return pickList(matches, title);
}

/**
 * @param {object} p
 * @param {string} p.title
 * @param {(pageToken?: string) => Promise<{items?: Array, nextPageToken?: string}>} p.fetchPage
 * @param {(title: string) => Promise<{id: string}>} p.create
 */
export async function resolveListId({ title, fetchPage, create }) {
  const found = await scan(fetchPage, title);
  if (found) return found.id;
  const created = await create(title);
  try {
    return (await scan(fetchPage, title))?.id || created.id;
  } catch {
    return created.id; // Nachprüfung gescheitert: die eigene Liste ist besser als keine
  }
}
