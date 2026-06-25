// user.js — settings + (stub) body entries. Settings persist to localStorage
// so they survive across reloads; body entries are unused stubs for now.

const LOCAL_KEYS = {
  settings: "journal-vos-settings",
  layout: "journal-vos-layout",
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export async function getSettings() {
  return readJSON(LOCAL_KEYS.settings, { theme: "honey", themeMode: "manual" });
}

export async function saveSettings(settings) {
  writeJSON(LOCAL_KEYS.settings, settings);
  return { ok: true };
}

export async function getLayout() {
  const layout = readJSON(LOCAL_KEYS.layout, null);
  return layout?.layout || null;
}

export async function saveLayout(layout) {
  writeJSON(LOCAL_KEYS.layout, { layout });
  return { ok: true };
}

export async function getBodyEntry(_date) { return null; }
export async function saveBodyEntry(_date, _data) { return { ok: false, stub: true }; }
export async function getBodyEntries(_days = 30) { return []; }
