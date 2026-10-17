// taskchampion.js — Browser-Client für den TaskChampion-Sync-Server (Taskwarrior 3 `task sync`).
// Pull: Snapshot + Versionen holen, entschlüsseln, in IndexedDB als Replik halten.
// Push: lokale Änderungen als Operationen per AddVersion senden (commit()).
// Protokoll: gothenburgbitfactory.org/taskchampion (http, encryption, sync-protocol).
//  - Schlüssel: PBKDF2-HMAC-SHA256, 600 000 Iterationen, Salt = 16-Byte-Client-ID, 32 Byte
//  - Hülle: [1 B Version=1][12 B Nonce][ChaCha20-Poly1305-Ciphertext+Tag], AAD = [1][16 B Version-ID]
//  - Klartext: Versionen = {"operations":[…]} als UTF-8-JSON; Snapshot = zlib-komprimiertes {uuid: {prop: value}}
// Client-ID/Secret liegen nur in der IndexedDB dieses Browsers, nie in Firestore.
import { chacha20poly1305 } from "@noble/ciphers/chacha.js";

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
export const getConfig = () => get("config");
export const saveConfig = async ({ url, clientId, secret }) => {
  const cfg = { url: String(url).trim().replace(/\/+$/, ""), clientId: String(clientId).trim().toLowerCase(), secret: String(secret) };
  if (!/^https?:\/\//.test(cfg.url)) throw new Error("Server-URL muss mit https:// beginnen");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(cfg.clientId)) throw new Error("Client-ID ist keine UUID");
  if (!cfg.secret) throw new Error("Secret fehlt");
  keyCache = null;
  await put("config", cfg);
  await del("state");
  mem = null;
  return cfg;
};
export const clearConfig = async () => { keyCache = null; mem = null; await del("config"); await del("state"); };

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
  // Klartext ist zlib-komprimiertes JSON (0x78-Header); unkomprimiert wird ebenfalls akzeptiert
  if (plain[0] === 0x78) {
    const ds = new Blob([plain]).stream().pipeThrough(new DecompressionStream("deflate"));
    plain = new Uint8Array(await new Response(ds).arrayBuffer());
  }
  return JSON.parse(new TextDecoder().decode(plain));
}

// ── HTTP ──
async function call(cfg, path) {
  let res;
  try { res = await fetch(`${cfg.url}/v1/client/${path}`, { headers: { "X-Client-Id": cfg.clientId } }); }
  catch { throw new Error("tc-network"); } // offline, CORS oder Proxy down
  return res;
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

let mem = null; // {versionId, tasks, syncedAt}
const state = async () => (mem ||= (await get("state")) || { versionId: NIL, tasks: {}, syncedAt: 0 });

async function pullSnapshot(cfg, st) {
  const res = await call(cfg, "snapshot");
  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`tc-http-${res.status}`);
  const vid = res.headers.get("X-Version-Id");
  st.tasks = await open(cfg, vid, await res.arrayBuffer());
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
      const ops = await open(cfg, st.versionId, await res.arrayBuffer());
      applyOps(st.tasks, Array.isArray(ops) ? ops : ops.operations || []);
      st.versionId = res.headers.get("X-Version-Id");
    }
    st.syncedAt = Date.now();
    await put("state", st);
    return st;
  })().finally(() => { running = null; }));
}

/** Tasks als Array (Replik); synct, wenn älter als 60 s oder force. */
export async function tasks({ force = false } = {}) {
  const cfg = await getConfig();
  if (!cfg) throw new Error("tc-unconfigured");
  const st = await state();
  if (force || Date.now() - st.syncedAt > STALE_MS) await sync();
  return Object.entries((await state()).tasks).map(([uuid, t]) => ({ uuid, ...t }));
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

/** Operationen an den Server senden (vorher Pull; bei Konflikt 409 neu ziehen und wiederholen). */
export async function commit(ops) {
  if (!ops.length) return;
  const cfg = await getConfig();
  if (!cfg) throw new Error("tc-unconfigured");
  for (let attempt = 0; attempt < 5; attempt++) {
    await sync();
    const st = await state();
    let res;
    try {
      res = await fetch(`${cfg.url}/v1/client/add-version/${st.versionId}`, {
        method: "POST",
        headers: { "X-Client-Id": cfg.clientId, "Content-Type": "application/vnd.taskchampion.history-segment" },
        body: await seal(cfg, st.versionId, { operations: ops }),
      });
    } catch { throw new Error("tc-network"); }
    if (res.status === 409) continue; // jemand war schneller → neu ziehen, erneut senden
    if (!res.ok) throw new Error(`tc-http-${res.status}`);
    applyOps(st.tasks, ops);
    st.versionId = res.headers.get("X-Version-Id");
    st.syncedAt = Date.now();
    await put("state", st);
    return;
  }
  throw new Error("tc-conflict");
}
