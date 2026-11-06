// journalSearch.js — Freitextsuche und Filter für Journal v2 (p2-timeline).
// Reine Funktionen: Parsing des Sucheingangs und Matching. Einträge werden
// nur gelesen und gefiltert; Tags sind hier reine Filter (Scope Observe v1,
// "Zwei getrennte Mechaniken": kein Parsing-Auslöser, keine Ableitung).

export function parseSearchQuery(input = "") {
  const tokens = String(input || "").trim().split(/\s+/).filter(Boolean);
  const tags = [];
  const words = [];
  for (const token of tokens) {
    if (token.length > 1 && token.startsWith("+")) tags.push(token.slice(1).toLowerCase());
    else words.push(token.toLowerCase());
  }
  return { tags, words };
}

const hasText = (entry) => typeof entry.text === "string" && entry.text.trim().length > 0;

export function matchesSearch(entry, { tags = [], words = [] }) {
  if (!hasText(entry)) return false;
  const text = entry.text.toLowerCase();
  if (words.length && !words.every((word) => text.includes(word))) return false;
  if (tags.length) {
    const entryTags = (Array.isArray(entry.tags) ? entry.tags : []).map((tag) => String(tag).toLowerCase());
    if (!tags.every((tag) => entryTags.some((entryTag) => entryTag.includes(tag)))) return false;
  }
  return true;
}

export function searchEntries(entries = [], query) {
  const parsed = typeof query === "string" ? parseSearchQuery(query) : query;
  if (!parsed || (!parsed.tags.length && !parsed.words.length)) return [];
  return entries
    .filter((entry) => matchesSearch(entry, parsed))
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.time || "").localeCompare(a.time || ""));
}

// Kurzer Treffer-Ausschnitt um das erste Wortvorkommen; Eintrag bleibt unverändert.
export function excerptFor(entry, words = [], max = 140) {
  const text = String(entry.text || "");
  const lower = text.toLowerCase();
  const hit = words.length ? Math.max(0, lower.indexOf(words[0])) : 0;
  const start = hit > 40 ? hit - 40 : 0;
  const body = text.slice(start, start + max).replace(/\s+/g, " ").trim();
  return (start > 0 ? "… " : "") + body + (start + max < text.length ? " …" : "");
}
