const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{16,80}$/;

export function browserStorage() {
  try { return globalThis.localStorage; } catch { return null; }
}

export function smartLogRequestKey(uid, date) {
  return `jv2:smart-request:v1:${uid}:${date}`;
}

export function readSmartLogRequestId(storage, key) {
  try {
    const value = storage.getItem(key);
    return typeof value === "string" && REQUEST_ID_PATTERN.test(value) ? value : "";
  } catch {
    return "";
  }
}

export function writeSmartLogRequestId(storage, key, requestId) {
  if (!REQUEST_ID_PATTERN.test(requestId)) return false;
  try {
    storage.setItem(key, requestId);
    return true;
  } catch {
    return false;
  }
}

export function clearSmartLogRequestId(storage, key) {
  try { storage.removeItem(key); } catch { /* private browsing or blocked storage */ }
}
