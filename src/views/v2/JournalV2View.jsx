// JournalV2View — Journal v2 im Design "Raster" (Schweizer Logbuch).
// Erreichbar über den Hash #v2 bzw. #v2/<yyyy-mm-dd|today> (siehe main.jsx).
// Nutzt dieselben Datenquellen wie die v1-Timeline (@journal-db), schreibt
// aber nur: Journal-Einträge (addDoc) und Habit-Records (recordHabit).
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, addMonths, addWeeks, format, getDayOfYear, getISOWeek, isLeapYear, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import * as db from "@journal-db";
// Journal-CRUD direkt aus journal-dev: @journal-db liefert dafür evtl. die
// fitness-dev-Variante (andere saveJournal-Signatur, kein getJournalRange).
import { getJournal, getJournalRange, saveJournal, deleteJournal } from "../../lib/db/journal.js";
import { MonthView, WeekView, rangeFor } from "./JournalV2Range.jsx";
import { extractTags, timeStr } from "../../components/Journal/journalUtils";
import { calendarConnected, clearCalendarToken, connectCalendar, fetchEvents } from "./gcal.js";
import "./journal-v2.css";

const HABIT_LIMIT = 5;
const iso = (d) => format(d, "yyyy-MM-dd");

function splitEntry(text) {
  const [first, ...rest] = String(text || "").split("\n");
  if (rest.length && first.length <= 40) return { title: first, body: rest.join("\n").trim() };
  return { title: null, body: text };
}

const MODES = [["tag", "Tag"], ["woche", "Woche"], ["monat", "Monat"]];

export default function JournalV2View({ date, onDateChange, user, mode = "tag", onModeChange = () => {} }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const day = parseISO(date);
  const uid = user?.uid ?? null;

  const entries = useQuery({
    queryKey: ["jv2-entries", uid, date],
    enabled: !!uid,
    queryFn: async () => {
      const list = await getJournal(date);
      return [...list].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    },
  });

  const habits = useQuery({
    queryKey: ["jv2-habits", uid],
    enabled: !!uid,
    queryFn: async () => {
      try {
        const all = await db.getHabits(120);
        return all.filter((h) => !h.deleted).slice(0, HABIT_LIMIT);
      } catch {
        return [];
      }
    },
  });

  const [rangeFrom, rangeTo] = rangeFor(mode === "monat" ? "monat" : "woche", day);
  const rangeKey = [iso(rangeFrom), iso(rangeTo)];
  const range = useQuery({
    queryKey: ["jv2-range", uid, ...rangeKey],
    enabled: !!uid && mode !== "tag",
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
    enabled: !!uid && calOn,
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

  const submit = async (event) => {
    event.preventDefault();
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

  const remove = async (id) => {
    await deleteJournal(id);
    qc.invalidateQueries({ queryKey: ["jv2-entries", uid, date] });
  };

  const shift = (n) => {
    const next = mode === "monat" ? addMonths(day, n) : mode === "woche" ? addWeeks(day, n) : addDays(day, n);
    onDateChange(iso(next));
  };
  const pick = (d) => { onDateChange(d); onModeChange("tag"); };
  const list = entries.data || [];
  const habitList = habits.data || [];

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
            <div className="jv2-dayno jv2-rangeno">{mode === "woche" ? getISOWeek(day) : format(day, "MM")}</div>
            <div className="jv2-meta">
              <span className="jv2-kw">{mode === "woche" ? "KW" : "Monat"}</span>
              <span>
                <b>{mode === "woche" ? `${format(rangeFrom, "d. MMM", { locale: de })} – ${format(rangeTo, "d. MMM", { locale: de })}` : format(day, "MMMM", { locale: de })}</b>
                <br />
                {format(mode === "woche" ? rangeFrom : day, "yyyy")}
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
              <time>{timeStr(e)}</time>
              <div className="jv2-body">
                {title && <h3>{title}</h3>}
                {body && <p>{body}</p>}
                {tags.map((t) => <span key={t} className="jv2-tag">{t}</span>)}
              </div>
              <button type="button" className="jv2-del" aria-label="Eintrag löschen" onClick={() => remove(e.id)}>×</button>
            </div>
          );
        })}

        <form className="jv2-compose" onSubmit={submit}>
          <input
            id="jv2-input"
            ref={inputRef}
            aria-label="Neuer Eintrag"
            placeholder="Neuer Eintrag … (+tag)"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!uid}
          />
          <button type="submit" disabled={!uid || busy || !draft.trim()}>Log</button>
        </form>

        </>}

        {calMsg && <div className="jv2-empty" role="alert">{calMsg}</div>}
        <div className="jv2-foot">
          <span>Journal v2 · Raster</span>
          {uid && (calOn
            ? <button type="button" className="jv2-link" onClick={disconnect}>Kalender trennen</button>
            : <button type="button" className="jv2-link" onClick={connect}>Kalender verbinden</button>)}
          <a href="#journal">← v1</a>
        </div>
      </article>
    </div>
  );
}
