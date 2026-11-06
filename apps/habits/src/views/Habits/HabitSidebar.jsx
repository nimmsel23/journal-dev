import { X, Calendar, Check, Save, History, Brain, PenLine } from "lucide-react";
import { useSwipeToDismiss } from "@fitness/hooks/useSwipeToDismiss.js";
import { ICON_COMPONENTS_MAP, getRollingDays } from "./utils";

export default function HabitSidebar({
  selectedHabitId,
  setSelectedHabitId,
  habits,
  rollingDates,
  selectedSidebarDate,
  setSelectedSidebarDate,
  journalText,
  isJournalSaving,
  onToggleSidebarDone,
  journalHistory,
  onOpenJournalModal,
  inline = false,
}) {
  const selectedHabit = habits.find(h => h.uuid === selectedHabitId);
  const swipeRef = useSwipeToDismiss(() => setSelectedHabitId(null), { enabled: Boolean(selectedHabit) && !inline });
  if (!selectedHabit) return null;

  const selectedHabitRecords = selectedHabit.records || [];
  const selectedHabitConsistency = selectedHabitRecords.length > 0 ?
    (selectedHabitRecords.filter(r => rollingDates.includes(r.date) && r.completion === 'DONE').length / rollingDates.length) * 100 : 0;

  const IconComponent = ICON_COMPONENTS_MAP[selectedHabit.icon || 'Activity'];
  const isDoneOnSidebarDate = selectedHabitRecords.some(r => r.date === selectedSidebarDate && r.completion === 'DONE');

  const content = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent size={22} className="text-slate-100" />}
          <h2 className="text-lg font-black text-slate-100">{selectedHabit.name}</h2>
        </div>
        <button onClick={() => setSelectedHabitId(null)} className="p-2 text-slate-400 hover:text-red-400 transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-widest opacity-70 text-slate-100 flex items-center gap-2">
            <Calendar size={12} className="text-slate-400" />
            Konsistenz (28 Tage)
          </h4>
          <span className="text-[10px] font-bold opacity-30 text-slate-400">{Math.round(selectedHabitConsistency)}%</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {getRollingDays(28).map(d => {
            const done = selectedHabitRecords.some(r => r.date === d && r.completion === 'DONE');
            const isSelectedDate = d === selectedSidebarDate;
            return (
              <button
                key={d}
                onClick={() => setSelectedSidebarDate(d)}
                title={`${d}: ${done ? 'Erledigt' : 'Offen'}`}
                className={`aspect-square rounded-md shadow-sm transition-all border ${done ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-900 border-white/10/50'} ${isSelectedDate ? 'ring-2 ring-[#fb923c] ring-offset-1 ring-offset-[#0f172a] scale-110 z-10' : ''}`}
              />
            );
          })}
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-0.5">{selectedSidebarDate}</div>
            <h4 className="text-sm font-black text-slate-100">Status & Notizen</h4>
          </div>
          <button
            onClick={() => onToggleSidebarDone(selectedHabitId, selectedSidebarDate)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDoneOnSidebarDate ? 'bg-green text-black shadow-lg shadow-green/20' : 'bg-slate-900 border border-white/10 text-slate-400'}`}
          >
            <Check size={14} className={isDoneOnSidebarDate ? 'stroke-[3]' : ''} />
            {isDoneOnSidebarDate ? 'Erledigt' : 'Offen'}
          </button>
        </div>

        <button
          onClick={() => onOpenJournalModal?.()}
          className="w-full text-left bg-slate-900 border border-white/10 rounded-2xl p-4 hover:border-orange-400 transition-all"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-400">
              <PenLine size={12} />
              Reflexion schreiben
            </div>
            {isJournalSaving && <Save size={12} className="text-orange-400 animate-pulse" />}
          </div>
          {journalText ? (
            <p className="text-xs font-bold leading-relaxed text-slate-100/80 line-clamp-3 whitespace-pre-wrap">{journalText}</p>
          ) : (
            <p className="text-xs font-bold leading-relaxed text-slate-400 opacity-50 italic">Tippen, um die Memoirs zu öffnen</p>
          )}
        </button>

        {(() => {
          const currentEntry = journalHistory.find(h => h.date === selectedSidebarDate);
          if (!currentEntry?.coachFeedback) return null;
          return (
            <div className="p-4 rounded-2xl bg-orange-400/5 border border-orange-400/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={14} className="text-orange-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Coach Feedback</span>
              </div>
              <p className="text-xs font-bold leading-relaxed text-slate-100/90 italic">"{currentEntry.coachFeedback}"</p>
            </div>
          );
        })()}
      </div>

      {journalHistory?.length > 0 && (
        <div className="space-y-3 pb-4">
          <div className="flex items-center gap-2 px-1">
            <History size={14} className="text-slate-400" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Historie</h4>
          </div>
          {journalHistory.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-white/10/50">
              <div className="text-[9px] font-black opacity-30 uppercase tracking-widest mb-2">{item.date}</div>
              <div className="text-xs font-bold leading-relaxed text-slate-100/80 whitespace-pre-wrap">{item.text}</div>
              {item.coachFeedback && (
                <div className="mt-3 pt-3 border-t border-white/10/30">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Brain size={10} className="text-orange-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">Coach Feedback</span>
                  </div>
                  <p className="text-[11px] font-bold italic text-slate-100/70">"{item.coachFeedback}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (inline) {
    return (
      <div className="rounded-[24px] bg-slate-900 border border-white/10 p-6 space-y-5">
        {content}
      </div>
    );
  }

  return (
    <div ref={swipeRef} className={`fixed bottom-0 left-0 right-0 max-h-[85vh] bg-slate-900 shadow-2xl z-50 rounded-t-[32px] transform transition-transform duration-300 ${selectedHabitId ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="w-12 h-1 rounded-full bg-white/10 mx-auto mt-3 mb-1" />
      <div className="flex flex-col p-6 space-y-5 overflow-y-auto overscroll-contain max-h-[calc(85vh-2rem)]">
        {content}
      </div>
    </div>
  );
}
