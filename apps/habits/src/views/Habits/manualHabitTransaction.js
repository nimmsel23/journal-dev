import { DAILY_DIMENSIONS, createDailyExecutionSnapshot, dailyExecutionScore, normalizeDailyAssignments, setDailyDimensionCompleted } from "./dailyExecutionModel.js";

// Today's configured assignments can start a snapshot; past assignments are
// never reconstructed and unrelated Journal entries never create points.
export function applyManualHabitTransaction({ db, dayRef, recordRef, configRef, habitRef, habitId, date, today, completed, runTransaction, serverTimestamp }) {
  return runTransaction(db, async (transaction) => {
    const day = await transaction.get(dayRef);
    let snapshot = day.exists() ? day.data() : null;
    if (!snapshot && date === today && configRef && habitRef) {
      const configDoc = await transaction.get(configRef);
      const config = configDoc.exists() ? configDoc.data() : null;
      if (config?.assignments && date >= (config.effectiveDate || today)) {
        const ids = DAILY_DIMENSIONS.map(({ key }) => {
          const assignment = config.assignments[key];
          return typeof assignment === "string" ? assignment : assignment?.habitId;
        });
        if (ids.includes(habitId) && ids.every((id) => typeof id === "string" && id)) {
          const habitDocs = await Promise.all(ids.map((id) => transaction.get(habitRef(id))));
          const habits = habitDocs.map((doc, index) => ({ ...(doc.data() || {}), uuid: ids[index] }));
          if (habitDocs.every((doc, index) => doc.exists() && !habits[index].deleted)) {
            const assignments = normalizeDailyAssignments(config.assignments, habits);
            snapshot = createDailyExecutionSnapshot({ date, assignments, habits });
          }
        }
      }
    }
    const dimension = DAILY_DIMENSIONS.find(({ key }) => snapshot?.dimensions?.[key]?.habitId === habitId)?.key;
    let next = null;
    if (dimension) {
      next = setDailyDimensionCompleted(snapshot, dimension, completed);
      transaction.set(dayRef, { ...next, score: dailyExecutionScore(next), configured: true });
    }
    transaction.set(recordRef, {
      habitId, date, completion: completed ? "DONE" : "MISSED", recorded_at: serverTimestamp(),
      ...(dimension ? { dailyDimension: dimension, dailyHabitName: next.dimensions[dimension].habitName, dailyExecutionDate: date } : {}),
    }, { merge: true });
    return next ? { ...next, score: dailyExecutionScore(next), configured: true } : null;
  });
}
