import test from "node:test";
import assert from "node:assert/strict";
import { keepSoloKey, keepTab, parseSoloTabs } from "../src/lib/soloTabs.js";

test("parseSoloTabs: leer = Hub (keine Einschränkung)", () => {
  assert.deepEqual(parseSoloTabs(""), []);
  assert.deepEqual(parseSoloTabs(undefined), []);
  assert.deepEqual(parseSoloTabs(" journal-v2 , door-v2 "), ["journal-v2", "door-v2"]);
});

test("keepTab: ohne Solo alle Keys, mit Solo nur gelistete", () => {
  assert.equal(keepTab("door-v2", []), true);
  assert.equal(keepTab("door-v2", ["journal-v2"]), false);
  assert.equal(keepTab("journal-v2", ["journal-v2"]), true);
});

test("keepSoloKey spiegelt routes.js (=== ein Solo-Key)", () => {
  assert.equal(keepSoloKey("journal-v2", ""), true);
  assert.equal(keepSoloKey("door-v2", ""), true);
  assert.equal(keepSoloKey("journal-v2", "journal-v2"), true);
  assert.equal(keepSoloKey("door-v2", "journal-v2"), false);
});
