import test from "node:test";
import assert from "node:assert/strict";
import { buildSmartCalendarEvent, smartCalendarEventId } from "../src/lib/google/smartCalendarModel.js";

test("builds a private all-day calendar event with source provenance", () => {
  const event = buildSmartCalendarEvent({ title: "Trainieren", date: "2026-11-04", time: null, notes: "Kraft" }, {
    sourceJournalId: "smart_request_1234567890", requestId: "request_1234567890ab",
  });
  assert.deepEqual(event.start, { date: "2026-11-04" });
  assert.deepEqual(event.end, { date: "2026-11-05" });
  assert.equal(event.visibility, "private");
  assert.equal(event.extendedProperties.private.sourceJournalId, "smart_request_1234567890");
});

test("requires explicit duration for a timed event and preserves the selected timezone", () => {
  const args = { sourceJournalId: "smart_request_1234567890", requestId: "request_1234567890ab", timeZone: "Europe/Vienna" };
  assert.throws(() => buildSmartCalendarEvent({ title: "Training", date: "2026-11-04", time: "18:00" }, args), /planner_duration_required/);
  const event = buildSmartCalendarEvent({ title: "Training", date: "2026-11-04", time: "18:00", duration_minutes: 45 }, args);
  assert.equal(event.start.timeZone, "Europe/Vienna");
  assert.equal(Date.parse(event.end.dateTime) - Date.parse(event.start.dateTime), 45 * 60_000);
});

test("request-based event IDs are deterministic and valid for Google Calendar", async () => {
  const first = await smartCalendarEventId("request_1234567890ab", 0);
  const replay = await smartCalendarEventId("request_1234567890ab", 0);
  assert.equal(first, replay);
  assert.match(first, /^v[0-9a-f]{64}$/);
});
