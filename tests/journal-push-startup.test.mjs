import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Run the real hook body with React's render-time semantics: effects are queued,
// but their dependency arrays are evaluated immediately, including on iOS.
const source = readFileSync(new URL('../src/hooks/useJournalPushNotifications.js', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '')
  .replace('export function useJournalPushNotifications', 'function useJournalPushNotifications');

for (const permission of ['unsupported', 'default', 'granted']) {
  for (const user of [null, { uid: 'test-user' }]) {
    test(`hook renders before effects: ${permission}, ${user ? 'signed in' : 'signed out'}`, () => {
      const effects = [];
      const result = runInNewContext(`${source}\nuseJournalPushNotifications(user)`, {
        user,
        ...(permission === 'unsupported' ? {} : { Notification: { permission } }),
        useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
        useEffect: (effect, dependencies) => effects.push({ effect, dependencies }),
        useCallback: (callback) => callback,
      });
      assert.equal(result.permission, permission);
      assert.equal(result.busy, false);
      assert.equal(typeof result.enable, 'function');
      assert.equal(effects.length, 2);
      assert.equal(typeof effects[1].dependencies.at(-1), 'function');
    });
  }
}
