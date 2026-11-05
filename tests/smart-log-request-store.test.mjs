import test from "node:test";
import assert from "node:assert/strict";
import { clearSmartLogRequestId, readSmartLogRequestId, smartLogRequestKey, writeSmartLogRequestId } from "../src/lib/smartLogRequestStore.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

test("Smart-Log-Retry behält die Request-ID für dasselbe Nutzer-Datum", () => {
  const storage = memoryStorage();
  const key = smartLogRequestKey("user-1", "2026-11-03");
  assert.equal(writeSmartLogRequestId(storage, key, "1234567890abcdef"), true);
  assert.equal(readSmartLogRequestId(storage, key), "1234567890abcdef");
  assert.notEqual(key, smartLogRequestKey("user-2", "2026-11-03"));
  assert.notEqual(key, smartLogRequestKey("user-1", "2026-11-04"));
  clearSmartLogRequestId(storage, key);
  assert.equal(readSmartLogRequestId(storage, key), "");
});

test("kaputte, ungültige und nicht verfügbare lokale Speicherung ist nicht fatal", () => {
  assert.equal(readSmartLogRequestId(memoryStorage(), "missing"), "");
  assert.equal(writeSmartLogRequestId(memoryStorage(), "k", "bad"), false);
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  assert.equal(readSmartLogRequestId(blocked, "k"), "");
  assert.equal(writeSmartLogRequestId(blocked, "k", "1234567890abcdef"), false);
  assert.doesNotThrow(() => clearSmartLogRequestId(blocked, "k"));
  assert.equal(readSmartLogRequestId(null, "k"), "");
});
