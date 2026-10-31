// gtasks.sync.js — stiller Hintergrund-Abgleich zwischen lokalem Store (gtasks.store.js) und Google Tasks.
// Rein (kein Firebase, kein DOM): API, Uhr, Lock und Timer werden injiziert; getestet in tests/gtasks-sync.test.mjs.
//
// Ablauf eines Durchgangs (run):
//   1. Outbox der Reihe nach senden (insert → echte id wird gemappt, patch, delete, move).
//   2. Danach Pull der Listen (Potential offen + kürzlich erledigt, Production-Fenster) und Rebase im Store.
// Auslöser: Start, online, Sichtbarwerden, Intervall (startBackgroundSync), Verbinden, nach Schreibzugriffen (kick, entprellt).
//
// Fehler sind für die Oberfläche unsichtbar: offline, Timeout, 5xx, 429, abgelaufener Token → der Durchgang bricht ab,
// die Outbox bleibt unverändert, der nächste Versuch kommt mit Backoff (4 s, 8 s … max. 5 min; "online" setzt zurück).
// Nur Ops, die der Server endgültig ablehnt (400/404/409/410/412/422: Task gibt es nicht mehr, ungültig) werden
// verworfen, damit eine einzelne kaputte Op die Warteschlange nie blockiert.
//
// Mehrere Origins/Geräte syncen unabhängig gegen dieselben Listen: gesendet werden nur die geänderten Felder
// (PATCH), der Pull-Rebase im Store hält lokale, noch offene Änderungen obenauf → last-write-wins pro Task und Feld,
// kein Datenverlust außer bei Änderungen an einem inzwischen gelöschten Task (404 → verworfen).
// Ein insert, dessen Antwort verloren ging (Timeout), wird beim Wiederholen zuerst gegen die offene Liste geprüft
// (gleicher Titel + Fälligkeit, id lokal unbekannt) und adoptiert statt doppelt angelegt.
import { addDays, format, startOfWeek } from "date-fns";
import { LIST_POTENTIAL, LIST_PRODUCTION, PROFIT_WEEKS } from "./gtasks.model.js";
import { clean, isTmp } from "./gtasks.store.js";

const DROP_STATUS = [400, 404, 409, 410, 412, 422];
const BACKOFF_BASE_MS = 4_000;
const BACKOFF_MAX_MS = 5 * 60_000;
const PULL_EVERY_MS = 30_000;
const KICK_DELAY_MS = 700;
const AHEAD_WEEKS = 6; // Production-Fenster: Wochen in die Zukunft
const dueOf = (d) => `${d}T00:00:00.000Z`;

const timeout = (p, ms) => new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(Object.assign(new Error("timeout"), { code: "timeout" })), ms);
  Promise.resolve(p).then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
});

/**
 * @param {object} d
 * @param {object} d.store
 * @param {{listTasks, insertTask, patchTask, deleteTask, moveTask}} d.api   gtasks.js (oder Fake)
 * @param {() => boolean} [d.canRun]   online + Google verbunden + uid bekannt
 * @param {(fn: () => Promise) => Promise} [d.withLock]  Tab-übergreifende Sperre (Web Lock)
 * @param {() => number} [d.now]
 * @param {number} [d.timeoutMs]
 */
export function createSync({ store, api, canRun = () => true, withLock = (fn) => fn(), now = Date.now, timeoutMs = 20_000 }) {
  let running = null;
  let again = false;
  let fails = 0;
  let nextAt = 0;
  let kickTimer = null;

  const T = (p) => timeout(p, timeoutMs);
  const gone = () => Object.assign(new Error("gone"), { status: 404 });
  const real = (id) => { const r = store.resolve(id); if (isTmp(r)) throw gone(); return r; }; // insert der id wurde verworfen

  // ── Outbox senden ──
  async function adoptExisting(op) {
    const known = new Set(store.tasks(op.list).map((t) => t.id));
    const open = await T(api.listTasks(op.list, { showCompleted: false }));
    const want = (op.task?.title || "").trim();
    return open.find((t) => !known.has(t.id) && (t.title || "").trim() === want && (t.due || "").slice(0, 10) === (op.task?.due || "").slice(0, 10)) || null;
  }

  async function send(op) {
    switch (op.kind) {
      case "insert": {
        const found = op.tried ? await adoptExisting(op) : null;
        const previous = op.previous && !isTmp(store.resolve(op.previous)) ? store.resolve(op.previous) : undefined;
        const res = found || await T(api.insertTask(op.list, clean(op.task), previous));
        store.mapId(op.list, op.id, res);
        return;
      }
      case "patch": await T(api.patchTask(op.list, real(op.id), op.patch)); return;
      case "delete": await T(api.deleteTask(op.list, real(op.id))); return;
      case "move": {
        const previous = op.previous && !isTmp(store.resolve(op.previous)) ? store.resolve(op.previous) : undefined;
        await T(api.moveTask(op.list, real(op.id), previous));
        return;
      }
      default:
    }
  }

  async function flush() {
    let sent = 0;
    for (;;) {
      const op = store.head();
      if (!op) return sent;
      store.beginSend(op.seq);
      try {
        await send(op);
        store.ack(op.seq);
        sent += 1;
      } catch (e) {
        if (DROP_STATUS.includes(e?.status)) { store.ack(op.seq); continue; } // gibt es nicht mehr / ungültig → nicht blockieren
        store.endSend(op.seq);
        throw e; // Netz, Timeout, 5xx, 429, abgelaufener Token … → später erneut
      }
    }
  }

  // ── Pull ──
  async function pull() {
    const today = new Date(now());
    const since = startOfWeek(addDays(today, -7 * (PROFIT_WEEKS - 1)), { weekStartsOn: 1 });
    const completedMin = since.toISOString();
    const dueMin = dueOf(format(since, "yyyy-MM-dd"));
    const dueMax = dueOf(format(addDays(today, 7 * AHEAD_WEEKS), "yyyy-MM-dd"));
    const [potOpen, potDone, prodWindow, prodDone] = await Promise.all([
      T(api.listTasks(LIST_POTENTIAL, { showCompleted: false })),
      T(api.listTasks(LIST_POTENTIAL, { showCompleted: true, completedMin })),
      T(api.listTasks(LIST_PRODUCTION, { showCompleted: true, dueMin, dueMax })),
      T(api.listTasks(LIST_PRODUCTION, { showCompleted: true, completedMin })),
    ]);
    // erst wenn ALLE Abrufe da sind, Store ersetzen (kein halber Stand)
    const merge = (...lists) => {
      const byId = new Map();
      for (const l of lists) for (const t of l) byId.set(t.id, t);
      return [...byId.values()];
    };
    // Reihenfolge der offenen Potential-Tasks (= Priorität) stammt aus potOpen; erledigte folgen
    const potOrder = potOpen.map((t) => t.id);
    const pot = merge(potOpen, potDone).sort((a, b) => {
      const ia = potOrder.indexOf(a.id), ib = potOrder.indexOf(b.id);
      return (ia < 0 ? Infinity : ia) - (ib < 0 ? Infinity : ib);
    });
    store.replaceLists({ [LIST_POTENTIAL]: pot, [LIST_PRODUCTION]: merge(prodWindow, prodDone) });
  }

  // ── Durchgang ──
  const backoff = () => Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** Math.max(0, fails - 1));

  async function cycle(force) {
    store.reload();
    const sent = await flush();
    if (force || sent > 0 || !store.syncedAt() || now() - store.syncedAt() >= PULL_EVERY_MS) await pull();
  }

  /** Einen Durchgang starten (falls möglich); nie werfen. force: Backoff ignorieren und immer pullen. */
  async function run({ force = false } = {}) {
    if (running) { again = true; return running; }
    let ok = false;
    try { ok = canRun(); } catch { ok = false; }
    if (!ok) return undefined;
    if (!force && now() < nextAt) return undefined;
    running = (async () => {
      try {
        await withLock(() => cycle(force));
        fails = 0;
        nextAt = 0;
      } catch {
        fails += 1;
        nextAt = now() + backoff(); // still: Fehler sind kein Zustand, den die Oberfläche zeigt
      }
    })();
    try { await running; } finally {
      running = null;
      if (again) { again = false; setTimeout(() => { run(); }, 300); }
    }
    return undefined;
  }

  /** Nach Schreibzugriffen: entprellt anstoßen. */
  function kick() {
    clearTimeout(kickTimer);
    kickTimer = setTimeout(() => { run(); }, KICK_DELAY_MS);
  }

  return { run, kick, resetBackoff() { fails = 0; nextAt = 0; }, isRunning: () => !!running, state: () => ({ fails, nextAt }) };
}
