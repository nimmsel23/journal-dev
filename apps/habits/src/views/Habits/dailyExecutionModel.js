export const DAILY_DIMENSIONS = Object.freeze([
  { key: "doing", label: "Doing" },
  { key: "thinking", label: "Thinking" },
  { key: "feeling", label: "Feeling" },
  { key: "being", label: "Being" },
]);

const DIMENSION_KEYS = new Set(DAILY_DIMENSIONS.map(({ key }) => key));

export function normalizeDailyAssignments(assignments, habits) {
  if (!assignments || typeof assignments !== "object" || Array.isArray(assignments)) {
    throw new Error("daily_assignments_invalid");
  }
  const activeHabits = new Map((habits || []).filter((habit) => !habit.deleted).map((habit) => [habit.uuid, habit]));
  const selectedIds = new Set();
  const normalized = {};

  for (const dimension of DAILY_DIMENSIONS) {
    const candidate = assignments[dimension.key];
    const habitId = typeof candidate === "string" ? candidate : candidate?.habitId;
    if (typeof habitId !== "string" || !activeHabits.has(habitId)) {
      throw new Error(`daily_assignment_${dimension.key}_required`);
    }
    if (selectedIds.has(habitId)) throw new Error("daily_assignment_habit_must_be_unique");
    selectedIds.add(habitId);
    const habit = activeHabits.get(habitId);
    const skillLinks = Array.isArray(candidate?.skillLinks)
      ? [...new Set(candidate.skillLinks.filter((skill) => typeof skill === "string" && skill.length <= 40))]
      : Array.isArray(habit.skillLinks)
        ? [...new Set(habit.skillLinks.filter((skill) => typeof skill === "string" && skill.length <= 40))]
        : [];
    normalized[dimension.key] = {
      habitId,
      skillLinks,
      completionRule: "manual",
    };
  }

  if (Object.keys(assignments).some((key) => !DIMENSION_KEYS.has(key))) {
    throw new Error("daily_assignments_unknown_dimension");
  }
  return normalized;
}

export function createDailyExecutionSnapshot({ date, assignments, habits, existing = null, now = new Date().toISOString() }) {
  if (existing?.schemaVersion === 1 && existing.date === date) return existing;
  const normalized = normalizeDailyAssignments(assignments, habits);
  const byId = new Map(habits.map((habit) => [habit.uuid, habit]));
  const dimensions = Object.fromEntries(DAILY_DIMENSIONS.map(({ key }) => {
    const assignment = normalized[key];
    const habit = byId.get(assignment.habitId);
    return [key, {
      habitId: assignment.habitId,
      habitName: String(habit.name || "").trim(),
      skillLinks: assignment.skillLinks,
      completionRule: assignment.completionRule,
      completed: false,
      completedAt: null,
      linkedRecords: [],
    }];
  }));
  return { schemaVersion: 1, date, createdAt: now, updatedAt: now, dimensions };
}

export function dailyAssignmentsLocked(snapshot) {
  return Boolean(snapshot?.assignmentsLocked || DAILY_DIMENSIONS.some(({ key }) =>
    snapshot?.dimensions?.[key]?.completed || snapshot?.dimensions?.[key]?.linkedRecords?.length));
}

export function replaceDailyAssignments(snapshot, { assignments, habits, now = new Date().toISOString() }) {
  if (dailyAssignmentsLocked(snapshot)) {
    throw new Error("daily_assignments_locked_after_completion");
  }
  const replacement = createDailyExecutionSnapshot({
    date: snapshot.date,
    assignments,
    habits,
    existing: null,
    now,
  });
  return { ...replacement, createdAt: snapshot.createdAt || now };
}

export function setDailyDimensionCompleted(snapshot, dimensionKey, completed, { at = new Date().toISOString(), linkedRecords } = {}) {
  if (!DIMENSION_KEYS.has(dimensionKey)) throw new Error("daily_dimension_unknown");
  const current = snapshot?.dimensions?.[dimensionKey];
  if (!current?.habitId) throw new Error("daily_dimension_not_configured");
  const nextDimension = {
    ...current,
    completed: Boolean(completed),
    completedAt: completed ? (current.completedAt || at) : null,
    ...(linkedRecords ? { linkedRecords: [...linkedRecords] } : {}),
  };
  return {
    ...snapshot,
    assignmentsLocked: dailyAssignmentsLocked(snapshot) || Boolean(completed),
    updatedAt: at,
    dimensions: { ...snapshot.dimensions, [dimensionKey]: nextDimension },
  };
}

export function linkDailyExecutionRecord(snapshot, dimensionKey, record, { at = new Date().toISOString() } = {}) {
  if (!DIMENSION_KEYS.has(dimensionKey)) throw new Error("daily_dimension_unknown");
  if (!record || typeof record.skill !== "string" || !record.skill
      || typeof record.recordId !== "string" || !record.recordId
      || record.date !== snapshot?.date) throw new Error("daily_linked_record_invalid");
  const dimension = snapshot?.dimensions?.[dimensionKey];
  if (!dimension?.habitId) throw new Error("daily_dimension_not_configured");
  const linkedRecords = Array.isArray(dimension.linkedRecords) ? dimension.linkedRecords : [];
  if (linkedRecords.some((item) => item.skill === record.skill && item.recordId === record.recordId)) return snapshot;
  return setDailyDimensionCompleted(snapshot, dimensionKey, true, {
    at,
    linkedRecords: [...linkedRecords, { ...record }],
  });
}

export function dailyExecutionScore(snapshot) {
  return DAILY_DIMENSIONS.reduce((score, { key }) => {
    const dimension = snapshot?.dimensions?.[key];
    return score + (dimension?.habitId && dimension.completed ? 1 : 0);
  }, 0);
}
