// composerCollapse.js — Vorschlag (Aufgabe 4 / FRONTEND-REVIEWS Review 1):
// JournalForm.jsx klappt nach dem Sichern über wasSaving + leeren Text zu.
// Bleibt text vom Elternteil stehen (Rollback, Race, anderer Caller), bleibt
// der Composer offen. Umbau von JournalForm ist hier NICHT enthalten —
// nur die Entscheidungsfunktion + Vertrag für einen späteren, freigegebenen
// Patch inkl. Gerätetest.
//
// Vorschlag: onSubmit liefert explizit { ok: boolean } (sync oder Promise).
// JournalForm klappt nur bei ok===true zu und leert pendingMedia unabhängig
// vom Text. Bei ok===false bleibt expanded. Void/undefined → kein Zuklappen
// (fail-closed gegenüber dem Legacy-Heuristik-Pfad).

/** Legacy-Heuristik wie JournalForm useEffect (saving↓ + leerer Text). */
export function shouldCollapseLegacy({ wasSaving, saving, text }) {
  return Boolean(wasSaving && !saving && !String(text || ""));
}

/**
 * Vorgeschlagener Vertrag: Rückgabe von onSubmit normalisieren.
 * Nur ein Objekt mit ok:true zählt als Erfolg.
 */
export function resolveSubmitResult(result) {
  if (result && typeof result === "object" && Object.prototype.hasOwnProperty.call(result, "ok")) {
    return { ok: result.ok === true };
  }
  return { ok: false };
}

/** Vorgeschlagenes Zuklappen: nur nach explizitem Submit-Erfolg. */
export function shouldCollapseOnSubmitResult(result) {
  return resolveSubmitResult(result).ok;
}
