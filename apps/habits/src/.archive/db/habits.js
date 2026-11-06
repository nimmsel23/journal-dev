import { api, localToday } from "./core";

const LOCAL_KEYS = {
  habitOverlay: "fitness-local-habit-overlay",
  habitJournals: "fitness-local-habit-journals",
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function normalizeHabitRecord(record) {
  const date = record?.date || (record?.epochDay !== undefined ? new Date(Number(record.epochDay) * 86400000).toISOString().slice(0, 10) : null);
  if (!date) return null;
  return { ...record, date, completion: record?.completion || (record?.done ? "DONE" : "MISSED") };
}

function overlayHabit(habit) {
  const overlay = readJSON(LOCAL_KEYS.habitOverlay, {})[habit.uuid] || {};
  return { ...habit, ...overlay };
}

function mapHabits(raw) {
  const habits = Array.isArray(raw) ? raw : raw?.habits || [];
  return habits.map((h) => {
    const records = (h.records || []).map(normalizeHabitRecord).filter(Boolean);
    return {
      uuid: h.uuid || h.id,
      name: h.name,
      icon: h.icon || "Activity",
      deleted: !!h.deleted,
      source: h.source || "coach",
      records,
      hasRecord: (date) => records.some((x) => x.date === date && x.completion === "DONE"),
    };
  }).map(overlayHabit);
}

export async function getHabits() {
  try {
    const data = await api.get("/habitsync/habits");
    return mapHabits(data).filter((h) => !h.deleted);
  } catch {
    return [];
  }
}

export async function addHabit(name, icon = "Activity") {
  return api.post("/habitsync/add", { name: name.trim(), icon });
}

export async function deleteHabit(uuid) {
  const overlay = readJSON(LOCAL_KEYS.habitOverlay, {});
  overlay[uuid] = { ...(overlay[uuid] || {}), deleted: true };
  writeJSON(LOCAL_KEYS.habitOverlay, overlay);
  return api.delete(`/habitsync/delete/${encodeURIComponent(uuid)}`);
}

export async function recordHabit(uuid, date = localToday()) {
  return api.post(`/habitsync/record/${encodeURIComponent(uuid)}`, {});
}

export async function unrecordHabit(uuid, date = localToday()) {
  return api.post(`/habitsync/record/${encodeURIComponent(uuid)}`, {});
}

export async function updateHabit(uuid, newName, newIcon) {
  const overlay = readJSON(LOCAL_KEYS.habitOverlay, {});
  overlay[uuid] = { ...(overlay[uuid] || {}), name: newName, icon: newIcon };
  writeJSON(LOCAL_KEYS.habitOverlay, overlay);
  return { ok: true };
}

export async function getHabitRecordsForDate(date = localToday()) {
  const habits = await getHabits();
  return habits.filter((h) => h.hasRecord(date)).map((h) => h.uuid);
}

export async function getHabitJournal(habitId, date) {
  const journals = readJSON(LOCAL_KEYS.habitJournals, {});
  return (journals[habitId] || []).find((item) => item.date === date) || null;
}

export async function getHabitJournalHistory(habitId) {
  const journals = readJSON(LOCAL_KEYS.habitJournals, {});
  return (journals[habitId] || []).slice().sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveHabitJournal(habitId, date, text) {
  const journals = readJSON(LOCAL_KEYS.habitJournals, {});
  const items = Array.isArray(journals[habitId]) ? journals[habitId].filter((item) => item.date !== date) : [];
  items.unshift({ date, text: String(text || "").trim(), updated_at: new Date().toISOString() });
  journals[habitId] = items;
  writeJSON(LOCAL_KEYS.habitJournals, journals);
  return { ok: true };
}
