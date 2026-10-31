// gtasks.store.js — lokaler Store für Door v2 "Quelle: Google Tasks" (offline-first). Rein (kein Netz, kein
// Firebase, kein DOM); Speicher, Uhr und Id-Erzeugung werden injiziert. Getestet in tests/gtasks-store.test.mjs.
//
// Grundsatz: Die Oberfläche liest und schreibt NUR hier. Google Tasks wird im Hintergrund abgeglichen
// (gtasks.sync.js) — ohne Netz, bei schlechter Verbindung oder abgelaufenem Token ändert sich für die
// Oberfläche nichts.
//
// Zustand (JSON in localStorage, Schlüssel je Firebase-uid UND Quelle: dv2:lf:gtasks:v1:<uid>; jede Origin
// hat ihren eigenen localStorage, nichts wird origin-übergreifend vorausgesetzt):
//   lists    { "<Listentitel>": [Task] }   Task = { id, title, notes, status, due, completed, updated }
//            in Google-Reihenfolge (= Position); Potential offen + kürzlich erledigt, Production Fenster
//   outbox   [Op]                          noch nicht gesendete Änderungen, in Reihenfolge
//   aliases  { "<tmp-id>": "<echte id>" }  damit eine Oberfläche, die noch die temporäre id hält, weiterarbeitet
//   sending  seq der gerade gesendeten Op  (nicht mehr verändern; auch für andere Tabs sichtbar)
//   syncedAt Zeitpunkt des letzten erfolgreichen Pulls
//
// Op = { seq, at, kind: insert|patch|delete|move, list, id, task?, patch?, previous?, tried? }
//   Offline angelegte Tasks haben die id "tmp:…"; beim Senden der insert-Op wird sie auf die echte id gemappt.
//   Ops werden zusammengefasst (mehrere Patches eines Tasks → einer; Löschen eines noch nie gesendeten Tasks
//   → gar nichts), damit nach langer Offline-Zeit wenige Anfragen reichen.
//
// Pull-Rebase (replaceLists): Serverstand übernehmen und die noch offene Outbox obenauf anwenden → lokale,
// noch nicht gesendete Änderungen werden nie überschrieben und die Oberfläche flackert nicht. Mit mehreren
// Origins/Geräten gilt damit last-write-wins pro Task und Feld: wer zuletzt sendet, setzt die Felder; felder,
// die er nicht angefasst hat, bleiben beim anderen erhalten.
// Mehrere Tabs derselben Origin teilen den localStorage: vor jeder Änderung wird der gespeicherte Stand neu
// gelesen (kein Überschreiben fremder Ops); den Abgleich selbst sperrt gtasks.local.js per Web Lock.

export const VERSION = 1;
export const TMP = "tmp:";
export const isTmp = (id) => typeof id === "string" && id.startsWith(TMP);
export const storeKey = (uid, source = "gtasks") => `dv2:lf:${source}:v${VERSION}:${uid}`;

const ALIAS_MAX = 300;
const FIELDS = ["id", "title", "notes", "status", "due", "completed", "updated"];

/** Nur die Felder, die Door braucht (hält den Speicher klein). */
export function slim(t) {
  const o = {};
  for (const k of FIELDS) if (t?.[k] !== undefined && t?.[k] !== null) o[k] = t[k];
  return o;
}
/** Felder mit null/undefined weglassen (Insert-Körper). */
export const clean = (o) => Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v !== null && v !== undefined));

const empty = () => ({ v: VERSION, lists: {}, outbox: [], aliases: {}, sending: null, seq: 0, syncedAt: 0 });

function parse(raw) {
  const s = JSON.parse(raw);
  if (!s || typeof s !== "object" || s.v !== VERSION || !Array.isArray(s.outbox) || !s.lists || typeof s.lists !== "object") return null;
  return { ...empty(), ...s, aliases: s.aliases && typeof s.aliases === "object" ? s.aliases : {} };
}

/** Eine Op auf `lists` anwenden (lokal beim Schreiben und beim Rebase nach dem Pull). */
export function applyOp(lists, op) {
  const arr = (lists[op.list] ||= []);
  const at = (id) => arr.findIndex((t) => t.id === id);
  switch (op.kind) {
    case "insert": {
      if (at(op.id) >= 0) return;
      const t = { ...clean(op.task), id: op.id, status: op.task?.status || "needsAction", updated: op.at };
      if (t.status === "completed" && !t.completed) t.completed = op.at;
      const i = op.previous ? at(op.previous) : -1;
      if (i >= 0) arr.splice(i + 1, 0, t); else arr.unshift(t);
      return;
    }
    case "patch": {
      const t = arr[at(op.id)];
      if (!t) return;
      for (const [k, v] of Object.entries(op.patch || {})) { if (v === null || v === undefined) delete t[k]; else t[k] = v; }
      if (op.patch?.status === "needsAction") delete t.completed;
      else if (op.patch?.status === "completed" && !t.completed) t.completed = op.at;
      t.updated = op.at;
      return;
    }
    case "delete": {
      const i = at(op.id);
      if (i >= 0) arr.splice(i, 1);
      return;
    }
    case "move": {
      const i = at(op.id);
      if (i < 0) return;
      const [t] = arr.splice(i, 1);
      const j = op.previous ? at(op.previous) : -1;
      if (j >= 0) arr.splice(j + 1, 0, t); else arr.unshift(t);
      return;
    }
    default:
  }
}

/**
 * @param {object} deps
 * @param {Storage-like} deps.storage  getItem/setItem/removeItem (localStorage); darf werfen
 * @param {string} deps.uid
 * @param {string} [deps.source]
 * @param {() => number} [deps.now]
 * @param {() => string} [deps.newId]  temporäre ids (Tests)
 */
export function createStore({ storage, uid, source = "gtasks", now = Date.now, newId }) {
  const key = storeKey(uid, source);
  const makeId = newId || (() => `${TMP}${now().toString(36)}${Math.random().toString(36).slice(2, 8)}`);
  let st = empty();
  let lastRaw = null; // zuletzt gelesener/geschriebener Rohwert → erkennt Änderungen anderer Tabs
  const subs = new Set();
  const emit = (origin) => subs.forEach((fn) => { try { fn(origin); } catch { /* Zuhörer dürfen den Store nicht stören */ } });

  const readRaw = () => { try { return storage.getItem(key); } catch { return null; } };
  const adopt = (raw) => { try { const s = parse(raw); if (s) { st = s; lastRaw = raw; return true; } } catch { /* kaputtes JSON → Speicherstand behalten */ } return false; };
  const persist = () => { try { const raw = JSON.stringify(st); storage.setItem(key, raw); lastRaw = raw; } catch { /* gesperrt/voll: der Speicher-Zustand gilt weiter */ } };
  /** Stand anderer Tabs übernehmen, bevor wir etwas ändern. */
  const fresh = () => { const raw = readRaw(); if (raw != null && raw !== lastRaw) adopt(raw); };
  const commit = () => { persist(); emit("local"); };

  { const raw = readRaw(); if (raw != null) adopt(raw); }

  const resolve = (id) => st.aliases[id] || id;
  const tasks = (list) => st.lists[list] || [];

  const busy = (o) => o.seq === st.sending || o.tried;
  const same = (op) => (o) => o.list === op.list && o.id === op.id;

  function enqueue(op) {
    fresh();
    if (op.kind !== "insert" && !tasks(op.list).some((t) => t.id === op.id)) return false; // gibt es lokal nicht (mehr)
    op.seq = ++st.seq;
    op.at = new Date(now()).toISOString();
    applyOp(st.lists, op);
    const q = st.outbox;
    const mine = same(op);
    if (op.kind === "patch") {
      const ins = q.find((o) => o.kind === "insert" && mine(o) && !busy(o));
      if (ins) { Object.assign(ins.task, clean(op.patch)); commit(); return true; }
      const prev = [...q].reverse().find((o) => o.kind === "patch" && mine(o));
      if (prev && !busy(prev)) { Object.assign(prev.patch, op.patch); commit(); return true; }
    } else if (op.kind === "delete") {
      if (q.some((o) => o.kind === "insert" && mine(o) && !busy(o))) { st.outbox = q.filter((o) => !mine(o)); commit(); return true; } // nie gesendet → verschwindet spurlos
      st.outbox = q.filter((o) => !(mine(o) && !busy(o)));
    } else if (op.kind === "move") {
      st.outbox = q.filter((o) => !(o.kind === "move" && mine(o) && !busy(o)));
    }
    st.outbox.push(op);
    commit();
    return true;
  }

  return {
    key,
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    /** Stand eines anderen Tabs übernehmen (storage-Event). */
    reload() { const raw = readRaw(); if (raw != null && raw !== lastRaw && adopt(raw)) { emit("remote"); return true; } return false; },
    resolve,
    tasks,
    find: (list, id) => tasks(list).find((t) => t.id === resolve(id)) || null,
    hasData: () => st.outbox.length > 0 || Object.values(st.lists).some((a) => a.length > 0),
    pending: () => st.outbox.length,
    syncedAt: () => st.syncedAt,

    // ── Schreiben (wirkt sofort lokal, landet in der Outbox) ──
    insert(list, task, previous) {
      fresh();
      const id = makeId();
      enqueue({ kind: "insert", list, id, task: clean(task), previous: previous ? resolve(previous) : undefined });
      return id;
    },
    patch: (list, id, patch) => enqueue({ kind: "patch", list, id: resolve(id), patch }),
    remove: (list, id) => enqueue({ kind: "delete", list, id: resolve(id) }),
    move: (list, id, previous) => enqueue({ kind: "move", list, id: resolve(id), previous: previous ? resolve(previous) : undefined }),

    // ── Abgleich (gtasks.sync.js) ──
    head() { fresh(); return st.outbox[0] || null; },
    /** Op wird gesendet: nicht mehr zusammenfassen; ein insert gilt ab jetzt als "evtl. angekommen" (tried). */
    beginSend(seq) {
      fresh();
      const op = st.outbox.find((o) => o.seq === seq);
      if (!op) return;
      st.sending = seq;
      if (op.kind === "insert") op.tried = true;
      persist();
    },
    /** Op erledigt (oder nicht mehr sinnvoll → verworfen). */
    ack(seq) {
      fresh();
      st.outbox = st.outbox.filter((o) => o.seq !== seq);
      if (st.sending === seq) st.sending = null;
      commit();
    },
    /** Senden gescheitert (später erneut): Op bleibt, ist wieder zusammenfassbar (insert bleibt tried). */
    endSend(seq) {
      fresh();
      if (st.sending === seq) { st.sending = null; persist(); }
    },
    /** insert angekommen: temporäre id → echte id in Liste, Outbox und Alias-Tabelle. */
    mapId(list, tmp, serverTask) {
      fresh();
      const real = slim(serverTask);
      const arr = (st.lists[list] ||= []);
      const i = arr.findIndex((t) => t.id === tmp);
      if (i >= 0) arr[i] = { ...arr[i], ...real };
      else if (!arr.some((t) => t.id === real.id)) arr.unshift(real);
      // hat ein Pull die echte id schon gebracht, bleibt nur ein Eintrag
      st.lists[list] = arr.filter((t, idx) => t.id !== real.id || arr.findIndex((x) => x.id === real.id) === idx);
      st.aliases[tmp] = real.id;
      const keys = Object.keys(st.aliases);
      if (keys.length > ALIAS_MAX) for (const k of keys.slice(0, keys.length - ALIAS_MAX)) delete st.aliases[k];
      for (const o of st.outbox) {
        if (o.list !== list) continue;
        if (o.id === tmp) o.id = real.id;
        if (o.previous === tmp) o.previous = real.id;
      }
      persist();
      emit("remote");
    },
    /** Serverstand übernehmen und die offene Outbox obenauf anwenden (Rebase). Listen ohne neue Daten bleiben. */
    replaceLists(pulled) {
      fresh();
      const lists = {};
      for (const [name, arr] of Object.entries(st.lists)) lists[name] = arr;
      for (const [name, arr] of Object.entries(pulled || {})) lists[name] = arr.map(slim);
      for (const op of st.outbox) applyOp(lists, op);
      st.lists = lists;
      st.syncedAt = now();
      persist();
      emit("remote");
    },
    /** Nur für Tests/Diagnose. */
    snapshot: () => JSON.parse(JSON.stringify(st)),
  };
}
