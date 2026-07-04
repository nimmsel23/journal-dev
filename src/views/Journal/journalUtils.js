export const EFFORT_LABELS = ['', '', 'Sehr leicht', 'Leicht', 'Moderat', 'Etwas schwer', 'Schwer', 'Sehr schwer', 'Extrem', 'Maximal', 'All-Out'];

export function timeStr(e) {
  if (e.time) return e.time.slice(11, 16);
  if (e.updated_at?.seconds) return new Date(e.updated_at.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return '';
}
