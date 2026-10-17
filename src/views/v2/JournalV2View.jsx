// JournalV2View — Journal v2 im Design "Raster" (Schweizer Logbuch).
// Erreichbar über den Hash #v2 bzw. #v2/<yyyy-mm-dd|today> (siehe main.jsx).
// Nutzt dieselben Datenquellen wie die v1-Timeline (@journal-db), schreibt
// aber nur: Journal-Einträge (addDoc) und Habit-Records (recordHabit).
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, addMonths, addWeeks, format, getDayOfYear, getISOWeek, isLeapYear, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import * as db from "@journal-db";
// Journal-CRUD direkt aus journal-dev: @journal-db liefert dafür evtl. die
// fitness-dev-Variante (andere saveJournal-Signatur, kein getJournalRange).
import { getJournal, getJournalRange, saveJournal, deleteJournal, setJournalTime } from "../../lib/db/journal.js";
import { MonthView, WeekView, rangeFor } from "./JournalV2Range.jsx";
import HabitsView from "./JournalV2Habits.jsx";
import { TimelineOverlay, useTimelineDrag, hhmm } from "./TimelineDrag.jsx";
import { analyzeSmartJournal } from "../../lib/smartJournalLogger.js";
import { applySmartAnalysis } from "../../lib/smartJournalApply.js";
import { addHabit, archiveHabit } from "./habitsDb.js";
import { extractTags, timeStr } from "../../components/Journal/journalUtils";
import { calendarConnected, clearCalendarToken, connectCalendar, fetchEvents } from "./gcal.js";
import "./journal-v2.css";

const HABIT_LIMIT = 5;
const iso = (d) => format(d, "yyyy-MM-dd");

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

const MODES = [["tag", "Tag"], ["woche", "Woche"], ["monat", "Monat"], ["habits", "Habits"]];

export default function JournalV2View({ date, onDateChange, user, mode = "tag", onModeChange = () => {} }) {
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
  const [draft, setDraft] = useState("");
  // Timeline-Raster (Drag auf die versteckte Timeline): 60 / 30 / 15 Minuten
  const [grain, setGrainState] = useState(() => {
    try { return [60, 30, 15].includes(Number(localStorage.getItem("jv2:grain"))) ? Number(localStorage.getItem("jv2:grain")) : 30; } catch { return 30; }
  });
  const setGrain = (g) => {
    setGrainState(g);
    try { localStorage.setItem("jv2:grain", String(g)); } catch {}
  };
  // Smart Logger: Freitext → Vertex-Analyse → Vorschau → Übernehmen (Journal, Mahlzeiten, Wasser, Habits)
  const [smart, setSmart] = useState(() => {
    try { return localStorage.getItem("jv2:smart") === "1"; } catch { return false; }
  });
  const [analysis, setAnalysis] = useState(null);
  const [smartMsg, setSmartMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const day = parseISO(date);
  const uid = user?.uid ?? null;

  const entries = useQuery({
    queryKey: ["jv2-entries", uid, date],
    enabled: !!uid,
    queryFn: async () => {
      const list = await getJournal(date);
      return [...list].sort(byMinutes);
    },
  });

  const habits = useQuery({
    queryKey: ["jv2-habits", uid],
    enabled: !!uid,
    queryFn: async () => {
      try {
        const all = await db.getHabits(120);
        return all.filter((h) => !h.deleted);
      } catch {
        return [];
      }
    },
  });

  const [rangeFrom, rangeTo] = rangeFor(mode === "monat" ? "monat" : "woche", day);
  const rangeKey = [iso(rangeFrom), iso(rangeTo)];
  const range = useQuery({
    queryKey: ["jv2-range", uid, ...rangeKey],
    enabled: !!uid && (mode === "woche" || mode === "monat"),
    queryFn: () => getJournalRange(rangeKey[0], rangeKey[1]),
  });

  // Google Calendar (nur lesen): Termine zum Reviewen, Token nur in sessionStorage
  const [calOn, setCalOn] = useState(() => calendarConnected());
  const [calMsg, setCalMsg] = useState("");
  const inputRef = useRef(null);
  const evFrom = mode === "tag" ? day : rangeFrom;
  const evTo = mode === "tag" ? day : rangeTo;
  const events = useQuery({
    queryKey: ["jv2-cal", uid, iso(evFrom), iso(evTo)],
    enabled: !!uid && calOn && mode !== "habits",
    retry: false,
    queryFn: async () => {
      try {
        return await fetchEvents(evFrom, evTo);
      } catch (error) {
        if (error.message === "calendar-expired") {
          setCalOn(false);
          setCalMsg("Kalender-Zugriff abgelaufen. Bitte neu verbinden.");
          return [];
        }
        setCalMsg(error.message);
        return [];
      }
    },
  });
  const connect = async () => {
    setCalMsg("");
    try {
      await connectCalendar();
      setCalOn(true);
      qc.invalidateQueries({ queryKey: ["jv2-cal"] });
    } catch (error) {
      setCalMsg(error.code === "auth/popup-closed-by-user" ? "" : error.message);
    }
  };
  const disconnect = () => { clearCalendarToken(); setCalOn(false); };
  // Review: Termin als Journal-Eintrag beginnen (Tag +termin, Titel vorbelegt)
  const review = (ev) => {
    setDraft(`+termin ${ev.title}: `);
    inputRef.current?.focus();
  };
  const evList = events.data || [];
  const eventsByDate = new Map();
  evList.forEach((ev) => eventsByDate.set(ev.date, [...(eventsByDate.get(ev.date) || []), ev]));

  const habitKey = ["jv2-habits", uid];
  const toggleHabit = async (habit) => {
    const done = habit.hasRecord(date);
    // optimistisch: records lokal anpassen, dann schreiben
    qc.setQueryData(habitKey, (prev = []) =>
      prev.map((h) => {
        if (h.uuid !== habit.uuid) return h;
        const records = done
          ? h.records.filter((r) => r.date !== date)
          : [...h.records, { habitId: h.uuid, date, completion: "DONE" }];
        return { ...h, records, hasRecord: (d) => records.some((r) => r.date === d && r.completion === "DONE") };
      }),
    );
    try {
      await (done ? db.unrecordHabit(habit.uuid, date) : db.recordHabit(habit.uuid, date));
    } catch (error) {
      console.error("Habit toggle failed:", error);
      qc.invalidateQueries({ queryKey: habitKey });
    }
  };

  const toggleSmart = () => {
    const next = !smart;
    setSmart(next);
    setAnalysis(null);
    setSmartMsg("");
    try { localStorage.setItem("jv2:smart", next ? "1" : "0"); } catch {}
  };

  const analyze = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true);
    setSmartMsg("");
    try {
      setAnalysis(await analyzeSmartJournal({ text: draft.trim(), habits: allHabits }));
    } catch (error) {
      console.error("Smart-Analyse fehlgeschlagen:", error);
      setSmartMsg(error?.message === "vertex_ai_unavailable" ? "Vertex AI ist hier nicht verfügbar." : (error?.message || "Analyse fehlgeschlagen."));
    } finally {
      setBusy(false);
    }
  };

  const applyAnalysis = async () => {
    if (!analysis || busy) return;
    setBusy(true);
    setSmartMsg("");
    try {
      const res = await applySmartAnalysis({ date, analysis, habits: allHabits });
      setAnalysis(null);
      setDraft("");
      const parts = [res.journal && "Eintrag", res.meals && `${res.meals} Mahlzeit${res.meals > 1 ? "en" : ""}`, res.water_ml && `${res.water_ml} ml Wasser`, res.habits.length && `${res.habits.length} Habit${res.habits.length > 1 ? "s" : ""}`].filter(Boolean);
      setSmartMsg(`Übernommen: ${parts.join(", ") || "nichts"}.`);
      qc.invalidateQueries({ queryKey: ["jv2-entries", uid, date] });
      qc.invalidateQueries({ queryKey: ["jv2-habits", uid] });
    } catch (error) {
      console.error("Smart-Übernahme fehlgeschlagen:", error);
      setSmartMsg(error?.message || "Übernahme fehlgeschlagen.");
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

  const remove = async (id) => {
    await deleteJournal(id);
    qc.invalidateQueries({ queryKey: ["jv2-entries", uid, date] });
  };

  const shift = (n) => {
    const next = mode === "monat" ? addMonths(day, n) : mode === "woche" ? addWeeks(day, n) : mode === "habits" ? addDays(day, 7 * n) : addDays(day, n);
    onDateChange(iso(next));
  };
  const pick = (d) => { onDateChange(d); onModeChange("tag"); };
  const list = entries.data || [];
  const allHabits = habits.data || [];
  const habitList = allHabits.slice(0, HABIT_LIMIT); // Streifen in Tag/Woche/Monat
  const doneToday = allHabits.filter((h) => h.hasRecord(date)).length;
  const addNew = async (name) => {
    try {
      await addHabit(name);
      await qc.invalidateQueries({ queryKey: ["jv2-habits", uid] });
    } catch (error) {
      console.error("Habit anlegen fehlgeschlagen:", error);
    }
  };
  const archive = async (habit) => {
    qc.setQueryData(["jv2-habits", uid], (prev = []) => prev.filter((h) => h.uuid !== habit.uuid));
    try {
      await archiveHabit(habit.uuid);
    } catch (error) {
      console.error("Habit archivieren fehlgeschlagen:", error);
      qc.invalidateQueries({ queryKey: ["jv2-habits", uid] });
    }
  };

  return (
    <div className="jv2-page">
      <article className="jv2" aria-label="Journal v2">
        <div className="jv2-modes" role="tablist" aria-label="Ansicht">
          {MODES.map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={mode === key} onClick={() => onModeChange(key)}>{label}</button>
          ))}
        </div>
        {mode !== "tag" && (
          <div className="jv2-top">
            <div className="jv2-dayno jv2-rangeno">{mode === "woche" ? getISOWeek(day) : mode === "habits" ? `${doneToday}/${allHabits.length}` : format(day, "MM")}</div>
            <div className="jv2-meta">
              <span className="jv2-kw">{mode === "woche" ? "KW" : mode === "habits" ? "Habits" : "Monat"}</span>
              <span>
                <b>{mode === "woche" ? `${format(rangeFrom, "d. MMM", { locale: de })} – ${format(rangeTo, "d. MMM", { locale: de })}` : mode === "habits" ? format(day, "EEE d. MMM", { locale: de }) : format(day, "MMMM", { locale: de })}</b>
                <br />
                {mode === "habits" ? "letzte 28 Tage" : format(mode === "woche" ? rangeFrom : day, "yyyy")}
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
        {mode === "habits" && uid && <HabitsView date={date} habits={allHabits} onToggle={toggleHabit} onAdd={addNew} onArchive={archive} />}
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
                <button key={h.uuid} type="button" className={done ? "done" : ""} aria-pressed={done} onClick={() => toggleHabit(h)}>
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
              <div className="jv2-body">
                {title && <h3>{title}</h3>}
                {body && <p>{body}</p>}
                {tags.map((t) => <span key={t} className="jv2-tag">{t}</span>)}
              </div>
              <button type="button" className="jv2-del" aria-label="Eintrag löschen" onClick={() => remove(e.id)}>×</button>
            </div>
          );
        })}

        {smart && analysis && (
          <div className="jv2-smart" aria-label="Vorschau der Analyse">
            <h4>Vorschau</h4>
            <p className="jv2-sline"><b>Eintrag</b>{analysis.journal_entry || "—"}</p>
            {analysis.meals.map((m, i) => (
              <p className="jv2-sline" key={i}><b>{m.type}</b>{m.description} · {Math.round(m.kcal)} kcal · P{Math.round(m.protein)} K{Math.round(m.carbs)} F{Math.round(m.fat)}</p>
            ))}
            {analysis.water_ml > 0 && <p className="jv2-sline"><b>Wasser</b>{analysis.water_ml} ml</p>}
            {analysis.habits_done.map((h, i) => {
              const known = allHabits.some((x) => String(x.name || "").trim().toLowerCase() === h.name.toLowerCase());
              return <p className="jv2-sline" key={i}><b>Habit</b>{h.name}{known ? "" : " (unbekannt, wird übersprungen)"}</p>;
            })}
            <div className="jv2-sact">
              <button type="button" onClick={applyAnalysis} disabled={busy}>Übernehmen</button>
              <button type="button" className="ghost" onClick={() => setAnalysis(null)}>Verwerfen</button>
            </div>
          </div>
        )}
        {smartMsg && <div className="jv2-empty" role="status">{smartMsg}</div>}

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
              onChange={(e) => { setDraft(e.target.value); setAnalysis(null); }}
              disabled={!uid}
            />
          ) : (
            <input
              id="jv2-input"
              ref={inputRef}
              aria-label="Neuer Eintrag"
              placeholder="Neuer Eintrag … (+tag)"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={!uid}
            />
          )}
          <button type="submit" disabled={!uid || busy || !draft.trim()}>{smart ? (busy && !analysis ? "…" : "Analyse") : "Log"}</button>
        </form>

        </>}

        {calMsg && <div className="jv2-empty" role="alert">{calMsg}</div>}
        <div className="jv2-foot">
          <span>Journal v2 · Raster</span>
          {uid && (calOn
            ? <button type="button" className="jv2-link" onClick={disconnect}>Kalender trennen</button>
            : <button type="button" className="jv2-link" onClick={connect}>Kalender verbinden</button>)}
          <a href="#door2">Door →</a>
          <a href="#journal">← v1</a>
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
