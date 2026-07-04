import { X, Target, Dumbbell, Book, Brain, CheckCircle2 } from "lucide-react";
import { EFFORT_LABELS } from "./journalUtils";
import { ACTIVITY_ICONS, ACTIVITY_LABELS, BLOCK_COLORS } from "../../constants/ActivityConstants";

export default function JournalModal({ selectedEntry, setSelectedEntry, habits, formatRelativeDate, colorActivities }) {
  if (!selectedEntry) return null;

  const isHabit = selectedEntry.type === 'habit';
  const isWorkout = selectedEntry.type === 'workout';
  const isActivity = selectedEntry.type === 'activity';
  const isHabitCompletion = selectedEntry.type === 'habit-completion';
  const habit = isHabit ? habits.find(h => h.uuid === selectedEntry.habitId) : null;

  const ActivityIcon = isActivity && ACTIVITY_ICONS[selectedEntry.activityType]
    ? ACTIVITY_ICONS[selectedEntry.activityType]
    : Dumbbell;

  const activityColor = isActivity && colorActivities && BLOCK_COLORS[selectedEntry.activityType]
    ? BLOCK_COLORS[selectedEntry.activityType]
    : 'var(--accent)';

  const timeDisplay = selectedEntry.time
    ? selectedEntry.time.slice(11, 16)
    : selectedEntry.updated_at?.seconds
    ? new Date(selectedEntry.updated_at.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const iconColor = isWorkout
    ? 'text-blue-500 bg-blue-500/10'
    : isActivity
    ? ''
    : 'text-[var(--accent)] bg-[var(--accent)]/10';

  const title = isHabit
    ? habit?.name
    : isWorkout
    ? selectedEntry.block
    : isActivity
    ? (ACTIVITY_LABELS[selectedEntry.activityType] || selectedEntry.block || 'Ausdauer')
    : isHabitCompletion
    ? selectedEntry.habitName
    : 'Journal Eintrag';

  const subtitle = isWorkout
    ? 'Workout geloggt'
    : isActivity
    ? 'Ausdauer geloggt'
    : isHabitCompletion
    ? 'Habit abgeschlossen'
    : isHabit
    ? 'Habit Journal'
    : 'Notiz';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEntry(null)} />

      <div className="relative w-full max-w-2xl bg-[var(--card)] rounded-[32px] border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[var(--line)]/50 flex items-center justify-between bg-gradient-to-r from-[var(--card)] to-[var(--bg2)]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${!isActivity ? iconColor : ''}`}
              style={isActivity ? { color: activityColor, backgroundColor: `${activityColor}1a` } : {}}
            >
              {isHabit ? <Target size={20} />
                : isWorkout ? <Dumbbell size={20} />
                : isActivity ? <ActivityIcon size={20} />
                : isHabitCompletion ? <CheckCircle2 size={20} />
                : <Book size={20} />}
            </div>
            <div>
              <h3
                className="text-sm font-black uppercase tracking-widest"
                style={isActivity ? { color: activityColor } : { color: 'var(--ink)' }}
              >
                {title}
              </h3>
              <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
                {formatRelativeDate(selectedEntry.date)}{timeDisplay ? ` · ${timeDisplay} Uhr` : ''} · {subtitle}
              </div>
            </div>
          </div>
          <button onClick={() => setSelectedEntry(null)} className="p-3 rounded-2xl hover:bg-[var(--bg2)] text-[var(--dim)] transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-8">
          {/* Workout: Übungsliste */}
          {isWorkout && selectedEntry.exercises?.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-3">Abgehakte Übungen</div>
              <div className="flex flex-wrap gap-2">
                {selectedEntry.exercises.map((ex, idx) => (
                  <span key={idx} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-500/8 text-blue-400 border border-blue-500/15">
                    {ex.name}
                    {ex.sets && ex.reps ? ` · ${ex.sets}×${ex.reps}` : ''}
                    {ex.weight ? ` @ ${ex.weight}kg` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Effort */}
          {(isWorkout || isActivity) && selectedEntry.effort > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Anstrengung</span>
              <span
                className="text-xs font-black px-3 py-1 rounded-lg border"
                style={isActivity && colorActivities ? {
                  color: activityColor,
                  backgroundColor: `${activityColor}14`,
                  borderColor: `${activityColor}26`,
                } : {
                  color: '#60a5fa',
                  backgroundColor: 'rgba(59,130,246,0.08)',
                  borderColor: 'rgba(59,130,246,0.15)',
                }}
              >
                {selectedEntry.effort}/10 · {EFFORT_LABELS[selectedEntry.effort] || ''}
              </span>
            </div>
          )}

          {/* Text / Notes */}
          {selectedEntry.text && (
            <p className="text-lg sm:text-xl font-medium leading-relaxed text-[var(--ink)]/90 whitespace-pre-wrap selection:bg-[var(--accent)]/30">
              {selectedEntry.text}
            </p>
          )}

          {/* Habit-Completion: leerer State */}
          {isHabitCompletion && !selectedEntry.text && (
            <div className="flex items-center gap-3 text-[var(--accent)]">
              <CheckCircle2 size={32} />
              <span className="text-base font-black uppercase tracking-widest">{selectedEntry.habitName} — Abgeschlossen</span>
            </div>
          )}

          {/* Coach Feedback */}
          {selectedEntry.coachFeedback && (
            <div className="p-6 rounded-[24px] bg-[var(--accent)]/5 border border-[var(--accent)]/20 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-[var(--accent)]">
                <Brain size={120} />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Brain size={18} className="text-[var(--accent)]" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">Coach Feedback</span>
              </div>
              <p className="text-sm sm:text-base font-bold italic text-[var(--ink)]/80 leading-relaxed relative z-10">
                "{selectedEntry.coachFeedback}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--line)]/50 bg-[var(--bg2)]/50 flex justify-end">
          <button onClick={() => setSelectedEntry(null)} className="btn bg-[var(--card)] border border-[var(--line)] text-[var(--ink)] px-8 py-2.5 text-[10px] font-black uppercase tracking-widest hover:border-[var(--accent)] transition-all">
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
