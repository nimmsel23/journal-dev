import * as db from "@journal-db";
import { auth } from "./firebase.js";
import { claimSmartJournalForApply, saveJournal, updateJournal, updateSmartJournalStatus } from "./db/journal.js";
import { createSmartJournalApplier } from "./smartJournalApplyCore.js";
import { createSmartCalendarEvent } from "./google/smartCalendar.js";

async function applyPlanner({ requestId, sourceJournalId, tasks }, assertAccount) {
  const pending = [];
  const events = [];
  let created = 0;
  for (const [index, task] of tasks.entries()) {
    assertAccount();
    if (!task.date) { pending.push({ index, task, reason: "date_required" }); continue; }
    if (task.time && !task.duration_minutes) { pending.push({ index, task, reason: "duration_required_for_timed_event" }); continue; }
    try {
      const event = await createSmartCalendarEvent(task, { requestId, sourceJournalId, index });
      assertAccount();
      events.push({ title: task.title, date: task.date, time: task.time, htmlLink: event.htmlLink });
      created += 1;
    } catch (error) {
      assertAccount();
      const reason = error?.message === "planner_event_content_conflict"
        ? "google_calendar_event_conflict"
        : error?.status === 403 || /insufficient|scope/i.test(error?.message || "")
        ? "google_calendar_permission_required"
        : ["google-expired", "google-offline"].includes(error?.message) ? error.message : "google_calendar_write_failed";
      pending.push({ index, task, reason });
    }
  }
  return { created, pending, events };
}

export function applySmartAnalysis(args) {
  const owner = auth?.currentUser?.uid;
  if (!owner) throw new Error("smart_account_changed");
  const assertAccount = () => {
    if (auth?.currentUser?.uid !== owner) throw new Error("smart_account_changed");
  };
  const apply = createSmartJournalApplier({
    saveJournal,
    updateJournal,
    claimJournal: (date, text, options) => claimSmartJournalForApply(date, text, { ...options, expectedUid: owner }),
    updateStatus: (id, status) => updateSmartJournalStatus(id, status, owner),
    applyNutrition: db.applySmartNutrition,
    applyFitness: db.applySmartFitness,
    applyRelax: db.applySmartRelax,
    applyPlanner: (options) => applyPlanner(options, assertAccount),
    recordHabit: db.recordSmartHabit,
    assertAccount,
  });
  return apply(args);
}
