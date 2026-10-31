// GameMapPanel — Fire / Focus / Freedom / Frame als Raster-Liste, direkt aus der Taskwarrior-Replik
// (TaskChampion, siehe lib/door/taskchampion.js). Abhaken und Anlegen schreiben zurück.
//   Fire    = die Woche: EINE Door (+door, Domain) und ihre 4 Hits/Strikes/Bigrocks (+hit, alphatype bigrock,
//             hit_number 1–4); darunter übrige Strikes (überfällig/heute/Woche/+fire) + Termine aus Google Calendar „Fire Map“
//   Focus / Freedom / Frame sind keine Tasklisten, sondern Map-Dokumente je Domain (MapDocsPanel, FrameCards).
//   Frame   = Frame Map je Domain (Body / Being / Balance / Business), fünf Fragen in Firestore – keine Tasks
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, endOfISOWeek, format, startOfDay, startOfISOWeek } from "date-fns";
import { de } from "date-fns/locale";
import * as tc from "../../lib/door/taskchampion.js";
import TcSetup, { tcError } from "./TcSetup.jsx";
import AutosaveArea from "./AutosaveArea.jsx";
import { usePersistedText } from "../../lib/useAutosaveField.js";
import MapDocsPanel from "./MapDocsPanel.jsx";
import { FRAME_DOMAINS, FRAME_QUESTIONS, saveFrameAnswer, watchFrames } from "./frameDb.js";
import { useLiveSnap } from "../../lib/useLiveSnap.js";
import { fetchEvents } from "../v2/gcal.js";
import { useGoogle } from "../../lib/google/useGoogle.js";
import { googleErrorText } from "../../lib/google/tokens.js";
import { asBool, useSetting } from "../../lib/useSetting.js";

export const MAPS = {
  fire: { label: "Fire", sub: "Woche · 4 Hits", tag: "fire", hint: "Welche Door öffnest du diese Woche – mit welchen 4 Hits?" },
  focus: { label: "Focus", sub: "Monthly · Weekly", hint: "Was muss diesen Monat anders sein?" },
  freedom: { label: "Freedom", sub: "IPW · Annual · Quarterly", hint: "Wofür machst du das alles?" },
  frame: { label: "Frame", sub: "Standort · Domains", hint: "Wo stehst du jetzt – Body, Being, Balance, Business?" },
};

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
  return [];
}

/** Door der Woche (+door) und die bis zu 4 Hits der Woche (+hit bzw. alphatype bigrock; Platz = hit_number). */
export function weekDoor(all) {
  const from = startOfISOWeek(new Date()), to = addDays(endOfISOWeek(new Date()), 1);
  const inW = (t, f) => { const d = secs(t[f]); return d && d >= from && d <= to; };
  const door = all.find((t) => open(t) && has(t, "door")) || null;
  const hits = all.filter((t) => (t.status === "pending" || t.status === "completed") && (has(t, "hit") || t.alphatype === "bigrock")
    && (inW(t, "due") || (t.status === "completed" && inW(t, "end"))))
    .sort((a, b) => (Number(a.hit_number) || 99) - (Number(b.hit_number) || 99) || (secs(a.due) || 0) - (secs(b.due) || 0));
  const slots = [null, null, null, null];
  const rest = [];
  for (const h of hits) { const n = Number(h.hit_number); if (n >= 1 && n <= 4 && !slots[n - 1]) slots[n - 1] = h; else rest.push(h); }
  const extra = [];
  for (const h of rest) { const i = slots.indexOf(null); if (i >= 0) slots[i] = h; else extra.push(h); }
  return { door, slots, extra };
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

/* Fire × Google Calendar: Termine der Woche (heute hervorgehoben), nur lesen. Verbindung und Token
   gemeinsam mit Journal v2 und Door v2 · Google Tasks (lib/google). Standard: Kalender „Fire Map“,
   Umschalter „Alle Kalender“ gilt wie in Journal v2 (`jv2:cal-all`).
   Einträge „[TW …]“ sind von `firectl gcal due` gespiegelte Taskwarrior-Tasks → nicht doppelt anzeigen. */
function FireCalendar() {
  const google = useGoogle();
  const on = google.connected;
  const [calAll, setCalAll] = useSetting("jv2:cal-all", false, asBool);
  const from = startOfISOWeek(new Date()), to = endOfISOWeek(new Date());
  const todayKey = format(new Date(), "yyyy-MM-dd");
  // Termine der Woche lokal vorhalten: offline (oder Verbindung abgelaufen) bleibt der zuletzt geladene Stand sichtbar
  const calKey = `gv2:cal:${format(from, "yyyy-MM-dd")}:${calAll ? "all" : "fire"}`;
  const cached = () => { try { return JSON.parse(localStorage.getItem(calKey) || "null"); } catch { return null; } };
  const q = useQuery({
    queryKey: ["gv2-cal", format(from, "yyyy-MM-dd"), calAll, on], enabled: on, staleTime: 60_000, retry: false,
    queryFn: async () => {
      try {
        const ev = await fetchEvents(from, to, { all: calAll });
        try { localStorage.setItem(calKey, JSON.stringify(ev)); } catch { /* Speicher voll/gesperrt */ }
        return ev;
      } catch (e) {
        if (e?.message === "google-expired" || e?.message === "fire-calendar-missing") throw e;
        const c = cached();
        if (c) return c;
        throw e;
      }
    },
  });
  const events = q.data ?? cached();
  const expired = q.error?.message === "google-expired";
  // Netzprobleme bleiben still (der zuletzt geladene Stand bleibt sichtbar); nur Hinweise, die eine Handlung brauchen
  const quiet = (m) => (m === googleErrorText({ message: "google-offline" }) ? "" : m);
  const err = q.error && !expired ? (q.error.message === "fire-calendar-missing" ? "Kalender „Fire Map“ nicht gefunden. Oben „Alle Kalender“ wählen." : quiet(googleErrorText(q.error))) : quiet(google.error);
  const evs = (events || []).filter((e) => !e.title.startsWith("[TW "));
  const mirrored = (events || []).length - evs.length;
  const days = [...new Set(evs.map((e) => e.date))];
  return (
    <section>
      <h4 className="dv2-sec">Kalender · {calAll ? "Alle" : "Fire Map"} <span>{events ? evs.length : ""}</span></h4>
      {(!on || expired) && <div className="dv2-src"><button type="button" className="dv2-link" disabled={google.busy} onClick={google.connect}>{expired ? "Kalender neu verbinden" : "Google Kalender verbinden"}</button></div>}
      {on && !expired && (
        <div className="dv2-src">
          <button type="button" className="dv2-link" onClick={() => setCalAll(!calAll)}>{calAll ? "Nur Fire Map" : "Alle Kalender"}</button>
          <button type="button" className="dv2-link" onClick={google.disconnect}>Kalender trennen</button>
          {google.mode === "popup" && <span>Verbindung ca. 1 h</span>}
          {mirrored > 0 && <span>{mirrored} gespiegelte Tasks ausgeblendet</span>}
        </div>
      )}
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      {on && !expired && events && evs.length === 0 && <div className="dv2-none" style={{ padding: "8px 14px" }}>Keine Termine diese Woche.</div>}
      {days.map((d) => (
        <div key={d}>
          {evs.filter((e) => e.date === d).map((e) => (
            <div key={e.id} className="dv2-row"><div className="dv2-text">
              <h3>{e.title}</h3>
              <p>{d === todayKey ? <b>Heute</b> : format(new Date(`${d}T12:00:00`), "EEE d. MMM", { locale: de })}{e.allDay ? " · ganztägig" : e.time ? ` · ${e.time}` : ""}{e.location ? ` · ${e.location}` : ""}{calAll && e.calendar ? ` · ${e.calendar}` : ""}</p>
            </div></div>
          ))}
        </div>
      ))}
    </section>
  );
}

/* Frame: je Domain die fünf Fragen (journal/{uid}/frame/{domain}). Autosave beim Tippen (Entwurf im localStorage,
   entprellt lokal gespeichert, sofort bei Blur/Seite verlassen) – siehe AutosaveArea. */
function FrameCards({ uid }) {
  const live = useLiveSnap(!!uid, (next, fail) => watchFrames(uid, next, fail), [uid]);
  if (!uid) return <div className="dv2-empty">Frame speichern braucht den Cloud-Login.</div>;
  // lokal speichern, Abgleich im Hintergrund (nie awaiten); Fehler nur in der Konsole
  const save = (domain, key, value) => { saveFrameAnswer(uid, domain, key, value); };
  return (
    <section>
      <h4 className="dv2-sec">Frame Map</h4>
      {FRAME_DOMAINS.map((d) => {
        const ans = live.data?.[d]?.questions || {};
        const filled = FRAME_QUESTIONS.filter(([k]) => (ans[k] || "").trim()).length;
        return (
          <details key={d} className="gv2-frame">
            <summary><b>{d[0].toUpperCase() + d.slice(1)}</b> <span>{filled}/{FRAME_QUESTIONS.length}</span></summary>
            {FRAME_QUESTIONS.map(([k, label]) => (
              <label key={`${d}-${k}`} className="gv2-step"><b className="gv2-q">{label}</b>
                <AutosaveArea rows={3} ready={live.ready || !!live.error} remote={ans[k] || ""} storageKey={`${uid}:frame:${d}:${k}`} onSave={(v) => save(d, k, v)} />
              </label>
            ))}
          </details>
        );
      })}
    </section>
  );
}

function HitRow({ t, busy, onToggle }) {
  const done = t.status === "completed";
  return (
    <button type="button" className={`dv2-hit${done ? " done" : ""}`} aria-pressed={done} disabled={busy} onClick={() => onToggle(t)} style={{ width: "100%" }}>
      <i>{done ? "✓" : ""}</i><span>{t.description}</span>
    </button>
  );
}

/* Leerer Hit-Slot: Eingabe mit Entwurf im localStorage, verschwindet erst beim Anlegen */
function HitSlotForm({ uid, n, busy, onAdd }) {
  const [text, setText] = usePersistedText(`${uid}:fire:hit${n}`);
  return (
    <form className="dv2-compose" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; onAdd(text); setText(""); }}>
      <input aria-label={`Hit ${n}`} placeholder={`Hit ${n} …`} value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit" disabled={!text.trim() || busy}>Add</button>
    </form>
  );
}

export default function GameMapPanel({ map, uid }) {
  const spec = MAPS[map];
  const qc = useQueryClient();
  const [cfg, setCfg] = useState(undefined);
  const [draft, setDraft] = usePersistedText(`${uid}:fire:strike`); // Entwurf übersteht Reload/Absturz
  const [err, setErr] = useState("");
  useQuery({ queryKey: ["gv2-cfg"], queryFn: async () => { const c = await tc.getConfig(); setCfg(c || null); return c || null; }, staleTime: Infinity });
  const q = useQuery({ queryKey: ["gv2-tasks", map], queryFn: () => tc.tasks(), enabled: !!cfg && map === "fire", staleTime: 15_000 });
  const refresh = () => qc.invalidateQueries({ queryKey: ["gv2-tasks"] });
  // Hintergrund-Sync oder lokale Änderung → Liste neu aus der lokalen Replik lesen
  useEffect(() => tc.onChange(refresh), []); // eslint-disable-line react-hooks/exhaustive-deps
  const act = useMutation({
    mutationFn: (fn) => fn(),
    onSuccess: () => { setErr(""); refresh(); },
    onError: (e) => { setErr(e?.message === "tc-network" ? "" : tcError(e)); refresh(); }, // Netzfehler bleiben still (Outbox sendet später)
  });
  const toggle = (t) => act.mutate(async () => {
    const fresh = (await tc.tasks()).find((x) => x.uuid === t.uuid);
    if (!fresh) return;
    const now = tc.nowSecs();
    await tc.commit(tc.editOps(fresh, fresh.status === "completed" ? { status: "pending", end: null, modified: now } : { status: "completed", end: now, modified: now }));
  });
  const todayDue = () => String(Math.floor(startOfDay(new Date()).getTime() / 1000));
  const add = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    act.mutate(() => tc.commit(tc.newTaskOps(text, { tags: [spec.tag], props: { due: todayDue() } }).ops));
  };
  const addHit = (n, door, raw) => {
    const text = (raw || "").trim();
    if (!text) return;
    act.mutate(() => tc.commit(tc.newTaskOps(text, {
      tags: ["hit"],
      props: { alphatype: "bigrock", hit_number: String(n), due: todayDue(), ...(door?.domain ? { domain: door.domain } : {}), ...(door ? { domino_door: door.domino_door || door.description } : {}) },
    }).ops));
  };

  if (map === "frame") return <FrameCards uid={uid} />; // Frame = Frame Map je Domain, keine Tasks
  if (map === "freedom" || map === "focus") return <MapDocsPanel kind={map} uid={uid} />; // Map-Dokumente je Domain, keine Tasks
  if (cfg === undefined) return null;
  if (cfg === null) return <TcSetup onDone={() => { setCfg(undefined); qc.invalidateQueries({ queryKey: ["gv2-cfg"] }); }} />;
  const all = q.data || [];
  const { door, slots, extra } = weekDoor(all);
  const shown = new Set([...slots, ...extra].filter(Boolean).map((t) => t.uuid));
  const groups = groupsFor(map, all).map((g) => ({ ...g, items: g.items.filter((t) => !shown.has(t.uuid) && !has(t, "door")) })).filter((g) => g.items.length);
  const doneN = slots.filter((t) => t?.status === "completed").length;
  return (
    <>
      <div className="dv2-sum"><b>{doneN}/4</b><span>{door ? `Door: ${door.description}${door.domain ? ` · ${door.domain}` : ""}` : spec.hint}</span></div>
      <div className="dv2-src">
        <button type="button" className="dv2-link" disabled={act.isPending} onClick={() => act.mutate(() => tc.flush())}>Sync</button>
        {q.isFetching && <span>lädt …</span>}
      </div>
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      <section>
        <h4 className="dv2-sec">Door der Woche <span>{door?.domain || ""}</span></h4>
        {door
          ? <div className="dv2-row"><div className="dv2-text"><h3>{door.description}</h3><p>{[door.domain, door.domino_door && door.domino_door !== door.description ? door.domino_door : ""].filter(Boolean).join(" · ")}</p></div></div>
          : <div className="dv2-empty">Noch keine Door gewählt. <a className="dv2-link" href="#door2/plan">Im Plan wählen →</a></div>}
      </section>
      <section>
        <h4 className="dv2-sec">4 Hits zum Öffnen <span>{doneN}/4</span></h4>
        {slots.map((t, i) => t
          ? <HitRow key={t.uuid} t={t} busy={act.isPending} onToggle={toggle} />
          : (
            <HitSlotForm key={`slot-${i}`} uid={uid} n={i + 1} busy={act.isPending} onAdd={(text) => addHit(i + 1, door, text)} />
          ))}
        {extra.length > 0 && <h4 className="dv2-sec">Weitere Hits <span>{extra.length}</span></h4>}
        {extra.map((t) => <HitRow key={t.uuid} t={t} busy={act.isPending} onToggle={toggle} />)}
      </section>
      <FireCalendar />
      <form className="dv2-compose" onSubmit={add}>
        <input aria-label="Neuer Strike" placeholder="Weiterer Strike (heute) …" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="submit" disabled={!draft.trim() || act.isPending}>Add</button>
      </form>
      {groups.map((g) => (
        <section key={g.key}>
          <h4 className="dv2-sec">{g.title} <span>{g.items.length}</span></h4>
          {g.items.map((t) => <Row key={t.uuid} t={t} busy={act.isPending} onToggle={toggle} />)}
        </section>
      ))}
    </>
  );
}
