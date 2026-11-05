import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeSmartRelaxItems, shouldCreateSmartRecord } from '../src/lib/smartSkillReplay.js';

const source = { requestId: 'request_1234567890ab', sourceJournalId: 'smart_request_1234567890ab' };

test('fitness retry preserves existing detailed session and rejects a foreign ID', () => {
  const existing = { sourceRequestId: source.requestId, sourceJournalId: source.sourceJournalId, exercises: [{ name: 'Squat', sets: [100] }] };
  assert.equal(shouldCreateSmartRecord(null, source), true);
  assert.equal(shouldCreateSmartRecord(existing, source), false);
  assert.deepEqual(existing.exercises, [{ name: 'Squat', sets: [100] }]);
  assert.throws(() => shouldCreateSmartRecord({ ...existing, sourceRequestId: 'other' }, source), /smart_skill_record_id_conflict/);
});

test('relax retry keeps enriched existing items and adds only missing items', () => {
  const sessions = [{ _smartIndex: 0, technique: 'Meditation', minutes: 15, note: '' }, { _smartIndex: 1, technique: 'Atmung', minutes: 10, note: '' }];
  const existing = { id: `smart_${source.requestId}_0`, sourceRequestId: source.requestId, sourceJournalId: source.sourceJournalId, technique: 'Meditation', minutes: 20, reflection: 'Updated by user' };
  const merged = mergeSmartRelaxItems([existing], sessions, source);
  assert.equal(merged.created, 1);
  assert.deepEqual(merged.items[0], existing);
  assert.equal(merged.items[1].technique, 'Atmung');
  assert.equal(mergeSmartRelaxItems(merged.items, sessions, source).created, 0);
  assert.throws(() => mergeSmartRelaxItems([{ ...existing, sourceJournalId: 'other' }], sessions, source), /smart_skill_record_id_conflict/);
});
