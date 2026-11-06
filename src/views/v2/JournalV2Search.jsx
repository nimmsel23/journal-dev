// JournalV2Search — Suche-Ansicht für Journal v2 (p2-timeline, Scope Zeile 6):
// Freitextsuche über Einträge, `+tag`-Token filtert nach Tags (z. B. +fuel =
// Skill-Journal Ernährung), Zeitfenster begrenzt den durchsuchten Zeitraum.
// Nur-Lese-Ansicht; Ergebnisse sind verlustfrei gekürzte Treffer, der
// Original-Eintrag bleibt unverändert, ein Klick springt in die Tag-Ansicht.
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { getJournalHistory, getJournalRange } from "../../lib/db/journal.js";
import { excerptFor, parseSearchQuery, searchEntries } from "../../lib/journalSearch.js";

const iso = (d) => format(d, "yyyy-MM-dd");
const WINDOWS = [["30", "30 Tage"], ["90", "90 Tage"], ["365", "1 Jahr"], ["0", "Alles (bis 500)"]];

export default function SearchView({ uid, today, onPick }) {
  const [windowDays, setWindowDays] = useState("90");
  const [query, setQuery] = useState("");
  const parsed = useMemo(() => parseSearchQuery(query), [query]);

  const results = useQuery({
    queryKey: ["jv2-search", uid, windowDays, today],
    enabled: !!uid,
    staleTime: 60000,
    retry: false,
    queryFn: () => windowDays === "0"
      ? getJournalHistory(500)
      : getJournalRange(iso(addDays(parseISO(today), -(Number(windowDays) - 1))), today),
  });

  const hits = useMemo(() => searchEntries(results.data || [], parsed), [results.data, parsed]);
  const active = parsed.tags.length > 0 || parsed.words.length > 0;

  let lastDate = null;
  return (
    <div className="jv2-search">
      <div className="jv2-search-bar">
        <input
          type="search"
          value={query}
          placeholder="Suche im Journal … (+fuel, +hot … filtert nach Tags)"
          aria-label="Journal durchsuchen"
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="jv2-search-windows" role="group" aria-label="Zeitraum">
          {WINDOWS.map(([key, label]) => (
            <button key={key} type="button" aria-pressed={windowDays === key} onClick={() => setWindowDays(key)}>{label}</button>
          ))}
        </div>
      </div>
      <p className="jv2-search-hint">
        Wörter werden gemeinsam gesucht (Groß-/Kleinschreibung egal). <code>+wort</code> filtert nach Tags — z. B. <code>+fuel</code> (Ernährung), <code>+fitness</code>, <code>+relax</code>, <code>+hot</code>.
      </p>
      {results.isPending && active && <p className="jv2-search-empty">Durchsuche den Zeitraum …</p>}
      {results.isError && <p className="jv2-search-empty">Der Zeitraum konnte nicht geladen werden — offline? Der sichtbare Bereich funktioniert mit dem lokalen Cache.</p>}
      {!active && (results.data || []).length === 0 && <p className="jv2-search-empty">Keine Einträge im gewählten Zeitraum.</p>}
      {active && !results.isPending && hits.length === 0 && <p className="jv2-search-empty">Keine Treffer.</p>}
      {active && hits.length > 0 && (
        <div className="jv2-search-results">
          {hits.map((entry) => {
            const showDate = entry.date !== lastDate;
            lastDate = entry.date;
            const target = entry.date ? () => onPick(parseISO(entry.date)) : null;
            const firstLine = String(entry.text || "").split("\n")[0].slice(0, 80);
            const content = (
              <>
                <span className="jv2-search-hit-time">{entry.time || ""}</span>
                <span>
                  <b>{firstLine}</b>
                  <br />
                  {excerptFor(entry, parsed.words, 160)}
                </span>
              </>
            );
            return (
              <div key={entry.id} className="jv2-search-hit-wrap">
                {showDate && (target
                  ? <button type="button" className="jv2-search-date" onClick={target}>{format(parseISO(entry.date), "EEEE d. MMMM yyyy", { locale: de })}</button>
                  : <span className="jv2-search-date">ohne Datum</span>)}
                {target
                  ? <button type="button" className="jv2-search-hit" onClick={target}>{content}</button>
                  : <div className="jv2-search-hit">{content}</div>}
              </div>
            );
          })}
        </div>
      )}
      {active && hits.length > 0 && <p className="jv2-search-count">{hits.length} Treffer — Klick springt zum Tag.</p>}
    </div>
  );
}
