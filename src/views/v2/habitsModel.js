import { addDays, format, parseISO } from 'date-fns';

export const CATEGORIES = ['body', 'being', 'balance', 'business'];
export const WEEKDAYS = [[1, 'Mo'], [2, 'Di'], [3, 'Mi'], [4, 'Do'], [5, 'Fr'], [6, 'Sa'], [0, 'So']];
export const DEFAULT_FREQUENCY = { type: 'daily', weekdays: [], timesPerPeriod: 1 };
const iso = (d) => format(d, 'yyyy-MM-dd');

export function habitFields(draft) {
  const name = String(draft.name || '').trim();
  if (!name) throw new Error('Bitte einen Namen eingeben.');
  const category = draft.category || null;
  if (category && !CATEGORIES.includes(category)) throw new Error('Unbekannte Kategorie.');
  const frequency = draft.frequency || DEFAULT_FREQUENCY;
  if (!['daily', 'weekly', 'monthly'].includes(frequency.type)) throw new Error('Ungültige Frequenz.');
  const weekdays = [...new Set(frequency.weekdays || [])];
  if (weekdays.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) throw new Error('Ungültige Wochentage.');
  const timesPerPeriod = Number(frequency.timesPerPeriod ?? 1);
  if (!Number.isInteger(timesPerPeriod) || timesPerPeriod < 1 || timesPerPeriod > 31) throw new Error('Monatsziel muss zwischen 1 und 31 liegen.');
  return { name, category, frequency: { type: frequency.type, weekdays, timesPerPeriod } };
}

export function dueOnDate(habit, date) {
  const frequency = habit.frequency || DEFAULT_FREQUENCY;
  return frequency.type !== 'weekly' || !frequency.weekdays?.length || frequency.weekdays.includes(parseISO(date).getDay());
}

export function habitStats(habit, endDate, today) {
  const end = endDate > today ? today : endDate;
  const created = habit.created_at?.toDate?.() || (typeof habit.created_at === 'string' ? new Date(habit.created_at) : null);
  const since = created && !Number.isNaN(created.getTime()) ? iso(created) : null;
  const days = Array.from({ length: 28 }, (_, i) => iso(addDays(parseISO(endDate), i - 27)));
  const eligible = (d) => d <= end && (!since || d >= since) && dueOnDate(habit, d);
  const scheduled = days.filter(eligible);
  const hits = scheduled.filter((d) => habit.hasRecord(d)).length;
  let streak = 0;
  let started = false;
  // Only the final scheduled day can remain open without breaking the streak.
  for (let n = 0; n < 120; n++) {
    const d = iso(addDays(parseISO(end), -n));
    if (since && d < since) break;
    if (!dueOnDate(habit, d)) continue;
    const done = habit.hasRecord(d);
    if (!started) { started = true; if (!done) continue; }
    if (!done) break;
    streak++;
  }
  const monthly = habit.frequency?.type === 'monthly';
  const month = endDate.slice(0, 7);
  const monthHits = new Set((habit.records || []).filter((r) => r.completion === 'DONE' && r.date.startsWith(month) && r.date <= end).map((r) => r.date)).size;
  return { days, hits, total: scheduled.length, rate: scheduled.length ? Math.round(hits / scheduled.length * 100) : 0, streak, monthly, monthHits, target: habit.frequency?.timesPerPeriod || 1 };
}
