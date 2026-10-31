// Fake für Google Tasks (nur das, was gtasks.sync.js braucht) + Hilfen für die Offline-first-Tests.
export function memoryStorage({ locked = false } = {}) {
  const m = new Map();
  return {
    m,
    getItem: (k) => { if (locked) throw new Error("locked"); return m.has(k) ? m.get(k) : null; },
    setItem: (k, v) => { if (locked) throw new Error("locked"); m.set(k, String(v)); },
    removeItem: (k) => { if (locked) throw new Error("locked"); m.delete(k); },
  };
}

export function fakeClock(start = "2026-10-31T10:00:00.000Z") {
  const c = { t: Date.parse(start), now: () => c.t, advance: (ms) => { c.t += ms; } };
  return c;
}

/** Ein "Google-Konto": Listen nach Titel, Tasks in Positionsreihenfolge. Fehler lassen sich einschleusen. */
export function fakeGoogle({ now = Date.now } = {}) {
  let n = 0;
  const lists = {};
  const st = { offline: false, fail: [], calls: [], lostResponse: 0 };
  const arr = (title) => (lists[title] ||= []);
  const iso = () => new Date(now()).toISOString();
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const guard = (name) => {
    st.calls.push(name);
    if (st.offline) throw new TypeError("Failed to fetch");
    if (st.fail.length) throw st.fail.shift();
  };
  const err = (status) => Object.assign(new Error(`tasks ${status}`), { status });

  const api = {
    async listTasks(list, opts = {}) {
      guard("list");
      let a = arr(list);
      if (!opts.showCompleted) a = a.filter((t) => t.status !== "completed");
      if (opts.completedMin) a = a.filter((t) => t.status !== "completed" || (t.completed || "") >= opts.completedMin);
      if (opts.dueMin) a = a.filter((t) => (t.due || "") >= opts.dueMin);
      if (opts.dueMax) a = a.filter((t) => (t.due || "") < opts.dueMax);
      return clone(a);
    },
    async insertTask(list, task, previous) {
      guard("insert");
      const t = { id: `g${String(++n).padStart(3, "0")}`, status: "needsAction", updated: iso(), ...clone(task) };
      if (t.status === "completed" && !t.completed) t.completed = iso();
      const a = arr(list);
      const i = previous ? a.findIndex((x) => x.id === previous) : -1;
      if (i >= 0) a.splice(i + 1, 0, t); else a.unshift(t);
      if (st.lostResponse > 0) { st.lostResponse -= 1; throw new Error("timeout"); } // Task ist angelegt, Antwort verloren
      return clone(t);
    },
    async patchTask(list, id, patch) {
      guard("patch");
      const t = arr(list).find((x) => x.id === id);
      if (!t) throw err(404);
      for (const [k, v] of Object.entries(patch)) { if (v === null) delete t[k]; else t[k] = v; }
      if (patch.status === "completed" && !t.completed) t.completed = iso();
      t.updated = iso();
      return clone(t);
    },
    async deleteTask(list, id) {
      guard("delete");
      const a = arr(list);
      const i = a.findIndex((x) => x.id === id);
      if (i < 0) throw err(404);
      a.splice(i, 1);
      return null;
    },
    async moveTask(list, id, previous) {
      guard("move");
      const a = arr(list);
      const i = a.findIndex((x) => x.id === id);
      if (i < 0) throw err(404);
      const [t] = a.splice(i, 1);
      const j = previous ? a.findIndex((x) => x.id === previous) : -1;
      if (j >= 0) a.splice(j + 1, 0, t); else a.unshift(t);
      return clone(t);
    },
  };
  return { api, st, lists, arr, err, seed(list, tasks) { for (const t of tasks) arr(list).push({ id: `g${String(++n).padStart(3, "0")}`, status: "needsAction", updated: iso(), ...t }); } };
}
