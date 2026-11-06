// Minimal core für habits-dev — nur api + localToday, kein journal/firestore Overhead
const BASE = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_API_BASE || '') : '';

const _fetch = () =>
  typeof window !== 'undefined' && window.aosOfflineQueue?.fetch
    ? window.aosOfflineQueue.fetch
    : fetch;

export const api = {
  async get(path) {
    const res = await _fetch()(BASE + path, { cache: 'no-store' });
    if (!res.ok && !res.headers?.get?.('X-Source')?.startsWith('offline'))
      throw new Error(`GET ${path} → ${res.status}`);
    return res.json().catch(() => null);
  },
  async post(path, data) {
    const res = await _fetch()(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok && res.status !== 202) throw new Error(`POST ${path} → ${res.status}`);
    return res.json();
  },
  async delete(path) {
    const res = await _fetch()(BASE + path, { method: 'DELETE' });
    if (!res.ok && res.status !== 202) throw new Error(`DELETE ${path} → ${res.status}`);
    return res.json();
  },
};

export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
