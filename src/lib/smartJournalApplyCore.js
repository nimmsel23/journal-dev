const ROOT_FIELDS = new Set(["journal_entry", "water_ml", "meals", "habits_done", "fitness_sessions", "relax_sessions", "planner_tasks", "request_id", "original_text", "source_tags"]);
const MEAL_FIELDS = new Set(["description", "type", "notes", "time", "kcal", "protein", "carbs", "fat", "estimated_fields"]);
const HABIT_FIELDS = new Set(["name", "evidence"]);
const MEAL_TYPES = new Set(["breakfast", "lunch", "dinner", "snack"]);
const MACRO_FIELDS = new Set(["kcal", "protein", "carbs", "fat"]);

function assertObject(value, name, fields) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`smart_schema_${name}_invalid`);
  if (Object.keys(value).some((key) => !fields.has(key))) throw new Error(`smart_schema_${name}_unknown_field`);
}

function boundedString(value, name, max, { empty = true } = {}) {
  if (typeof value !== "string" || value.length > max || (!empty && !value.trim())) {
    throw new Error(`smart_schema_${name}_invalid`);
  }
  return value;
}

function boundedNumber(value, name, max) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > max) {
    throw new Error(`smart_schema_${name}_invalid`);
  }
  return value;
}

function optionalNumber(value, name, max) {
  if (value == null) return null;
  return boundedNumber(value, name, max);
}

function validISODate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateSmartAnalysis(value) {
  assertObject(value, "root", ROOT_FIELDS);
  const journal_entry = boundedString(value.journal_entry, "journal_entry", 4000);
  const water_ml = boundedNumber(value.water_ml, "water_ml", 20000);
  if (!Number.isInteger(water_ml)) throw new Error("smart_schema_water_ml_invalid");
  if (!Array.isArray(value.meals) || value.meals.length > 20) throw new Error("smart_schema_meals_invalid");
  if (!Array.isArray(value.habits_done) || value.habits_done.length > 50) throw new Error("smart_schema_habits_invalid");
  for (const key of ["fitness_sessions", "relax_sessions", "planner_tasks"]) {
    if (value[key] != null && (!Array.isArray(value[key]) || value[key].length > 20)) throw new Error(`smart_schema_${key}_invalid`);
  }

  const meals = value.meals.map((meal) => {
    assertObject(meal, "meal", MEAL_FIELDS);
    if (!MEAL_TYPES.has(meal.type)) throw new Error("smart_schema_meal_type_invalid");
    const time = meal.time == null ? null : boundedString(meal.time, "meal_time", 5, { empty: false });
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error("smart_schema_meal_time_invalid");
    const estimated_fields = meal.estimated_fields ?? [];
    if (!Array.isArray(estimated_fields) || estimated_fields.some((field) => !MACRO_FIELDS.has(field))) {
      throw new Error("smart_schema_meal_estimates_invalid");
    }
    for (const field of estimated_fields) {
      if (meal[field] == null) throw new Error("smart_schema_meal_estimate_without_value");
    }
    return {
      description: boundedString(meal.description, "meal_description", 240, { empty: false }).trim(),
      type: meal.type,
      notes: boundedString(meal.notes ?? "", "meal_notes", 500),
      time,
      kcal: optionalNumber(meal.kcal, "meal_kcal", 10000),
      protein: optionalNumber(meal.protein, "meal_protein", 1500),
      carbs: optionalNumber(meal.carbs, "meal_carbs", 2000),
      fat: optionalNumber(meal.fat, "meal_fat", 1500),
      estimated_fields: [...new Set(estimated_fields)],
    };
  });

  const habits_done = value.habits_done.map((habit) => {
    assertObject(habit, "habit", HABIT_FIELDS);
    return {
      name: boundedString(habit.name, "habit_name", 120, { empty: false }).trim(),
      evidence: boundedString(habit.evidence ?? "", "habit_evidence", 500),
    };
  });

  const fitnessTypes = new Set(["strength", "hiit", "running", "walking", "cycling", "rowing", "swimming", "hiking", "climbing", "yoga", "stretching"]);
  const fitness_sessions = (value.fitness_sessions || []).map((item) => {
    assertObject(item, "fitness", new Set(["activity_type", "date", "duration_minutes", "notes", "time"]));
    if (!fitnessTypes.has(item.activity_type)) throw new Error("smart_schema_fitness_type_invalid");
    if (item.duration_minutes != null && (!Number.isInteger(item.duration_minutes) || item.duration_minutes < 1 || item.duration_minutes > 1440)) throw new Error("smart_schema_fitness_duration_invalid");
    const time = item.time == null ? null : boundedString(item.time, "fitness_time", 5, { empty: false });
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error("smart_schema_fitness_time_invalid");
    const date = item.date == null ? null : boundedString(item.date, "fitness_date", 10, { empty: false });
    if (date && !validISODate(date)) throw new Error("smart_schema_fitness_date_invalid");
    return { activity_type: item.activity_type, date, duration_minutes: item.duration_minutes ?? null, notes: boundedString(item.notes ?? "", "fitness_notes", 500), time };
  });
  const relax_sessions = (value.relax_sessions || []).map((item) => {
    assertObject(item, "relax", new Set(["technique", "date", "minutes", "note"]));
    if (item.minutes != null && (!Number.isInteger(item.minutes) || item.minutes < 1 || item.minutes > 1440)) throw new Error("smart_schema_relax_minutes_invalid");
    const date = item.date == null ? null : boundedString(item.date, "relax_date", 10, { empty: false });
    if (date && !validISODate(date)) throw new Error("smart_schema_relax_date_invalid");
    return { technique: boundedString(item.technique, "relax_technique", 120, { empty: false }).trim(), date, minutes: item.minutes ?? null, note: boundedString(item.note ?? "", "relax_note", 500) };
  });
  const planner_tasks = (value.planner_tasks || []).map((item) => {
    assertObject(item, "planner", new Set(["title", "date", "time", "duration_minutes", "notes"]));
    const taskDate = item.date == null ? null : boundedString(item.date, "planner_date", 10, { empty: false });
    if (taskDate && !validISODate(taskDate)) throw new Error("smart_schema_planner_date_invalid");
    const time = item.time == null ? null : boundedString(item.time, "planner_time", 5, { empty: false });
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error("smart_schema_planner_time_invalid");
    if (item.duration_minutes != null && (!Number.isInteger(item.duration_minutes) || item.duration_minutes < 1 || item.duration_minutes > 1440)) throw new Error("smart_schema_planner_duration_invalid");
    return { title: boundedString(item.title, "planner_title", 160, { empty: false }).trim(), date: taskDate, time, duration_minutes: item.duration_minutes ?? null, notes: boundedString(item.notes ?? "", "planner_notes", 500) };
  });

  const source_tags = value.source_tags ?? [];
  if (!Array.isArray(source_tags) || source_tags.length > 30 || source_tags.some((tag) => typeof tag !== "string" || tag.length > 60)) {
    throw new Error("smart_schema_source_tags_invalid");
  }
  const request_id = boundedString(value.request_id, "request_id", 80, { empty: false });
  if (!/^[A-Za-z0-9_-]{16,80}$/.test(request_id)) throw new Error("smart_schema_request_id_invalid");
  const original_text = boundedString(value.original_text, "original_text", 12000, { empty: false });

  return { request_id, original_text, source_tags: [...new Set(source_tags)], journal_entry, water_ml, meals, habits_done, fitness_sessions, relax_sessions, planner_tasks };
}

export function sourceJournalId(requestId) {
  if (!/^[A-Za-z0-9_-]{16,80}$/.test(String(requestId || ""))) throw new Error("smart_schema_request_id_invalid");
  return `smart_${requestId}`;
}

export function smartAnalysisForRetry(entry) {
  const payload = entry?.smartLog?.retryPayload;
  if (entry?.smartLog?.schemaVersion !== 1 || !payload || !entry?.text) return null;
  return {
    ...payload,
    original_text: entry.text,
    source_tags: (entry.tags || []).filter((tag) => tag !== "smart-log"),
  };
}

export function mergeSmartNutritionLog(currentValue, { date, requestId, journalId, meals = [], water_ml = 0 }) {
  const current = currentValue || { date, meals: [], water_ml: 0 };
  const existing = Array.isArray(current.meals) ? current.meals : [];
  const nextMeals = [...existing];
  let mealsAdded = 0;
  let mealsChanged = false;
  meals.forEach((meal, index) => {
    const id = `smart_${requestId}_${index}`;
    const stored = {
      ...meal,
      id,
      sourceRequestId: requestId,
      sourceJournalId: journalId,
      catalog_item_id: null,
      catalog_components: [],
      catalog_addon_ids: [],
    };
    if (meal.time) stored.time = new Date(`${date}T${meal.time}:00`).toISOString();
    const previousIndex = nextMeals.findIndex((item) => item.id === id);
    if (previousIndex < 0) {
      nextMeals.push(stored);
      mealsAdded += 1;
      mealsChanged = true;
    } else if (JSON.stringify(nextMeals[previousIndex]) !== JSON.stringify(stored)) {
      nextMeals[previousIndex] = stored;
      mealsChanged = true;
    }
  });

  const contributions = current.smartWaterContributions && typeof current.smartWaterContributions === "object"
    ? { ...current.smartWaterContributions }
    : {};
  const amount = Math.max(0, Number(water_ml) || 0);
  const prior = contributions[requestId];
  const oldContribution = Math.max(0, Number(typeof prior === "object" ? prior.water_ml : prior) || 0);
  const contributionChanged = amount !== oldContribution && (amount > 0 || oldContribution > 0);
  if (amount > 0) contributions[requestId] = { water_ml: amount, sourceJournalId: journalId };
  else delete contributions[requestId];
  const nextWater = Math.max(0, Number(current.water_ml) || 0) + amount - oldContribution;
  const changed = mealsChanged || contributionChanged;
  return {
    changed,
    data: {
      ...current,
      date,
      meals: nextMeals,
      water_ml: nextWater,
      smartWaterContributions: contributions,
    },
    applied: {
      meals: mealsAdded,
      water_ml: amount > oldContribution ? amount - oldContribution : 0,
    },
  };
}

export function createSmartJournalApplier({ saveJournal, updateJournal, applyNutrition, recordHabit, applyFitness, applyRelax, applyPlanner, now = () => new Date().toISOString() }) {
  return async function applySmartAnalysis({ date, analysis, habits = [] }) {
    const data = validateSmartAnalysis(analysis);
    const journalId = sourceJournalId(data.request_id);
    const tags = [...new Set([...data.source_tags, "smart-log"])];
    const summary = data.journal_entry;
    const { original_text, source_tags, ...retryPayload } = data;
    const result = { request_id: data.request_id, sourceJournalId: journalId, journal: true, meals: 0, water_ml: 0, habits: [], fitness: 0, relax: 0, planner: 0, planner_pending: [], planner_events: [], planner_suggestions: data.planner_tasks, unmatched: [] };

    await saveJournal(date, data.original_text, {
      id: journalId,
      preserveText: true,
      tags,
      smartLog: { schemaVersion: 1, requestId: data.request_id, status: "applying", summary, retryPayload, updatedAt: now() },
    });

    try {
      if (data.meals.length || data.water_ml > 0) {
        const nutrition = await applyNutrition({
          date,
          requestId: data.request_id,
          sourceJournalId: journalId,
          meals: data.meals,
          water_ml: data.water_ml,
        });
        result.meals = nutrition.meals;
        result.water_ml = nutrition.water_ml;
      }

      const byName = new Map(habits.map((habit) => [String(habit.name || "").trim().toLocaleLowerCase(), habit]));
      const doneIds = new Set();
      for (const hit of data.habits_done) {
        const match = byName.get(hit.name.toLocaleLowerCase());
        if (!match?.uuid) {
          result.unmatched.push(hit.name);
          continue;
        }
        if (doneIds.has(match.uuid)) continue;
        doneIds.add(match.uuid);
        await recordHabit(match.uuid, date, { requestId: data.request_id, sourceJournalId: journalId });
        result.habits.push(match.uuid);
      }

      if (data.fitness_sessions.length && applyFitness) result.fitness = await applyFitness({ date, requestId: data.request_id, sourceJournalId: journalId, sessions: data.fitness_sessions });
      if (data.relax_sessions.length && applyRelax) result.relax = await applyRelax({ date, requestId: data.request_id, sourceJournalId: journalId, sessions: data.relax_sessions });
      if (data.planner_tasks.length && applyPlanner) {
        const planner = await applyPlanner({ date, requestId: data.request_id, sourceJournalId: journalId, tasks: data.planner_tasks });
        result.planner = planner.created;
        result.planner_pending = planner.pending;
        result.planner_events = planner.events || [];
      } else if (data.planner_tasks.length) {
        result.planner_pending = data.planner_tasks.map((task) => ({ task, reason: "planner_adapter_unavailable" }));
      }

      const status = result.planner_pending.length ? "partial" : "applied";

      await updateJournal(journalId, data.original_text, {
        preserveText: true,
        tags,
        smartLog: { schemaVersion: 1, requestId: data.request_id, status, summary, ...(status === "partial" ? { retryPayload } : {}), applied: result, updatedAt: now() },
      });
      return result;
    } catch (error) {
      try {
        await updateJournal(journalId, data.original_text, {
          preserveText: true,
          tags,
          smartLog: { schemaVersion: 1, requestId: data.request_id, status: "partial", summary, retryPayload, applied: result, updatedAt: now() },
        });
      } catch (statusError) {
        console.error("Smart-Log-Status konnte nicht aktualisiert werden:", statusError);
      }
      throw error;
    }
  };
}
