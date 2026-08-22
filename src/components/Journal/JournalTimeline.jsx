// JournalTimeline.jsx — DER gemeinsame Journal-Kern (SSOT).
//
// Konsolidiert die früheren Parallel-Linien views/Journal/index.jsx
// (fitness embedded) und JournalVosView.jsx (journal standalone + fuel).
// Wird in drei Kontexten gebündelt:
//   fitness-dev  — Verzeichnis-Symlink src/views/Journal → hier re-exportiert
//   fuel-dev     — @journal/views/JournalVosView.jsx (Wrapper um diesen Kern)
//   journal-dev  — Standalone-Tab (routes.js → JournalVosView)
//
// Deshalb: Namespace-Import von @db + Feature-Detection (nicht jeder
// Kontext exportiert Nutrition/Meals/Settings), relative Imports statt
// kontextabhängiger Aliases, Theming über CSS-Tokens mit Fallbacks.

import { useState, useEffect, useMemo } from "react";
import * as db from "@journal-db";
import { Book, PenLine } from "lucide-react";
import { localToday, formatRelativeDate, sessionInfo, getDailyPrompt, getCalendarMeta } from "./journalUtils";
import { mediaAvailable, uploadJournalMedia, attachToEntry, removeAttachment } from "./journalMedia";
import JournalSettings from "./JournalSettings";
import JournalHeader from "./JournalHeader";
import JournalCalendar from "./JournalCalendar";
import JournalForm from "./JournalForm";
import JournalEntry from "./JournalEntry";
import JournalModal from "./JournalModal";
import CrossoverButtons from "../../import-crossover/CrossoverButtons";

// Timeline-Cache pro User: zeigt beim (Neu-)Laden sofort den letzten bekannten
// Stand an, während Firestore im Hintergrund neu lädt (optimistic paint).
const TIMELINE_CACHE_PREFIX = "journal:timeline:";
const INITIAL_DAY_WINDOW = 10;
const LOAD_MORE_STEP = 10;
function readTimelineCache(uid) {
  try {
    const raw = localStorage.getItem(TIMELINE_CACHE_PREFIX + uid);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function writeTimelineCache(uid, timeline) {
  try { localStorage.setItem(TIMELINE_CACHE_PREFIX + uid, JSON.stringify(timeline)); } catch {}
}
function mergeTimelineGroups(primary = [], secondary = []) {
  const grouped = new Map();
  [...secondary, ...primary].forEach((group) => {
    if (!group?.date) return;
    const previous = grouped.get(group.date);
    grouped.set(group.date, {
      ...previous,
      ...group,
      entries: (group.entries || []).filter((entry) => entry.type !== "supplement"),
      supplements: group.supplements || previous?.supplements || [],
    });
  });
  return [...grouped.values()].sort((a, b) => b.date.localeCompare(a.date));
}
// Via @habits-Alias, NICHT relativ über den views/Habits-Symlink: dessen
// Ziel ist ein absoluter /home/alpha-Pfad und im CI-Runner tot.
import { ICON_COMPONENTS_MAP } from "@habits/views/Habits/utils";
import HabitJournalModal from "@habits/views/Habits/HabitJournalModal";

const CROSSOVER_URLS = {
  fitness: "https://fitness-aos.web.app",
  fuel: "https://fuel-vos.web.app",
  relax: "https://vitalos.web.app",
};

// Theme-Kontrakt: Im fitness-Kontext liefern dessen Themes die --*-Tokens,
// standalone/fuel greifen die ruhigen DayOne-artigen Fallbacks.
const TOKENS = {
  "--j-bg": "var(--bg, #0b1018)",
  "--j-bg2": "var(--bg2, #131b29)",
  "--j-card": "var(--card, #111827)",
  "--j-line": "var(--line, rgba(148,163,184,0.14))",
  "--j-ink": "var(--ink, #e7edf6)",
  "--j-dim": "var(--dim, #8b98ab)",
  "--j-accent": "var(--accent, #4a9eff)",
};

export default function JournalTimeline({ onOpenSession, onNavigateShell, user: userProp, showCrossover = false, date: controlledDate = null, onDateChange = null }) {
  // Host-Apps (vitalos JournalApp/RelaxApp, fuel) übergeben kein user-Prop —
  // dann selbst auf Auth subscriben, sonst bleibt die Timeline hinter dem
  // user?.uid-Guard dauerhaft leer. Prop gewinnt, Fallback nur ohne Prop.
  const [authUser, setAuthUser] = useState(null);
  useEffect(() => db.watchAuth?.(u => setAuthUser(u)), []);
  const user = userProp ?? authUser;
  // Quellen, deren Laden fehlschlug (Auth abgelaufen, Rules, offline) —
  // sichtbar machen statt still leere Abschnitte zu rendern.
  const [loadWarnings, setLoadWarnings] = useState([]);

  const [date, setDateState] = useState(controlledDate || localToday());
  const [text, setText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [habits, setHabits] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [dayWindow, setDayWindow] = useState(INITIAL_DAY_WINDOW);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  // Medien (Fotos) nur mit Firebase-Auth-User — fitness/journal haben auch
  // einen local-Modus ohne Auth, dort bleibt die Medien-UI versteckt.
  const [mediaEnabled, setMediaEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    mediaAvailable()
      .then(ok => { if (!cancelled) setMediaEnabled(ok); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.uid]);

  useEffect(() => {
    if (controlledDate && controlledDate !== date) setDateState(controlledDate);
  }, [controlledDate, date]);

  function setDate(nextDate) {
    setDateState(nextDate);
    onDateChange?.(nextDate);
  }

  function navigateCrossover(target, subTab = null) {
    if (onNavigateShell) {
      onNavigateShell(target, target === "fitness" ? null : subTab);
      return;
    }
    if (target === "fitness" && onOpenSession) {
      onOpenSession(date);
      return;
    }
    const url = CROSSOVER_URLS[target];
    if (url && typeof window !== "undefined") window.location.href = url;
  }
  const [journalSettings, setJournalSettings] = useState(() => ({
    colorActivities: localStorage.getItem('journal_colorActivities') === 'true',
    telegramEnabled: false,
    telegramChatId: '',
  }));
  const colorActivities = journalSettings.colorActivities;

  useEffect(() => {
    db.getSettings?.().then(s => {
      if (s) {
        setJournalSettings(prev => ({
          ...prev,
          colorActivities: s.journal_colorActivities ?? prev.colorActivities,
          telegramEnabled: s.telegramEnabled ?? false,
          telegramChatId: s.telegramChatId ?? '',
        }));
      }
    }).catch(() => {});
  }, [user?.uid]);

  function handleSettingChange(key, value) {
    setJournalSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'colorActivities') localStorage.setItem('journal_colorActivities', value);
    db.saveSettings?.({ [key === 'colorActivities' ? 'journal_colorActivities' : key]: value })?.catch?.(() => {});
  }

  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [selectedHabitForJournal, setSelectedHabitForJournal] = useState(null);
  const [journalText, setJournalText] = useState("");
  const [isJournalSaving, setIsJournalSaving] = useState(false);

  const outstandingMemoirs = useMemo(() => {
    if (!date || habits.length === 0) return [];

    const doneHabits = habits.filter(h =>
      h.records?.some(r => r.date === date && r.completion === 'DONE')
    );

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
    const j = await db.getHabitJournal?.(habit.uuid, date);
    setJournalText(j?.text || "");
    setJournalModalOpen(true);
  };

  async function onSaveJournal(textOverride = null) {
    const textToSave = textOverride !== null ? textOverride : journalText;
    if (!selectedHabitForJournal || !date) return;
    setIsJournalSaving(true);
    try {
      await db.saveHabitJournal?.(selectedHabitForJournal.uuid, date, textToSave);
      setDayWindow(p => p + 1);
    } finally {
      setIsJournalSaving(false);
    }
  }

  useEffect(() => {
    async function load() {
      // Guard: nur laden wenn User authentifiziert ist (sonst Firestore-Error)
      if (!user?.uid) return;

      // Cold-Start: letzten bekannten Stand sofort zeigen, während Firestore lädt.
      if (timeline.length === 0) {
        const cached = readTimelineCache(user.uid);
        if (cached?.length) setTimeline(cached);
      }

      // Feature-Detection: nicht jeder @db-Kontext hat alle Quellen
      // (fitness local: keine Nutrition/Meals; package-Barrel: Stubs).
      // Fehlende Funktion = kein Feature (ok); Rejection = Warnung anzeigen.
      const failed = [];
      const grab = (label, promise) =>
        Promise.resolve(promise ?? []).catch(err => {
          console.error(`[JournalTimeline] ${label} laden fehlgeschlagen:`, err);
          failed.push(label);
          return [];
        });
      const [regularHistory, habitHistory, sessions, mealLogs, allHabits, nutritionJournalHistory, supplementLogs, relaxSessions] = await Promise.all([
        grab("Journal", db.getJournalHistory(dayWindow)),
        grab("Habit-Journale", db.getAllHabitJournalsHistory?.(dayWindow)),
        grab("Workouts", db.getSessionHistory?.(dayWindow)),
        grab("Fuel-Meals", db.getMealsHistory?.(dayWindow)),
        grab("Habits", db.getHabits?.()),
        grab("Ernährungs-Notizen", db.getNutritionNotesHistory?.(dayWindow)),
        grab("Supplements", db.getSupplementsHistory?.(dayWindow)),
        grab("Relax", db.getRelaxSessionHistory?.(dayWindow)),
      ]);
      setLoadWarnings([...new Set(failed)]);

      setHabits(allHabits);

      const combined = [
        ...regularHistory.map(e => ({ ...e, type: 'regular' })),
        ...habitHistory,
        ...nutritionJournalHistory.map(e => ({ ...e, type: 'nutrition-notes' })),
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
          time: savedAt,
        });
      });

      mealLogs.forEach(log => {
        const totalKcal = (log.meals || []).reduce((sum, m) => sum + (Number(m.kcal) || 0), 0);
        combined.push({
          id: 'meals-' + log.date,
          date: log.date,
          type: 'meal',
          text: '',
          meals: log.meals || [],
          totalKcal,
          time: `${log.date}T12:30:00`,
        });
      });

      relaxSessions.forEach(session => {
        const items = session.items || [];
        if (!items.length) return;
        const savedAt = session.saved_at?.seconds
          ? new Date(session.saved_at.seconds * 1000).toISOString()
          : (typeof session.saved_at === 'string' ? session.saved_at : `${session.date}T20:00:00`);
        const totalMinutes = items.reduce((sum, it) => sum + (Number(it.minutes) || 0), 0);
        combined.push({
          id: 'relax-' + session.date,
          date: session.date,
          type: 'relax',
          text: '',
          techniques: items,
          totalMinutes,
          time: savedAt,
        });
      });

      const supplementsByDate = {};
      supplementLogs.forEach(log => {
        const intakes = log.intakes || [];
        if (!intakes.length) return;
        supplementsByDate[log.date] = intakes;
      });

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - dayWindow);
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
              time: `${record.date}T12:00:00`,
            });
          }
        });
      });

      const grouped = {};
      combined.forEach(entry => {
        const d = entry.date || localToday();
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(entry);
      });

      const sortedDates = [...new Set([
        ...Object.keys(grouped),
        ...Object.keys(supplementsByDate),
      ])].sort((a, b) => b.localeCompare(a));

      const freshTimeline = sortedDates.map(d => ({
        date: d,
        entries: (grouped[d] || []).sort((a, b) => {
          const timeA = a.time || "";
          const timeB = b.time || "";
          return timeB.localeCompare(timeA);
        }),
        supplements: supplementsByDate[d] || [],
      }));

      const cached = readTimelineCache(user.uid) || [];
      const finalTimeline = mergeTimelineGroups(freshTimeline, cached);
      setTimeline(finalTimeline);

      if (date === localToday() && grouped[date]?.filter(e => e.type === 'regular').length === 1 && !text) {
        const todayRegular = grouped[date].find(e => e.type === 'regular');
        setEditingEntry(todayRegular);
        setText(todayRegular.text);
      } else if (!editingEntry) {
        setText("");
      }
    }
    load().catch(() => setTimeline([]));
  }, [dayWindow, date, user?.uid]);

  useEffect(() => {
    if (user?.uid && timeline.length > 0) writeTimelineCache(user.uid, timeline);
  }, [timeline, user?.uid]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2000); }

  // files: File[] aus JournalForm (Bild-Anhänge). Upload passiert NACH dem
  // Speichern des Eintrags — schlägt er fehl, bleibt der Eintrag bestehen.
  async function submit(files = []) {
    if (!text.trim()) return;
    setSaving(true);
    try {
      let uploadFailed = false;

      async function uploadAndAttach(entryId, entryDate) {
        if (!mediaEnabled || !entryId || !files.length) return [];
        try {
          const uploaded = [];
          for (const file of files) {
            uploaded.push(await uploadJournalMedia(file, entryDate));
          }
          await attachToEntry(entryId, uploaded);
          return uploaded;
        } catch {
          uploadFailed = true;
          return [];
        }
      }

      if (editingEntry) {
        const { id: entryId, date: entryDate } = editingEntry;
        const trimmed = text.trim();
        // Optimistic: Text sofort in der Timeline zeigen, statt auf Firestore zu warten.
        setTimeline(prev => prev.map(group => group.date === entryDate
          ? { ...group, entries: group.entries.map(e => e.id === entryId ? { ...e, text: trimmed } : e) }
          : group));
        setEditingEntry(null);
        setText("");
        setStartDate("");
        setEndDate("");

        await db.updateJournal(entryId, trimmed, { startDate, endDate });
        const uploaded = await uploadAndAttach(entryId, entryDate);
        if (uploaded.length) {
          setTimeline(prev => prev.map(group => group.date === entryDate
            ? { ...group, entries: group.entries.map(e => e.id === entryId
                ? { ...e, attachments: [...(e.attachments || []), ...uploaded] }
                : e) }
            : group));
        }
        showToast(uploadFailed ? "Upload fehlgeschlagen" : "Aktualisiert ✓");
      } else {
        const trimmed = text.trim();
        const tempId = `temp-${Date.now()}`;
        const optimisticEntry = { id: tempId, date, text: trimmed, type: "regular", time: new Date().toISOString() };

        // Optimistic: Eintrag sofort einfügen, statt auf Firestore zu warten.
        setTimeline(prev => {
          const idx = prev.findIndex(g => g.date === date);
          if (idx === -1) {
            return [{ date, entries: [optimisticEntry] }, ...prev].sort((a, b) => b.date.localeCompare(a.date));
          }
          const copy = [...prev];
          copy[idx] = { ...copy[idx], entries: [optimisticEntry, ...copy[idx].entries] };
          return copy;
        });
        setText("");

        try {
          const saved = await db.saveJournal(date, trimmed, { startDate, endDate });
          const realId = saved?.id || tempId;
          setTimeline(prev => prev.map(group => group.date === date
            ? { ...group, entries: group.entries.map(e => e.id === tempId ? { ...e, id: realId } : e) }
            : group));
          const uploaded = await uploadAndAttach(realId, date);
          if (uploaded.length) {
            setTimeline(prev => prev.map(group => group.date === date
              ? { ...group, entries: group.entries.map(e => e.id === realId ? { ...e, attachments: uploaded } : e) }
              : group));
          }
          setDayWindow(p => p + 1);
          setStartDate("");
          setEndDate("");
          showToast(uploadFailed ? "Upload fehlgeschlagen" : "Gespeichert ✓");
        } catch (err) {
          // Rollback: optimistischen Eintrag wieder entfernen, Text zurückgeben.
          setTimeline(prev => prev
            .map(group => group.date === date
              ? { ...group, entries: group.entries.filter(e => e.id !== tempId) }
              : group)
            .filter(group => group.entries.length > 0));
          setText(trimmed);
          throw err;
        }
      }
    } catch { showToast("Fehler beim Speichern"); }
    finally { setSaving(false); }
  }

  // Bestehendes Attachment im Bearbeitungs-Modus entfernen: Storage +
  // Firestore via journalMedia, dann Timeline- und Editing-State nachziehen.
  async function handleRemoveAttachment(attachment) {
    if (!editingEntry) return;
    try {
      await removeAttachment(editingEntry.id, attachment);
      const strip = (e) => ({
        ...e,
        attachments: (e.attachments || []).filter(a => a.path !== attachment.path),
      });
      setEditingEntry(prev => (prev ? strip(prev) : prev));
      setTimeline(prev => prev.map(group => group.date === editingEntry.date
        ? { ...group, entries: group.entries.map(e => e.id === editingEntry.id ? strip(e) : e) }
        : group));
      showToast("Anhang entfernt");
    } catch {
      showToast("Entfernen fehlgeschlagen");
    }
  }

  const handleEdit = (entry) => {
    setSelectedEntry(null);
    setDate(entry.date);
    setEditingEntry(entry);
    setText(entry.text);
    setStartDate(entry.startDate || "");
    setEndDate(entry.endDate || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function handleDeleteEntry(entry) {
    if (!entry?.id || entry.type !== "regular") return;
    if (typeof window !== "undefined" && !window.confirm("Diesen Journal-Eintrag wirklich löschen?")) return;
    try {
      await db.deleteJournal?.(entry.id);
      setSelectedEntry(null);
      setEditingEntry(prev => (prev?.id === entry.id ? null : prev));
      setTimeline(prev => prev
        .map(group => group.date === entry.date
          ? { ...group, entries: group.entries.filter(e => e.id !== entry.id) }
          : group)
        .filter(group => group.entries.length > 0 || (group.supplements || []).length > 0));
      setText(prev => (editingEntry?.id === entry.id ? "" : prev));
      setStartDate(prev => (editingEntry?.id === entry.id ? "" : prev));
      setEndDate(prev => (editingEntry?.id === entry.id ? "" : prev));
      showToast("Gelöscht ✓");
    } catch {
      showToast("Löschen fehlgeschlagen");
    }
  }

  return (
    <div className="pb-32 max-w-3xl mx-auto px-2" style={TOKENS}>
      <JournalHeader
        date={date}
        setDate={setDate}
        localToday={localToday()}
        formatRelativeDate={formatRelativeDate}
        onOpenSettings={() => setShowSettings(true)}
        onToggleCalendar={() => setShowCalendar(v => !v)}
        calendarOpen={showCalendar}
      />

      <div className="mb-6">
        {!user && (
          <div className="rounded-2xl border border-[var(--j-line)] bg-[var(--j-card)] p-4 flex items-center justify-between gap-3">
            <span className="text-sm text-[var(--j-dim)]">Nicht angemeldet — Journal-Daten sind erst nach Login sichtbar.</span>
            {db.signIn && (
              <button
                onClick={() => db.signIn().catch(() => {})}
                className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: 'var(--j-accent)', color: 'var(--j-bg)' }}
              >
                Anmelden
              </button>
            )}
          </div>
        )}
        {loadWarnings.length > 0 && (
          <div className="mt-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-[12px] text-amber-400">
            Konnte nicht geladen werden: {loadWarnings.join(", ")} — Sitzung prüfen / neu anmelden.
          </div>
        )}
      </div>

      <div className="space-y-10">
        {showCalendar && (
          <JournalCalendar
            date={date}
            timeline={timeline}
            onSelectDate={(d) => {
              setDate(d);
              requestAnimationFrame(() => {
                document.getElementById(`journal-day-${d}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              });
            }}
          />
        )}

        <JournalForm
          text={text}
          setText={setText}
          onSubmit={submit}
          saving={saving}
          editingEntry={editingEntry}
          onCancelEdit={() => { setEditingEntry(null); setText(""); setDate(localToday()); setStartDate(""); setEndDate(""); }}
          prompt={getDailyPrompt(date)}
          mediaEnabled={mediaEnabled}
          onRemoveAttachment={handleRemoveAttachment}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        {showCrossover && (
          <CrossoverButtons
            onLogFitness={() => navigateCrossover('fitness', 'session')}
            onLogFuel={() => navigateCrossover('fuel', 'log')}
            onLogRelax={() => navigateCrossover('relax', 'session')}
          />
        )}

        {outstandingMemoirs.length > 0 && (
          <div className="p-6 rounded-2xl border border-[var(--j-accent)]/25 bg-[var(--j-accent)]/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--j-accent)] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--j-accent)]">
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
                    className="flex items-center justify-between p-4 rounded-2xl bg-[var(--j-card)] border border-[var(--j-line)] hover:border-[var(--j-accent)] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[var(--j-accent)]/10 flex items-center justify-center text-[var(--j-accent)] group-hover:scale-105 transition-transform">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--j-ink)]">{h.name}</div>
                        <div className="text-[8px] font-bold text-[var(--j-dim)] uppercase tracking-widest mt-0.5">Eintrag fehlt</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--j-accent)] bg-[var(--j-accent)]/10 px-2.5 py-1.5 rounded-xl border border-[var(--j-accent)]/15 transition-all">
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
            timeline.map((group, index) => {
              const habitJournalIds = new Set(group.entries.filter(e => e.type === 'habit').map(e => e.habitId));
              const standaloneCompletions = group.entries.filter(e => e.type === 'habit-completion' && !habitJournalIds.has(e.habitId));
              const mainEntries = group.entries.filter(e => e.type !== 'habit-completion');
              const supplements = group.supplements || [];
              const meta = getCalendarMeta(group.date);
              const prevMeta = index > 0 ? getCalendarMeta(timeline[index - 1].date) : null;
              const showMonthBreak = !prevMeta || prevMeta.monthKey !== meta.monthKey;
              return (
                <div key={group.date} id={`journal-day-${group.date}`} className="relative scroll-mt-4">
                  {showMonthBreak && (
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-[var(--j-line)]" />
                      <div className="px-3 py-1 rounded-full border border-[var(--j-line)] bg-[var(--j-bg2)] text-[10px] font-black uppercase tracking-[0.22em] text-[var(--j-dim)]">
                        {meta.monthLabel}
                      </div>
                      <div className="h-px flex-1 bg-[var(--j-line)]" />
                    </div>
                  )}
                  <div className="sticky top-0 z-10 py-2 bg-[var(--j-bg)]/90 backdrop-blur-md -mx-2 px-2 border-b border-[var(--j-line)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-baseline gap-3 min-w-0">
                        <div className="text-2xl font-black tabular-nums text-[var(--j-ink)] leading-none">
                          {meta.dayNumber}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--j-accent)]">
                            {formatRelativeDate(group.date)}
                          </h3>
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--j-dim)]">
                            {meta.weekdayShort} · {group.date} · KW {meta.isoWeek}
                          </div>
                        </div>
                      </div>
                    </div>
                    {supplements.length > 0 && (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[9px] text-[var(--j-dim)]">
                        <span className="uppercase tracking-[0.18em] opacity-70">Supplements</span>
                        {supplements.slice(0, 3).map((intake, idx) => (
                          <span
                            key={`${group.date}-supplement-${idx}`}
                            className="px-2 py-0.5 rounded-md border border-[var(--j-line)] bg-[var(--j-bg2)]"
                          >
                            {intake.supplement_id}
                          </span>
                        ))}
                        {supplements.length > 3 && (
                          <span className="opacity-70">+{supplements.length - 3}</span>
                        )}
                      </div>
                    )}
                    {standaloneCompletions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {standaloneCompletions.map(e => {
                          const Icon = ICON_COMPONENTS_MAP[e.habitIcon] || ICON_COMPONENTS_MAP['Activity'];
                          return (
                            <span
                              key={e.id}
                              title={e.habitName}
                              className="w-6 h-6 rounded-full bg-[var(--j-accent)]/10 border border-[var(--j-accent)]/20 flex items-center justify-center text-[var(--j-accent)] cursor-default"
                            >
                              <Icon size={12} />
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="relative pl-6 sm:pl-8 border-l border-[var(--j-line)] space-y-6 mt-4">
                    {mainEntries.map((e, i) => (
                      <JournalEntry
                        key={e.id || i}
                        e={e}
                        habits={habits}
                        setSelectedEntry={setSelectedEntry}
                        onEdit={handleEdit}
                        onOpenSession={onOpenSession}
                        colorActivities={colorActivities}
                        mediaEnabled={mediaEnabled}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-20 text-center rounded-3xl border border-dashed border-[var(--j-line)] text-[var(--j-dim)]">
              <Book size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-sm font-bold uppercase tracking-widest opacity-60">Keine Einträge gefunden</p>
            </div>
          )}

          {timeline.length > 0 && (
            <div className="pt-8 flex justify-center">
              <button
                onClick={() => setDayWindow(p => p + LOAD_MORE_STEP)}
                className="px-8 py-3 rounded-2xl bg-[var(--j-bg2)] border border-[var(--j-line)] text-[10px] font-black uppercase tracking-widest text-[var(--j-dim)] hover:text-[var(--j-ink)] hover:border-[var(--j-accent)]/30 transition-all"
              >
                Ältere laden ↓
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-[var(--j-card)] text-[var(--j-accent)] border border-[var(--j-line)]">
          {toast}
        </div>
      )}

      <JournalModal
        selectedEntry={selectedEntry}
        setSelectedEntry={setSelectedEntry}
        habits={habits}
        formatRelativeDate={formatRelativeDate}
        colorActivities={colorActivities}
        mediaEnabled={mediaEnabled}
        onEditEntry={handleEdit}
        onDeleteEntry={handleDeleteEntry}
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
          showIntegrations={typeof db.getSettings === "function"}
        />
      )}
    </div>
  );
}
