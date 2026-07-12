// journalUtils.js — geteilte Helfer der Journal-Timeline.
// Bewusst ohne @utils/@db-Aliases: dieser Ordner wird von fitness-dev
// (Verzeichnis-Symlink views/Journal), fuel-dev (@journal) und dem
// journal-Standalone-Build gebündelt — nicht jeder Kontext definiert
// dieselben Aliases.

export const EFFORT_LABELS = ['', '', 'Sehr leicht', 'Leicht', 'Moderat', 'Etwas schwer', 'Schwer', 'Sehr schwer', 'Extrem', 'Maximal', 'All-Out'];

export const ACTIVITY_FALLBACK_LABELS = {
  swimming: 'Schwimmen', running: 'Laufen', cycling: 'Radfahren',
  hiking: 'Wandern', yoga: 'Yoga', climbing: 'Klettern',
  rowing: 'Rudern', elliptical: 'Elliptical', walking: 'Gehen',
};

// Semantische Typ-Farben der Timeline (Pillar-Kennung, kein Theme):
// Workout = Blau, Fuel/Meal = Emerald, Ernährungsjournal = Sky.
// Habit/Regular folgen dem Theme-Akzent (var(--j-accent)).
export const TYPE_COLORS = {
  workout: '#3b82f6',
  meal: '#22c55e',
  'nutrition-journal': '#38bdf8',
};

export function timeStr(e) {
  if (e.time) return e.time.slice(11, 16);
  if (e.updated_at?.seconds) return new Date(e.updated_at.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return '';
}

export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatRelativeDate(dateStr) {
  if (dateStr === localToday()) return "Heute";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === yesterday.toISOString().slice(0, 10)) return "Gestern";

  return new Date(dateStr).toLocaleDateString('de-DE', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

export function sessionInfo(session) {
  const isCardio = session.sessionMode === 'cardio' || !!session.activity;
  if (isCardio) {
    const type = typeof session.activity === 'string' ? session.activity : session.activity?.type;
    return { label: ACTIVITY_FALLBACK_LABELS[type] || 'Ausdauer', activityType: type || 'cardio' };
  }
  return { label: session.block || 'Krafttraining', activityType: null };
}
