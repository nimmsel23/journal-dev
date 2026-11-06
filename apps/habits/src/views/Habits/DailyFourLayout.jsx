import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, Settings2 } from "lucide-react";
import { DAILY_DIMENSIONS } from "./dailyExecutionModel.js";
import { localToday } from "@utils";

const SKILLS = [
  ["fitness", "Fitness"],
  ["fuel", "Nutrition"],
  ["relax", "Relax"],
  ["journal", "Journal"],
  ["plan", "Planner"],
  ["habits", "Habits"],
];

function assignmentFor(config, snapshot, dimension) {
  const stored = config?.assignments?.[dimension] || snapshot?.dimensions?.[dimension];
  if (!stored) return { habitId: "", skillLinks: [] };
  return {
    habitId: typeof stored === "string" ? stored : stored.habitId || "",
    skillLinks: Array.isArray(stored.skillLinks) ? stored.skillLinks : [],
  };
}

export default function DailyFourLayout({
  date,
  habits,
  config,
  execution,
  error,
  saving,
  onSaveAssignments,
  onToggleCompletion,
  onLoadFitnessSessions,
  onLinkFitnessSession,
  onLoadSkillRecords,
  onLinkSkillRecord,
  onOpenSkill,
  onOpenJournal,
  onOpenAllHabits,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [message, setMessage] = useState("");
  const [fitnessChooserFor, setFitnessChooserFor] = useState(null);
  const [fitnessSessions, setFitnessSessions] = useState([]);
  const [fitnessSessionsLoading, setFitnessSessionsLoading] = useState(false);
  const [skillChooserFor, setSkillChooserFor] = useState(null);
  const [skillRecords, setSkillRecords] = useState([]);
  const [skillRecordsLoading, setSkillRecordsLoading] = useState(false);
  const currentDate = useRef(date);
  const draftDirty = useRef(false);
  const chooserGeneration = useRef(0);
  if (currentDate.current !== date) {
    currentDate.current = date;
    draftDirty.current = false;
    chooserGeneration.current += 1;
  }
  const activeHabits = useMemo(() => (habits || []).filter((habit) => !habit.deleted), [habits]);

  useEffect(() => {
    setFitnessChooserFor(null);
    setFitnessSessions([]);
    setFitnessSessionsLoading(false);
    setSkillChooserFor(null);
    setSkillRecords([]);
    setSkillRecordsLoading(false);
    setMessage("");
  }, [date]);

  useEffect(() => {
    // A delayed snapshot or settings response must not overwrite choices the
    // user has already made while the day was loading.
    if (draftDirty.current) return;
    setDraft(Object.fromEntries(DAILY_DIMENSIONS.map(({ key }) => [key, assignmentFor(config, execution, key)])));
    setEditing(!execution?.configured);
  }, [date, config, execution]);

  const selectedIds = DAILY_DIMENSIONS.map(({ key }) => draft[key]?.habitId).filter(Boolean);
  const assignmentsValid = DAILY_DIMENSIONS.every(({ key }) => draft[key]?.habitId)
    && new Set(selectedIds).size === DAILY_DIMENSIONS.length;

  const updateAssignment = (dimension, patch) => {
    draftDirty.current = true;
    setDraft((current) => ({
      ...current,
      [dimension]: { ...(current[dimension] || { habitId: "", skillLinks: [] }), ...patch },
    }));
    setMessage("");
  };

  const save = async () => {
    try {
      const result = await onSaveAssignments(draft);
      draftDirty.current = false;
      setMessage(result?.effectiveDate && result.effectiveDate > date
        ? "Die neuen Zuordnungen gelten ab morgen. Der heutige Tagesstand bleibt erhalten."
        : "Deine vier Gewohnheiten sind gespeichert.");
      setEditing(false);
    } catch (cause) {
      setMessage(cause?.message || "Die Zuordnungen konnten nicht gespeichert werden.");
    }
  };

  const toggleFitnessChooser = async (dimension) => {
    if (fitnessChooserFor === dimension) { setFitnessChooserFor(null); return; }
    const generation = chooserGeneration.current;
    setFitnessChooserFor(dimension);
    setFitnessSessionsLoading(true);
    try {
      const sessions = await onLoadFitnessSessions?.(date) || [];
      if (chooserGeneration.current === generation) setFitnessSessions(sessions);
    } catch (cause) {
      if (chooserGeneration.current === generation) setMessage(cause?.message || "Trainingseinheiten konnten nicht geladen werden.");
    } finally {
      if (chooserGeneration.current === generation) setFitnessSessionsLoading(false);
    }
  };

  const linkFitnessSession = async (dimension, session) => {
    try {
      await onLinkFitnessSession?.(dimension, session);
      setMessage(`${session.title} ist mit der Gewohnheit verknüpft. Der Tagespunkt zählt weiterhin nur einmal.`);
      setFitnessChooserFor(null);
    } catch (cause) {
      setMessage(cause?.message || "Die Trainingseinheit konnte nicht verknüpft werden.");
    }
  };

  const toggleSkillChooser = async (dimension, skill) => {
    const key = `${dimension}:${skill}`;
    if (skillChooserFor === key) { setSkillChooserFor(null); return; }
    const generation = chooserGeneration.current;
    setSkillChooserFor(key);
    setSkillRecords([]);
    setSkillRecordsLoading(true);
    try {
      const records = await onLoadSkillRecords?.(date, skill) || [];
      if (chooserGeneration.current === generation) setSkillRecords(records);
    } catch (cause) {
      if (chooserGeneration.current === generation) setMessage(cause?.message || "Einträge konnten nicht geladen werden.");
    } finally {
      if (chooserGeneration.current === generation) setSkillRecordsLoading(false);
    }
  };

  const linkSkillRecord = async (dimension, skill, record) => {
    try {
      await onLinkSkillRecord?.(dimension, skill, record);
      setMessage(`${record.title} ist mit der Gewohnheit verknüpft. Der Tagespunkt zählt weiterhin nur einmal.`);
      setSkillChooserFor(null);
    } catch (cause) {
      setMessage(cause?.message || "Der Eintrag konnte nicht verknüpft werden.");
    }
  };

  const score = Number.isInteger(execution?.score) ? execution.score : 0;
  const configured = Boolean(execution?.configured);
  const futureDay = date > localToday();
  const todayDay = date === localToday();

  return (
    <section className="mx-auto max-w-3xl space-y-5 text-slate-100" aria-label="Tägliche vier Gewohnheiten">
      <header className="rounded-3xl border border-white/10 bg-slate-950 p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Daily Execution · {date}</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Dein Tag in vier Ebenen</h2>
            <p className="mt-1 text-sm text-slate-400">Eine selbst gewählte Gewohnheit je Ebene. Jede zählt höchstens einmal.</p>
          </div>
          <div className="shrink-0 text-right" aria-label={configured ? `${score} von 4 Punkten` : "Kein Tagesstand gespeichert"}>
            <span className="text-3xl font-black text-orange-300">{configured ? score : "–"}</span>
            <span className="text-lg text-slate-500"> / 4</span>
          </div>
        </div>
        {configured && <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-orange-300 transition-[width]" style={{ width: `${score * 25}%` }} />
        </div>}
      </header>

      {execution?.fromCache && <p className="text-sm text-slate-400" role="status">Zwischengespeicherter Stand. Änderungen benötigen eine Verbindung und werden erst nach Bestätigung angezeigt.</p>}
      {error && <p className="rounded-xl border border-rose-400/30 bg-rose-950/30 p-3 text-sm text-rose-200" role="alert">{error}</p>}
      {futureDay && <p className="text-sm text-slate-400">Zukünftige Gewohnheiten können noch nicht als ausgeführt markiert werden.</p>}
      {message && <p className="rounded-xl border border-white/10 bg-slate-900 p-3 text-sm text-slate-200" role="status">{message}</p>}

      {configured && !editing && (
        <div className="space-y-3">
          {DAILY_DIMENSIONS.map(({ key, label }) => {
            const item = execution.dimensions?.[key];
            if (!item) return null;
            const skill = item.skillLinks?.[0];
            const skillLabel = SKILLS.find(([id]) => id === skill)?.[1] || skill;
            return (
              <article key={key} className={`rounded-2xl border p-4 transition-colors ${item.completed ? "border-emerald-300/30 bg-emerald-950/25" : "border-white/10 bg-slate-950"}`}>
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    aria-pressed={item.completed}
                    aria-label={`${label}: ${item.completed ? "Ausführung zurücknehmen" : "Als ausgeführt markieren"}`}
                    disabled={saving || (futureDay && !item.completed)}
                    onClick={() => onToggleCompletion(key, !item.completed)}
                    className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${item.completed ? "border-emerald-300 bg-emerald-300 text-slate-950" : "border-white/20 text-slate-500 hover:border-orange-300 hover:text-orange-200"}`}
                  >
                    {item.completed ? <Check size={21} /> : <span className="text-xs font-bold">+1</span>}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</div>
                    <h3 className="mt-1 break-words text-lg font-semibold">{item.habitName}</h3>
                    <details className="mt-2 text-sm text-slate-400">
                      <summary className="flex cursor-pointer list-none items-center gap-1 hover:text-slate-200">
                        Details <ChevronDown size={14} />
                      </summary>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {skill && <button type="button" onClick={() => onOpenSkill?.(skill, { date, dimension: key, habitId: item.habitId, habitName: item.habitName })} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-slate-200 hover:border-orange-300">{skillLabel} öffnen <ArrowUpRight size={14} /></button>}
                        {item.skillLinks?.includes("fitness") && <button type="button" disabled={saving || futureDay || fitnessSessionsLoading} onClick={() => toggleFitnessChooser(key)} className="rounded-lg border border-white/10 px-3 py-2 text-slate-200 hover:border-orange-300">{fitnessChooserFor === key ? "Auswahl schließen" : "Erfasste Trainingseinheit verknüpfen"}</button>}
                        {["fuel", "relax"].filter((linkedSkill) => item.skillLinks?.includes(linkedSkill)).map((linkedSkill) => {
                          const chooserKey = `${key}:${linkedSkill}`;
                          const canonicalSkill = linkedSkill === "fuel" ? "nutrition" : linkedSkill;
                          const linkedLabel = linkedSkill === "fuel" ? "Ernährung" : "Relax";
                          return <span key={linkedSkill} className="contents">
                            <button type="button" disabled={saving || futureDay || skillRecordsLoading} onClick={() => toggleSkillChooser(key, linkedSkill)} className="rounded-lg border border-white/10 px-3 py-2 text-slate-200 hover:border-orange-300">
                              {skillChooserFor === chooserKey ? "Auswahl schließen" : `${linkedLabel}-Eintrag verknüpfen`}
                            </button>
                            {skillChooserFor === chooserKey && <span className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3" aria-label={`${linkedLabel}-Einträge`}>
                              <span className="block text-xs text-slate-400">Wähle einen gespeicherten {linkedLabel}-Eintrag vom {date}. Die Fachdaten bleiben im Tracker.</span>
                              {skillRecordsLoading ? <span className="mt-2 block text-sm text-slate-400">Lade Einträge …</span>
                                : skillRecords.length ? <span className="mt-2 flex flex-wrap gap-2">{skillRecords.map((record) => {
                                  const alreadyLinked = item.linkedRecords?.some((entry) => entry.skill === canonicalSkill && entry.recordId === record.recordId);
                                  return <button key={record.recordId} type="button" disabled={saving || alreadyLinked} onClick={() => linkSkillRecord(key, linkedSkill, record)} className="rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-slate-200 disabled:opacity-50">
                                    <span className="block font-semibold">{alreadyLinked ? "✓ Verknüpft · " : "Als Beleg verwenden · "}{record.title}</span>
                                    {record.detail && <span className="block text-xs text-slate-400">{record.detail}</span>}
                                  </button>;
                                })}</span>
                                : <span className="mt-2 block text-sm text-slate-400">Für diesen Tag ist noch kein Eintrag mit Daten gespeichert.</span>}
                            </span>}
                          </span>;
                        })}
                        <button type="button" onClick={() => onOpenJournal?.({ uuid: item.habitId, name: item.habitName })} className="rounded-lg border border-white/10 px-3 py-2 text-slate-200 hover:border-orange-300">Habit-Notiz</button>
                      </div>
                      {fitnessChooserFor === key && <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3" aria-label="Erfasste Trainingseinheiten">
                        <p className="text-xs text-slate-400">Wähle eine bereits erfasste Einheit für „{item.habitName}“. Der Trainingsdatensatz bleibt im Fitness-Tracker.</p>
                        {fitnessSessionsLoading ? <p className="mt-2 text-sm text-slate-400">Lade Trainingseinheiten …</p>
                          : fitnessSessions.length ? <div className="mt-2 flex flex-wrap gap-2">{fitnessSessions.map((session) => {
                            const alreadyLinked = item.linkedRecords?.some((record) => record.skill === "fitness" && record.recordId === session.recordId);
                            return <button key={session.recordId} type="button" disabled={saving || alreadyLinked} onClick={() => linkFitnessSession(key, session)} className="rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-slate-200 disabled:opacity-50">
                              <span className="block font-semibold">{alreadyLinked ? "✓ Verknüpft · " : "Als Beleg verwenden · "}{session.title}</span>
                              {session.detail && <span className="block text-xs text-slate-400">{session.detail}</span>}
                            </button>;
                          })}</div>
                          : <p className="mt-2 text-sm text-slate-400">Für diesen Tag ist noch keine Einheit mit Trainingsdetails gespeichert.</p>}
                      </div>}
                      <p className="mt-3 text-xs">Als ausgeführt gilt diese Gewohnheit, wenn du sie hier ausdrücklich bestätigst. Ein Eintrag oder ein Vorsatz im Journal setzt keinen Punkt.</p>
                    </details>
                  </div>
                  {item.completed && <span className="pt-1 text-xs font-semibold text-emerald-200">Erledigt</span>}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!configured && !todayDay && <p className="text-sm text-slate-400">Für diesen Tag ist kein Daily-Four-Stand gespeichert.</p>}

      {todayDay && config && (!configured || editing) && (
        <section className="rounded-3xl border border-white/10 bg-slate-950 p-5 sm:p-7" aria-label="Vier tägliche Gewohnheiten festlegen">
          <h3 className="text-lg font-bold">Vier Gewohnheiten festlegen</h3>
          <p className="mt-1 text-sm text-slate-400">Wähle vier verschiedene bestehende Habits. Die Zuordnung ist unabhängig von Body, Being, Balance und Business.</p>
          {activeHabits.length < DAILY_DIMENSIONS.length && <div className="mt-3 rounded-xl border border-amber-300/20 bg-amber-950/20 p-3 text-sm text-amber-100">Du brauchst vier bestehende Gewohnheiten. <button type="button" onClick={onOpenAllHabits} className="underline underline-offset-2">Gewohnheiten anlegen</button></div>}
          <div className="mt-5 space-y-4">
            {DAILY_DIMENSIONS.map(({ key, label }) => (
              <div key={key} className="grid gap-2 sm:grid-cols-[1fr_1fr]">
                <label className="text-sm font-medium">
                  <span className="mb-1 block text-slate-300">{label}</span>
                  <select value={draft[key]?.habitId || ""} disabled={saving} onChange={(event) => updateAssignment(key, { habitId: event.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-slate-100">
                    <option value="">Gewohnheit wählen</option>
                    {activeHabits.map((habit) => <option key={habit.uuid} value={habit.uuid} disabled={selectedIds.includes(habit.uuid) && draft[key]?.habitId !== habit.uuid}>{habit.name}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  <span className="mb-1 block text-slate-300">Verbundener Skill (optional)</span>
                  <select value={draft[key]?.skillLinks?.[0] || ""} disabled={saving} onChange={(event) => updateAssignment(key, { skillLinks: event.target.value ? [event.target.value] : [] })} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-slate-100">
                    <option value="">Kein Tracker</option>
                    {SKILLS.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                  </select>
                </label>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" disabled={!assignmentsValid || saving} onClick={save} className="rounded-xl bg-orange-300 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">{saving ? "Speichere …" : "Vier Gewohnheiten speichern"}</button>
            {configured && <button type="button" disabled={saving} onClick={() => { draftDirty.current = false; setDraft(Object.fromEntries(DAILY_DIMENSIONS.map(({ key }) => [key, assignmentFor(config, execution, key)]))); setEditing(false); }} className="rounded-xl border border-white/10 px-4 py-3 text-slate-300">Abbrechen</button>}
          </div>
          {selectedIds.length > new Set(selectedIds).size && <p className="mt-3 text-sm text-amber-200">Jede Ebene braucht eine andere Gewohnheit.</p>}
        </section>
      )}

      {todayDay && config && configured && !editing && <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-orange-200"><Settings2 size={16} /> Zuweisungen ändern</button>}
    </section>
  );
}
