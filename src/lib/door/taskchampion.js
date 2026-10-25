// taskchampion.js — Browser-Client für den TaskChampion-Sync-Server (Taskwarrior 3 `task sync`).
// Pull: Snapshot + Versionen holen, entschlüsseln, in IndexedDB als Replik halten.
// Push: lokale Änderungen als Operationen per AddVersion senden (commit()).
// Protokoll: gothenburgbitfactory.org/taskchampion (http, encryption, sync-protocol).
//  - Schlüssel: PBKDF2-HMAC-SHA256, 600 000 Iterationen, Salt = 16-Byte-Client-ID, 32 Byte
//  - Hülle: [1 B Version=1][12 B Nonce][ChaCha20-Poly1305-Ciphertext+Tag], AAD = [1][16 B Version-ID]
//  - Klartext: Versionen = {"operations":[…]} als UTF-8-JSON; Snapshot = zlib-komprimiertes {uuid: {prop: value}}
// Client-ID/Secret: IndexedDB/localStorage dieses Browsers + Firestore journal/{uid}/settings/taskchampion (geräteübergreifend).
import { chacha20poly1305 } from "@noble/ciphers/chacha.js";
import { unzlibSync } from "fflate";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db as fdb, auth } from "../firebase.js";
import { setOutbox } from "../offline.js";

const NIL = "00000000-0000-0000-0000-000000000000";
const STALE_MS = 60_000;
const MAX_VERSIONS = 20_000;

// ── IndexedDB (ein Store, Key → Wert) ──
let dbp;
const idb = () => (dbp ||= new Promise((res, rej) => {
  const r = indexedDB.open("tc-door", 1);
  r.onupgradeneeded = () => r.result.createObjectStore("kv");
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
}));
const kv = async (mode, fn) => {
  const db = await idb();
  return new Promise((res, rej) => {
    const tx = db.transaction("kv", mode);
    const req = fn(tx.objectStore("kv"));
    tx.oncomplete = () => res(req?.result);
    tx.onerror = () => rej(tx.error);
  });
};
// ohne IndexedDB (Tests, gesperrter Speicher): nur im Arbeitsspeicher
const fallback = new Map();
const noIdb = typeof indexedDB === "undefined";
const get = (k) => (noIdb ? Promise.resolve(fallback.get(k)) : kv("readonly", (s) => s.get(k)));
const put = (k, v) => (noIdb ? Promise.resolve(void fallback.set(k, v)) : kv("readwrite", (s) => s.put(v, k)));
const del = (k) => (noIdb ? Promise.resolve(void fallback.delete(k)) : kv("readwrite", (s) => s.delete(k)));

// ── Konfiguration ──
// Zugangsdaten zusätzlich in localStorage spiegeln: IndexedDB kann (Safari-ITP, Speicherdruck, gesperrter
// Speicher) leer zurückkommen – dann aus dem Spiegel wiederherstellen statt neu abzufragen.
const LS_KEY = "tc:config";
const lsGet = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch { return null; } };
const lsPut = (v) => { try { v ? localStorage.setItem(LS_KEY, JSON.stringify(v)) : localStorage.removeItem(LS_KEY); } catch { /* Speicher gesperrt */ } };
const persist = () => { try { navigator.storage?.persist?.(); } catch { /* optional */ } };
// Wahrheit pro Nutzer: Firestore journal/{uid}/settings/taskchampion – gilt für alle Apps/Geräte
// (jede App hat eigene Origin und damit eigenen Browser-Speicher). Beim ersten Zugriff ohne lokale Config geholt.
const validCfg = (c) => c && c.url && c.clientId && c.secret;
const userRef = async () => {
  if (!auth) return null;
  if (auth.currentUser) return doc(fdb, "journal", auth.currentUser.uid, "settings", "taskchampion");
  const u = await new Promise((res) => { const off = auth.onAuthStateChanged((x) => { off(); res(x); }); setTimeout(() => res(null), 3000); });
  return u ? doc(fdb, "journal", u.uid, "settings", "taskchampion") : null;
};
const remoteGet = async () => { try { const r = await userRef(); const sn = r && await getDoc(r); return sn?.exists() && validCfg(sn.data()) ? sn.data() : null; } catch { return null; } };
const remotePut = async (cfg) => { try { const r = await userRef(); if (r) await setDoc(r, cfg); } catch { /* offline: lokal gilt */ } };
const remoteDel = async () => { try { const r = await userRef(); if (r) await deleteDoc(r); } catch { /* offline */ } };
let remoteTried = false;
export const getConfig = async () => {
  let cfg;
  try { cfg = await get("config"); } catch { cfg = null; }
  if (cfg) { if (!lsGet()) lsPut(cfg); return cfg; }
  cfg = lsGet();
  if (!cfg && !remoteTried) {
    remoteTried = true;
    cfg = await remoteGet();
    if (!cfg) remoteTried = false; // nicht angemeldet/offline: später erneut versuchen
    else lsPut(cfg);
  }
  if (cfg) { try { await put("config", cfg); } catch { /* nur Spiegel verfügbar */ } }
  return cfg || undefined;
};
export const saveConfig = async ({ url, clientId, secret }) => {
  const cfg = { url: String(url).trim().replace(/\/+$/, ""), clientId: String(clientId).trim().toLowerCase(), secret: String(secret) };
  if (!/^https?:\/\//.test(cfg.url)) throw new Error("Server-URL muss mit https:// beginnen");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(cfg.clientId)) throw new Error("Client-ID ist keine UUID");
  if (!cfg.secret) throw new Error("Secret fehlt");
  const old = await getConfig();
  const same = old && old.clientId === cfg.clientId && old.secret === cfg.secret; // nur URL geändert → Replik behalten
  keyCache = null;
  lsPut(cfg);
  persist();
  await remotePut(cfg);
  try { await put("config", cfg); } catch { /* Spiegel in localStorage genügt */ }
  if (!same) { await del("state"); mem = null; setOutbox(0); }
  return cfg;
};
export const clearConfig = async () => { keyCache = null; mem = null; setOutbox(0); lsPut(null); remoteTried = true; await remoteDel(); await del("config"); await del("state"); };

// ── Krypto ──
const uuidBytes = (id) => Uint8Array.from(id.replace(/-/g, "").match(/../g).map((h) => parseInt(h, 16)));
let keyCache = null;
async function key(cfg) {
  if (keyCache?.id === cfg.clientId) return keyCache.key;
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(cfg.secret), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: uuidBytes(cfg.clientId), iterations: 600_000 }, base, 256);
  keyCache = { id: cfg.clientId, key: new Uint8Array(bits) };
  return keyCache.key;
}
async function seal(cfg, parentId, value) {
  // Versionen gehen als reines UTF-8-JSON raus (nur Snapshots sind zlib-komprimiert)
  const plain = new TextEncoder().encode(JSON.stringify(value));
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const ct = chacha20poly1305(await key(cfg), nonce, new Uint8Array([1, ...uuidBytes(parentId)])).encrypt(plain);
  return new Uint8Array([1, ...nonce, ...ct]);
}
async function open(cfg, versionId, buf) {
  const b = new Uint8Array(buf);
  if (b[0] !== 1) throw new Error("tc-format");
  const aad = new Uint8Array([1, ...uuidBytes(versionId)]);
  let plain;
  try {
    plain = chacha20poly1305(await key(cfg), b.slice(1, 13), aad).decrypt(b.slice(13));
  } catch {
    throw new Error("tc-decrypt"); // falsches Secret oder falsche Client-ID
  }
  // Snapshots sind zlib-komprimiert (0x78-Header), Versionen reines JSON. Reine JS-Dekompression statt
  // DecompressionStream/Response-Stream (Safari/iOS wirft dort ein unspezifisches „Load failed“).
  if (plain[0] === 0x78) {
    try { plain = unzlibSync(plain); } catch { throw new Error("tc-format"); }
  }
  return JSON.parse(new TextDecoder().decode(plain));
}

// ── HTTP ──
const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;
async function call(cfg, path) {
  let res;
  if (isOffline()) throw new Error("tc-network");
  try { res = await fetch(`${cfg.url}/v1/client/${path}`, { headers: { "X-Client-Id": cfg.clientId } }); }
  catch { throw new Error("tc-network"); } // offline, CORS oder Proxy down
  return res;
}
/** Antwortkörper lesen; ein Abbruch mitten im Transfer ist ein Netzwerkfehler (Safari: „Load failed“). */
async function bodyOf(res) {
  try { return await res.arrayBuffer(); } catch { throw new Error("tc-body"); }
}

// ── Replik anwenden ──
function applyOps(tasks, ops) {
  for (const op of ops) {
    if (!op || typeof op !== "object") continue; // "UndoPoint"
    if (op.Create) tasks[op.Create.uuid] ||= {};
    else if (op.Delete) delete tasks[op.Delete.uuid];
    else if (op.Update) {
      const { uuid, property, value } = op.Update;
      const t = (tasks[uuid] ||= {});
      if (value == null) delete t[property]; else t[property] = value;
    }
  }
}

let mem = null; // {versionId, tasks, syncedAt, pending}  tasks = Stand des Servers, pending = lokale, noch nicht gesendete Operationen
const state = async () => {
  if (!mem) { mem = (await get("state")) || { versionId: NIL, tasks: {}, syncedAt: 0 }; mem.pending ||= []; setOutbox(mem.pending.length); }
  return mem;
};

// Änderungen der lokalen Replik (Sync, Commit) → Ansichten laden neu, ohne Netz abzuwarten
const listeners = new Set();
const notify = () => listeners.forEach((f) => { try { f(); } catch { /* Listener-Fehler egal */ } });
export const onChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const clone = (o) => (typeof structuredClone === "function" ? structuredClone(o) : JSON.parse(JSON.stringify(o)));

async function pullSnapshot(cfg, st) {
  const res = await call(cfg, "snapshot");
  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`tc-http-${res.status}`);
  const vid = res.headers.get("X-Version-Id");
  st.tasks = await open(cfg, vid, await bodyOf(res));
  st.versionId = vid;
  return true;
}

let running = null;
/** Neue Versionen holen und anwenden. */
export function sync() {
  return (running ||= (async () => {
    const cfg = await getConfig();
    if (!cfg) throw new Error("tc-unconfigured");
    const st = await state();
    if (st.versionId === NIL) await pullSnapshot(cfg, st);
    for (let n = 0; n < MAX_VERSIONS; n++) {
      const res = await call(cfg, `get-child-version/${st.versionId}`);
      if (res.status === 404) break; // aktuell
      if (res.status === 410) { // Historie weg → Snapshot neu holen
        st.tasks = {}; st.versionId = NIL;
        if (!(await pullSnapshot(cfg, st))) throw new Error("tc-gone");
        continue;
      }
      if (!res.ok) throw new Error(`tc-http-${res.status}`);
      const ops = await open(cfg, st.versionId, await bodyOf(res));
      applyOps(st.tasks, Array.isArray(ops) ? ops : ops.operations || []);
      st.versionId = res.headers.get("X-Version-Id");
    }
    st.syncedAt = Date.now();
    await put("state", st);
    notify();
    return st;
  })().finally(() => { running = null; }));
}

/** Tasks als Array: lokale Replik plus noch nicht gesendete Änderungen. Antwortet sofort aus dem Speicher; ein
 *  Abgleich mit dem Server läuft im Hintergrund (`onChange` meldet das Ergebnis). Nur die allererste Replik braucht Netz. */
export async function tasks({ force = false } = {}) {
  const cfg = await getConfig();
  if (!cfg) throw new Error("tc-unconfigured");
  const st = await state();
  if (st.versionId === NIL) await sync(); // noch keine Replik: einmal laden (offline → tc-network)
  else if (force) { try { await flush(); } catch (e) { if (e?.message !== "tc-network") throw e; } }
  else if (Date.now() - st.syncedAt > STALE_MS) flush().catch(() => {});
  const view = clone((await state()).tasks);
  applyOps(view, (await state()).pending);
  return Object.entries(view).map(([uuid, t]) => ({ uuid, ...t }));
}

export const lastSync = async () => (await state()).syncedAt || 0;

// ── Push ──
const opTime = () => new Date().toISOString().replace(/Z$/, "000000Z"); // RFC3339, 9 Nachkommastellen wie Taskwarrior
export const nowSecs = () => String(Math.floor(Date.now() / 1000));
const tagsOf = (t) => Object.keys(t).filter((k) => k.startsWith("tag_")).map((k) => k.slice(4));

/** Operationen, die `task` auf die gewünschten Eigenschaften bringen (null = Eigenschaft entfernen). */
export function editOps(task, props) {
  return Object.entries(props)
    .filter(([k, v]) => (v ?? undefined) !== task[k])
    .map(([property, value]) => ({ Update: { uuid: task.uuid, property, value: value ?? null, timestamp: opTime() } }));
}
/** Tag setzen/entfernen: Taskwarrior hält `tag_<name>` und die Liste `tags`. */
export function tagProps(task, tag, on) {
  const tags = new Set(tagsOf(task));
  on ? tags.add(tag) : tags.delete(tag);
  return { [`tag_${tag}`]: on ? "x" : null, tags: tags.size ? [...tags].join(",") : null };
}
export function newTaskOps(description, { tags = [], props = {} } = {}) {
  const uuid = crypto.randomUUID();
  const now = nowSecs();
  const all = { status: "pending", entry: now, modified: now, description, ...(tags.length ? { tags: tags.join(",") } : {}), ...Object.fromEntries(tags.map((t) => [`tag_${t}`, "x"])), ...props };
  return { uuid, ops: [{ Create: { uuid } }, ...editOps({ uuid }, all)] };
}

/** Änderung lokal vormerken (sofort sichtbar, offline-fähig) und im Hintergrund an den Server senden. */
export async function commit(ops) {
  if (!ops.length) return;
  if (!(await getConfig())) throw new Error("tc-unconfigured");
  const st = await state();
  st.pending.push(...ops);
  await put("state", st);
  setOutbox(st.pending.length);
  notify();
  flush().catch(() => {}); // offline/Server down: bleibt in der Warteschlange, nächster Anlass sendet erneut
}

let flushing = null;
/** Neue Versionen holen, danach alle vorgemerkten Operationen senden (bei Konflikt 409 neu ziehen und wiederholen). */
export function flush() {
  return (flushing ||= (async () => {
    const cfg = await getConfig();
    if (!cfg) throw new Error("tc-unconfigured");
    await sync();
    const st = await state();
    for (let attempt = 0; st.pending.length && attempt < 5; attempt++) {
      const sent = st.pending.slice();
      if (isOffline()) throw new Error("tc-network");
      let res;
      try {
        res = await fetch(`${cfg.url}/v1/client/add-version/${st.versionId}`, {
          method: "POST",
          headers: { "X-Client-Id": cfg.clientId, "Content-Type": "application/vnd.taskchampion.history-segment" },
          body: await seal(cfg, st.versionId, { operations: sent }),
        });
      } catch { throw new Error("tc-network"); }
      if (res.status === 409) { await sync(); continue; } // jemand war schneller → neu ziehen, erneut senden
      if (!res.ok) throw new Error(`tc-http-${res.status}`);
      applyOps(st.tasks, sent);
      st.pending = st.pending.slice(sent.length); // Änderungen, die während des Sendens dazukamen, bleiben stehen
      st.versionId = res.headers.get("X-Version-Id");
      st.syncedAt = Date.now();
      await put("state", st);
      setOutbox(st.pending.length);
      notify();
      attempt = -1; // erfolgreich: Rest (falls vorhanden) mit frischem Versuchszähler
    }
    if (st.pending.length) throw new Error("tc-conflict");
  })().finally(() => { flushing = null; }));
}
