import { Target, Dumbbell, Clock, Brain, Edit, CheckCircle2, UtensilsCrossed, NotebookPen } from "lucide-react";
import { EFFORT_LABELS, timeStr, TYPE_COLORS } from "./journalUtils";
// Via Alias, NICHT relativ über den src/constants-Symlink: dessen Ziel ist
// ein absoluter /home/alpha-Pfad und im CI-Runner tot. @fitness/constants
// definieren alle Konsumenten (journal, fitness, fuel .cjs, vitalos)
// checkout-relativ.
import { ACTIVITY_ICONS, ACTIVITY_LABELS, BLOCK_COLORS } from "@fitness/constants/ActivityConstants";

const ACCENT = "var(--j-accent)";

function TypeBadge({ icon: Icon, color, label, sub }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`, color }}>
        <Icon size={16} />
      </div>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color }}>{label}</span>
        <div className="text-[8px] font-bold uppercase tracking-tighter -mt-0.5 text-[var(--j-dim)]">{sub}</div>
      </div>
    </div>
  );
}

export default function JournalEntry({ e, habits, setSelectedEntry, onEdit, colorActivities, mediaEnabled }) {
  const isHabit = e.type === 'habit';
  const isWorkout = e.type === 'workout';
  const isActivity = e.type === 'activity';
  const isHabitCompletion = e.type === 'habit-completion';
  const isMeal = e.type === 'meal';
  const isNutritionJournal = e.type === 'nutrition-notes';
  const habit = isHabit ? habits.find(h => h.uuid === e.habitId) : null;

  const activityColor = colorActivities && BLOCK_COLORS[e.activityType]
    ? BLOCK_COLORS[e.activityType]
    : ACCENT;

  const bulletBg = TYPE_COLORS[e.type]
    || (isActivity ? activityColor : ACCENT);

  const borderColor = isWorkout
    ? 'rgba(59,130,246,0.15)'
    : isNutritionJournal
    ? 'rgba(56,189,248,0.15)'
    : isActivity && colorActivities
    ? `${activityColor}30`
    : 'var(--j-line)';

  return (
    <div className="relative group">
      <div
        className="absolute -left-[37px] top-6 w-4 h-4 rounded-full border-4 border-[var(--j-bg)] z-10 transition-transform group-hover:scale-125"
        style={{ backgroundColor: bulletBg }}
      />

      <div
        onClick={() => setSelectedEntry(e)}
        className="p-6 rounded-2xl border bg-[var(--j-card)] transition-colors hover:border-[var(--j-accent)]/40 cursor-pointer"
        style={{ borderColor }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          {isWorkout ? (
            <TypeBadge icon={Dumbbell} color={TYPE_COLORS.workout} label={e.block} sub="Workout geloggt" />
          ) : isActivity ? (
            <TypeBadge
              icon={ACTIVITY_ICONS[e.activityType] || Dumbbell}
              color={activityColor}
              label={ACTIVITY_LABELS[e.activityType] || e.block || 'Ausdauer'}
              sub="Ausdauer geloggt"
            />
          ) : isMeal ? (
            <TypeBadge
              icon={UtensilsCrossed}
              color={TYPE_COLORS.meal}
              label="Fuel"
              sub={`${e.meals?.length || 0} Mahlzeit${e.meals?.length === 1 ? '' : 'en'}`}
            />
          ) : isHabitCompletion ? (
            <TypeBadge icon={CheckCircle2} color={ACCENT} label={e.habitName} sub="Habit abgeschlossen" />
          ) : isHabit ? (
            <TypeBadge icon={Target} color={ACCENT} label={habit?.name} sub="Habit Journal" />
          ) : isNutritionJournal ? (
            <TypeBadge icon={NotebookPen} color={TYPE_COLORS['nutrition-notes']} label="Ernährungs-Notizen" sub="Notizen geloggt" />
          ) : (
            <div className="flex items-center gap-2 text-[var(--j-dim)]">
              <Clock size={14} className="opacity-50" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Journal Eintrag</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {e.type === 'regular' && (
              <button
                onClick={(ev) => { ev.stopPropagation(); onEdit(e); }}
                className="p-1.5 rounded-lg text-[var(--j-dim)] hover:text-[var(--j-accent)] hover:bg-[var(--j-bg2)] transition-all"
                title="Eintrag bearbeiten"
              >
                <Edit size={12} />
              </button>
            )}
            {timeStr(e) && (
              <span className="text-[10px] font-mono text-[var(--j-dim)] opacity-60 bg-[var(--j-bg2)] px-2 py-1 rounded-md">
                {timeStr(e)}
              </span>
            )}
          </div>
        </div>

        {/* Workout: Übungsliste */}
        {isWorkout && e.exercises?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {e.exercises.map((ex, idx) => (
              <span key={idx} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/8 text-blue-400 border border-blue-500/15">
                {ex.name}
              </span>
            ))}
          </div>
        )}

        {/* Fuel: Mahlzeiten + kcal-Summe */}
        {isMeal && e.meals?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5 items-center">
            {e.meals.map((m, idx) => (
              <span key={idx} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/8 text-emerald-400 border border-emerald-500/15">
                {m.description}
              </span>
            ))}
            {e.totalKcal > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md border text-emerald-300 bg-emerald-500/8 border-emerald-500/15">
                {Math.round(e.totalKcal)} kcal
              </span>
            )}
          </div>
        )}

        {/* Effort-Badge */}
        {(isWorkout || isActivity) && e.effort > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--j-dim)]">Anstrengung</span>
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-md border"
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
              {e.effort}/10{EFFORT_LABELS[e.effort] ? ` · ${EFFORT_LABELS[e.effort]}` : ''}
            </span>
          </div>
        )}

        {/* Text */}
        {e.text && (
          <p className="text-[15px] leading-relaxed text-[var(--j-ink)] whitespace-pre-wrap line-clamp-3">
            {e.text}
          </p>
        )}

        {/* Foto-Anhänge: max 4 Thumbnails, Rest als +N auf dem letzten */}
        {mediaEnabled && e.attachments?.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-hidden">
            {e.attachments.slice(0, 4).map((a, idx) => (
              <div key={a.path || idx} className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border border-[var(--j-line)] bg-[var(--j-bg2)]">
                <img src={a.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                {idx === 3 && e.attachments.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-[var(--j-ink)]">
                    +{e.attachments.length - 3}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isHabit && e.coachFeedback && (
          <div className="mt-6 p-4 rounded-xl bg-[var(--j-accent)]/5 border-l-4 border-[var(--j-accent)]">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={14} className="text-[var(--j-accent)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--j-accent)]">Coach Feedback</span>
            </div>
            <p className="text-xs italic text-[var(--j-ink)] opacity-80 leading-relaxed truncate">"{e.coachFeedback}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
