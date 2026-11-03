import { addDays, format, parseISO } from "date-fns";

export function buildSmartCalendarEvent(task, { sourceJournalId, requestId, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" }) {
  if (!task?.date || !/^\d{4}-\d{2}-\d{2}$/.test(task.date)) throw new Error("planner_date_required");
  const base = {
    summary: task.title,
    description: [task.notes, `VitalOS Journal: ${sourceJournalId}`].filter(Boolean).join("\n\n"),
    extendedProperties: { private: { sourceRequestId: requestId, sourceJournalId } },
    visibility: "private",
  };
  if (!task.time) {
    const next = format(addDays(parseISO(task.date), 1), "yyyy-MM-dd");
    return { ...base, start: { date: task.date }, end: { date: next } };
  }
  if (!Number.isInteger(task.duration_minutes) || task.duration_minutes < 1 || task.duration_minutes > 1440) throw new Error("planner_duration_required");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(task.time)) throw new Error("planner_time_invalid");
  const start = new Date(`${task.date}T${task.time}:00`);
  const end = new Date(start.getTime() + task.duration_minutes * 60_000);
  return { ...base, start: { dateTime: start.toISOString(), timeZone }, end: { dateTime: end.toISOString(), timeZone } };
}

export async function smartCalendarEventId(requestId, index) {
  const bytes = new TextEncoder().encode(`${requestId}:${index}`);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `v${hash}`;
}
