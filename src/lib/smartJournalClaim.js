/** Claim the stable journal ID once; callers receive the existing snapshot on replay. */
export function claimSmartJournalTransaction({ db, ref, data, runTransaction }) {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists()) return snapshot;
    transaction.set(ref, data);
    return null;
  });
}
