const { HttpsError } = require("firebase-functions/v1/https");
const { createHash } = require("node:crypto");

const REGION_TIME_ZONE = "Europe/Vienna";
const MODEL = "gemini-2.5-flash";
const MAX_INPUT = 12000;
const MACROS = new Set(["kcal", "protein", "carbs", "fat"]);
function isIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function weekKey(now) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: REGION_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const thursday = new Date(Date.UTC(+date.year, +date.month - 1, +date.day));
  thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7));
  const isoYear = thursday.getUTCFullYear();
  const jan1 = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil((((thursday - jan1) / 86400000) + 1) / 7);
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

function validateInput(data) {
  const requestId = data.request_id;
  if (typeof requestId !== "string" || !/^[A-Za-z0-9_-]{16,80}$/.test(requestId)) {
    throw new HttpsError("invalid-argument", "request_id_invalid");
  }
  if (typeof data.text !== "string" || !data.text.trim() || data.text.length > MAX_INPUT) {
    throw new HttpsError("invalid-argument", "text_invalid");
  }
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const habits = Array.isArray(data.habits) ? data.habits : [];
  if (tags.length > 30 || tags.some((x) => typeof x !== "string" || x.length > 60)) {
    throw new HttpsError("invalid-argument", "tags_invalid");
  }
  if (habits.length > 100 || habits.some((x) => !x || typeof x.name !== "string" || x.name.length > 120)) {
    throw new HttpsError("invalid-argument", "habits_invalid");
  }
  const referenceDate = isIsoDate(data.date) ? data.date : null;
  if (!referenceDate) throw new HttpsError("invalid-argument", "date_invalid");
  return { requestId, text: data.text, date: referenceDate, tags: [...new Set(tags)], habits: habits.map((x) => x.name) };
}

function promptFor({ text, date, tags, habits }) {
  return `Du extrahierst strukturierte Tracker-Daten aus einem freien Tagebuchtext. Erfinde nichts.
Gib ausschließlich JSON mit journal_entry, water_ml, meals, habits_done, fitness_sessions, relax_sessions und planner_tasks zurück.
journal_entry: knappe deutsche Zusammenfassung. Der Originaltext wird separat unverändert gespeichert.
meals: nur klar erwähnte Mahlzeiten/Getränke; type ist breakfast, lunch, dinner oder snack.
time nur als HH:mm, wenn ausdrücklich genannt. Makros nur nennen, wenn im Text oder als Schätzung für ein ausdrücklich erwähntes Essen; unbekannte Makros weglassen, nie 0 erfinden. Jede geschätzte Größe unter estimated_fields (kcal, protein, carbs, fat) markieren.
habits_done darf nur exakt passende Namen aus dieser Liste enthalten: ${JSON.stringify(habits)}
fitness_sessions nur für klar berichtete, bereits absolvierte Einheiten. Felder: activity_type (strength, hiit, running, walking, cycling, rowing, swimming, hiking, climbing, yoga, stretching), date als YYYY-MM-DD wenn aus Bezugsdatum ${date} eindeutig, sonst weglassen; duration_minutes als ganze Zahl oder weglassen, notes, time nur bei ausdrücklich genannter Uhrzeit. Keine Übungen/Sätze hinzuerfinden.
relax_sessions nur für klar absolvierte Praxis. Felder: technique, date wenn eindeutig, minutes als ganze Zahl oder weglassen, note. Stimmung nicht ableiten.
planner_tasks nur für ausdrücklich zukünftige Absichten mit konkretem Verb. Bezugsdatum des Journaleintrags: ${date}. Felder: title, date (YYYY-MM-DD nur wenn aus Kontext eindeutig ableitbar), time (HH:mm nur ausdrücklich genannt), duration_minutes nur wenn genannt, notes. Keine Termine aus vagen Wünschen erzeugen.
water_ml ist eine klar genannte Trinkmenge als ganze ml-Zahl, sonst 0. Tags helfen nur bei der Zuordnung, nicht als Fakten: ${JSON.stringify(tags)}
Text:\n"""\n${text}\n"""`;
}

function fingerprint(input) {
  return createHash("sha256").update(JSON.stringify({
    text: input.text,
    date: input.date,
    tags: input.tags,
    habits: input.habits,
  })).digest("hex");
}

function validateResult(parsed, input) {
  const allowedRoot = new Set(["journal_entry", "water_ml", "meals", "habits_done", "fitness_sessions", "relax_sessions", "planner_tasks"]);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)
      || Object.keys(parsed).some((key) => !allowedRoot.has(key))) throw new Error("schema_root");
  if (typeof parsed.journal_entry !== "string" || parsed.journal_entry.length > 4000) throw new Error("schema_journal");
  if (!Number.isInteger(parsed.water_ml) || parsed.water_ml < 0 || parsed.water_ml > 20000) throw new Error("schema_water");
  if (!Array.isArray(parsed.meals) || parsed.meals.length > 20) throw new Error("schema_meals");
  if (!Array.isArray(parsed.habits_done) || parsed.habits_done.length > 50) throw new Error("schema_habits");
  const meals = parsed.meals.map((meal) => {
    const fields = new Set(["description", "type", "notes", "time", ...MACROS, "estimated_fields"]);
    if (!meal || typeof meal !== "object" || Array.isArray(meal)
        || Object.keys(meal).some((key) => !fields.has(key))) throw new Error("schema_meal");
    if (typeof meal.description !== "string" || !meal.description.trim() || meal.description.length > 240) throw new Error("schema_description");
    if (!["breakfast", "lunch", "dinner", "snack"].includes(meal.type)) throw new Error("schema_type");
    if (meal.notes != null && (typeof meal.notes !== "string" || meal.notes.length > 500)) throw new Error("schema_notes");
    if (meal.time != null && (typeof meal.time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(meal.time))) throw new Error("schema_time");
    const estimates = meal.estimated_fields ?? [];
    if (!Array.isArray(estimates) || estimates.some((x) => !MACROS.has(x))) throw new Error("schema_estimates");
    for (const [key, max] of [["kcal", 10000], ["protein", 1500], ["carbs", 2000], ["fat", 1500]]) {
      if (meal[key] != null && (typeof meal[key] !== "number" || !Number.isFinite(meal[key]) || meal[key] < 0 || meal[key] > max)) throw new Error(`schema_${key}`);
      if (estimates.includes(key) && meal[key] == null) throw new Error("schema_estimate_missing");
    }
    return { description: meal.description.trim(), type: meal.type, notes: meal.notes || "", time: meal.time || null,
      kcal: meal.kcal ?? null, protein: meal.protein ?? null, carbs: meal.carbs ?? null, fat: meal.fat ?? null,
      estimated_fields: [...new Set(estimates)] };
  });
  const allowedHabits = new Set(input.habits);
  const habits_done = parsed.habits_done.map((habit) => {
    if (!habit || typeof habit.name !== "string" || !allowedHabits.has(habit.name)) throw new Error("schema_habit_name");
    if (habit.evidence != null && (typeof habit.evidence !== "string" || habit.evidence.length > 500)) throw new Error("schema_habit_evidence");
    return { name: habit.name, evidence: habit.evidence || "" };
  });
  const fitnessTypes = new Set(["strength", "hiit", "running", "walking", "cycling", "rowing", "swimming", "hiking", "climbing", "yoga", "stretching"]);
  for (const [key, cap] of [["fitness_sessions", 20], ["relax_sessions", 20], ["planner_tasks", 20]]) {
    if (parsed[key] != null && (!Array.isArray(parsed[key]) || parsed[key].length > cap)) throw new Error(`schema_${key}`);
  }
  const fitness_sessions = (parsed.fitness_sessions ?? []).map((item) => {
    if (!item || typeof item !== "object" || Object.keys(item).some((key) => !["activity_type", "date", "duration_minutes", "notes", "time"].includes(key))) throw new Error("schema_fitness");
    if (!fitnessTypes.has(item.activity_type)) throw new Error("schema_fitness_type");
    if (item.duration_minutes != null && (!Number.isInteger(item.duration_minutes) || item.duration_minutes < 1 || item.duration_minutes > 1440)) throw new Error("schema_fitness_duration");
    if (item.notes != null && (typeof item.notes !== "string" || item.notes.length > 500)) throw new Error("schema_fitness_notes");
    if (item.time != null && (typeof item.time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time))) throw new Error("schema_fitness_time");
    if (item.date != null && !isIsoDate(item.date)) throw new Error("schema_fitness_date");
    return { activity_type: item.activity_type, date: item.date || input.date, duration_minutes: item.duration_minutes ?? null, notes: item.notes || "", time: item.time || null };
  });
  const relax_sessions = (parsed.relax_sessions ?? []).map((item) => {
    if (!item || typeof item !== "object" || Object.keys(item).some((key) => !["technique", "date", "minutes", "note"].includes(key))) throw new Error("schema_relax");
    if (typeof item.technique !== "string" || !item.technique.trim() || item.technique.length > 120) throw new Error("schema_relax_technique");
    if (item.minutes != null && (!Number.isInteger(item.minutes) || item.minutes < 1 || item.minutes > 1440)) throw new Error("schema_relax_minutes");
    if (item.note != null && (typeof item.note !== "string" || item.note.length > 500)) throw new Error("schema_relax_note");
    if (item.date != null && !isIsoDate(item.date)) throw new Error("schema_relax_date");
    return { technique: item.technique.trim(), date: item.date || input.date, minutes: item.minutes ?? null, note: item.note || "" };
  });
  const planner_tasks = (parsed.planner_tasks ?? []).map((item) => {
    if (!item || typeof item !== "object" || Object.keys(item).some((key) => !["title", "date", "time", "duration_minutes", "notes"].includes(key))) throw new Error("schema_planner");
    if (typeof item.title !== "string" || !item.title.trim() || item.title.length > 160) throw new Error("schema_planner_title");
    if (item.date != null && !isIsoDate(item.date)) throw new Error("schema_planner_date");
    if (item.time != null && (typeof item.time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time))) throw new Error("schema_planner_time");
    if (item.duration_minutes != null && (!Number.isInteger(item.duration_minutes) || item.duration_minutes < 1 || item.duration_minutes > 1440)) throw new Error("schema_planner_duration");
    if (item.notes != null && (typeof item.notes !== "string" || item.notes.length > 500)) throw new Error("schema_planner_notes");
    return { title: item.title.trim(), date: item.date || null, time: item.time || null, duration_minutes: item.duration_minutes ?? null, notes: item.notes || "" };
  });
  return { request_id: input.requestId, original_text: input.text, source_tags: input.tags,
    journal_entry: parsed.journal_entry, water_ml: parsed.water_ml, meals, habits_done, fitness_sessions, relax_sessions, planner_tasks };
}

async function analyze({ db, uid, data, apiKey, fetchImpl, now = new Date() }) {
  const input = validateInput(data);
  const inputHash = fingerprint(input);
  if (!apiKey) throw new HttpsError("failed-precondition", "smart_log_provider_not_configured");
  const key = weekKey(now);
  const reqRef = db.collection("smartLoggingRequests").doc(uid).collection("requests").doc(input.requestId);
  const quotaRef = db.collection("smartLoggingQuotas").doc(uid).collection("weeks").doc(key);
  const entitlementRef = db.collection("smartLoggingEntitlements").doc(uid);
  const configRef = db.collection("smartLoggingConfig").doc("default");

  const reservation = await db.runTransaction(async (tx) => {
    const [reqSnap, quotaSnap, entitlementSnap, configSnap] = await Promise.all([
      tx.get(reqRef), tx.get(quotaRef), tx.get(entitlementRef), tx.get(configRef),
    ]);
    if (reqSnap.exists && reqSnap.get("inputHash") && reqSnap.get("inputHash") !== inputHash) {
      throw new HttpsError("failed-precondition", "smart_log_request_id_conflict");
    }
    if (reqSnap.exists && reqSnap.get("status") === "succeeded") return { cached: reqSnap.get("result") };
    if (reqSnap.exists && ["processing", "locked"].includes(reqSnap.get("status"))) {
      throw new HttpsError("aborted", "smart_log_request_locked");
    }
    const entitlement = entitlementSnap.data() || {};
    const isOperate = entitlement.tier === "operate" && entitlement.active === true;
    const config = configSnap.data() || {};
    const limit = isOperate ? entitlement.weeklyLimit : (config.observeWeeklyLimit ?? 1);
    if (!Number.isInteger(limit) || limit < 0) throw new HttpsError("failed-precondition", "smart_log_entitlement_not_configured");
    const used = quotaSnap.exists ? (quotaSnap.get("used") || 0) : 0;
    const pending = quotaSnap.exists ? (quotaSnap.get("reserved") || 0) : 0;
    if (used + pending >= limit) throw new HttpsError("resource-exhausted", "smart_log_weekly_quota_reached", { tier: isOperate ? "operate" : "observe", week: key, limit });
    tx.set(quotaRef, { used, reserved: pending + 1, week: key, tier: isOperate ? "operate" : "observe", updatedAt: new Date() }, { merge: true });
    tx.set(reqRef, { status: "processing", week: key, inputHash, createdAt: new Date(), updatedAt: new Date() });
    return { cached: null };
  });
  if (reservation.cached) return reservation.cached;

  let providerStarted = false;
  try {
    providerStarted = true;
    const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: promptFor(input) }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 } }),
    });
    if (!response.ok) throw new Error(`provider_http_${response.status}`);
    const body = await response.json();
    const raw = body?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
    if (!raw) throw new Error("provider_empty_response");
    const result = validateResult(JSON.parse(raw), input);
    await db.runTransaction(async (tx) => {
      const [quotaSnap, reqSnap] = await Promise.all([tx.get(quotaRef), tx.get(reqRef)]);
      if (!reqSnap.exists || reqSnap.get("status") !== "processing") throw new Error("smart_request_state_lost");
      const reserved = Math.max(0, (quotaSnap.get("reserved") || 1) - 1);
      tx.set(quotaRef, { reserved, used: (quotaSnap.get("used") || 0) + 1, updatedAt: new Date() }, { merge: true });
      tx.set(reqRef, { status: "succeeded", result, updatedAt: new Date() }, { merge: true });
    });
    return result;
  } catch (error) {
    await db.runTransaction(async (tx) => {
      const [quotaSnap, reqSnap] = await Promise.all([tx.get(quotaRef), tx.get(reqRef)]);
      if (reqSnap.exists && reqSnap.get("status") === "processing") {
        if (providerStarted) {
          // Gemini may have processed/billed the request even if its response
          // or our success write failed. Keep the request and quota locked so
          // a retry with the same ID cannot trigger a second model call.
          tx.set(reqRef, { status: "locked", updatedAt: new Date(), failure: "provider_result_unknown" }, { merge: true });
        } else {
          tx.set(quotaRef, { reserved: Math.max(0, (quotaSnap.get("reserved") || 1) - 1), updatedAt: new Date() }, { merge: true });
          tx.set(reqRef, { status: "failed", updatedAt: new Date() }, { merge: true });
        }
      }
    });
    throw error;
  }
}

module.exports = { analyze, weekKey, validateInput, validateResult };
