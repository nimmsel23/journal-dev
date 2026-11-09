import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldCollapseLegacy,
  resolveSubmitResult,
  shouldCollapseOnSubmitResult,
} from '../src/lib/journal/composerCollapse.js';

// Belegt den fragilen Legacy-Pfad und den vorgeschlagenen onSubmit-{ok}-Vertrag
// (FRONTEND-REVIEWS Review 1). JournalForm.jsx bleibt unverändert.

test('Legacy: Zuklappen nur bei saving↓ und leerem Text', () => {
  assert.equal(shouldCollapseLegacy({ wasSaving: true, saving: false, text: '' }), true);
  assert.equal(shouldCollapseLegacy({ wasSaving: true, saving: false, text: null }), true);
  assert.equal(shouldCollapseLegacy({ wasSaving: false, saving: false, text: '' }), false);
  assert.equal(shouldCollapseLegacy({ wasSaving: true, saving: true, text: '' }), false);
});

test('Legacy-Regression: Text-Rest nach Speichern hält Composer offen', () => {
  // Parent leert text nicht (Rollback/Race) → Composer bleibt expanded.
  assert.equal(
    shouldCollapseLegacy({ wasSaving: true, saving: false, text: 'noch da' }),
    false,
  );
});

test('Vorschlag: resolveSubmitResult akzeptiert nur ok:true', () => {
  assert.deepEqual(resolveSubmitResult({ ok: true }), { ok: true });
  assert.deepEqual(resolveSubmitResult({ ok: false }), { ok: false });
  assert.deepEqual(resolveSubmitResult({ ok: 'yes' }), { ok: false });
  assert.deepEqual(resolveSubmitResult(undefined), { ok: false });
  assert.deepEqual(resolveSubmitResult(null), { ok: false });
  assert.deepEqual(resolveSubmitResult(true), { ok: false });
});

test('Vorschlag: Zuklappen bei ok:true auch mit Text-Rest', () => {
  assert.equal(shouldCollapseOnSubmitResult({ ok: true }), true);
  // Unabhängig vom Text — genau der Fix gegenüber Legacy.
  assert.equal(shouldCollapseOnSubmitResult({ ok: true, text: 'noch da' }), true);
  assert.equal(shouldCollapseOnSubmitResult({ ok: false }), false);
  assert.equal(shouldCollapseOnSubmitResult(undefined), false);
});
