import { useState, useEffect, useMemo, useRef } from "react";
import { Star, CalendarDays, Activity, PenLine, LayoutGrid, Smartphone, Bell, Grid2X2 } from "lucide-react";
import {
  getHabits, setHabitCompletionFromHabits, addHabit, deleteHabit,
  updateHabit, getHabitRecordsForDate, getHabitJournal, saveHabitJournal, getHabitJournalHistory,
  saveHabitOrder, getDailyExecution, getDailyExecutionConfig, saveDailyExecutionAssignments,
  getDailyFitnessSessionOptions, linkDailyFitnessSession, getDailyNutritionLogOptions,
  getDailyRelaxSessionOptions, linkDailySkillRecord, setDailyExecutionCompleted,
} from "@habits-db";
import { localToday } from "@utils";
import { ICON_COMPONENTS_MAP, DEFAULT_FREQUENCY } from "./utils";

import HabitForm from "./HabitForm";
import HabitItem from "./HabitItem";
import HabitSidebar from "./HabitSidebar";
import HabitJournalModal from "./HabitJournalModal";
import HabitStats from "./HabitStats";
import { getRollingDays } from "./utils";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Core4Layout from "./Core4Layout";
import DailyFourLayout from "./DailyFourLayout.jsx";
import PushSettingsModal from "./PushSettingsModal";
import { usePushNotifications } from "./usePushNotifications";

export default function Habits({ user = null, selectedDate: controlledDate = null, onSelectedDateChange = null, onOpenSkill = null }) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState("");
  const [selectedIcon, setSelectedIcon] = useState('Activity');
  const [selectedCategory, setSelectedCategory] = useState('body');
  const [selectedFrequency, setSelectedFrequency] = useState(DEFAULT_FREQUENCY);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDateState] = useState(controlledDate || localToday());
  const selectedDateRef = useRef(selectedDate);
  selectedDateRef.current = selectedDate;
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editingIcon, setEditingIcon] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingFrequency, setEditingFrequency] = useState(DEFAULT_FREQUENCY);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [selectedSidebarDate, setSelectedSidebarDate] = useState(controlledDate || localToday());
  const [journalText, setJournalText] = useState("");
  const [journalHistory, setJournalHistory] = useState([]);
  const [isJournalSaving, setIsJournalSaving] = useState(false);
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [memoirWrittenIds, setMemoirWrittenIds] = useState(new Set());
  const [layoutMode, setLayoutMode] = useState(() => localStorage.getItem("habits-layout-mode") || "daily-four");
  const [dailyExecution, setDailyExecution] = useState(null);
  const [dailyConfig, setDailyConfig] = useState(null);
  const [dailyRetry, setDailyRetry] = useState(0);
  const [dailyError, setDailyError] = useState("");
  const [habitSaveError, setHabitSaveError] = useState("");
  const [dailySaving, setDailySaving] = useState(false);
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const push = usePushNotifications(user);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setHabits((prev) => {
      const oldIndex = prev.findIndex((h) => h.uuid === active.id);
      const newIndex = prev.findIndex((h) => h.uuid === over.id);
      const nextHabits = arrayMove(prev, oldIndex, newIndex);

      const orderedUuids = nextHabits.map(h => h.uuid);
      saveHabitOrder(orderedUuids).catch(err => {
        console.error("Failed to save habit order:", err);
      });

      return nextHabits;
    });
  }

  const rollingDates = useMemo(() => getRollingDays(28), []);
  const recentDates = useMemo(() => getRollingDays(10), []);

  useEffect(() => {
    if (controlledDate && controlledDate !== selectedDate) setSelectedDateState(controlledDate);
  }, [controlledDate, selectedDate]);

  function setSelectedDate(nextDate) {
    setSelectedDateState(nextDate);
    onSelectedDateChange?.(nextDate);
  }

  const outstandingMemoirs = useMemo(
    () => habits.filter(h => h.isDoneForSelectedDate && !memoirWrittenIds.has(h.uuid)),
    [habits, memoirWrittenIds]
  );

  function handleOpenMemoir(habit) {
    setSelectedHabitId(habit.uuid);
    setSelectedSidebarDate(selectedDate);
    setJournalModalOpen(true);
  }

  async function load() {
    setLoading(true);
    try {
      const allHabits = await getHabits();
      const completedHabitIdsForSelectedDate = await getHabitRecordsForDate(selectedDate);
      if (selectedDateRef.current !== selectedDate) return;

      const habitsWithStatus = allHabits
        .filter(h => !h.deleted)
        .map(h => ({
          ...h,
          isDoneForSelectedDate: completedHabitIdsForSelectedDate.includes(h.uuid)
        }));
      setHabits(habitsWithStatus);

      const doneHabits = habitsWithStatus.filter(h => h.isDoneForSelectedDate);
      const journalChecks = await Promise.all(
        doneHabits.map(h => getHabitJournal(h.uuid, selectedDate).then(j => ({ uuid: h.uuid, has: !!(j?.text?.trim()) })))
      );
      if (selectedDateRef.current === selectedDate) setMemoirWrittenIds(new Set(journalChecks.filter(x => x.has).map(x => x.uuid)));
    } finally {
      if (selectedDateRef.current === selectedDate) setLoading(false);
    }
  }

  useEffect(() => { load(); }, [selectedDate]);

  useEffect(() => {
    if (layoutMode !== "daily-four") return undefined;
    let live = true;
    setDailyError("");
    setDailyConfig(null);
    // A missing/slow settings read must not hide an already cached day.
    getDailyExecution(selectedDate)
      .then((execution) => { if (live) setDailyExecution(execution); })
      .catch(() => { if (live) setDailyError("Tagesübersicht konnte nicht geladen werden. Bitte prüfe deine Verbindung."); });
    getDailyExecutionConfig()
      .then((config) => { if (live) setDailyConfig(config); })
      .catch(() => { if (live) setDailyError("Zuordnungen sind gerade nicht verfügbar. Ein gespeicherter Tagesstand bleibt sichtbar."); });
    return () => { live = false; };
  }, [layoutMode, selectedDate, dailyRetry]);

  useEffect(() => {
    if (dailyConfig || layoutMode !== "daily-four") return undefined;
    const retry = () => setDailyRetry((value) => value + 1);
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, [dailyConfig, layoutMode]);

  useEffect(() => {
    setSelectedSidebarDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (selectedHabitId && selectedSidebarDate) {
      setJournalText("");
      getHabitJournal(selectedHabitId, selectedSidebarDate).then(j => {
        setJournalText(j?.text || "");
      });
    }
    if (selectedHabitId) {
      getHabitJournalHistory(selectedHabitId).then(setJournalHistory);
    }
  }, [selectedHabitId, selectedSidebarDate]);

  useEffect(() => {
    if (editingHabitId) {
      const habitToEdit = habits.find(h => h.uuid === editingHabitId);
      setEditingIcon(habitToEdit?.icon || 'Activity');
      setEditingCategory(habitToEdit?.category || null);
      setEditingFrequency(habitToEdit?.frequency || DEFAULT_FREQUENCY);
    } else {
      setEditingIcon(null);
      setEditingCategory(null);
      setEditingFrequency(DEFAULT_FREQUENCY);
    }
  }, [editingHabitId, habits]);

  async function toggleCheck(h) {
    await updateManualHabit(h.uuid, selectedDate, !h.isDoneForSelectedDate);
  }

  async function updateManualHabit(habitId, date, completed) {
    setHabitSaveError("");
    try {
      const execution = await setHabitCompletionFromHabits(habitId, date, completed);
      if (execution && date === selectedDateRef.current) setDailyExecution(execution);
      await load();
    } catch (error) {
      setHabitSaveError("Die Änderung konnte nicht gespeichert werden. Bitte prüfe deine Verbindung und versuche es erneut.");
      console.error("Habit-Änderung fehlgeschlagen:", error);
    }
  }

  async function saveDailyAssignments(assignments) {
    if (selectedDate !== localToday()) throw new Error("daily_assignments_change_today_only");
    setDailySaving(true);
    try {
      const result = await saveDailyExecutionAssignments(assignments, habits, selectedDate);
      const [execution, config] = await Promise.all([getDailyExecution(selectedDate), getDailyExecutionConfig()]);
      if (execution.date === selectedDateRef.current) setDailyExecution(execution);
      setDailyConfig(config);
      return result;
    } finally {
      setDailySaving(false);
    }
  }

  async function toggleDailyCompletion(dimension, completed) {
    setDailySaving(true);
    setDailyError("");
    try {
      const next = await setDailyExecutionCompleted(selectedDate, dimension, completed);
      if (next.date === selectedDateRef.current) setDailyExecution(next);
      await load();
    } catch (error) {
      setDailyError(error?.message || "Tagesstatus konnte nicht gespeichert werden.");
    } finally {
      setDailySaving(false);
    }
  }

  async function loadDailyFitnessSessions(date) {
    return getDailyFitnessSessionOptions(date);
  }

  async function linkFitnessSession(dimension, session) {
    setDailySaving(true);
    setDailyError("");
    try {
      const next = await linkDailyFitnessSession(selectedDate, dimension, session.recordId);
      if (next.date === selectedDateRef.current) setDailyExecution(next);
      await load();
      return next;
    } catch (error) {
      setDailyError(error?.message || "Trainingseinheit konnte nicht verknüpft werden.");
      throw error;
    } finally {
      setDailySaving(false);
    }
  }

  async function loadDailySkillRecords(date, skill) {
    if (skill === "fuel") return getDailyNutritionLogOptions(date);
    if (skill === "relax") return getDailyRelaxSessionOptions(date);
    return [];
  }

  async function linkSkillRecord(dimension, skill, record) {
    setDailySaving(true);
    setDailyError("");
    try {
      const canonicalSkill = skill === "fuel" ? "nutrition" : skill;
      const next = await linkDailySkillRecord(selectedDate, dimension, canonicalSkill, record.recordId);
      if (next.date === selectedDateRef.current) setDailyExecution(next);
      await load();
      return next;
    } catch (error) {
      setDailyError(error?.message || "Der Eintrag konnte nicht verknüpft werden.");
      throw error;
    } finally {
      setDailySaving(false);
    }
  }

  async function toggleSidebarDone(habitId, date) {
    const h = habits.find(x => x.uuid === habitId);
    const isDone = h?.records?.some(r => r.date === date && r.completion === 'DONE');
    await updateManualHabit(habitId, date, !isDone);
  }

  async function onSaveJournal(textOverride = null) {
    const textToSave = textOverride !== null ? textOverride : journalText;
    if (!selectedHabitId || !selectedSidebarDate) return;
    setIsJournalSaving(true);
    try {
      await saveHabitJournal(selectedHabitId, selectedSidebarDate, textToSave);
      getHabitJournalHistory(selectedHabitId).then(setJournalHistory);
      if (textToSave.trim()) {
        setMemoirWrittenIds(prev => new Set([...prev, selectedHabitId]));
      }
    } finally {
      setIsJournalSaving(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setSaving(true);
    try {
      await addHabit(newHabit.trim(), selectedIcon, selectedCategory, selectedFrequency);
      setNewHabit("");
      setSelectedIcon('Activity');
      setSelectedFrequency(DEFAULT_FREQUENCY);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(uuid) {
    if (!confirm("Habit wirklich löschen?")) return;
    await deleteHabit(uuid);
    load();
  }

  const overallConsistency = habits.length === 0 ? 0 : habits.reduce((totalConsistency, h) => {
    const habitDoneCount = (h.records || []).filter(r => rollingDates.includes(r.date) && r.completion === 'DONE').length;
    return totalConsistency + (habitDoneCount / rollingDates.length);
  }, 0) / habits.length;

  const todayCompletionPercentage = habits.length === 0 ? 0 :
    (habits.filter(h => h.isDoneForSelectedDate).length / habits.length) * 100;

  function getMotivationalMessage(percentage) {
    if (percentage === 100) return "Hervorragend! Alle Habits erledigt! Weiter so!";
    if (percentage >= 50) return `Du hast ${Math.round(percentage)}% deiner Habits erledigt. Fast geschafft! Bleib dran!`;
    if (percentage > 0) return `Du hast ${Math.round(percentage)}% deiner Habits erledigt. Guter Start! Aber da geht noch mehr!`;
    return "Der Tag hat gerade erst begonnen! Fang jetzt an und hol dir die ersten Checks!";
  }

  const updateHabitName = (uuid, name) => {
    setHabits(prev => prev.map(h => h.uuid === uuid ? { ...h, name } : h));
  };

  const finishEditing = async () => {
    const h = habits.find(x => x.uuid === editingHabitId);
    if (h) {
      await updateHabit(h.uuid, h.name.trim(), editingIcon, editingCategory, editingFrequency);
    }
    setEditingHabitId(null);
    setEditingIcon(null);
    setEditingCategory(null);
    setEditingFrequency(DEFAULT_FREQUENCY);
    load();
  };

  if (layoutMode === "daily-four") {
    return (
      <div className="pb-32 px-2 sm:px-4 lg:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black text-slate-100 sm:text-3xl">VitalOS · Dein Tag</h1>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 shadow-xl">
            <button type="button" onClick={() => { setLayoutMode("v1"); localStorage.setItem("habits-layout-mode", "v1"); }} className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white" title="Alle Habits"><LayoutGrid size={16} /></button>
            <button type="button" onClick={() => { setLayoutMode("core4"); localStorage.setItem("habits-layout-mode", "core4"); }} className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white" title="Bisherige Core4-Ansicht"><Smartphone size={16} /></button>
            <button type="button" onClick={() => setPushModalOpen(true)} className={`rounded-xl border border-white/10 p-2 ${push.settings?.enabled ? "text-orange-300" : "text-slate-400"}`} title="Erinnerungen"><Bell size={16} /></button>
          </div>
        </div>
        <DailyFourLayout
          date={selectedDate}
          habits={habits}
          config={dailyConfig}
          execution={dailyExecution?.date === selectedDate ? dailyExecution : null}
          error={dailyError}
          saving={dailySaving}
          onSaveAssignments={saveDailyAssignments}
          onToggleCompletion={toggleDailyCompletion}
          onLoadFitnessSessions={loadDailyFitnessSessions}
          onLinkFitnessSession={linkFitnessSession}
          onLoadSkillRecords={loadDailySkillRecords}
          onLinkSkillRecord={linkSkillRecord}
          onOpenSkill={onOpenSkill}
          onOpenAllHabits={() => { setLayoutMode("v1"); localStorage.setItem("habits-layout-mode", "v1"); }}
          onOpenJournal={(habit) => {
            setSelectedHabitId(habit.uuid);
            setSelectedSidebarDate(selectedDate);
            setJournalModalOpen(true);
          }}
        />
        <HabitJournalModal
          open={journalModalOpen}
          onClose={() => setJournalModalOpen(false)}
          habit={habits.find((habit) => habit.uuid === selectedHabitId)}
          date={selectedSidebarDate}
          journalText={journalText}
          setJournalText={setJournalText}
          isJournalSaving={isJournalSaving}
          onSaveJournal={onSaveJournal}
        />
        <PushSettingsModal open={pushModalOpen} onClose={() => setPushModalOpen(false)} settings={push.settings} permission={push.permission} busy={push.busy} onEnable={push.enable} onDisable={push.disable} onReminderTimeChange={push.updateReminderTime} />
      </div>
    );
  }

  if (layoutMode === "core4") {
    return (
      <div className="pb-32 px-2 sm:px-4 lg:px-6">
        {habitSaveError && <p role="alert">{habitSaveError}</p>}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-black text-slate-100">Deine Habits</h1>
          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-2 rounded-2xl shadow-xl">
            <button
              onClick={() => { setLayoutMode("v1"); localStorage.setItem("habits-layout-mode", "v1"); }}
              className={`p-1.5 rounded-xl border transition-all ${layoutMode === 'v1' ? 'bg-orange-400 text-black border-orange-400' : 'bg-slate-900 text-slate-400 border-white/10 hover:border-orange-400'}`}
              title="V1 Standard-Ansicht"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => { setLayoutMode("core4"); localStorage.setItem("habits-layout-mode", "core4"); }}
              className={`p-1.5 rounded-xl border transition-all ${layoutMode === 'core4' ? 'bg-orange-400 text-black border-orange-400' : 'bg-slate-900 text-slate-400 border-white/10 hover:border-orange-400'}`}
              title="Core4 Minimal-Ansicht"
            >
              <Smartphone size={16} />
            </button>
            <button
              onClick={() => { setLayoutMode("daily-four"); localStorage.setItem("habits-layout-mode", "daily-four"); }}
              className="rounded-xl border border-white/10 p-1.5 text-slate-400 transition-all hover:border-orange-400 hover:text-orange-300"
              title="Daily Execution · vier Ebenen"
            >
              <Grid2X2 size={16} />
            </button>
            <button
              onClick={() => setPushModalOpen(true)}
              className={`p-1.5 rounded-xl border transition-all ${push.settings?.enabled ? 'bg-orange-400 text-black border-orange-400' : 'bg-slate-900 text-slate-400 border-white/10 hover:border-orange-400'}`}
              title="Erinnerungen"
            >
              <Bell size={16} />
            </button>
          </div>
        </div>
        <Core4Layout
          habits={habits}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onToggleCheck={toggleCheck}
          onDragEnd={handleDragEnd}
          onOpenJournal={(h) => {
            setSelectedHabitId(h.uuid);
          }}
          journalText={journalText}
          setJournalText={setJournalText}
          onSaveJournal={() => onSaveJournal()}
          isJournalSaving={isJournalSaving}
          selectedHabitId={selectedHabitId}
          setSelectedHabitId={setSelectedHabitId}
          newHabit={newHabit}
          setNewHabit={setNewHabit}
          selectedIcon={selectedIcon}
          setSelectedIcon={setSelectedIcon}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedFrequency={selectedFrequency}
          setSelectedFrequency={setSelectedFrequency}
          onAddHabit={handleAdd}
          saving={saving}
          editingHabitId={editingHabitId}
          setEditingHabitId={setEditingHabitId}
          editingIcon={editingIcon}
          setEditingIcon={setEditingIcon}
          editingCategory={editingCategory}
          setEditingCategory={setEditingCategory}
          editingFrequency={editingFrequency}
          setEditingFrequency={setEditingFrequency}
          onUpdateHabitName={updateHabitName}
          onFinishEditing={finishEditing}
          onDeleteHabit={handleDelete}
        />
        <PushSettingsModal
          open={pushModalOpen}
          onClose={() => setPushModalOpen(false)}
          settings={push.settings}
          permission={push.permission}
          busy={push.busy}
          onEnable={push.enable}
          onDisable={push.disable}
          onReminderTimeChange={push.updateReminderTime}
        />
      </div>
    );
  }

  return (
    <div className="pb-32 px-2 sm:px-4 lg:px-6">
      {habitSaveError && <p role="alert">{habitSaveError}</p>}
      <div className="mb-10 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-black text-slate-100 mb-1">Deine Habits</h1>
            <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Konsistenz schlägt Intensität</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900 border border-white/10 px-4 py-2.5 rounded-2xl shadow-xl">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Gesamt-Score</span>
                <span className="text-lg font-black text-orange-400">{Math.round(overallConsistency * 100)}%</span>
             </div>
             <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center text-orange-400">
                <Star size={20} fill="currentColor" fillOpacity={0.2} />
             </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-2 rounded-2xl shadow-xl">
            <button
              onClick={() => { setLayoutMode("v1"); localStorage.setItem("habits-layout-mode", "v1"); }}
              className={`p-1.5 rounded-xl border transition-all ${layoutMode === 'v1' ? 'bg-orange-400 text-black border-orange-400' : 'bg-slate-900 text-slate-400 border-white/10 hover:border-orange-400'}`}
              title="V1 Standard-Ansicht"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => { setLayoutMode("core4"); localStorage.setItem("habits-layout-mode", "core4"); }}
              className={`p-1.5 rounded-xl border transition-all ${layoutMode === 'core4' ? 'bg-orange-400 text-black border-orange-400' : 'bg-slate-900 text-slate-400 border-white/10 hover:border-orange-400'}`}
              title="Core4 Minimal-Ansicht"
            >
              <Smartphone size={16} />
            </button>
            <button
              onClick={() => { setLayoutMode("daily-four"); localStorage.setItem("habits-layout-mode", "daily-four"); }}
              className="p-1.5 rounded-xl border border-white/10 text-slate-400 transition-all hover:border-orange-400 hover:text-orange-300"
              title="Daily Execution · vier Ebenen"
            >
              <Grid2X2 size={16} />
            </button>
            <button
              onClick={() => setPushModalOpen(true)}
              className={`p-1.5 rounded-xl border transition-all ${push.settings?.enabled ? 'bg-orange-400 text-black border-orange-400' : 'bg-slate-900 text-slate-400 border-white/10 hover:border-orange-400'}`}
              title="Erinnerungen"
            >
              <Bell size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable 10-Day Date Picker */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2">
          {recentDates.map(d => {
            const isSelected = d === selectedDate;
            const isToday = d === localToday();
            const dateObj = new Date(d);
            const weekday = dateObj.toLocaleDateString('de-DE', { weekday: 'short' });
            const dayNum = dateObj.getDate();

            return (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`flex-shrink-0 flex flex-col items-center min-w-[52px] py-3 rounded-2xl border transition-all
                  ${isSelected
                    ? 'bg-orange-400 border-orange-400 text-black shadow-lg shadow-orange-400/20 scale-105 z-10'
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:border-orange-400/50'}`}
              >
                <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'opacity-70' : 'opacity-40'}`}>
                  {weekday}
                </span>
                <span className="text-sm font-black tracking-tighter">
                  {dayNum}
                </span>
                {isToday && !isSelected && (
                  <div className="w-1 h-1 rounded-full bg-orange-400 mt-1" />
                )}
              </button>
            );
          })}

          <div className="flex-shrink-0 pl-4 border-l border-white/10/30 flex items-center">
             <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 text-slate-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <CalendarDays size={14} className="text-slate-400" />
                {new Date(selectedDate).toLocaleDateString('de-DE', { month: 'short' })}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {outstandingMemoirs.length > 0 && (
            <div className="p-5 rounded-[24px] border border-orange-400/25 bg-orange-400/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                  Offene Memoirs ({outstandingMemoirs.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {outstandingMemoirs.map(h => {
                  const Icon = ICON_COMPONENTS_MAP[h.icon] || ICON_COMPONENTS_MAP['Activity'];
                  return (
                    <button
                      key={h.uuid}
                      onClick={() => handleOpenMemoir(h)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-orange-400 hover:shadow-lg transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-orange-400/10 flex items-center justify-center text-orange-400">
                          <Icon size={14} />
                        </div>
                        <span className="text-xs font-black text-slate-100">{h.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-orange-400 bg-orange-400/10 px-2 py-1 rounded-lg group-hover:bg-orange-400 group-hover:text-black transition-all">
                        <PenLine size={10} /> Schreiben
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="label-caps px-1 text-slate-400">Aktive Habits</div>
            {habits.length === 0 && !loading && (
              <div className="card p-12 text-center opacity-30 border-dashed bg-slate-900 border-white/10">
                <Activity size={32} className="mx-auto mb-3 text-slate-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Noch keine Habits</p>
              </div>
            )}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={habits.map(h => h.uuid)} strategy={verticalListSortingStrategy}>
                {habits.map(h => (
                  <HabitItem
                    key={h.uuid}
                    h={h}
                    isSelected={selectedHabitId === h.uuid}
                    isEditing={editingHabitId === h.uuid}
                    editingIcon={editingIcon}
                    setEditingIcon={setEditingIcon}
                    editingCategory={editingCategory}
                    setEditingCategory={setEditingCategory}
                    editingFrequency={editingFrequency}
                    setEditingFrequency={setEditingFrequency}
                    setEditingHabitId={setEditingHabitId}
                    onToggleSelection={() => setSelectedHabitId(selectedHabitId === h.uuid ? null : h.uuid)}
                    onToggleCheck={toggleCheck}
                    onDelete={handleDelete}
                    onUpdateName={updateHabitName}
                    onFinishEditing={finishEditing}
                    selectedDate={selectedDate}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Rechte Spalte: Desktop zeigt Sidebar inline, sonst Form+Stats */}
        <div className="space-y-6">
          {selectedHabitId ? (
            <div className="hidden lg:block">
              <HabitSidebar
                inline
                selectedHabitId={selectedHabitId}
                setSelectedHabitId={setSelectedHabitId}
                habits={habits}
                rollingDates={rollingDates}
                selectedSidebarDate={selectedSidebarDate}
                setSelectedSidebarDate={setSelectedSidebarDate}
                journalText={journalText}
                isJournalSaving={isJournalSaving}
                onToggleSidebarDone={toggleSidebarDone}
                journalHistory={journalHistory}
                onOpenJournalModal={() => setJournalModalOpen(true)}
              />
            </div>
          ) : (
            <>
              <HabitForm
                newHabit={newHabit}
                setNewHabit={setNewHabit}
                selectedIcon={selectedIcon}
                setSelectedIcon={setSelectedIcon}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedFrequency={selectedFrequency}
                setSelectedFrequency={setSelectedFrequency}
                onAdd={handleAdd}
                saving={saving}
              />
              <HabitStats
                todayCompletionPercentage={todayCompletionPercentage}
                getMotivationalMessage={getMotivationalMessage}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile: klassisches Slide-in Overlay */}
      <div className="lg:hidden">
        <HabitSidebar
          selectedHabitId={selectedHabitId}
          setSelectedHabitId={setSelectedHabitId}
          habits={habits}
          rollingDates={rollingDates}
          selectedSidebarDate={selectedSidebarDate}
          setSelectedSidebarDate={setSelectedSidebarDate}
          journalText={journalText}
          isJournalSaving={isJournalSaving}
          onToggleSidebarDone={toggleSidebarDone}
          journalHistory={journalHistory}
          onOpenJournalModal={() => setJournalModalOpen(true)}
        />
        {selectedHabitId && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedHabitId(null)} />
        )}
      </div>

      <HabitJournalModal
        open={journalModalOpen}
        onClose={() => setJournalModalOpen(false)}
        habit={habits.find(h => h.uuid === selectedHabitId)}
        date={selectedSidebarDate}
        journalText={journalText}
        setJournalText={setJournalText}
        isJournalSaving={isJournalSaving}
        onSaveJournal={onSaveJournal}
      />

      <PushSettingsModal
        open={pushModalOpen}
        onClose={() => setPushModalOpen(false)}
        settings={push.settings}
        permission={push.permission}
        busy={push.busy}
        onEnable={push.enable}
        onDisable={push.disable}
        onReminderTimeChange={push.updateReminderTime}
      />
    </div>
  );
}
