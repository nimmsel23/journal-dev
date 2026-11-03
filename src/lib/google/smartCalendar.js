import { google } from "./auth.js";
import { buildSmartCalendarEvent, matchesSmartCalendarEvent, smartCalendarEventId } from "./smartCalendarModel.js";

export { buildSmartCalendarEvent, smartCalendarEventId } from "./smartCalendarModel.js";

const API = "https://www.googleapis.com/calendar/v3";

export async function createSmartCalendarEvent(task, { sourceJournalId, requestId, index }) {
  const id = await smartCalendarEventId(requestId, index);
  const event = buildSmartCalendarEvent(task, { sourceJournalId, requestId });
  const response = await google.authFetch(`${API}/calendars/primary/events`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...event, id }),
  });
  if (response.status === 409) {
    const check = await google.authFetch(`${API}/calendars/primary/events/${encodeURIComponent(id)}`);
    const existing = await check.json().catch(() => ({}));
    if (!check.ok) throw new Error("planner_event_lookup_failed");
    if (!matchesSmartCalendarEvent(existing, event)) throw new Error("planner_event_content_conflict");
    return { id, htmlLink: existing.htmlLink || null, existing: true };
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data?.error?.message || `calendar ${response.status}`), { status: response.status });
  return { id, htmlLink: data.htmlLink || null, existing: false };
}
