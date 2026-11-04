import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { claimSmartJournalTransaction } from '../../src/lib/smartJournalClaim.js';

const workspace = process.env.VOS_TEST_WORKSPACE;
if (!workspace || !process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Set VOS_TEST_WORKSPACE and run with the Firestore emulator');
const require = createRequire(resolve(workspace, 'plan-app/package.json'));
const { initializeTestEnvironment, assertFails } = require('@firebase/rules-unit-testing');
const { doc, getDoc, runTransaction, serverTimestamp, updateDoc } = require('firebase/firestore');
const env = await initializeTestEnvironment({ projectId: 'demo-vitalos-product', firestore: { rules: readFileSync(resolve(workspace, 'firestore.product.rules'), 'utf8') } });
try {
  const alice = env.authenticatedContext('alice').firestore();
  const bob = env.authenticatedContext('bob').firestore();
  const ref = doc(alice, 'fitness/alice/journal/smart_request_1234567890ab');
  const input = (text) => ({ date: '2026-11-04', text, tags: ['body', 'smart-log'], smartLog: { status: 'applying', requestId: 'request_1234567890ab' }, time: '2026-11-04T12:00:00Z', created_at: serverTimestamp() });
  const claim = (text) => claimSmartJournalTransaction({ db: alice, ref, data: input(text), runTransaction });
  const [first, second] = await Promise.all([claim('Original A'), claim('Original B')]);
  assert.equal([first, second].filter((item) => item === null).length, 1);
  const saved = (await getDoc(ref)).data();
  assert.ok(['Original A', 'Original B'].includes(saved.text));
  const replay = first || second;
  assert.equal(replay.data().text, saved.text);
  await updateDoc(ref, { text: 'User correction', tags: ['edited'] });
  const afterEdit = await claim('Old proposal');
  assert.equal(afterEdit.data().text, 'User correction');
  assert.deepEqual((await getDoc(ref)).data().tags, ['edited']);
  const otherRef = doc(bob, 'fitness/alice/journal/smart_request_1234567890ab');
  await assertFails(claimSmartJournalTransaction({ db: bob, ref: otherRef, data: input('intrusion'), runTransaction }));
  console.log('PASS Smart Journal claim: concurrent creation, replay, user edits and account isolation');
} finally {
  await env.cleanup();
}
