export function randomId(prefix = "") {
  const ts = Date.now().toString(36).slice(-6);
  const rnd = Math.random().toString(36).slice(2, 8);
  const id = `${ts}${rnd}`;
  return prefix ? `${prefix}_${id}` : id;
}

export function slugifyId(value, prefix = "") {
  const slug = String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 50);
  return prefix ? `${prefix}_${slug}` : slug;
}
