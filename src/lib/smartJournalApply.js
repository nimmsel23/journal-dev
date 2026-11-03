import * as db from "@journal-db";
import { saveJournal, updateJournal } from "./db/journal.js";
import { createSmartJournalApplier } from "./smartJournalApplyCore.js";
import { createSmartCalendarEvent } from "./google/smartCalendar.js";

async function applyPlanner({ requestId, sourceJournalId, tasks }) {
  const pending = [];
  const events = [];
  let created = 0;
  for (const [index, task] of tasks.entries()) {
    if (!task.date) { pending.push({ task, reason: "date_required" }); continue; }
    if (task.time && !task.duration_minutes) { pending.push({ task, reason: "duration_required_for_timed_event" }); continue; }
    try {
      const event = await createSmartCalendarEvent(task, { requestId, sourceJournalId, index });
      events.push({ title: task.title, date: task.date, time: task.time, htmlLink: event.htmlLink });
      created += 1;
    } catch (error) {
      const reason = error?.message === "planner_event_content_conflict"
        ? "google_calendar_event_conflict"
        : error?.status === 403 || /insufficient|scope/i.test(error?.message || "")
        ? "google_calendar_permission_required"
        : ["google-expired", "google-offline"].includes(error?.message) ? error.message : "google_calendar_write_failed";
      pending.push({ task, reason });
    }
  }
  return { created, pending, events };
}

const apply = createSmartJournalApplier({
  saveJournal,
  updateJournal,
  applyNutrition: db.applySmartNutrition,
  applyFitness: db.applySmartFitness,
  applyRelax: db.applySmartRelax,
  applyPlanner,
  recordHabit: db.recordHabit,
});

export function applySmartAnalysis(args) {
  return apply(args);
}
