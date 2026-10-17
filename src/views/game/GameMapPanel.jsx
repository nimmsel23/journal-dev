// GameMapPanel — Fire / Focus / Freedom / Frame als Raster-Liste, direkt aus der Taskwarrior-Replik
// (TaskChampion, siehe lib/door/taskchampion.js). Abhaken und Anlegen schreiben zurück.
//   Fire    = Strikes der Woche: überfällig, heute, Rest der Woche (+ alles mit +fire)
//   Focus   = Monatsergebnisse: +focus, gruppiert nach Projekt
//   Freedom = Jahresvisionen: +freedom, gruppiert nach Projekt
//   Frame   = Standort: offene Tasks je Domain (Body / Being / Balance / Business) bzw. +frame
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, endOfISOWeek, format, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import * as tc from "../../lib/door/taskchampion.js";
import TcSetup, { tcError } from "./TcSetup.jsx";

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

export default function GameMapPanel({ map }) {
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

  if (cfg === undefined) return null;
  if (cfg === null) return <TcSetup onDone={() => { setCfg(undefined); qc.invalidateQueries({ queryKey: ["gv2-cfg"] }); }} />;
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
      {groups.map((g) => (
        <section key={g.key}>
          <h4 className="dv2-sec">{g.title} <span>{g.items.length}</span></h4>
          {g.items.map((t) => <Row key={t.uuid} t={t} busy={act.isPending} onToggle={toggle} />)}
        </section>
      ))}
    </>
  );
}
