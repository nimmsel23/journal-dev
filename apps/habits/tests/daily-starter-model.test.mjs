import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDailyAssignments } from "../src/views/Habits/dailyExecutionModel.js";
import { STARTER_HABITS, planStarterHabits, starterAssignments } from "../src/views/Habits/dailyStarterModel.js";

test("starter set covers each daily dimension exactly once with distinct names", () => {
  assert.deepEqual(STARTER_HABITS.map((item) => item.dimension), ["doing", "thinking", "feeling", "being"]);
  assert.equal(new Set(STARTER_HABITS.map((item) => item.name)).size, 4);
});

test("planStarterHabits reuses same-named active habits and ignores deleted ones", () => {
  const plan = planStarterHabits([
    { uuid: "a", name: "5 min. lesen" },
    { uuid: "b", name: "2 Min. Atmen", deleted: true },
    { uuid: "c", name: "Etwas anderes" },
  ]);
  assert.equal(plan.find((item) => item.dimension === "thinking").existingId, "a");
  assert.equal(plan.find((item) => item.dimension === "being").existingId, null);
  assert.equal(plan.find((item) => item.dimension === "doing").existingId, null);
});

test("starterAssignments yields assignments accepted by the daily model", () => {
  const plan = planStarterHabits([{ uuid: "a", name: "5 Min. Lesen" }]);
  const assignments = starterAssignments(plan, { doing: "d", feeling: "f", being: "b" });
  const habits = ["a", "d", "f", "b"].map((uuid) => ({ uuid, name: uuid }));
  const normalized = normalizeDailyAssignments(assignments, habits);
  assert.equal(normalized.thinking.habitId, "a");
  assert.equal(normalized.doing.habitId, "d");
  assert.throws(() => starterAssignments(plan, { doing: "d" }), /starter_habit_feeling_missing/);
});
