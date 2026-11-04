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
  const [year, month, day] = task.date.split("-").map(Number);
  const [hour, minute] = task.time.split(":").map(Number);
  if (start.getFullYear() !== year || start.getMonth() + 1 !== month || start.getDate() !== day
      || start.getHours() !== hour || start.getMinutes() !== minute) throw new Error("planner_local_time_invalid");
  const end = new Date(start.getTime() + task.duration_minutes * 60_000);
  return { ...base, start: { dateTime: start.toISOString(), timeZone }, end: { dateTime: end.toISOString(), timeZone } };
}

export async function smartCalendarEventId(requestId, index) {
  const bytes = new TextEncoder().encode(`${requestId}:${index}`);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `v${hash}`;
}

// Google can normalize a timed event's offset while preserving the instant.
export function matchesSmartCalendarEvent(existing, expected) {
  if (!existing || existing.status === 'cancelled') return false;
  if (existing.summary !== expected.summary || (existing.description || '') !== (expected.description || '')) return false;
  if (existing.visibility !== 'private') return false;
  const actualSource = existing.extendedProperties?.private;
  const expectedSource = expected.extendedProperties?.private;
  if (actualSource?.sourceRequestId !== expectedSource?.sourceRequestId || actualSource?.sourceJournalId !== expectedSource?.sourceJournalId) return false;
  const sameBoundary = (actual, wanted) => {
    if (wanted?.date) return actual?.date === wanted.date && !actual?.dateTime;
    if (!actual?.dateTime || !wanted?.dateTime) return false;
    const actualTime = Date.parse(actual.dateTime);
    const wantedTime = Date.parse(wanted.dateTime);
    return Number.isFinite(actualTime) && actualTime === wantedTime;
  };
  return sameBoundary(existing.start, expected.start) && sameBoundary(existing.end, expected.end);
}
