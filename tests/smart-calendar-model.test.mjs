import test from "node:test";
import assert from "node:assert/strict";
import { buildSmartCalendarEvent, matchesSmartCalendarEvent, smartCalendarEventId } from "../src/lib/google/smartCalendarModel.js";

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


test("calendar retry accepts the same event and rejects changed or cancelled events", () => {
  const args = { sourceJournalId: "smart_request_1234567890", requestId: "request_1234567890ab", timeZone: "Europe/Vienna" };
  const event = buildSmartCalendarEvent({ title: "Training", date: "2026-11-04", time: "18:00", duration_minutes: 45, notes: "Kraft" }, args);
  assert.equal(matchesSmartCalendarEvent(event, event), true);
  assert.equal(matchesSmartCalendarEvent({ ...event, summary: "Changed" }, event), false);
  assert.equal(matchesSmartCalendarEvent({ ...event, status: "cancelled" }, event), false);
  assert.equal(matchesSmartCalendarEvent({ ...event, start: { dateTime: new Date(Date.parse(event.start.dateTime) + 60000).toISOString() } }, event), false);
  assert.equal(matchesSmartCalendarEvent({ ...event, visibility: "public" }, event), false);
  assert.equal(matchesSmartCalendarEvent({ ...event, extendedProperties: { private: { sourceRequestId: "other", sourceJournalId: args.sourceJournalId } } }, event), false);
});

test("calendar retry compares normalized offsets and all-day boundaries", () => {
  const args = { sourceJournalId: "smart_request_1234567890", requestId: "request_1234567890ab" };
  const allDay = buildSmartCalendarEvent({ title: "Training", date: "2026-11-04", notes: "" }, args);
  assert.equal(matchesSmartCalendarEvent(allDay, allDay), true);
  assert.equal(matchesSmartCalendarEvent({ ...allDay, end: { date: "2026-11-06" } }, allDay), false);
  const timed = { ...allDay, start: { dateTime: "2026-11-04T17:00:00Z" }, end: { dateTime: "2026-11-04T17:45:00Z" } };
  assert.equal(matchesSmartCalendarEvent({ ...timed, start: { dateTime: "2026-11-04T18:00:00+01:00" }, end: { dateTime: "2026-11-04T18:45:00+01:00" } }, timed), true);
});

test("rejects a nonexistent local time instead of silently shifting it", () => {
  const old = process.env.TZ;
  process.env.TZ = "Europe/Vienna";
  try {
    const args = { sourceJournalId: "voice_session", requestId: "voice_session" };
    assert.throws(() => buildSmartCalendarEvent({ title: "Training", date: "2026-03-29", time: "02:30", duration_minutes: 30 }, args), /planner_local_time_invalid/);
    assert.doesNotThrow(() => buildSmartCalendarEvent({ title: "Training", date: "2026-03-29", time: "03:30", duration_minutes: 30 }, args));
  } finally { if (old === undefined) delete process.env.TZ; else process.env.TZ = old; }
});
