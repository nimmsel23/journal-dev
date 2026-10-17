// GameMapPanel — Fire / Focus / Freedom / Frame als Raster-Liste, direkt aus der Taskwarrior-Replik
// (TaskChampion, siehe lib/door/taskchampion.js). Abhaken und Anlegen schreiben zurück.
//   Fire    = Strikes der Woche: überfällig, heute, Rest der Woche (+ alles mit +fire) + Termine aus Google Calendar „Fire Map“
//   Focus   = Monatsergebnisse: +focus, gruppiert nach Projekt
//   Freedom = Jahresvisionen: +freedom, gruppiert nach Projekt
//   Frame   = Standort: offene Tasks je Domain (Body / Being / Balance / Business) bzw. +frame
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, endOfISOWeek, format, startOfDay, startOfISOWeek } from "date-fns";
import { de } from "date-fns/locale";
import * as tc from "../../lib/door/taskchampion.js";
import TcSetup, { tcError } from "./TcSetup.jsx";
import { FRAME_DOMAINS, FRAME_QUESTIONS, fetchFrames, saveFrameAnswer } from "./frameDb.js";
import { calendarConnected, clearCalendarToken, connectCalendar, fetchEvents } from "../v2/gcal.js";

export const MAPS = {
  fire: { label: "Fire", sub: "Woche · Strikes", tag: "fire", hint: "Welcher Strike steht an – und wofür?" },
  focus: { label: "Focus", sub: "Monat · Ergebnisse", tag: "focus", hint: "Was muss diesen Monat anders sein?" },
  freedom: { label: "Freedom", sub: "Jahr · Visionen", tag: "freedom", hint: "Wofür machst du das alles?" },
  frame: { label: "Frame", sub: "Standort · Domains", tag: "frame", hint: "Wo stehst du jetzt – Body, Being, Balance, Business?" },
};
const DOMAINS = ["body", "being", "balance", "business"];

const has = (t, tag) => t[`tag_${tag}`] !== undefined;
const secs = (v) => (v ? new Date(Number(v) * 1000) : null);
const open = (t) => t.status === "pending" && !(t.wait && Number(t.wait) * 1000 > Date.now());
const PRIO = { H: 0, M: 1, L: 2 };
const byPrio = (a, b) => (PRIO[a.priority] ?? 3) - (PRIO[b.priority] ?? 3) || (secs(a.due) || 0) - (secs(b.due) || 0) || Number(a.entry) - Number(b.entry);

/** → [{key, title, items}] */
export function groupsFor(map, all) {
  const list = all.filter(open);
  if (map === "fire") {
    const today = startOfDay(new Date());
    const weekEnd = endOfISOWeek(today);
    const g = { over: [], today: [], week: [], tag: [] };
    for (const t of list) {
      const d = secs(t.due);
      if (d && d < today) g.over.push(t);
      else if (d && format(d, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) g.today.push(t);
      else if (d && d <= weekEnd) g.week.push(t);
      else if (has(t, "fire")) g.tag.push(t);
    }
    return [["over", "Überfällig"], ["today", "Heute"], ["week", "Diese Woche"], ["tag", "Fire ohne Termin"]]
      .map(([key, title]) => ({ key, title, items: g[key].sort(byPrio) })).filter((x) => x.items.length);
  }
  if (map === "frame") {
    const pool = list.filter((t) => has(t, "frame") || DOMAINS.includes(String(t.domain || "").toLowerCase()));
    const g = Object.fromEntries([...DOMAINS, "other"].map((d) => [d, []]));
    for (const t of pool) (g[String(t.domain || "").toLowerCase()] || g.other).push(t);
    return [...DOMAINS, "other"].map((d) => ({ key: d, title: d === "other" ? "Ohne Domain" : d[0].toUpperCase() + d.slice(1), items: g[d].sort(byPrio) })).filter((x) => x.items.length);
  }
  const tag = MAPS[map].tag;
  const g = new Map();
  for (const t of list.filter((x) => has(x, tag)).sort(byPrio)) {
    const k = t.project || "Ohne Projekt";
    if (!g.has(k)) g.set(k, []);
    g.get(k).push(t);
  }
  return [...g].map(([key, items]) => ({ key, title: key, items }));
}

function Row({ t, busy, onToggle }) {
  const d = secs(t.due);
  const meta = [t.priority && `Prio ${t.priority}`, d && format(d, "EEE d. MMM", { locale: de }), t.project, t.domain].filter(Boolean).join(" · ");
  return (
    <button type="button" className="dv2-hit" aria-pressed={false} disabled={busy} onClick={() => onToggle(t)} style={{ width: "100%" }}>
      <i />
      <span>{t.description || "— leer —"}{meta && <small style={{ display: "block", opacity: 0.6 }}>{meta}</small>}</span>
    </button>
  );
}

/* Fire × Google Calendar: Termine der Woche aus dem Kalender „Fire Map“ (nur lesen).
   Einträge „[TW …]“ sind von `firectl gcal due` gespiegelte Taskwarrior-Tasks → nicht doppelt anzeigen. */
function FireCalendar() {
  const [on, setOn] = useState(() => calendarConnected());
  const [msg, setMsg] = useState("");
  const from = startOfISOWeek(new Date()), to = endOfISOWeek(new Date());
  const q = useQuery({ queryKey: ["gv2-cal", format(from, "yyyy-MM-dd"), on], enabled: on, queryFn: () => fetchEvents(from, to), staleTime: 60_000, retry: false });
  const connect = async () => {
    setMsg("");
    try { await connectCalendar(); setOn(true); } catch (e) { setMsg(e?.message || "Verbinden fehlgeschlagen"); }
  };
  const expired = q.error?.message === "calendar-expired";
  const err = q.error && !expired ? (q.error.message === "fire-calendar-missing" ? "Kalender „Fire Map“ nicht gefunden." : q.error.message) : msg;
  const evs = (q.data || []).filter((e) => !e.title.startsWith("[TW "));
  const mirrored = (q.data || []).length - evs.length;
  const days = [...new Set(evs.map((e) => e.date))];
  return (
    <section>
      <h4 className="dv2-sec">Kalender · Fire Map <span>{on && q.data ? evs.length : ""}</span></h4>
      {(!on || expired) && <div className="dv2-src"><button type="button" className="dv2-link" onClick={connect}>{expired ? "Kalender neu verbinden" : "Google Kalender verbinden"}</button></div>}
      {on && !expired && <div className="dv2-src"><button type="button" className="dv2-link" onClick={() => { clearCalendarToken(); setOn(false); }}>Kalender trennen</button>{mirrored > 0 && <span>{mirrored} gespiegelte Tasks ausgeblendet</span>}</div>}
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      {on && !expired && q.data && evs.length === 0 && <div className="dv2-none" style={{ padding: "8px 14px" }}>Keine Termine diese Woche.</div>}
      {days.map((d) => (
        <div key={d}>
          {evs.filter((e) => e.date === d).map((e) => (
            <div key={e.id} className="dv2-row"><div className="dv2-text">
              <h3>{e.title}</h3>
              <p>{format(new Date(`${d}T12:00:00`), "EEE d. MMM", { locale: de })}{e.allDay ? " · ganztägig" : e.time ? ` · ${e.time}` : ""}{e.location ? ` · ${e.location}` : ""}</p>
            </div></div>
          ))}
        </div>
      ))}
    </section>
  );
}

/* Frame: je Domain die fünf Fragen (journal/{uid}/frame/{domain}), speichert beim Verlassen des Feldes. */
function FrameCards({ uid }) {
  const qc = useQueryClient();
  const [err, setErr] = useState("");
  const q = useQuery({ queryKey: ["gv2-frame", uid], enabled: !!uid, queryFn: () => fetchFrames(uid), staleTime: 30_000 });
  if (!uid) return <div className="dv2-empty">Frame speichern braucht den Cloud-Login.</div>;
  const save = async (domain, key, value, old) => {
    if (value.trim() === (old || "").trim()) return;
    setErr("");
    try { await saveFrameAnswer(uid, domain, key, value.trim()); qc.invalidateQueries({ queryKey: ["gv2-frame", uid] }); }
    catch (e) { setErr(e?.code === "permission-denied" ? "Keine Berechtigung für journal/… – Firestore-Rules noch nicht deployt." : e?.message || "Speichern fehlgeschlagen"); }
  };
  return (
    <section>
      <h4 className="dv2-sec">Frame Map</h4>
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      {q.isError && <div className="dv2-empty" role="alert">{q.error?.code === "permission-denied" ? "Keine Berechtigung für journal/… – Firestore-Rules noch nicht deployt." : q.error?.message}</div>}
      {FRAME_DOMAINS.map((d) => {
        const ans = q.data?.[d]?.questions || {};
        const filled = FRAME_QUESTIONS.filter(([k]) => (ans[k] || "").trim()).length;
        return (
          <details key={d} className="gv2-frame">
            <summary><b>{d[0].toUpperCase() + d.slice(1)}</b> <span>{filled}/{FRAME_QUESTIONS.length}</span></summary>
            {FRAME_QUESTIONS.map(([k, label]) => (
              <label key={`${d}-${k}-${ans[k] || ""}`} className="gv2-step"><b className="gv2-q">{label}</b>
                <textarea rows={3} defaultValue={ans[k] || ""} onBlur={(e) => save(d, k, e.target.value, ans[k])} />
              </label>
            ))}
          </details>
        );
      })}
    </section>
  );
}

export default function GameMapPanel({ map, uid }) {
  const spec = MAPS[map];
  const qc = useQueryClient();
  const [cfg, setCfg] = useState(undefined);
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState("");
  useQuery({ queryKey: ["gv2-cfg"], queryFn: async () => { const c = await tc.getConfig(); setCfg(c || null); return c || null; }, staleTime: Infinity });
  const q = useQuery({ queryKey: ["gv2-tasks", map], queryFn: () => tc.tasks(), enabled: !!cfg, staleTime: 15_000 });
  const refresh = () => qc.invalidateQueries({ queryKey: ["gv2-tasks"] });
  const act = useMutation({
    mutationFn: (fn) => fn(),
    onSuccess: () => { setErr(""); refresh(); },
    onError: (e) => { setErr(tcError(e)); refresh(); },
  });
  const toggle = (t) => act.mutate(async () => {
    const fresh = (await tc.tasks({ force: true })).find((x) => x.uuid === t.uuid);
    if (fresh) await tc.commit(tc.editOps(fresh, { status: "completed", end: tc.nowSecs(), modified: tc.nowSecs() }));
  });
  const add = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    act.mutate(async () => {
      const props = {};
      if (map === "fire") props.due = String(Math.floor(startOfDay(new Date()).getTime() / 1000)); // heute fällig
      await tc.commit(tc.newTaskOps(text, { tags: [spec.tag], props }).ops);
    });
  };

  if (cfg === undefined) return map === "frame" ? <FrameCards uid={uid} /> : null;
  if (cfg === null) return map === "frame" ? <><FrameCards uid={uid} /><TcSetup onDone={() => { setCfg(undefined); qc.invalidateQueries({ queryKey: ["gv2-cfg"] }); }} /></> : <TcSetup onDone={() => { setCfg(undefined); qc.invalidateQueries({ queryKey: ["gv2-cfg"] }); }} />;
  const groups = groupsFor(map, q.data || []);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return (
    <>
      <div className="dv2-sum"><b>{total}</b><span>{spec.hint}</span></div>
      <div className="dv2-src">
        <button type="button" className="dv2-link" disabled={act.isPending} onClick={() => act.mutate(() => tc.sync())}>Sync</button>
        {q.isFetching && <span>lädt …</span>}
      </div>
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      {map !== "frame" && (
        <form className="dv2-compose" onSubmit={add}>
          <input aria-label={`Neu in ${spec.label}`} placeholder={map === "fire" ? "Neuer Strike (heute) …" : `Neu in ${spec.label} …`} value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button type="submit" disabled={!draft.trim() || act.isPending}>Add</button>
        </form>
      )}
      {q.isError && <div className="dv2-empty" role="alert">{tcError(q.error)}</div>}
      {!q.isLoading && !q.isError && total === 0 && <div className="dv2-empty">Nichts offen in {spec.label}. Tag <code>+{spec.tag}</code> setzen oder oben anlegen.</div>}
      {map === "fire" && <FireCalendar />}
      {map === "frame" && <FrameCards uid={uid} />}
      {groups.map((g) => (
        <section key={g.key}>
          <h4 className="dv2-sec">{g.title} <span>{g.items.length}</span></h4>
          {g.items.map((t) => <Row key={t.uuid} t={t} busy={act.isPending} onToggle={toggle} />)}
        </section>
      ))}
    </>
  );
}
