import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { openHits, buildDoorReminder, fetchDueTasks } = createRequire(import.meta.url)('../functions/door-reminders.js');
const TODAY = '2026-10-28';
const due = (d) => `${d}T00:00:00.000Z`;

test('nur offene Hits bis heute zählen', () => {
  const hits = openHits([
    { title: 'A', status: 'needsAction', due: due('2026-10-28') },
    { title: 'B', status: 'needsAction', due: due('2026-10-27') },
    { title: 'C', status: 'completed', due: due('2026-10-28') },
    { title: 'D', status: 'needsAction', due: due('2026-10-29') },
    { title: 'E', status: 'needsAction' },
    { title: '  ', status: 'needsAction', due: due('2026-10-28') },
  ], TODAY);
  assert.deepEqual(hits, [{ title: 'A', overdue: false }, { title: 'B', overdue: true }]);
});

test('Text: Anzahl, überfällig, höchstens drei Titel', () => {
  assert.equal(buildDoorReminder([], TODAY), null);
  assert.equal(buildDoorReminder([{ title: 'A', due: due(TODAY) }], TODAY).body, '1 offener Hit heute: A');
  const many = ['A', 'B', 'C', 'D'].map((title, i) => ({ title, due: due(i === 0 ? '2026-10-27' : TODAY) }));
  assert.equal(buildDoorReminder(many, TODAY).body, '4 offene Hits heute (1 überfällig): A, B, C …');
});

test('fetchDueTasks: findet die Liste, filtert per dueMax, ohne Liste leer', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    const body = url.includes('/users/@me/lists')
      ? { items: [{ id: 'x', title: 'Andere' }, { id: 'L1', title: 'Door · Production' }] }
      : { items: [{ title: 'A', due: due(TODAY) }] };
    return { ok: true, json: async () => body };
  };
  const tasks = await fetchDueTasks({ fetchImpl, accessToken: 't', today: TODAY });
  assert.equal(tasks.length, 1);
  assert.match(calls[1], /lists\/L1\/tasks\?.*dueMax=2026-10-29T00%3A00%3A00\.000Z/);
  assert.match(calls[1], /showCompleted=false/);
  const none = await fetchDueTasks({ fetchImpl: async () => ({ ok: true, json: async () => ({ items: [] }) }), accessToken: 't', today: TODAY });
  assert.deepEqual(none, []);
});
