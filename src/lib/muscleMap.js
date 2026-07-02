import { useState, useEffect } from 'react';

const AGENT_BASE = import.meta.env.MODE === 'firebase' ? null : 'http://localhost:9120';
const EMPTY = { rbh: {}, body_muscles: {}, body_muscles_slugs: {} };

let cache = null;
let pending = null;
const listeners = [];

function notify() {
  listeners.splice(0).forEach(fn => fn(cache));
}

async function load() {
  if (!AGENT_BASE) {
    cache = EMPTY;
    notify();
    return;
  }
  try {
    const res = await fetch(`${AGENT_BASE}/muscles/viz`);
    cache = res.ok ? await res.json() : EMPTY;
  } catch {
    cache = EMPTY;
  }
  notify();
}

function ensure() {
  if (!pending) pending = load();
  return pending;
}

ensure();

export function useMuscleMap() {
  const [map, setMap] = useState(cache);
  useEffect(() => {
    if (cache) { setMap(cache); return; }
    listeners.push(setMap);
    ensure();
    return () => {
      const i = listeners.indexOf(setMap);
      if (i !== -1) listeners.splice(i, 1);
    };
  }, []);
  return map;
}

export function getMuscleMapSync() {
  return cache;
}
