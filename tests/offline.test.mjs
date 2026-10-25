import test from "node:test";
import assert from "node:assert/strict";

const { track, setOutbox, getSyncState, clearSyncError } = await import("../src/lib/offline.js");

test("track zählt offene Schreibzugriffe und meldet Bestätigung", async () => {
  let done;
  const p = track(new Promise((r) => { done = r; }));
  assert.equal(getSyncState().pending, 1);
  done();
  assert.equal(await p, true);
  assert.equal(getSyncState().pending, 0);
});

test("track schluckt Fehler, meldet sie im Status und lehnt nie ab", async () => {
  const ok = await track(Promise.reject(Object.assign(new Error("x"), { code: "permission-denied" })));
  assert.equal(ok, false);
  assert.equal(getSyncState().pending, 0);
  assert.match(getSyncState().error, /Berechtigung/);
  clearSyncError();
  assert.equal(getSyncState().error, "");
});

test("setOutbox spiegelt die Warteschlange", () => {
  setOutbox(3);
  assert.equal(getSyncState().outbox, 3);
  setOutbox(0);
});
