/** Existing tracker records may have been enriched by the user after import. */
export function shouldCreateSmartRecord(existing, { requestId, sourceJournalId }) {
  if (!existing) return true;
  if (existing.sourceRequestId !== requestId || existing.sourceJournalId !== sourceJournalId) {
    throw new Error('smart_skill_record_id_conflict');
  }
  return false;
}

export function mergeSmartRelaxItems(existingItems, sessions, { requestId, sourceJournalId }) {
  const items = Array.isArray(existingItems) ? [...existingItems] : [];
  let created = 0;
  for (const session of sessions) {
    const id = `smart_${requestId}_${session._smartIndex}`;
    const existing = items.find((item) => item?.id === id);
    if (!shouldCreateSmartRecord(existing, { requestId, sourceJournalId })) continue;
    items.push({ id, technique: session.technique, minutes: session.minutes, note: session.note, sourceJournalId, sourceRequestId: requestId });
    created += 1;
  }
  return { items, created };
}
