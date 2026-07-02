import { useState, useEffect, useMemo } from "react";
import { saveJournal, updateJournal, getHabits, getJournalHistory, getAllHabitJournalsHistory, getSessionHistory, getHabitJournal, saveHabitJournal } from "@db";
import { localToday } from "@utils";
import { Book, PenLine } from "lucide-react";
import JournalSettings from "./JournalSettings";
import { ICON_COMPONENTS_MAP } from "@habits/views/Habits/utils";
import JournalHeader from "./JournalHeader";
import JournalForm from "./JournalForm";
import JournalEntry from "./JournalEntry";
import JournalModal from "./JournalModal";
import HabitJournalModal from "@habits/views/Habits/HabitJournalModal";

const ACTIVITY_LABELS = {
  swimming: 'Schwimmen', running: 'Laufen', cycling: 'Radfahren',
  hiking: 'Wandern', yoga: 'Yoga', climbing: 'Klettern',
  rowing: 'Rudern', elliptical: 'Elliptical', walking: 'Gehen',
};

function sessionInfo(session) {
  const isCardio = session.sessionMode === 'cardio' || !!session.activity;
  if (isCardio) {
    const type = typeof session.activity === 'string' ? session.activity : session.activity?.type;
    return { label: ACTIVITY_LABELS[type] || 'Ausdauer', activityType: type || 'cardio' };
  }
  return { label: session.block || 'Krafttraining', activityType: null };
}

function formatRelativeDate(dateStr) {
  const today = localToday();
  if (dateStr === today) return "Heute";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === yesterday.toISOString().slice(0, 10)) return "Gestern";
  
  return new Date(dateStr).toLocaleDateString('de-DE', { 
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' 
  });
}

export default function Journal({ onOpenSession, user }) {
  const [date, setDate]     = useState(localToday());
  const [text, setText]     = useState("");
  const [timeline, setTimeline] = useState([]); // Array of grouped entries by date
  const [habits, setHabits]   = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [limitCount, setLimitCount] = useState(30);
  const [showSettings, setShowSettings] = useState(false);
  const [journalSettings, setJournalSettings] = useState(() => ({
    colorActivities: localStorage.getItem('journal_colorActivities') === 'true',
  }));
  const colorActivities = journalSettings.colorActivities;

  function handleSettingChange(key, value) {
    setJournalSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(`journal_${key}`, value);
  }

  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [selectedHabitForJournal, setSelectedHabitForJournal] = useState(null);
  const [journalText, setJournalText] = useState("");
  const [isJournalSaving, setIsJournalSaving] = useState(false);

  const outstandingMemoirs = useMemo(() => {
    if (!date || habits.length === 0) return [];
    
    // Find habits done for the selected date
    const doneHabits = habits.filter(h => 
      h.records?.some(r => r.date === date && r.completion === 'DONE')
    );
    
    // Find which ones already have a habit journal entry (memoir) for this date in the timeline
    const dateGroup = timeline.find(g => g.date === date);
    const writtenHabitIdsForDate = new Set(
      (dateGroup?.entries || [])
        .filter(e => e.type === 'habit' && e.text && e.text.trim())
        .map(e => e.habitId)
    );
    
    return doneHabits.filter(h => !writtenHabitIdsForDate.has(h.uuid));
  }, [date, habits, timeline]);

  const handleOpenMemoir = async (habit) => {
    setSelectedHabitForJournal(habit);
    setJournalText("");
    const j = await getHabitJournal(habit.uuid, date);
    setJournalText(j?.text || "");
    setJournalModalOpen(true);
  };

  async function onSaveJournal(textOverride = null) {
    const textToSave = textOverride !== null ? textOverride : journalText;
    if (!selectedHabitForJournal || !date) return;
    setIsJournalSaving(true);
    try {
      await saveHabitJournal(selectedHabitForJournal.uuid, date, textToSave);
      setLimitCount(p => p + 1); // trigger reload
    } finally {
      setIsJournalSaving(false);
    }
  }

  useEffect(() => {
    async function load() {
      const [regularHistory, habitHistory, sessions, allHabits] = await Promise.all([
        getJournalHistory(limitCount),
        getAllHabitJournalsHistory(limitCount),
        getSessionHistory(limitCount),
        getHabits()
      ]);
      
      setHabits(allHabits);
      
      const combined = [
        ...regularHistory.map(e => ({ ...e, type: 'regular' })),
        ...habitHistory
      ];

      sessions.forEach(session => {
        const savedAt = session.saved_at?.seconds
          ? new Date(session.saved_at.seconds * 1000).toISOString()
          : (typeof session.saved_at === 'string' ? session.saved_at : `${session.date}T23:59:59`);
        const { label, activityType } = sessionInfo(session);
        combined.push({
          id: 'workout-' + session.date + '-' + (session.id || '0'),
          date: session.date,
          text: session.notes || '',
          type: activityType ? 'activity' : 'workout',
          block: label,
          activityType,
          exercises: session.exercises || [],
          effort: session.effort,
          mood: session.mood,
          time: savedAt
        });
      });

      // Habit-Completions aus allHabits.records
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - limitCount);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      allHabits.forEach(habit => {
        (habit.records || []).forEach(record => {
          if (record.completion === 'DONE' && record.date >= cutoffStr) {
            combined.push({
              id: `habit-completion-${habit.uuid}-${record.date}`,
              date: record.date,
              type: 'habit-completion',
              habitId: habit.uuid,
              habitName: habit.name,
              habitIcon: habit.icon,
              text: '',
              time: `${record.date}T12:00:00`
            });
          }
        });
      });

      // Group by date
      const grouped = {};
      combined.forEach(entry => {
        const d = entry.date || localToday();
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(entry);
      });

      // Sort dates descending
      const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
      
      // Sort entries within each date
      const finalTimeline = sortedDates.map(d => ({
        date: d,
        entries: grouped[d].sort((a, b) => {
          const timeA = a.time || "";
          const timeB = b.time || "";
          return timeB.localeCompare(timeA);
        })
      }));

      setTimeline(finalTimeline);

      // Auto-load if editing today
      if (date === localToday() && grouped[date]?.filter(e => e.type === 'regular').length === 1 && !text) {
        const todayRegular = grouped[date].find(e => e.type === 'regular');
        setEditingEntry(todayRegular);
        setText(todayRegular.text);
      } else if (!editingEntry) {
        setText("");
      }
    }
    load().catch(() => setTimeline([]));
  }, [limitCount, date, user?.uid]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2000); }

  async function submit() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      if (editingEntry) {
        await updateJournal(editingEntry.id, text);
        // Optimistic UI update
        setTimeline(prev => prev.map(group => {
           if (group.date === editingEntry.date) {
             return { ...group, entries: group.entries.map(e => e.id === editingEntry.id ? { ...e, text: text.trim() } : e) };
           }
           return group;
        }));
        setEditingEntry(null);
        showToast("Aktualisiert ✓");
      } else {
        await saveJournal(date, text);
        // Force full reload to get clean IDs and timeline
        setLimitCount(p => p + 1); // trigger reload
        showToast("Gespeichert ✓");
      }
      setText("");
    } catch { showToast("Fehler beim Speichern"); }
    finally { setSaving(false); }
  }

  const handleEdit = (entry) => {
    setDate(entry.date); // switch form context to this date
    setEditingEntry(entry);
    setText(entry.text);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-32 max-w-3xl mx-auto px-2">
      <JournalHeader
        date={date}
        setDate={setDate}
        localToday={localToday()}
        formatRelativeDate={formatRelativeDate}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="space-y-12">
        <JournalForm 
          text={text} 
          setText={setText} 
          onSubmit={submit} 
          saving={saving} 
          editingEntry={editingEntry}
          onCancelEdit={() => { setEditingEntry(null); setText(""); setDate(localToday()); }}
        />

        {outstandingMemoirs.length > 0 && (
          <div className="p-6 rounded-[24px] border border-orange-400/25 bg-orange-400/5 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                Ausstehende Memoirs ({outstandingMemoirs.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {outstandingMemoirs.map(h => {
                const Icon = ICON_COMPONENTS_MAP[h.icon] || ICON_COMPONENTS_MAP['Activity'];
                return (
                  <button
                    key={h.uuid}
                    onClick={() => handleOpenMemoir(h)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-orange-400 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-400/10 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-100">{h.name}</div>
                        <div className="text-[8px] font-bold opacity-40 uppercase tracking-widest mt-0.5">Eintrag fehlt</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-orange-400 bg-orange-400/10 px-2.5 py-1.5 rounded-xl border border-orange-400/15 group-hover:bg-orange-400 group-hover:text-black transition-all">
                      <PenLine size={10} />
                      Schreiben
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

<div className="space-y-12 mt-12">
          {timeline.length > 0 ? (
            timeline.map((group) => {
              const habitJournalIds = new Set(group.entries.filter(e => e.type === 'habit').map(e => e.habitId));
              const standaloneCompletions = group.entries.filter(e => e.type === 'habit-completion' && !habitJournalIds.has(e.habitId));
              const mainEntries = group.entries.filter(e => e.type !== 'habit-completion');
              return (
              <div key={group.date} className="relative">
                <div className="sticky top-0 z-10 py-2 bg-slate-950/90 backdrop-blur-md -mx-2 px-2 border-b border-white/10">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">
                    {formatRelativeDate(group.date)}
                  </h3>
                  {standaloneCompletions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {standaloneCompletions.map(e => {
                        const Icon = ICON_COMPONENTS_MAP[e.habitIcon] || ICON_COMPONENTS_MAP['Activity'];
                        return (
                          <span
                            key={e.id}
                            title={e.habitName}
                            className="w-6 h-6 rounded-full bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-orange-400 cursor-default"
                          >
                            <Icon size={12} />
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="relative pl-6 sm:pl-8 border-l border-white/10 space-y-6 mt-4">
                  {mainEntries.map((e, i) => (
                    <JournalEntry
                      key={e.id || i}
                      e={e}
                      habits={habits}
                      setSelectedEntry={setSelectedEntry}
                      onEdit={handleEdit}
                      onOpenSession={onOpenSession}
                      colorActivities={colorActivities}
                    />
                  ))}
                </div>
              </div>
              );
            })
          ) : (
            <div className="p-20 text-center rounded-[32px] border border-dashed border-white/10 opacity-20">
              <Book size={48} className="mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-widest">Keine Einträge gefunden</p>
            </div>
          )}

          {timeline.length > 0 && (
             <div className="pt-8 flex justify-center">
                <button 
                  onClick={() => setLimitCount(p => p + 30)} 
                  className="px-8 py-3 rounded-2xl bg-slate-900 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-100 hover:border-accent/30 transition-all"
                >
                  Ältere Einträge laden ↓
                </button>
             </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-slate-900/50 text-orange-400 border border-white/10">
          {toast}
        </div>
      )}

      <JournalModal
        selectedEntry={selectedEntry}
        setSelectedEntry={setSelectedEntry}
        habits={habits}
        formatRelativeDate={formatRelativeDate}
        colorActivities={colorActivities}
      />

      {journalModalOpen && (
        <HabitJournalModal
          open={journalModalOpen}
          onClose={() => {
            setJournalModalOpen(false);
            setSelectedHabitForJournal(null);
          }}
          habit={selectedHabitForJournal}
          date={date}
          journalText={journalText}
          setJournalText={setJournalText}
          isJournalSaving={isJournalSaving}
          onSaveJournal={onSaveJournal}
        />
      )}

      {showSettings && (
        <JournalSettings
          settings={journalSettings}
          onChange={handleSettingChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
