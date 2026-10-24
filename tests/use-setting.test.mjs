import test from "node:test";
import assert from "node:assert/strict";

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
};

const { readSetting, writeSetting, asBool } = await import("../src/lib/useSetting.js");

test.beforeEach(() => store.clear());

test("liefert initial, wenn nichts gespeichert ist", () => {
  assert.equal(readSetting("k", 30), 30);
});

test("Round-Trip für Zahl und Bool", () => {
  writeSetting("n", 15);
  writeSetting("b", true);
  assert.equal(readSetting("n", 30), 15);
  assert.equal(readSetting("b", false, asBool), true);
});

test("alte Flags \"1\"/\"0\" werden weiter gelesen", () => {
  store.set("jv2:smart", "1");
  store.set("jv2:cal-all", "0");
  assert.equal(readSetting("jv2:smart", false, asBool), true);
  assert.equal(readSetting("jv2:cal-all", true, asBool), false);
});

test("altes Raster \"30\" wird gelesen, ungültige Werte fallen auf initial", () => {
  const grain = (v) => ([60, 30, 15].includes(Number(v)) ? Number(v) : undefined);
  store.set("jv2:grain", "15");
  assert.equal(readSetting("jv2:grain", 30, grain), 15);
  store.set("jv2:grain", "99");
  assert.equal(readSetting("jv2:grain", 30, grain), 30);
});

test("kaputtes JSON und gesperrter Speicher werfen nicht", () => {
  store.set("x", "{kaputt");
  assert.equal(readSetting("x", "fb"), "{kaputt");
  const keep = globalThis.localStorage;
  globalThis.localStorage = { getItem() { throw new Error("gesperrt"); }, setItem() { throw new Error("gesperrt"); } };
  assert.equal(readSetting("x", "fb"), "fb");
  assert.doesNotThrow(() => writeSetting("x", 1));
  globalThis.localStorage = keep;
});
