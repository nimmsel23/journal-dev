import test from 'node:test';
import assert from 'node:assert/strict';
import { applyManualHabitTransaction } from '../src/views/Habits/manualHabitTransaction.js';
import { createDailyExecutionSnapshot } from '../src/views/Habits/dailyExecutionModel.js';

const date = '2026-11-03';
const habits = ['h1', 'h2', 'h3', 'h4'].map((uuid) => ({ uuid, name: uuid }));
const assignments = { doing: 'h1', thinking: 'h2', feeling: 'h3', being: 'h4' };
const snapshot = () => createDailyExecutionSnapshot({ date, habits, assignments });
async function perform(day, habitId, completed) {
  const writes = [];
  const result = await applyManualHabitTransaction({ db: {}, dayRef: 'day', recordRef: 'record', habitId, date, completed,
    serverTimestamp: () => 'server-time',
    runTransaction: async (_db, callback) => callback({
      get: async () => ({ exists: () => !!day, data: () => day }),
      set: (...args) => writes.push(args),
    }),
  });
  return { result, writes };
}

test('explicit habit completion atomically updates its existing daily snapshot', async () => {
  const done = await perform(snapshot(), 'h1', true);
  assert.equal(done.result.score, 1);
  assert.equal(done.writes[0][0], 'day');
  assert.equal(done.writes[1][1].completion, 'DONE');
  assert.deepEqual(done.writes[1][2], { merge: true });
  const undone = await perform(done.result, 'h1', false);
  assert.equal(undone.result.score, 0);
  assert.equal(undone.result.assignmentsLocked, true);
  assert.equal(undone.writes[1][1].completion, 'MISSED');
});

test('an unrelated habit or a day without snapshot does not create a daily point', async () => {
  for (const day of [snapshot(), null]) {
    const output = await perform(day, 'unrelated', true);
    assert.equal(output.result, null);
    assert.equal(output.writes.length, 1);
    assert.equal(output.writes[0][0], 'record');
  }
});

test('first manual completion today creates its snapshot from the active configuration', async () => {
  const data = new Map([['config', { assignments, effectiveDate: date }], ...habits.map((habit) => [habit.uuid, habit])]);
  const writes = [];
  const call = (today) => applyManualHabitTransaction({ db: {}, dayRef: 'day', recordRef: 'record', configRef: 'config', habitRef: (id) => id,
    habitId: 'h1', date, today, completed: true, serverTimestamp: () => 'time',
    runTransaction: async (_db, fn) => fn({ get: async (key) => ({ exists: () => data.has(key), data: () => data.get(key) }), set: (...args) => writes.push(args) }),
  });
  const result = await call(date);
  assert.equal(result.score, 1);
  assert.equal(result.dimensions.doing.habitId, 'h1');
  assert.deepEqual(writes.map(([ref]) => ref), ['day', 'record']);
  writes.length = 0;
  assert.equal(await call('2026-11-04'), null);
  assert.deepEqual(writes.map(([ref]) => ref), ['record']);
});
