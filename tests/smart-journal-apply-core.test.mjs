import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSmartJournalApplier,
  mergeSmartNutritionLog,
  smartAnalysisForRetry,
  smartPendingPlannerIndexes,
  sourceJournalId,
  validateSmartAnalysis,
  validateSmartReplay,
} from '../src/lib/smartJournalApplyCore.js';

const analysis = (overrides = {}) => ({
  request_id: 'request_1234567890ab',
  original_text: 'Heute 500 ml Wasser.\n  +body',
  source_tags: ['body'],
  journal_entry: 'Wasser getrunken.',
  water_ml: 500,
  meals: [{ description: 'Reis mit Huhn', type: 'lunch', notes: '', kcal: null, protein: null, carbs: null, fat: null, time: '12:35', estimated_fields: [] }],
  habits_done: [{ name: 'Meditieren', evidence: '15 Minuten meditiert' }],
  ...overrides,
});

test('validates known schema and keeps unknown nutrition values absent', () => {
  const result = validateSmartAnalysis(analysis());
  assert.equal(result.meals[0].kcal, null);
  assert.equal(result.meals[0].time, '12:35');
  assert.deepEqual(result.source_tags, ['body']);
});

test('validates Fitness, Relax and Planner targets without filling in unknown fields', () => {
  const result = validateSmartAnalysis(analysis({
    fitness_sessions: [{ activity_type: 'strength', duration_minutes: 45, notes: '', time: null }],
    relax_sessions: [{ technique: 'Meditation', minutes: 15, note: '' }],
    planner_tasks: [{ title: 'Trainieren', date: '2026-11-04', time: '18:00', notes: '' }],
  }));
  assert.equal(result.fitness_sessions[0].activity_type, 'strength');
  assert.equal(result.relax_sessions[0].minutes, 15);
  assert.equal(result.planner_tasks[0].time, '18:00');
  assert.throws(() => validateSmartAnalysis(analysis({ fitness_sessions: [{ activity_type: 'unknown' }] })), /smart_schema_fitness_type_invalid/);
  assert.throws(() => validateSmartAnalysis(analysis({ planner_tasks: [{ title: 'Trainieren', date: 'morgen' }] })), /smart_schema_planner_date_invalid/);
});

test('rejects malformed model values and unexpected fields instead of coercing them', () => {
  assert.throws(() => validateSmartAnalysis(analysis({ water_ml: '500' })), /smart_schema_water_ml_invalid/);
  assert.throws(() => validateSmartAnalysis(analysis({ unexpected: true })), /smart_schema_root_unknown_field/);
  assert.throws(() => validateSmartAnalysis(analysis({ meals: [{ ...analysis().meals[0], time: '25:00' }] })), /smart_schema_meal_time_invalid/);
  assert.throws(() => validateSmartAnalysis(analysis({ meals: [{ ...analysis().meals[0], protein: -1 }] })), /smart_schema_meal_protein_invalid/);
});

test('nutrition merge preserves legacy meals, adds separate water entries and retries without duplicates', () => {
  const current = { date: '2026-11-03', water_ml: 0, meals: [{ description: 'Manuell' }, { description: 'Altbestand' }] };
  const input = { date: '2026-11-03', requestId: 'request_1234567890ab', journalId: sourceJournalId('request_1234567890ab'), meals: analysis().meals, water_ml: 500 };
  const first = mergeSmartNutritionLog(current, input);
  assert.equal(first.data.meals.length, 3);
  assert.equal(first.data.meals[2].time, new Date('2026-11-03T12:35:00').toISOString());
  assert.equal(first.data.water_ml, 500);
  assert.equal(first.data.smartWaterContributions['request_1234567890ab'].sourceJournalId, input.journalId);
  assert.equal(first.applied.water_ml, 500);

  const retry = mergeSmartNutritionLog(first.data, input);
  assert.equal(retry.data.meals.length, 3);
  assert.equal(retry.data.water_ml, 500);
  assert.equal(retry.applied.meals, 0);
  assert.equal(retry.applied.water_ml, 0);

  const secondEntry = mergeSmartNutritionLog(first.data, { ...input, requestId: 'request_2234567890ab', journalId: sourceJournalId('request_2234567890ab'), meals: [], water_ml: 500 });
  assert.equal(secondEntry.data.water_ml, 1000);
});

test('apply keeps the original text and uses the same source id when retried', async () => {
  let nutrition = null;
  const saved = [];
  const updates = [];
  const habitWrites = new Set();
  const apply = createSmartJournalApplier({
    saveJournal: async (...args) => saved.push(args),
    updateJournal: async (...args) => updates.push(args),
    applyNutrition: async (input) => {
      const merged = mergeSmartNutritionLog(nutrition, { ...input, journalId: input.sourceJournalId });
      nutrition = merged.data;
      return merged.applied;
    },
    recordHabit: async (id, date) => habitWrites.add(`${id}_${date}`),
    now: () => '2026-11-03T10:00:00.000Z',
  });
  const args = { date: '2026-11-03', analysis: analysis(), habits: [{ uuid: 'habit-1', name: 'Meditieren' }] };
  const first = await apply(args);
  const retry = await apply(args);
  assert.equal(saved[0][1], args.analysis.original_text);
  assert.equal(saved[0][2].preserveText, true);
  assert.equal(saved[0][2].id, sourceJournalId(args.analysis.request_id));
  assert.equal(saved[1][2].id, saved[0][2].id);
  assert.equal(first.meals, 1);
  assert.equal(retry.meals, 0);
  assert.equal(retry.water_ml, 0);
  assert.equal(habitWrites.size, 1);
  assert.equal(updates.at(-1)[2].smartLog.status, 'applied');
});

test('apply sends Fitness and Relax records through adapters and retains Planner suggestions with provenance', async () => {
  const adapters = [];
  const updates = [];
  const apply = createSmartJournalApplier({
    saveJournal: async () => {},
    updateJournal: async (...args) => updates.push(args),
    applyNutrition: async () => ({ meals: 0, water_ml: 0 }),
    recordHabit: async () => {},
    applyFitness: async (input) => { adapters.push(['fitness', input]); return input.sessions.length; },
    applyRelax: async (input) => { adapters.push(['relax', input]); return input.sessions.length; },
  });
  const input = analysis({
    meals: [], water_ml: 0, habits_done: [],
    fitness_sessions: [{ activity_type: 'strength', duration_minutes: 45, notes: '', time: null }],
    relax_sessions: [{ technique: 'Meditation', minutes: 15, note: '' }],
    planner_tasks: [{ title: 'Morgen trainieren', date: '2026-11-04', time: '18:00', duration_minutes: null, notes: '' }],
  });
  const result = await apply({ date: '2026-11-03', analysis: input });
  assert.deepEqual(adapters.map(([name]) => name), ['fitness', 'relax']);
  assert.equal(adapters[0][1].sourceJournalId, sourceJournalId(input.request_id));
  assert.deepEqual(result.planner_suggestions, input.planner_tasks);
  assert.deepEqual(updates.at(-1)[2].smartLog.applied.planner_suggestions, input.planner_tasks);
});

test('partial skill failure leaves the source journal and records partial status', async () => {
  const saved = [];
  const updates = [];
  const apply = createSmartJournalApplier({
    saveJournal: async (...args) => saved.push(args),
    updateJournal: async (...args) => updates.push(args),
    applyNutrition: async () => { throw new Error('offline'); },
    recordHabit: async () => {},
  });
  await assert.rejects(() => apply({ date: '2026-11-03', analysis: analysis(), habits: [] }), /offline/);
  assert.equal(saved.length, 1);
  assert.equal(saved[0][1], analysis().original_text);
  assert.equal(updates.at(-1)[2].smartLog.status, 'partial');
  const retryAnalysis = smartAnalysisForRetry({
    text: analysis().original_text,
    tags: ['body', 'smart-log'],
    smartLog: updates.at(-1)[2].smartLog,
  });
  assert.equal(retryAnalysis.original_text, analysis().original_text);
  assert.deepEqual(retryAnalysis.source_tags, ['body']);
  assert.deepEqual(retryAnalysis.meals, validateSmartAnalysis(analysis()).meals);
});

test('does not resume an unsupported or incomplete stored Smart Log payload', () => {
  assert.equal(smartAnalysisForRetry({ text: 'Quelle' }), null);
  assert.equal(smartAnalysisForRetry({ text: 'Quelle', smartLog: { schemaVersion: 2, retryPayload: {} } }), null);
});

test('nutrition retry does not overwrite a meal enriched by the user', () => {
  const input = { date: '2026-11-03', requestId: 'request_1234567890ab', journalId: sourceJournalId('request_1234567890ab'), meals: analysis().meals, water_ml: 0 };
  const first = mergeSmartNutritionLog(null, input);
  const changed = { ...first.data, meals: [{ ...first.data.meals[0], description: 'User correction', custom: 'keep' }] };
  const retry = mergeSmartNutritionLog(changed, input);
  assert.deepEqual(retry.data.meals, changed.meals);
  assert.equal(retry.changed, false);
  const conflicting = { ...changed, meals: [{ ...changed.meals[0], sourceRequestId: 'other' }] };
  assert.throws(() => mergeSmartNutritionLog(conflicting, input), /smart_skill_record_id_conflict/);
});


test('retry locks already attempted tracker data but allows a pending calendar correction', () => {
  const initial = validateSmartAnalysis(analysis({ planner_tasks: [{ title: 'Training', date: null, time: '18:00', duration_minutes: null, notes: '' }] }));
  const { original_text, source_tags, ...retryPayload } = initial;
  const entry = { date: '2026-11-03', text: original_text, tags: [...source_tags, 'smart-log'], smartLog: { schemaVersion: 1, requestId: initial.request_id, status: 'partial', retryPayload, applied: { planner_pending: [{ index: 0, task: initial.planner_tasks[0], reason: 'date_required' }] } } };
  const amended = { ...initial, planner_tasks: [{ ...initial.planner_tasks[0], date: '2026-11-04', duration_minutes: 45 }] };
  assert.equal(validateSmartReplay(entry, amended, entry.date), null);
  assert.throws(() => validateSmartReplay(entry, { ...amended, fitness_sessions: [{ activity_type: 'walking', date: '2026-11-05', duration_minutes: 30, notes: '', time: null }] }, entry.date), /smart_retry_tracker_changed/);
  assert.throws(() => validateSmartReplay(entry, { ...amended, planner_tasks: [] }, entry.date), /smart_retry_planner_order_changed/);
  assert.throws(() => validateSmartReplay(entry, amended, '2026-11-04'), /smart_retry_source_changed/);
});

test('retry does not rewrite a changed journal or rerun a completed apply', async () => {
  const input = validateSmartAnalysis(analysis());
  const applied = { journal: true, meals: 1, water_ml: 500, habits: [], fitness: 0, relax: 0, planner: 0, planner_pending: [] };
  let writes = 0;
  const apply = createSmartJournalApplier({
    claimJournal: async () => ({ date: '2026-11-03', text: input.original_text, smartLog: { requestId: input.request_id, status: 'applied', applied } }),
    updateStatus: async () => { writes++; }, applyNutrition: async () => { writes++; }, recordHabit: async () => { writes++; },
  });
  assert.deepEqual(await apply({ date: '2026-11-03', analysis: input }), applied);
  assert.equal(writes, 0);
  await assert.rejects(() => apply({ date: '2026-11-03', analysis: { ...input, original_text: 'changed' } }), /smart_retry_source_changed/);
  assert.equal(writes, 0);
});

test('retry cannot modify a calendar item that was already applied', () => {
  const initial = validateSmartAnalysis(analysis({ planner_tasks: [{ title: 'A', date: '2026-11-04', time: null, duration_minutes: null, notes: '' }, { title: 'B', date: null, time: null, duration_minutes: null, notes: '' }] }));
  const { original_text, source_tags, ...retryPayload } = initial;
  const entry = { date: '2026-11-03', text: original_text, tags: source_tags, smartLog: { schemaVersion: 1, requestId: initial.request_id, status: 'partial', retryPayload, applied: { planner_pending: [{ index: 1, task: initial.planner_tasks[1] }] } } };
  const changed = { ...initial, planner_tasks: [{ ...initial.planner_tasks[0], title: 'Changed' }, initial.planner_tasks[1]] };
  assert.throws(() => validateSmartReplay(entry, changed, entry.date), /smart_retry_planner_already_applied/);
});

test('changed tracker dates are rejected before any retry writes', async () => {
  const original = validateSmartAnalysis(analysis({ fitness_sessions: [{ activity_type: 'strength', date: '2026-11-03', duration_minutes: 45, notes: '', time: null }] }));
  const { original_text, source_tags, ...retryPayload } = original;
  const existing = { date: '2026-11-03', text: original_text, tags: source_tags, smartLog: { schemaVersion: 1, requestId: original.request_id, status: 'partial', retryPayload } };
  let writes = 0;
  const apply = createSmartJournalApplier({ claimJournal: async () => existing, updateStatus: async () => { writes++; }, applyNutrition: async () => { writes++; }, recordHabit: async () => { writes++; }, applyFitness: async () => { writes++; } });
  const changed = { ...original, fitness_sessions: [{ ...original.fitness_sessions[0], date: '2026-11-04' }] };
  await assert.rejects(() => apply({ date: '2026-11-03', analysis: changed }), /smart_retry_tracker_changed/);
  assert.equal(writes, 0);
});


test('habit write failure leaves a Smart Log partial and never reports applied', async () => {
  const updates = [];
  const apply = createSmartJournalApplier({
    saveJournal: async () => {}, updateJournal: async (...args) => updates.push(args),
    applyNutrition: async () => ({ meals: 0, water_ml: 0 }),
    recordHabit: async () => { throw new Error('permission-denied'); },
  });
  await assert.rejects(() => apply({ date: '2026-11-03', analysis: analysis(), habits: [{ uuid: 'h1', name: 'Meditieren' }] }), /permission-denied/);
  assert.equal(updates.at(-1)[2].smartLog.status, 'partial');
});

test('smart replay reports a manually changed habit without marking it done again', async () => {
  const apply = createSmartJournalApplier({
    saveJournal: async () => {}, updateJournal: async () => {},
    applyNutrition: async () => ({ meals: 0, water_ml: 0 }),
    recordHabit: async () => ({ status: 'user_changed' }),
  });
  const result = await apply({ date: '2026-11-03', analysis: analysis(), habits: [{ uuid: 'h1', name: 'Meditieren' }] });
  assert.deepEqual(result.habits, []);
  assert.deepEqual(result.habits_skipped, ['h1']);
});


test('only pending calendar positions can be edited, including unambiguous legacy records', () => {
  const tasks = [{ title: 'A' }, { title: 'B' }, { title: 'A' }];
  assert.deepEqual(smartPendingPlannerIndexes(tasks, [{ index: 2 }, { task: { title: 'B' } }, { task: { title: 'A' } }]), [2, 1]);
  assert.deepEqual(smartPendingPlannerIndexes(tasks, [{ task: { title: 'A' } }]), []);
});

test('stops subsequent tracker writes when the account changes during nutrition', async () => {
  let owner = 'alice';
  const calls = [];
  const apply = createSmartJournalApplier({
    assertAccount: () => { if (owner !== 'alice') throw new Error('smart_account_changed'); },
    claimJournal: async () => null,
    updateStatus: async () => calls.push('status'),
    applyNutrition: async () => { calls.push('nutrition'); owner = 'bob'; return { meals: 1, water_ml: 500 }; },
    recordHabit: async () => calls.push('habit'),
  });
  const originalError = console.error;
  console.error = () => {};
  try {
    await assert.rejects(apply({ date: '2026-11-03', analysis: analysis(), habits: [{ uuid: 'habit-1', name: 'Meditieren' }] }), /smart_account_changed/);
  } finally { console.error = originalError; }
  assert.deepEqual(calls, ['nutrition']);
});

test('stops before tracker writes when the account changes during the journal claim', async () => {
  let owner = 'alice';
  let nutritionCalled = false;
  const apply = createSmartJournalApplier({
    assertAccount: () => { if (owner !== 'alice') throw new Error('smart_account_changed'); },
    claimJournal: async () => { owner = 'bob'; return null; },
    applyNutrition: async () => { nutritionCalled = true; },
    recordHabit: async () => {},
  });
  await assert.rejects(apply({ date: '2026-11-03', analysis: analysis(), habits: [] }), /smart_account_changed/);
  assert.equal(nutritionCalled, false);
});

test('ambiguous habit names are not assigned to an arbitrary habit', async () => {
  const writes = [];
  const apply = createSmartJournalApplier({
    saveJournal: async () => {}, updateJournal: async () => {},
    recordHabit: async (id) => writes.push(id),
  });
  const result = await apply({ date: '2026-11-03', analysis: analysis({ meals: [], water_ml: 0 }), habits: [
    { uuid: 'one', name: 'Meditieren' }, { uuid: 'two', name: ' meditieren ' },
    { uuid: 'three', name: 'MEDITIEREN' },
  ] });
  assert.deepEqual(writes, []);
  assert.deepEqual(result.unmatched, ['Meditieren']);
});

test('rejects nonexistent local tracker times before any write', async () => {
  const old = process.env.TZ;
  process.env.TZ = 'Europe/Vienna';
  try {
    let writes = 0;
    const apply = createSmartJournalApplier({ saveJournal: async () => { writes++; }, applyNutrition: async () => { writes++; } });
    await assert.rejects(apply({ date: '2026-03-29', analysis: analysis({ meals: [{ description: 'Snack', type: 'snack', time: '02:30' }], habits_done: [] }) }), /smart_local_time_invalid/);
    assert.equal(writes, 0);
  } finally { if (old === undefined) delete process.env.TZ; else process.env.TZ = old; }
});
