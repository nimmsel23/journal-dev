// JournalV2View — Journal v2 im Design "Raster" (Schweizer Logbuch).
// Erreichbar über den Hash #v2 bzw. #v2/<yyyy-mm-dd|today> (siehe main.jsx).
// Nutzt dieselben Datenquellen wie die v1-Timeline (@journal-db), schreibt
// aber nur: Journal-Einträge (addDoc) und Habit-Records (recordHabit).
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, format, getDayOfYear, getISOWeek, isLeapYear, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import * as db from "@journal-db";
import { extractTags, timeStr } from "../../components/Journal/journalUtils";
import "./journal-v2.css";

const HABIT_LIMIT = 5;

function splitEntry(text) {
  const [first, ...rest] = String(text || "").split("\n");
  if (rest.length && first.length <= 40) return { title: first, body: rest.join("\n").trim() };
  return { title: null, body: text };
}

export default function JournalV2View({ date, onDateChange, user }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const day = parseISO(date);
  const uid = user?.uid ?? null;

  const entries = useQuery({
    queryKey: ["jv2-entries", uid, date],
    enabled: !!uid,
    queryFn: async () => {
      const list = await db.getJournal(date);
      return [...list].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    },
  });

  const habits = useQuery({
    queryKey: ["jv2-habits", uid],
    enabled: !!uid,
    queryFn: async () => {
      try {
        const all = await db.getHabits(28);
        return all.filter((h) => !h.deleted).slice(0, HABIT_LIMIT);
      } catch {
        return [];
      }
    },
  });

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
      await db.saveJournal(date, text, { tags });
      setDraft("");
      await qc.invalidateQueries({ queryKey: ["jv2-entries", uid, date] });
    } catch (error) {
      console.error("Journal save failed:", error);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    await db.deleteJournal(id);
    qc.invalidateQueries({ queryKey: ["jv2-entries", uid, date] });
  };

  const shift = (n) => onDateChange(format(addDays(day, n), "yyyy-MM-dd"));
  const list = entries.data || [];
  const habitList = habits.data || [];

  return (
    <div className="jv2-page">
      <article className="jv2" aria-label="Journal v2">
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
            aria-label="Neuer Eintrag"
            placeholder="Neuer Eintrag … (+tag)"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!uid}
          />
          <button type="submit" disabled={!uid || busy || !draft.trim()}>Log</button>
        </form>

        <div className="jv2-foot">
          <span>Journal v2 · Raster</span>
          <a href="#journal">← v1</a>
        </div>
      </article>
    </div>
  );
}
