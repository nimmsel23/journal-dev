/** Smart Log needs confirmed writes and must respect later manual changes. */
export function applySmartHabitTransaction({ db, ref, uuid, date, requestId, sourceJournalId, runTransaction, serverTimestamp }) {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const existing = snapshot.exists() ? snapshot.data() : null;
    if (existing?.sourceRequestId === requestId) {
      if (existing.sourceJournalId !== sourceJournalId) throw new Error('smart_habit_provenance_conflict');
      return { status: existing.completion === 'DONE' ? 'already_done' : 'user_changed' };
    }
    if (existing?.completion === 'DONE') return { status: 'already_done' };
    transaction.set(ref, {
      habitId: uuid, date, completion: 'DONE', recorded_at: serverTimestamp(),
      sourceJournalId, sourceRequestId: requestId,
    }, { merge: true });
    return { status: 'created' };
  });
}
