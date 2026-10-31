// gtasks.model.js — Door-v2-Funktionen auf dem LOKALEN Store (gtasks.store.js), mit denselben
// Signaturen/Rückgabeformen wie potential/plan/production/profit.* (Panels bleiben gleich).
// Rein (kein Netz, kein Firebase); getestet in tests/gtasks-model.test.mjs. Verdrahtung mit Google: gtasks.local.js.
//
// Alles liest aus dem Store und schreibt optimistisch in ihn (Outbox) — nichts hier wartet auf das Netz.
// `kick()` stößt nur den Hintergrund-Abgleich an. Die Lese-Kerne sind synchron (`peek`), damit eine Ansicht
// ohne "Lade …"-Zwischenzustand starten kann.
//
// Mapping
//  Potential = Liste "Door · Potential": ein Task je Hot-List-Item. Titel = Text,
//    erledigt = status completed, löschen = DELETE.
//  Plan      = dieselben Tasks. Die Priorität steht in der ERSTEN Zeile von `notes`
//    (Titel bleibt in der Google-Tasks-App sauber lesbar):
//        Door: Q2 · Door 2026-W42
//    "Q1–Q4" = Quadrant, "Door <Woche>" = Door der Woche (höchstens ein Task je
//    Kalenderwoche). Weitere Zeilen in notes bleiben unangetastet. Die Marker bleiben
//    nach dem Erledigen stehen → daraus ergibt sich im Profit die Liste erledigter Doors.
//    Google Tasks kennt keine Priorität: sie wird zusätzlich als Reihenfolge der Liste
//    abgebildet (Q1 oben … Q4, danach Tasks ohne Quadrant), damit sie auch in der
//    Google-Tasks-App sichtbar ist (move beim Zuordnen).
//  Production = Liste "Door · Production": ein Task je Daily Hit, `due` = Tag der
//    Woche; Toggle = status completed ↔ needsAction; Quote = erledigt/gesamt der Woche.
//  Profit    = nur lesend, aus `completed`-Zeitstempeln der letzten Wochen: je Woche
//    Anzahl erledigter Potential-Tasks und Production-Hits + erledigte Wochen-Doors.
//    Reflexionen gibt es in dieser Quelle nicht (UI blendet sie aus).
import { addDays, format, startOfWeek } from "date-fns";
import { weekKey } from "./warstack.js";

export const LIST_POTENTIAL = "Door · Potential";
export const LIST_PRODUCTION = "Door · Production";
export const LIST_WARSTACK = "Door · War Stacks"; // Door v1: je War Stack ein Task, Inhalt in den Notes
export const LIST_PROFIT = "Door · Profit";       // Door v1: je Wochen-Reflexion ein Task, Text in den Notes

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const PROFIT_WEEKS = 8;

// ── Notes-Marker ──
const MARK_RE = /^Door:\s*(.*)$/;
export function parseNotes(notes = "") {
  const [first = "", ...rest] = notes.split("\n");
  const m = first.match(MARK_RE);
  if (!m) return { quadrant: null, doorWeek: "", rest: notes };
  const q = m[1].match(/Q([1-4])/);
  const w = m[1].match(/Door (\d{4}-W\d{2})/);
  return { quadrant: q ? Number(q[1]) : null, doorWeek: w ? w[1] : "", rest: rest.join("\n") };
}
export function buildNotes({ quadrant, doorWeek, rest }) {
  const parts = [quadrant ? `Q${quadrant}` : "", doorWeek ? `Door ${doorWeek}` : ""].filter(Boolean);
  const head = parts.length ? `Door: ${parts.join(" · ")}` : "";
  return [head, rest].filter((s) => s !== "" && s != null).join("\n");
}

export function toItem(t) {
  const n = parseNotes(t.notes);
  return {
    id: t.id, selector: t.id, title: t.title || "Untitled", description: n.rest, source: "gtasks",
    status: t.status === "completed" ? "done" : "active", phase: "potential",
    created_at: t.updated || "", quadrant: n.quadrant, doorWeek: n.doorWeek,
  };
}

const dueOf = (d) => `${d}T00:00:00.000Z`;
const weekDates = (base = new Date()) => {
  const mon = startOfWeek(base, { weekStartsOn: 1 });
  return DAY_KEYS.map((k, i) => [k, format(addDays(mon, i), "yyyy-MM-dd")]);
};
// react-query reicht als queryFn-Argument ein Kontextobjekt durch → nur echte Datumswerte als Basis zulassen
const asBase = (b) => (b instanceof Date && !Number.isNaN(b.getTime()) ? b : new Date());

/**
 * @param {object} store   createStore(...) aus gtasks.store.js
 * @param {object} [deps]
 * @param {() => void} [deps.kick]  Hintergrund-Abgleich anstoßen (nach Schreibzugriffen)
 */
export function createDoorModel(store, { kick = () => {} } = {}) {
  const openTasks = (list) => store.tasks(list).filter((t) => t.status !== "completed");
  const write = (fn) => { const r = fn(); kick(); return r; };

  // ── Lese-Kerne (synchron) ──
  const hotlist = () => openTasks(LIST_POTENTIAL).filter((t) => (t.title || "").trim()).map(toItem);

  const doorWar = () => {
    const items = hotlist();
    const wk = weekKey();
    const board = { 1: [], 2: [], 3: [], 4: [], unsorted: [] };
    const candidates = items.map((i) => ({ ...i, war_uuid: i.id }));
    for (const i of items) (board[i.quadrant] || board.unsorted).push(i.id);
    const door = items.find((i) => i.doorWeek === wk && i.quadrant === 2);
    const selected = { selector: door?.id || "", uuid: door?.id || "", week: door ? wk : "" };
    return { doorWar: { selected }, candidates, board, selected };
  };

  const weekHits = (base) => {
    const dates = weekDates(asBase(base));
    const days = new Set(dates.map(([, d]) => d));
    const tasks = store.tasks(LIST_PRODUCTION).filter((t) => days.has((t.due || "").slice(0, 10)));
    return { dates, tasks };
  };
  const dailyWeek = (base = new Date()) => {
    const { dates, tasks } = weekHits(base);
    const out = Object.fromEntries(DAY_KEYS.map((k) => [k, []]));
    for (const t of tasks) {
      const day = dates.find(([, d]) => d === (t.due || "").slice(0, 10));
      if (day) out[day[0]].push({ id: t.id, label: t.title || "", done: t.status === "completed", kind: "little" });
    }
    return { week: weekKey(asBase(base)), days: out, dates: Object.fromEntries(dates) };
  };
  const hitsWeek = (base = new Date()) => {
    const { tasks } = weekHits(base);
    const done = tasks.filter((t) => t.status === "completed").length;
    return { week: weekKey(asBase(base)), total_hits: tasks.length, completed_hits: done, open_hits: tasks.length - done, completion_rate: tasks.length ? done / tasks.length : 0 };
  };

  const profit = () => {
    const since = startOfWeek(addDays(new Date(), -7 * (PROFIT_WEEKS - 1)), { weekStartsOn: 1 });
    const sinceIso = since.toISOString();
    const recent = (t) => t.status === "completed" && t.completed && t.completed >= sinceIso;
    const pot = store.tasks(LIST_POTENTIAL).filter(recent);
    const prod = store.tasks(LIST_PRODUCTION).filter(recent);
    const weeks = new Map();
    for (let i = 0; i < PROFIT_WEEKS; i++) weeks.set(weekKey(addDays(since, i * 7)), { week: weekKey(addDays(since, i * 7)), potential: 0, hits: 0 });
    const bump = (t, field) => { const w = weeks.get(weekKey(new Date(t.completed))); if (w) w[field] += 1; };
    pot.forEach((t) => bump(t, "potential"));
    prod.forEach((t) => bump(t, "hits"));
    const doors = pot
      .filter((t) => parseNotes(t.notes).doorWeek)
      .map((t) => ({ id: t.id, door_title: t.title || "", week: parseNotes(t.notes).doorWeek, completed_at: t.completed }))
      .sort((a, b) => b.completed_at.localeCompare(a.completed_at));
    return { weeks: [...weeks.values()].reverse(), doors };
  };

  const currentTask = (id) => {
    const t = openTasks(LIST_POTENTIAL).find((x) => x.id === store.resolve(id));
    if (!t) throw new Error("task_not_found");
    return t;
  };

  /** Task hinter den letzten Task mit gleicher oder höherer Priorität schieben (Listenreihenfolge = Priorität). */
  const placeByPriority = (id, quadrant) => {
    const rank = (q) => q || 5; // ohne Quadrant ans Ende
    const real = store.resolve(id);
    let previous;
    for (const t of openTasks(LIST_POTENTIAL)) if (t.id !== real && rank(parseNotes(t.notes).quadrant) <= rank(quadrant)) previous = t.id;
    store.move(LIST_POTENTIAL, real, previous);
  };

  return {
    peek: { hotlist, doorWar, dailyWeek, hitsWeek, profit },

    // ── Potential ──
    fetchHotlist: async () => hotlist(),
    /** Potential legt den Task an — ans Ende der Liste (noch ohne Quadrant), nicht über die priorisierten. */
    addHotlistItem: async (text) => {
      const title = String(text || "").trim();
      if (!title) throw new Error("title_required");
      return write(() => { const id = store.insert(LIST_POTENTIAL, { title }, openTasks(LIST_POTENTIAL).at(-1)?.id); return { id, title }; });
    },
    /** Notiz hängt unter die Marker-Zeile an (Quadrant/Door bleiben erhalten). */
    addNote: async (id, text) => {
      const note = String(text || "").trim();
      if (!note) throw new Error("answer_required");
      const t = currentTask(id);
      const n = parseNotes(t.notes);
      return write(() => store.patch(LIST_POTENTIAL, t.id, { notes: buildNotes({ quadrant: n.quadrant, doorWeek: n.doorWeek, rest: [n.rest, note].filter(Boolean).join("\n") }) }));
    },
    completeHotlistItem: async (id) => write(() => store.patch(LIST_POTENTIAL, id, { status: "completed" })),
    deleteHotlistItem: async (id) => write(() => store.remove(LIST_POTENTIAL, id)),

    // ── Plan ──
    fetchDoorWar: async () => doorWar(),
    assignQuadrant: async (id, quadrant) => {
      const t = currentTask(id);
      const n = parseNotes(t.notes);
      // Door-Markierung nur auf Q2-Tasks
      const doorWeek = Number(quadrant) === 2 ? n.doorWeek : "";
      return write(() => {
        store.patch(LIST_POTENTIAL, t.id, { notes: buildNotes({ quadrant: Number(quadrant), doorWeek, rest: n.rest }) });
        placeByPriority(t.id, Number(quadrant));
      });
    },
    selectWeeklyDoor: async (id) => {
      const wk = weekKey();
      const tasks = openTasks(LIST_POTENTIAL);
      const t = tasks.find((x) => x.id === store.resolve(id));
      if (!t) throw new Error("task_not_found");
      if (parseNotes(t.notes).quadrant !== 2) throw new Error("selected_requires_q2");
      return write(() => {
        // alte Door dieser Woche abwählen (eine Door pro Woche)
        for (const o of tasks) {
          const n = parseNotes(o.notes);
          if (o.id !== t.id && n.doorWeek === wk) store.patch(LIST_POTENTIAL, o.id, { notes: buildNotes({ ...n, doorWeek: "" }) });
        }
        const n = parseNotes(t.notes);
        store.patch(LIST_POTENTIAL, t.id, { notes: buildNotes({ ...n, doorWeek: wk }) });
      });
    },

    // ── Production ──
    fetchDailyWeek: async (base) => dailyWeek(base),
    toggleDailyHit: async (id) => {
      const t = store.find(LIST_PRODUCTION, id);
      if (!t) throw new Error("daily_hit_not_found");
      return write(() => store.patch(LIST_PRODUCTION, t.id, t.status === "completed" ? { status: "needsAction", completed: null } : { status: "completed" }));
    },
    addDailyHit: async (dayKey, text) => {
      const title = String(text || "").trim();
      const date = weekDates().find(([k]) => k === dayKey)?.[1];
      if (!title || !date) throw new Error("title_required");
      return write(() => ({ id: store.insert(LIST_PRODUCTION, { title, due: dueOf(date) }), title }));
    },
    /** Hit mit Fälligkeitsdatum (yyyy-MM-dd) anlegen — Google Tasks speichert nur das Datum, keine Uhrzeit. */
    addHitOnDate: async (date, text) => {
      const title = String(text || "").trim();
      if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date || "")) throw new Error("title_required");
      return write(() => ({ id: store.insert(LIST_PRODUCTION, { title, due: dueOf(date) }), title }));
    },
    fetchHitsWeek: async (base) => hitsWeek(base),

    // ── Profit (nur lesend) ──
    fetchProfitGtasks: async () => profit(),
  };
}
