import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { habitFields, dueOnDate, habitStats } from '../src/views/v2/habitsModel.js';

const habit = (done, extra = {}) => ({ records: done.map((date) => ({ date, completion: 'DONE' })), hasRecord: (date) => done.includes(date), ...extra });
test('scheduled streak skips rest days and allows the current scheduled day to be open', () => {
  const h = habit(['2026-10-19', '2026-10-21'], { frequency: { type: 'weekly', weekdays: [1, 3, 5] } });
  assert.equal(dueOnDate(h, '2026-10-22'), false);
  assert.equal(habitStats(h, '2026-10-23', '2026-10-23').streak, 2);
  assert.equal(habitStats(h, '2026-10-26', '2026-10-26').streak, 0);
});
test('completion rate excludes dates before creation and future days', () => {
  const h = habit(['2026-10-20', '2026-10-22'], { created_at: { toDate: () => new Date('2026-10-20T12:00:00') } });
  const stats = habitStats(h, '2026-10-25', '2026-10-22');
  assert.equal(stats.total, 3);
  assert.equal(stats.rate, 67);
});
test('monthly targets count the selected calendar month once per date', () => {
  const h = habit(['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-02', '2026-10-24'], { frequency: { type: 'monthly', timesPerPeriod: 4 } });
  const stats = habitStats(h, '2026-10-23', '2026-10-23');
  assert.equal(stats.monthHits, 2);
  assert.equal(stats.target, 4);
  assert.equal(stats.monthly, true);
});
test('draft validation accepts the shared schema and rejects invalid metadata', () => {
  assert.equal(habitFields({ name: '  Read  ', category: 'business' }).name, 'Read');
  assert.throws(() => habitFields({ name: '   ' }));
  assert.throws(() => habitFields({ name: 'Read', category: 'unknown' }));
  assert.throws(() => habitFields({ name: 'Read', frequency: { type: 'monthly', timesPerPeriod: 32 } }));
  assert.throws(() => habitFields({ name: 'Read', frequency: { type: 'weekly', weekdays: [9] } }));
});

const dbSource = readFileSync(new URL('../src/views/v2/habitsDb.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replaceAll('export async function', 'async function');
function fakeDb() {
  const writes = [], reads = [];
  const fake = {
    db: {}, getUid: () => 'isolated-test-user', habitFields,
    serverTimestamp: () => 'timestamp',
    doc: (_, ...path) => path.join('/'), collection: (_, ...path) => path.join('/'),
    where: (...args) => args, query: (...args) => args,
    setDoc: async (...args) => writes.push(args),
    addDoc: async (...args) => { writes.push(args); return { id: 'new-habit' }; },
    getDocs: async (ref) => {
      reads.push(ref);
      return typeof ref === 'string'
        ? { docs: [{ id: 'existing', data: () => ({ name: 'Read', deleted: true, icon: 'Book', order: 7 }) }] }
        : { docs: [{ data: () => ({ habitId: 'existing', date: '2025-01-03', completion: 'DONE' }) }] };
    },
  };
  const api = runInNewContext(`${dbSource}\n({getHabitsRange,addHabit,updateHabit,setHabitArchived})`, fake);
  return { api, writes, reads };
}
test('historical load uses the requested range, retains archived habits and attaches records', async () => {
  const { api, reads } = fakeDb();
  const list = await api.getHabitsRange('2025-01-01', '2025-01-28');
  assert.equal(list[0].deleted, true);
  assert.equal(list[0].hasRecord('2025-01-03'), true);
  assert.deepEqual(JSON.parse(JSON.stringify(reads[1])), ['fitness/isolated-test-user/habitRecords', ['date', '>=', '2025-01-01'], ['date', '<=', '2025-01-28']]);
});
test('editing and archive/restore merge without overwriting icon, order or records', async () => {
  const { api, writes } = fakeDb();
  await api.updateHabit('existing', { name: 'Read more', category: 'business' });
  await api.setHabitArchived('existing', true);
  await api.setHabitArchived('existing', false);
  assert.ok(writes.every(([path, , options]) => path === 'fitness/isolated-test-user/habits/existing' && options.merge));
  assert.ok(writes.every(([, fields]) => !('icon' in fields) && !('order' in fields) && !('records' in fields)));
  assert.equal(writes[1][1].deleted, true);
  assert.equal(writes[2][1].deleted, false);
});
