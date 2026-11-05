import test from "node:test";
import assert from "node:assert/strict";
import { readVoiceContext, writeVoiceContext, voiceStorageKey, VOICE_CONTEXT_KEY } from "../src/views/voice/voiceContext.js";

test("Voice answer keys isolate guest and different accounts", () => {
  const keys = [null, "alice", "bob", "guest"].map((uid) => voiceStorageKey(uid, "2026-11-04", "session:stop"));
  assert.equal(new Set(keys).size, keys.length);
});

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    has: (key) => values.has(key),
  };
}

const context = {
  ownerUid: "user-a",
  sessionId: "voice-session-1",
  sourceJournalId: "journal-entry-1",
  sourceDate: "2026-11-03",
  sourceText: "A private journal entry",
};

test("journal context is available only to the account that started its Voice session", () => {
  const local = storage();
  writeVoiceContext(local, context);
  assert.equal(readVoiceContext(local, "user-a").sourceText, context.sourceText);
  assert.equal(readVoiceContext(local, "user-b"), null);
  assert.equal(local.has(VOICE_CONTEXT_KEY), false);
});

test("a guest Voice context is not exposed after an account signs in", () => {
  const local = storage();
  writeVoiceContext(local, { ...context, ownerUid: null });
  assert.equal(readVoiceContext(local, "user-a"), null);
  assert.equal(local.has(VOICE_CONTEXT_KEY), false);
});

test("legacy and malformed unowned contexts are cleared instead of shown", () => {
  const local = storage();
  local.setItem(VOICE_CONTEXT_KEY, JSON.stringify({ ...context }));
  assert.equal(readVoiceContext(local, "user-a"), null);
  assert.equal(local.has(VOICE_CONTEXT_KEY), false);
});
