// JournalV2View — Journal v2 im Design "Raster" (Schweizer Logbuch).
// Erreichbar über den Hash #v2 bzw. #v2/<yyyy-mm-dd|today> (siehe main.jsx).
// Nutzt dieselben Datenquellen wie die v1-Timeline (@journal-db), schreibt
// aber nur: Journal-Einträge (addDoc) und Habit-Records (recordHabit).
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, addMonths, addWeeks, addYears, format, getDayOfYear, getISOWeek, isLeapYear, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import * as db from "@journal-db";
// Journal-CRUD direkt aus journal-dev: @journal-db liefert dafür evtl. die
// fitness-dev-Variante (andere saveJournal-Signatur, kein getJournalRange).
import { getJournal, getJournalRange, saveJournal, updateJournal, deleteJournal, setJournalTime } from "../../lib/db/journal.js";
import { MonthView, WeekView, YearView, rangeFor } from "./JournalV2Range.jsx";
import HabitsView from "./JournalV2Habits.jsx";
import { TimelineOverlay, useTimelineDrag, hhmm } from "./TimelineDrag.jsx";
import { analyzeSmartJournal, newSmartRequestId } from "../../lib/smartJournalLogger.js";
import { browserStorage, clearSmartLogRequestId, readSmartLogRequestId, smartLogRequestKey, writeSmartLogRequestId } from "../../lib/smartLogRequestStore.js";
import { applySmartAnalysis } from "../../lib/smartJournalApply.js";
import { smartAnalysisForRetry, smartPendingPlannerIndexes } from "../../lib/smartJournalApplyCore.js";
import { addHabit, getHabitsRange, setHabitArchived, updateHabit } from "./habitsDb.js";
import { extractTags, timeStr } from "../../components/Journal/journalUtils";
import { asBool, useSetting } from "../../lib/useSetting.js";
import { usePersistedText } from "../../lib/useAutosaveField.js";
import { draftStore } from "../../lib/draftStore.js";
import { fetchEvents } from "./gcal.js";
import { useGoogle } from "../../lib/google/useGoogle.js";
import { googleErrorText } from "../../lib/google/tokens.js";
import "./journal-v2.css";

const HABIT_LIMIT = 5;
const iso = (d) => format(d, "yyyy-MM-dd");

function smartLogErrorText(error) {
  const message = error?.message || "";
  if (message.includes("smart_retry_tracker_changed") || message.includes("smart_retry_planner_order_changed") || message.includes("smart_retry_planner_already_applied")) return "Ein Teil wurde bereits gespeichert. Bitte ändere gespeicherte Tracker-Einträge direkt im jeweiligen Tracker; offene Kalender-Vorschläge kannst du an derselben Stelle ergänzen.";
  if (message.includes("smart_retry_source_changed") || message.includes("smart_retry_payload_unavailable")) return "Der Journaleintrag wurde geändert oder die gespeicherten Vorschläge fehlen. Bitte öffne den Journaleintrag erneut; vorhandene Daten bleiben erhalten.";
  if (message.includes("smart_log_request_locked") || message.includes("smart_log_request_in_progress")) return "Diese Anfrage ist noch aktiv oder nach einem unklaren Abbruch gesperrt. Sie wird nicht erneut an Gemini gesendet, damit keine Doppelberechnung entsteht. Dein Entwurf bleibt erhalten; du kannst ihn jederzeit ohne KI speichern.";
  if (message.includes("smart_log_weekly_quota_reached")) return "Das Smart-Log-Wochenkontingent ist ausgeschöpft. Du kannst den Text ohne KI im Journal speichern.";
  if (message.includes("smart_log_provider_not_configured")) return "Smart Logging ist gerade nicht verfügbar. Dein Entwurf bleibt erhalten und kann ohne KI gespeichert werden.";
  if (message.includes("smart_log_failed")) return "Die Analyse ist fehlgeschlagen. Dein Entwurf bleibt erhalten; du kannst es erneut versuchen oder ohne KI speichern.";
  return message || "Analyse fehlgeschlagen. Dein Entwurf bleibt erhalten.";
}

// Lokale Uhrzeit eines Eintrags in Minuten seit 0:00. `time` ist meist ein
// ISO-String (UTC) — timeStr() aus v1 schneidet davon nur die UTC-Stunde ab.
function minutesOf(entry) {
  const d = entry.time && String(entry.time).includes("T") ? new Date(entry.time) : null;
  if (d && !Number.isNaN(d.getTime())) return d.getHours() * 60 + d.getMinutes();
  const [h, m] = String(timeStr(entry) || "00:00").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
const byMinutes = (a, b) => minutesOf(a) - minutesOf(b);

function splitEntry(text) {
  const [first, ...rest] = String(text || "").split("\n");
  if (rest.length && first.length <= 40) return { title: first, body: rest.join("\n").trim() };
  return { title: null, body: text };
}

// Kopfzeile: oben die Zeitraum-Ansichten, darunter Habits und die Sprünge in Door (unter Woche), Focus (unter Monat), Game (unter Jahr)
const MODES = [["tag", "Tag"], ["woche", "Woche"], ["monat", "Monat"], ["jahr", "Jahr"]];
const LINKS = [["#door2", "Door"], ["#game2/focus", "Focus"], ["#game2", "Game"]];

export default function JournalV2View({ date, onDateChange, user, mode = "tag", onModeChange = () => {}, onNavigateJournal, onStartVoice, startSmart = false, onSetHabitCompletion }) {
  const qc = useQueryClient();
  // Vollbild: Seitenhintergrund + Statusleiste papierfarben, solange v2 offen ist
  useEffect(() => {
    const paper = "#f6f6f2";
    const meta = document.querySelector('meta[name="theme-color"]');
    const prev = { meta: meta?.getAttribute("content"), html: document.documentElement.style.background, body: document.body.style.background };
    meta?.setAttribute("content", paper);
    document.documentElement.style.background = paper;
    document.body.style.background = paper;
    return () => {
      if (meta && prev.meta) meta.setAttribute("content", prev.meta);
      document.documentElement.style.background = prev.html;
      document.body.style.background = prev.body;
    };
  }, []);
  // Timeline-Raster (Drag auf die versteckte Timeline): 60 / 30 / 15 Minuten
  const [grain, setGrain] = useSetting("jv2:grain", 30, (v) => ([60, 30, 15].includes(Number(v)) ? Number(v) : undefined));
  // Smart Logger: Freitext → Vertex-Analyse → Vorschau → Übernehmen (Journal, Mahlzeiten, Wasser, Habits)
  const [smart, setSmart] = useSetting("jv2:smart", false, asBool);
  useEffect(() => { if (startSmart) setSmart(true); }, [startSmart, setSmart]);
  const [analysis, setAnalysis] = useState(null);
  const [analysisDate, setAnalysisDate] = useState(null);
  const [plannerPending, setPlannerPending] = useState([]);
  const [retryLocked, setRetryLocked] = useState(false);
  const [editablePlannerIndexes, setEditablePlannerIndexes] = useState([]);
  const [resumeDate, setResumeDate] = useState(null);
  const [smartMsg, setSmartMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const day = parseISO(date);
  const uid = user?.uid ?? null;
  const account = useRef({ uid, generation: 0 });
  if (account.current.uid !== uid) account.current = { uid, generation: account.current.generation + 1 };
  const [previewGeneration, setPreviewGeneration] = useState(null);
  useEffect(() => {
    setAnalysis(null);
    setAnalysisDate(null);
    setPlannerPending([]);
    setRetryLocked(false);
    setEditablePlannerIndexes([]);
    setResumeDate(null);
    setSmartMsg("");
    setBusy(false);
    setPreviewGeneration(null);
  }, [uid]);
  // Eingabe-Entwurf (Journal/Smart Logger) übersteht Reload und Absturz; nach dem Speichern wird er geleert
  const [draft, setDraft] = usePersistedText(`${uid}:jv2:compose`);
  const smartRequestKey = smartLogRequestKey(uid || "anonymous", date);
  const [smartRequestId, setSmartRequestId] = useState(() => readSmartLogRequestId(browserStorage(), smartRequestKey));
  useEffect(() => {
    setSmartRequestId(readSmartLogRequestId(browserStorage(), smartRequestKey));
  }, [smartRequestKey]);
  const clearSmartRequest = () => {
    clearSmartLogRequestId(browserStorage(), smartRequestKey);
    setSmartRequestId("");
  };
  const changeDraft = (value) => {
    clearSmartRequest();
    setDraft(value);
  };

  const entries = useQuery({
    queryKey: ["jv2-entries", uid, date],
    enabled: !!uid,
    // cache-first: lokaler Stand sofort, Server-Stand kommt im Hintergrund nach (siehe lib/db/fastDocs.js)
    queryFn: async () => {
      const list = await getJournal(date, (late) => qc.setQueryData(["jv2-entries", uid, date], [...late].sort(byMinutes)));
      return [...list].sort(byMinutes);
    },
  });

  // Load history around the selected date, including the complete visible week/month.
  const habitFrom = iso(addDays(day, -119));
  const [, habitRangeEnd] = rangeFor(mode === "monat" ? "monat" : "woche", day);
  const habitTo = iso(habitRangeEnd);
  const habitKey = ["jv2-habits", uid, habitFrom, habitTo];
  const habitLock = useRef(false);
  const habitMutation = useMutation({
    mutationFn: (action) => action(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jv2-habits", uid] }),
  });
  const habitPending = habitMutation.isPending;
  const habits = useQuery({
    queryKey: habitKey,
    enabled: !!uid,
    retry: false,
    queryFn: () => getHabitsRange(habitFrom, habitTo, (late) => qc.setQueryData(habitKey, late)),
  });
  const habitAction = async (action) => {
    if (!uid || habitLock.current) return false;
    habitLock.current = true; // synchron: isPending springt erst nach dem nächsten Render um
    try {
      await habitMutation.mutateAsync(action);
      return true;
    } catch {
      return false; // Fehler steht in habitMutation.error
    } finally {
      habitLock.current = false;
    }
  };

  const [rangeFrom, rangeTo] = rangeFor(mode === "monat" ? "monat" : "woche", day);
  const [loadFrom, loadTo] = mode === "jahr" ? rangeFor("jahr", day) : [rangeFrom, rangeTo];
  const rangeKey = [iso(loadFrom), iso(loadTo)];
  const range = useQuery({
    queryKey: ["jv2-range", uid, ...rangeKey],
    enabled: !!uid && (mode === "woche" || mode === "monat" || mode === "jahr"),
    queryFn: () => getJournalRange(rangeKey[0], rangeKey[1], (late) => qc.setQueryData(["jv2-range", uid, ...rangeKey], late)),
  });

  // Google Calendar (nur lesen): Termine zum Reviewen. Verbindung gemeinsam mit Google Tasks (lib/google)
  const google = useGoogle();
  const calOn = google.connected;
  const [calMsg, setCalMsg] = useState("");
  // Standard: nur Fire Map; „alle“ zeigt jeden in Google ausgewählten Kalender
  const [calAll, setCalAll] = useSetting("jv2:cal-all", false, asBool);
  const toggleCalAll = () => {
    setCalAll(!calAll);
    setCalMsg("");
  };
  const inputRef = useRef(null);
  const evFrom = mode === "tag" ? day : rangeFrom;
  const evTo = mode === "tag" ? day : rangeTo;
  const events = useQuery({
    queryKey: ["jv2-cal", uid, iso(evFrom), iso(evTo), calAll, calOn],
    enabled: !!uid && calOn && mode !== "habits" && mode !== "jahr",
    retry: false,
    queryFn: async () => {
      try {
        setCalMsg("");
        return await fetchEvents(evFrom, evTo, { all: calAll });
      } catch (error) {
        // google-expired: der Dienst hat die Verbindung schon verworfen (calOn wird false) → Knopf „verbinden“
        // Netzprobleme (google-offline) bleiben still; nur Hinweise, die eine Handlung brauchen
        setCalMsg(error.message === "fire-calendar-missing" ? "Kalender „Fire Map“ nicht gefunden. Unten auf „Alle Kalender“ umschalten." : error.message === "google-offline" ? "" : googleErrorText(error));
        return [];
      }
    },
  });
  const connect = async () => {
    setCalMsg("");
    await google.connect();
    qc.invalidateQueries({ queryKey: ["jv2-cal"] });
  };
  const disconnect = () => google.disconnect();
  // Review: Termin als Journal-Eintrag beginnen (Tag +termin, Titel vorbelegt)
  const review = (ev) => {
    changeDraft(`+termin ${ev.title}: `);
    inputRef.current?.focus();
  };
  const evList = events.data || [];
  const eventsByDate = new Map();
  evList.forEach((ev) => eventsByDate.set(ev.date, [...(eventsByDate.get(ev.date) || []), ev]));

  const toggleHabit = (habit, recordDate = date) => {
    if (recordDate > db.localToday() || habit.deleted) return Promise.resolve(false);
    const completed = !habit.hasRecord(recordDate);
    return habitAction(() => onSetHabitCompletion
      ? onSetHabitCompletion(habit.uuid, recordDate, completed)
      : completed ? db.recordHabit(habit.uuid, recordDate) : db.unrecordHabit(habit.uuid, recordDate));
  };

  const toggleSmart = () => {
    setSmart(!smart);
    setAnalysis(null);
    setAnalysisDate(null);
    setPlannerPending([]);
    setRetryLocked(false);
    setEditablePlannerIndexes([]);
    setResumeDate(null);
    setSmartMsg("");
  };

  const analyze = async () => {
    if (!uid || !draft.trim() || busy) return;
    const generation = account.current.generation;
    const requestId = smartRequestId || newSmartRequestId();
    if (!smartRequestId) {
      setSmartRequestId(requestId);
      writeSmartLogRequestId(browserStorage(), smartRequestKey, requestId);
    }
    setBusy(true);
    setSmartMsg("");
    try {
      const { tags } = extractTags(draft);
      const result = await analyzeSmartJournal({ text: draft, date, habits: allHabits, tags, requestId });
      if (account.current.generation !== generation) return;
      setAnalysis(result);
      setPreviewGeneration(generation);
      setAnalysisDate(date);
      setPlannerPending([]);
      setRetryLocked(false);
      setEditablePlannerIndexes([]);
      setResumeDate(null);
    } catch (error) {
      if (account.current.generation !== generation) return;
      console.error("Smart-Analyse fehlgeschlagen:", error);
      setSmartMsg(error?.message === "vertex_ai_unavailable" ? "Vertex AI ist hier nicht verfügbar." : smartLogErrorText(error));
    } finally {
      if (account.current.generation === generation) setBusy(false);
    }
  };

  const editAnalysis = (patch) => setAnalysis((current) => current && ({ ...current, ...patch }));
  const editMeal = (index, patch) => setAnalysis((current) => current && ({
    ...current,
    meals: current.meals.map((meal, i) => i === index ? { ...meal, ...patch } : meal),
  }));
  const editAnalysisHabit = (index, patch) => setAnalysis((current) => current && ({
    ...current,
    habits_done: current.habits_done.map((habit, i) => i === index ? { ...habit, ...patch } : habit),
  }));
  const editAnalysisList = (key, index, patch) => setAnalysis((current) => current && ({
    ...current,
    [key]: (current[key] || []).map((item, i) => i === index ? { ...item, ...patch } : item),
  }));

  const applyAnalysis = async () => {
    if (!analysis || busy || previewGeneration !== account.current.generation) return;
    const generation = account.current.generation;
    setBusy(true);
    setSmartMsg("");
    try {
      const applyDate = resumeDate || analysisDate || date;
      const res = await applySmartAnalysis({ date: applyDate, analysis, habits: allHabits });
      if (account.current.generation !== generation) return;
      const pending = res.planner_pending || [];
      setPlannerPending(pending);
      setRetryLocked(pending.length > 0);
      setEditablePlannerIndexes(smartPendingPlannerIndexes(analysis.planner_tasks || [], pending));
      if (!pending.length) { setAnalysis(null); setAnalysisDate(null); setResumeDate(null); }
      if (!resumeDate) { setDraft(""); clearSmartRequest(); }
      const parts = [res.journal && "Eintrag", res.meals && `${res.meals} Mahlzeit${res.meals > 1 ? "en" : ""}`, res.water_ml && `${res.water_ml} ml Wasser`, res.habits.length && `${res.habits.length} Habit${res.habits.length > 1 ? "s" : ""}`, res.fitness && `${res.fitness} Fitness-Session${res.fitness > 1 ? "s" : ""}`, res.relax && `${res.relax} Relax-Einheit${res.relax > 1 ? "en" : ""}`, res.planner && `${res.planner} Google-Kalendertermin${res.planner > 1 ? "e" : ""}`].filter(Boolean);
      const habitNote = res.habits_skipped?.length ? " Ein später geänderter Habit-Status bleibt unverändert." : "";
      setSmartMsg(res.planner_pending?.some((pending) => pending.reason === "google_calendar_event_conflict")
        ? `Übernommen: ${parts.join(", ")}. Ein vorhandener Kalendertermin weicht vom Vorschlag ab. Bitte prüfe ihn im Google Kalender; er wurde nicht überschrieben.`
        : res.planner_pending?.length
        ? `Übernommen: ${parts.join(", ")}. ${res.planner_pending.length} Kalender-Vorschlag${res.planner_pending.length > 1 ? "e brauchen" : " braucht"} noch Angaben oder eine Google-Berechtigung.`
        : `Übernommen: ${parts.join(", ") || "nichts"}.${habitNote}`);
      qc.invalidateQueries({ queryKey: ["jv2-entries", uid, applyDate] });
      qc.invalidateQueries({ queryKey: ["jv2-habits", uid] });
    } catch (error) {
      if (account.current.generation !== generation) return;
      console.error("Smart-Übernahme fehlgeschlagen:", error);
      setSmartMsg(smartLogErrorText(error));
    } finally {
      if (account.current.generation === generation) setBusy(false);
    }
  };

  const resumeSmartEntry = (entry) => {
    const retryAnalysis = smartAnalysisForRetry(entry);
    if (!retryAnalysis || busy) return;
    const pending = entry.smartLog?.applied?.planner_pending || [];
    setSmart(true);
    setAnalysis(retryAnalysis);
    setPreviewGeneration(account.current.generation);
    setAnalysisDate(entry.date);
    setPlannerPending(pending);
    setEditablePlannerIndexes(smartPendingPlannerIndexes(retryAnalysis.planner_tasks || [], pending));
    setRetryLocked(true);
    setResumeDate(entry.date);
    setSmartMsg("Übernahme fortsetzen: Ergänze offene Kalenderangaben und prüfe die Vorschläge.");
  };

  const saveDraftWithoutAI = async () => {
    const { text, tags } = extractTags(draft);
    if (!text || !uid || busy) return;
    setBusy(true);
    try {
      await saveJournal(date, text, { tags });
      setDraft("");
      clearSmartRequest();
      setSmartMsg("Als normaler Journaleintrag gespeichert.");
      await qc.invalidateQueries({ queryKey: ["jv2-entries", uid, date] });
    } catch (error) {
      setSmartMsg(error?.message || "Journaleintrag konnte nicht gespeichert werden.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (smart) return analyze();
    const { text, tags } = extractTags(draft);
    if (!text || busy) return;
    setBusy(true);
    try {
      await saveJournal(date, text, { tags });
      setDraft("");
      clearSmartRequest();
      await qc.invalidateQueries({ queryKey: ["jv2-entries", uid, date] });
    } catch (error) {
      console.error("Journal save failed:", error);
    } finally {
      setBusy(false);
    }
  };

  const moveEntry = async (entry, minutes) => {
    if (minutes === minutesOf(entry)) return;
    const stamp = new Date(`${entry.date || date}T${hhmm(minutes)}:00`).toISOString();
    const key = ["jv2-entries", uid, date];
    qc.setQueryData(key, (prev = []) => prev.map((x) => (x.id === entry.id ? { ...x, time: stamp } : x)).sort(byMinutes));
    try {
      await setJournalTime(entry.id, stamp);
      qc.invalidateQueries({ queryKey: ["jv2-range"] });
    } catch (error) {
      console.error("Uhrzeit ändern fehlgeschlagen:", error);
      qc.invalidateQueries({ queryKey: key });
    }
  };
  const timeline = useTimelineDrag({ grain, setGrain, onMove: moveEntry, minutesOf });

  // Eintrag bearbeiten: Text + „+tag“-Zeile in einem Feld (wie beim Anlegen), Speichern über updateJournal
  const [edit, setEdit] = useState(null); // { id, text, err }
  const editKey = (id) => `${uid}:jv2:edit:${id}`;
  // Entwurf der Bearbeitung bleibt im localStorage, bis gespeichert oder verworfen wird (Reload/Absturz)
  const startEdit = (e) => setEdit({ id: e.id, text: draftStore().get(editKey(e.id)) ?? [String(e.text || "").trimEnd(), (e.tags || []).map((t) => `+${t}`).join(" ")].filter(Boolean).join("\n"), err: "" });
  const closeEdit = (id) => { draftStore().remove(editKey(id)); setEdit(null); };
  const saveEdit = async (e) => {
    const { text, tags } = extractTags(edit.text);
    if (!text) { setEdit({ ...edit, err: "Text darf nicht leer sein." }); return; }
    if (busy) return;
    setBusy(true);
    try {
      await updateJournal(e.id, text, { tags, startDate: e.startDate, endDate: e.endDate });
      closeEdit(e.id);
      await qc.invalidateQueries({ queryKey: ["jv2-entries", uid, date] });
      qc.invalidateQueries({ queryKey: ["jv2-range"] });
    } catch (error) {
      console.error("Eintrag ändern fehlgeschlagen:", error);
      setEdit((cur) => cur && { ...cur, err: error?.message || "Speichern fehlgeschlagen." });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    await deleteJournal(id);
    qc.invalidateQueries({ queryKey: ["jv2-entries", uid, date] });
  };

  const shift = (n) => {
    const next = mode === "jahr" ? addYears(day, n) : mode === "monat" ? addMonths(day, n) : mode === "woche" ? addWeeks(day, n) : mode === "habits" ? addDays(day, 7 * n) : addDays(day, n);
    onDateChange(iso(next));
  };
  const pick = (d) => { onDateChange(d); onModeChange("tag"); };
  const list = entries.data || [];
  const allHabits = (habits.data || []).filter((h) => !h.deleted);
  const habitList = allHabits.slice(0, HABIT_LIMIT); // Streifen in Tag/Woche/Monat
  const doneToday = allHabits.filter((h) => h.hasRecord(date)).length;
  const head = {
    woche: { no: getISOWeek(day), kw: "KW", title: `${format(rangeFrom, "d. MMM", { locale: de })} – ${format(rangeTo, "d. MMM", { locale: de })}`, sub: format(rangeFrom, "yyyy") },
    habits: { no: `${doneToday}/${allHabits.length}`, kw: "Habits", title: format(day, "EEE d. MMM", { locale: de }), sub: "letzte 28 Tage" },
    jahr: { no: format(day, "yy"), kw: "Jahr", title: format(day, "yyyy"), sub: `${(range.data || []).length} Einträge` },
    monat: { no: format(day, "MM"), kw: "Monat", title: format(day, "MMMM", { locale: de }), sub: format(day, "yyyy") },
  }[mode];
  const addNew = (fields) => habitAction(() => addHabit(fields));
  const editHabit = (habit, fields) => habitAction(() => updateHabit(habit.uuid, fields));
  const archive = (habit) => habitAction(() => setHabitArchived(habit.uuid, true));
  const restore = (habit) => habitAction(() => setHabitArchived(habit.uuid, false));

  return (
    <div className="jv2-page">
      <article className="jv2" aria-label="Journal v2">
        <div className="jv2-modes jv2-modes1" role="tablist" aria-label="Ansicht">
          {MODES.map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={mode === key} onClick={() => onModeChange(key)}>{label}</button>
          ))}
        </div>
        <div className="jv2-modes" role="group" aria-label="Habits und Sprünge">
          <button type="button" aria-pressed={mode === "habits"} onClick={() => onModeChange("habits")}>Habits</button>
          {LINKS.map(([href, label]) => onNavigateJournal
            ? <button key={href} type="button" onClick={() => onNavigateJournal(href === "#door2" ? "door-v2" : "game-v2")}>{label}</button>
            : <a key={href} href={href}>{label}</a>)}
        </div>
        {mode !== "tag" && head && (
          <div className="jv2-top">
            <div className="jv2-dayno jv2-rangeno">{head.no}</div>
            <div className="jv2-meta">
              <span className="jv2-kw">{head.kw}</span>
              <span>
                <b>{head.title}</b>
                <br />
                {head.sub}
              </span>
              <span className="jv2-nav">
                <button type="button" onClick={() => shift(-1)} aria-label="Zurück">←</button>
                <button type="button" onClick={() => onDateChange(iso(new Date()))}>Heute</button>
                <button type="button" onClick={() => shift(1)} aria-label="Weiter">→</button>
              </span>
            </div>
          </div>
        )}
        {mode === "woche" && <WeekView day={day} entries={range.data || []} habits={habitList} events={eventsByDate} onPick={pick} />}
        {mode === "habits" && uid && <HabitsView date={date} today={db.localToday()} habits={habits.data || []} onToggle={toggleHabit} onAdd={addNew} onUpdate={editHabit} onArchive={archive} onRestore={restore} pending={habitPending} loading={habits.isPending} error={habits.isError && !habits.data ? "Habits konnten nicht geladen werden." : ""} onRetry={() => { habitMutation.reset(); habits.refetch(); }} />}
        {mode === "jahr" && <YearView day={day} entries={range.data || []} onPick={pick} onPickMonth={(d) => { onDateChange(d); onModeChange("monat"); }} />}
        {mode === "monat" && <MonthView day={day} entries={range.data || []} habits={habitList} events={eventsByDate} onPick={pick} />}
        {!uid && mode !== "tag" && (
          <div className="jv2-empty">
            Nicht angemeldet. <button type="button" className="jv2-link" onClick={() => db.signIn()}>Cloud Login</button>
          </div>
        )}
        {mode === "tag" && <>
        <div className="jv2-top">
          <div className="jv2-dayno">{format(day, "dd")}</div>
          <div className="jv2-meta">
            <span className="jv2-kw">KW {getISOWeek(day)}</span>
            <span>
              <b>{format(day, "EEEE", { locale: de })}</b>
              <br />
              {format(day, "MMMM yyyy", { locale: de })}
              <br />
              Tag {getDayOfYear(day)}/{isLeapYear(day) ? 366 : 365}
            </span>
            <span className="jv2-nav">
              <button type="button" onClick={() => shift(-1)} aria-label="Vorheriger Tag">←</button>
              <button type="button" onClick={() => onDateChange(format(new Date(), "yyyy-MM-dd"))}>Heute</button>
              <button type="button" onClick={() => shift(1)} aria-label="Nächster Tag">→</button>
            </span>
          </div>
        </div>

        {habitList.length > 0 && (
          <div className="jv2-habits">
            {habitList.map((h) => {
              const done = h.hasRecord(date);
              return (
                <button key={h.uuid} type="button" className={done ? "done" : ""} aria-pressed={done} disabled={habitPending || date > db.localToday()} onClick={() => toggleHabit(h)}>
                  <i>{done ? "✓" : ""}</i>
                  <span>{h.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {!uid && (
          <div className="jv2-empty">
            Nicht angemeldet. <button type="button" className="jv2-link" onClick={() => db.signIn()}>Cloud Login</button>
          </div>
        )}
        {evList.map((ev) => {
          const reviewed = list.some((e) => (e.tags || []).includes("termin") && e.text.startsWith(ev.title));
          return (
            <div key={ev.id} className="jv2-entry jv2-event">
              <time>{ev.allDay ? "ganztg." : ev.time}</time>
              <div className="jv2-body">
                <h3>{ev.title}</h3>
                {ev.location && <p>{ev.location}</p>}
                <span className="jv2-tag">{ev.calendar}</span>
                {reviewed ? (
                  <span className="jv2-tag jv2-reviewed">✓ reviewt</span>
                ) : (
                  <button type="button" className="jv2-review" onClick={() => review(ev)}>Rückblick →</button>
                )}
              </div>
            </div>
          );
        })}
        {uid && entries.isLoading && <div className="jv2-empty">Lade …</div>}
        {uid && !entries.isLoading && list.length === 0 && <div className="jv2-empty">Noch kein Eintrag für diesen Tag.</div>}

        {list.map((e) => {
          const { title, body } = splitEntry(e.text);
          const tags = e.tags || [];
          return (
            <div key={e.id} className={`jv2-entry${tags.includes("offen") ? " open" : ""}`}>
              <button type="button" className="jv2-thandle" {...timeline.handleProps(e)} aria-label={`Uhrzeit ${hhmm(minutesOf(e))}: ziehen oder Pfeiltasten hoch/runter verschiebt den Eintrag`}>{hhmm(minutesOf(e))}</button>
              {edit?.id === e.id ? (
                <div className="jv2-body jv2-edit">
                  <textarea
                    autoFocus rows={4} aria-label="Eintrag bearbeiten" value={edit.text}
                    onChange={(ev) => { draftStore().set(editKey(edit.id), ev.target.value); setEdit({ ...edit, text: ev.target.value, err: "" }); }}
                    onKeyDown={(ev) => {
                      if (ev.key === "Escape") closeEdit(edit.id);
                      else if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); saveEdit(e); }
                    }}
                  />
                  {edit.err && <div role="alert" className="jv2-eerr">{edit.err}</div>}
                  <div className="jv2-eact">
                    <button type="button" onClick={() => saveEdit(e)} disabled={busy || !edit.text.trim()}>Speichern</button>
                    <button type="button" className="ghost" onClick={() => closeEdit(edit.id)}>Abbrechen</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="jv2-body">
                    {title && <h3>{title}</h3>}
                    {body && <p>{body}</p>}
                    {e.smartLog?.applied?.planner_suggestions?.length > 0 && <div className="jv2-smart-archived"><b>Google-Kalender-Vorschläge</b>{e.smartLog.applied.planner_suggestions.map((task, index) => { const event = e.smartLog.applied.planner_events?.find((created) => created.title === task.title && created.date === task.date); return <p key={`${e.id}-planner-${index}`}>{task.date || "Datum offen"}{task.time ? ` · ${task.time}` : ""} · {task.title}{event?.htmlLink ? <> · <a href={event.htmlLink} target="_blank" rel="noreferrer">Kalender öffnen ↗</a></> : null}</p>; })}</div>}
                    {e.smartLog?.status && e.smartLog.status !== "applied" && <div className="jv2-smart-archived"><small>Smart Log: {e.smartLog.status === "partial" ? "teilweise übernommen" : "Übernahme wurde unterbrochen"}</small>{smartAnalysisForRetry(e) && <button type="button" className="jv2-link" disabled={busy} onClick={() => resumeSmartEntry(e)}>Offene Schritte prüfen</button>}</div>}
                    {tags.map((t) => <span key={t} className="jv2-tag">{t}</span>)}
                    {onStartVoice && <div><button type="button" className="jv2-review" onClick={() => onStartVoice({ id: e.id, date: e.date || date, text: e.text })}>Mit The Voice reflektieren →</button></div>}
                  </div>
                  <button type="button" className="jv2-editbtn" aria-label="Eintrag bearbeiten" onClick={() => startEdit(e)}>✎</button>
                  <button type="button" className="jv2-del" aria-label="Eintrag löschen" onClick={() => remove(e.id)}>×</button>
                </>
              )}
            </div>
          );
        })}

        {smart && analysis && previewGeneration === account.current.generation && (
          <div className="jv2-smart" aria-label="Vorschau der Analyse">
            <h4>Vorschau · vor dem Speichern korrigieren</h4>
            <p className="jv2-sline"><b>Original · {analysisDate || date}</b>{analysis.original_text}</p>
            {retryLocked && <p className="jv2-smart-disclosure">Die Übernahme wurde bereits begonnen. Ändere Tracker-Einträge direkt im jeweiligen Tracker; offene Kalenderangaben kannst du hier ergänzen.</p>}
            <fieldset className="jv2-smart-locked-group" disabled={retryLocked}>
            <legend className="jv2-visually-hidden">Tracker-Vorschläge</legend>
            {analysis.journal_entry && <label className="jv2-smart-field"><b>Journal-Zusammenfassung</b><textarea rows={2} value={analysis.journal_entry} onChange={(event) => editAnalysis({ journal_entry: event.target.value })} /></label>}
            {analysis.meals.map((m, i) => <fieldset className="jv2-smart-meal" key={`${analysis.request_id}-meal-${i}`}>
              <legend>Mahlzeit {i + 1}</legend>
              <label>Art<select value={m.type} onChange={(event) => editMeal(i, { type: event.target.value })}>{[["breakfast", "Frühstück"], ["lunch", "Mittagessen"], ["dinner", "Abendessen"], ["snack", "Snack"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label>Beschreibung<input value={m.description} onChange={(event) => editMeal(i, { description: event.target.value })} /></label>
              <label>Uhrzeit<input type="time" value={m.time || ""} onChange={(event) => editMeal(i, { time: event.target.value || null })} /></label>
              <div className="jv2-smart-macros">{[["kcal", "kcal", 10000], ["protein", "Protein g", 1500], ["carbs", "Kohlenhydrate g", 2000], ["fat", "Fett g", 1500]].map(([field, label, max]) => <label key={field}>{label}<input type="number" min="0" max={max} step="any" value={m[field] ?? ""} placeholder="unbekannt" onChange={(event) => editMeal(i, { [field]: event.target.value === "" ? null : Number(event.target.value) })} /><span><input type="checkbox" checked={m.estimated_fields.includes(field)} onChange={(event) => editMeal(i, { estimated_fields: event.target.checked ? [...new Set([...m.estimated_fields, field])] : m.estimated_fields.filter((name) => name !== field) })} /> geschätzt</span></label>)}</div>
              <label>Notiz<input value={m.notes} onChange={(event) => editMeal(i, { notes: event.target.value })} /></label>
            </fieldset>)}
            <label className="jv2-smart-field"><b>Wasser · zusätzliche Menge</b><input type="number" min="0" max="20000" step="1" value={analysis.water_ml} onChange={(event) => editAnalysis({ water_ml: event.target.value === "" ? 0 : Number(event.target.value) })} /> ml</label>
            {(analysis.fitness_sessions || []).map((session, i) => <fieldset className="jv2-smart-meal" key={`${analysis.request_id}-fitness-${i}`}><legend>Fitness · Session {i + 1}</legend><label>Typ<select value={session.activity_type} onChange={(event) => editAnalysisList("fitness_sessions", i, { activity_type: event.target.value })}>{[["strength", "Krafttraining"], ["hiit", "HIIT"], ["running", "Laufen"], ["walking", "Spazieren"], ["cycling", "Radfahren"], ["rowing", "Rudern"], ["swimming", "Schwimmen"], ["hiking", "Wandern"], ["climbing", "Klettern"], ["yoga", "Yoga"], ["stretching", "Stretching"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Datum<input type="date" value={session.date || date} onChange={(event) => editAnalysisList("fitness_sessions", i, { date: event.target.value || date })} /></label><label>Dauer (Minuten)<input type="number" min="1" max="1440" value={session.duration_minutes ?? ""} onChange={(event) => editAnalysisList("fitness_sessions", i, { duration_minutes: event.target.value ? Number(event.target.value) : null })} /></label><label>Uhrzeit<input type="time" value={session.time || ""} onChange={(event) => editAnalysisList("fitness_sessions", i, { time: event.target.value || null })} /></label><label>Notiz<input value={session.notes} onChange={(event) => editAnalysisList("fitness_sessions", i, { notes: event.target.value })} /></label><button type="button" className="jv2-smart-remove" onClick={() => editAnalysis({ fitness_sessions: analysis.fitness_sessions.filter((_, index) => index !== i) })}>Entfernen</button></fieldset>)}
            {(analysis.relax_sessions || []).map((session, i) => <fieldset className="jv2-smart-meal" key={`${analysis.request_id}-relax-${i}`}><legend>Relax · Praxis {i + 1}</legend><label>Praxis<input value={session.technique} onChange={(event) => editAnalysisList("relax_sessions", i, { technique: event.target.value })} /></label><label>Datum<input type="date" value={session.date || date} onChange={(event) => editAnalysisList("relax_sessions", i, { date: event.target.value || date })} /></label><label>Dauer (Minuten)<input type="number" min="1" max="1440" value={session.minutes ?? ""} onChange={(event) => editAnalysisList("relax_sessions", i, { minutes: event.target.value ? Number(event.target.value) : null })} /></label><label>Notiz<input value={session.note} onChange={(event) => editAnalysisList("relax_sessions", i, { note: event.target.value })} /></label><button type="button" className="jv2-smart-remove" onClick={() => editAnalysis({ relax_sessions: analysis.relax_sessions.filter((_, index) => index !== i) })}>Entfernen</button></fieldset>)}
            </fieldset>
            {(analysis.planner_tasks || []).map((task, i) => <fieldset className="jv2-smart-meal" disabled={retryLocked && !editablePlannerIndexes.includes(i)} key={`${analysis.request_id}-planner-${i}`}><legend>Google Kalender · Termin {i + 1}</legend><label>Aufgabe<input value={task.title} onChange={(event) => editAnalysisList("planner_tasks", i, { title: event.target.value })} /></label><label>Datum<input type="date" value={task.date || ""} onChange={(event) => editAnalysisList("planner_tasks", i, { date: event.target.value || null })} /></label><label>Uhrzeit<input type="time" value={task.time || ""} onChange={(event) => editAnalysisList("planner_tasks", i, { time: event.target.value || null })} /></label>{task.time && <label>Dauer (Minuten)<input type="number" min="1" max="1440" value={task.duration_minutes ?? ""} placeholder="Bitte angeben" onChange={(event) => editAnalysisList("planner_tasks", i, { duration_minutes: event.target.value ? Number(event.target.value) : null })} /></label>}<label>Notiz<input value={task.notes} onChange={(event) => editAnalysisList("planner_tasks", i, { notes: event.target.value })} /></label><small>Es wird ein privater Termin im primären Google Kalender angelegt. Bei einer Uhrzeit ist eine Dauer nötig; ohne Uhrzeit wird ein ganztägiger Termin erstellt.</small>{plannerPending.some((pending) => (pending.index === i || (pending.index == null && editablePlannerIndexes.includes(i))) && ["google_calendar_permission_required", "google-expired", "google-offline"].includes(pending.reason)) && <button type="button" className="jv2-link" onClick={() => google.connect().catch((error) => setSmartMsg(googleErrorText(error)))}>Google Kalender verbinden / Berechtigung aktualisieren</button>}<button type="button" className="jv2-smart-remove" disabled={retryLocked} onClick={() => editAnalysis({ planner_tasks: analysis.planner_tasks.filter((_, index) => index !== i) })}>Entfernen</button></fieldset>)}
            <fieldset className="jv2-smart-locked-group" disabled={retryLocked}>
            <legend className="jv2-visually-hidden">Habit-Vorschläge</legend>
            {analysis.habits_done.map((h, i) => {
              const known = allHabits.some((x) => String(x.name || "").trim().toLowerCase() === h.name.toLowerCase());
              return <div className="jv2-smart-habit" key={`${analysis.request_id}-habit-${i}`}><label><b>Habit</b><input value={h.name} onChange={(event) => editAnalysisHabit(i, { name: event.target.value })} />{!known && <small>Unbekannt — wird nur übernommen, wenn der Name einem vorhandenen Habit entspricht.</small>}</label><label><b>Beleg</b><input value={h.evidence} onChange={(event) => editAnalysisHabit(i, { evidence: event.target.value })} /></label><button type="button" className="jv2-smart-remove" onClick={() => editAnalysis({ habits_done: analysis.habits_done.filter((_, index) => index !== i) })}>Entfernen</button></div>;
            })}
            </fieldset>
            <div className="jv2-sact">
              <button type="button" onClick={applyAnalysis} disabled={busy}>Übernehmen</button>
              <button type="button" className="ghost" onClick={() => { setAnalysis(null); setAnalysisDate(null); setPlannerPending([]); setRetryLocked(false); setEditablePlannerIndexes([]); setResumeDate(null); }}>Schließen</button>
            </div>
          </div>
        )}
        {smartMsg && <div className="jv2-empty" role="status">{smartMsg}</div>}

        {smart && <p className="jv2-smart-disclosure">Mit „Analyse“ werden dein Text, Datum, Tags und Habit-Namen über den VitalOS-Server an Gemini gesendet. Es wird nichts automatisch analysiert; du prüfst die Vorschläge vor der Übernahme.</p>}

        <form className={`jv2-compose${smart ? " smart" : ""}`} onSubmit={submit}>
          <button type="button" className={`jv2-smarttoggle${smart ? " on" : ""}`} aria-pressed={smart} onClick={toggleSmart} title="Smart Logger: Freitext in Journal, Mahlzeiten, Wasser und Habits zerlegen">✦</button>
          {smart ? (
            <textarea
              id="jv2-input"
              ref={inputRef}
              aria-label="Freitext für Smart Logger"
              rows={3}
              placeholder="Dein Tag in eigenen Worten: 2 Eier und Kaffee, 2 l Wasser, 30 Min Lesen …"
              value={draft}
              onChange={(e) => { changeDraft(e.target.value); setAnalysis(null); setAnalysisDate(null); setPlannerPending([]); setRetryLocked(false); setEditablePlannerIndexes([]); setResumeDate(null); }}
              disabled={!uid || busy}
            />
          ) : (
            <input
              id="jv2-input"
              ref={inputRef}
              aria-label="Neuer Eintrag"
              placeholder="Neuer Eintrag … (+tag)"
              value={draft}
              onChange={(e) => changeDraft(e.target.value)}
              disabled={!uid || busy}
            />
          )}
          <button type="submit" disabled={!uid || busy || !draft.trim()}>{smart ? (busy && !analysis ? "…" : "Analyse") : "Log"}</button>
        </form>
        {smart && !analysis && uid && draft.trim() && <button type="button" className="jv2-link" onClick={saveDraftWithoutAI} disabled={busy}>Ohne KI im Journal speichern</button>}

        </>}

        {(calMsg || google.error) && <div className="jv2-empty" role="alert">{calMsg || google.error}</div>}
        <div className="jv2-foot">
          <span>Journal v2 · Raster</span>
          {uid && (calOn
            ? <>
                <button type="button" className="jv2-link" onClick={toggleCalAll}>{calAll ? "Nur Fire Map" : "Alle Kalender"}</button>
                <button type="button" className="jv2-link" onClick={disconnect}>Kalender trennen</button>
                {google.mode === "popup" && <span>Verbindung ca. 1 h</span>}
              </>
            : <button type="button" className="jv2-link" disabled={google.busy} onClick={connect}>Kalender verbinden</button>)}
          <a href="#door2" onClick={(event) => { if (onNavigateJournal) { event.preventDefault(); onNavigateJournal("door-v2"); } }}>Door →</a>
          <a href="#journal" onClick={(event) => { if (onNavigateJournal) { event.preventDefault(); onNavigateJournal("journal"); } }}>← v1</a>
        </div>
      </article>
      <TimelineOverlay
        drag={timeline.drag}
        hover={timeline.hover}
        grain={grain}
        entries={list}
        minutesOf={minutesOf}
        title={timeline.drag ? splitEntry(timeline.drag.entry.text).title || String(timeline.drag.entry.text || "").slice(0, 28) : ""}
      />
    </div>
  );
}
