// TentV2View — General's Tent (Wochenabschluss) im Raster-Design, eigenständig (nicht Teil von Game).
// Ablauf wie im Tent-Pillar: Return & Report (Scores) → Lessons Learned → Course Correction → New Targets.
// Scores kommen aus Habits (Firestore) und Taskwarrior (TaskChampion-Replik); der Abschluss wird als
// Journal-Eintrag mit den Tags `tent` und `<Woche>` gespeichert (Status „Tent offen/geschlossen“ je Woche).
// Hash: #tent2 bzw. #tent2/<YYYY-MM-DD> (Datum = beliebiger Tag der Woche).
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, endOfISOWeek, format, getISOWeek, getISOWeekYear, startOfISOWeek } from "date-fns";
import * as db from "@journal-db";
import { getJournalRange, saveJournal } from "../../lib/db/journal.js";
import * as tc from "../../lib/door/taskchampion.js";
import "../door/v2/door-v2.css";
import "../game/game-v2.css";

const iso = (d) => format(d, "yyyy-MM-dd");
const weekKey = (d) => `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(2, "0")}`;
const has = (t, tag) => t[`tag_${tag}`] !== undefined;
const secs = (v) => (v ? new Date(Number(v) * 1000) : null);
const FIELDS = [
  ["lessons", "Lessons Learned", "Was habe ich diese Woche gelernt?"],
  ["correction", "Course Correction", "Was ändere ich ab sofort?"],
  ["targets", "New Targets", "Welche Ziele/Strikes setze ich für nächste Woche?"],
];
const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } };

function useScores(uid, from, to, enabled) {
  const habits = useQuery({
    queryKey: ["tv2-habits", uid], enabled: !!uid,
    queryFn: async () => { try { return (await db.getHabits(120)).filter((h) => !h.deleted); } catch { return []; } },
  });
  const tw = useQuery({
    queryKey: ["tv2-tw", uid, iso(from)], enabled,
    queryFn: async () => (await tc.getConfig()) ? tc.tasks() : null,
  });
  const days = Array.from({ length: 7 }, (_, i) => iso(addDays(from, i)));
  const hs = habits.data || [];
  const habitDone = hs.reduce((n, h) => n + days.filter((d) => (h.records || []).some((r) => r.date === d && r.completion === "DONE")).length, 0);
  const inWeek = (t, f) => { const d = secs(t[f]); return d && d >= from && d <= addDays(to, 1); };
  const all = tw.data || [];
  const fireDone = all.filter((t) => t.status === "completed" && inWeek(t, "end") && (has(t, "fire") || inWeek(t, "due"))).length;
  const fireOpen = all.filter((t) => t.status === "pending" && (has(t, "fire") || inWeek(t, "due")) && inWeek(t, "due")).length;
  const hitsDone = all.filter((t) => t.status === "completed" && has(t, "hit") && inWeek(t, "end")).length;
  const hitsOpen = all.filter((t) => t.status === "pending" && has(t, "hit") && inWeek(t, "due")).length;
  const doors = all.filter((t) => t.status === "completed" && has(t, "door") && inWeek(t, "end")).map((t) => t.description);
  return {
    loading: habits.isLoading, twOn: tw.data != null,
    rows: [
      ["Habits", habitDone, hs.length * 7],
      ...(tw.data != null ? [["Fire", fireDone, fireDone + fireOpen], ["Hits", hitsDone, hitsDone + hitsOpen]] : []),
    ],
    doors,
  };
}

export default function TentV2View({ user, date, onDateChange = () => {} }) {
  const qc = useQueryClient();
  const uid = user?.uid ?? null;
  const base = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00`) : new Date();
  const from = startOfISOWeek(base), to = endOfISOWeek(base);
  const wk = weekKey(from);
  const draftKey = `tv2:${wk}`;
  const [text, setText] = useState(() => read(draftKey));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { setText(read(draftKey)); setErr(""); }, [draftKey]);
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

  const entries = useQuery({ queryKey: ["tv2-entries", uid, wk], enabled: !!uid, queryFn: () => getJournalRange(iso(from), iso(addDays(to, 2))) });
  const closed = (entries.data || []).find((e) => (e.tags || []).includes("tent") && (e.tags || []).includes(wk));
  const sc = useScores(uid, from, to, !!uid);

  const set = (k, v) => setText((t) => { const n = { ...t, [k]: v }; try { localStorage.setItem(draftKey, JSON.stringify(n)); } catch {} return n; });
  const body = () => [
    `# General's Tent – ${wk}`, "", "## Return and Report", "",
    ...sc.rows.map(([l, d, t]) => `- ${l}: ${d}/${t}`),
    ...(sc.doors.length ? ["", `Doors geöffnet: ${sc.doors.join("; ")}`] : []),
    ...(text.report ? ["", text.report] : []), "",
    ...FIELDS.flatMap(([k, label]) => [`## ${label}`, "", text[k] || "—", ""]),
  ].join("\n");
  const close = async () => {
    setBusy(true); setErr("");
    try {
      const entryDay = new Date() <= to ? new Date() : to; // laufende Woche: heute, sonst Sonntag
      await saveJournal(iso(entryDay), body(), { tags: ["tent", wk] });
      qc.invalidateQueries({ queryKey: ["tv2-entries"] });
      qc.invalidateQueries({ queryKey: ["jv2-range"] });
    } catch (e) { setErr(e?.message || "Speichern fehlgeschlagen"); }
    setBusy(false);
  };
  const shift = (n) => onDateChange(iso(addDays(base, n * 7)));
  const filled = FIELDS.every(([k]) => (text[k] || "").trim());

  return (
    <div className="dv2-page">
      <article className="dv2" aria-label="General's Tent">
        <div className="dv2-top">
          <div className="dv2-no">{getISOWeek(from)}</div>
          <div className="dv2-meta">
            <span className="dv2-kw">Tent</span>
            <span><b>{format(from, "d. MMM")} – {format(to, "d. MMM yyyy")}</b><br />{closed ? "Tent geschlossen ✓" : "Tent offen"}</span>
          </div>
        </div>
        <div className="dv2-src">
          <button type="button" className="dv2-link" onClick={() => shift(-1)}>← Vorwoche</button>
          <button type="button" className="dv2-link" onClick={() => shift(1)}>Nächste →</button>
          {!sc.twOn && <a className="dv2-link" href="#fire">Taskwarrior verbinden</a>}
        </div>
        {!uid && <div className="dv2-empty">Nicht angemeldet. <button type="button" className="dv2-link" onClick={() => db.signIn()}>Cloud Login</button></div>}
        <h4 className="dv2-sec">Return and Report</h4>
        {sc.rows.map(([label, done, total]) => (
          <div key={label} className="dv2-row"><div className="dv2-text"><h3>{label}</h3><p>{done} / {total}{total ? ` · ${Math.round((done / total) * 100)} %` : ""}</p></div></div>
        ))}
        {sc.doors.length > 0 && <div className="dv2-row"><div className="dv2-text"><h3>Doors geöffnet</h3><p>{sc.doors.join(" · ")}</p></div></div>}
        <label className="gv2-step"><b className="gv2-q">Return and Report – Notiz</b>
          <textarea rows={3} value={text.report || ""} onChange={(e) => set("report", e.target.value)} placeholder="Ergebnis vs. Plan – ehrlich." />
        </label>
        {FIELDS.map(([k, label, hint]) => (
          <label key={k} className="gv2-step"><b className="gv2-q">{label}</b><small className="gv2-hint">{hint}</small>
            <textarea rows={4} value={text[k] || ""} onChange={(e) => set(k, e.target.value)} />
          </label>
        ))}
        {err && <div className="dv2-empty" role="alert">{err}</div>}
        <div className="dv2-qs gv2-save">
          <button type="button" className="dv2-pick" disabled={busy || !uid || !filled} onClick={close}>
            {busy ? "Speichere …" : closed ? "Tent erneut speichern" : "Tent schließen"}
          </button>
          {!filled && <span className="dv2-none">Lessons, Correction und Targets ausfüllen.</span>}
        </div>
        <div className="dv2-foot">
          <a href="#fire">Game →</a>
          <a href="#v2">← Journal</a>
        </div>
      </article>
    </div>
  );
}
