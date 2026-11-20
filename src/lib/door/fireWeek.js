import { endOfISOWeek, startOfISOWeek } from "date-fns";

export const FIRE_DOMAINS = ["body", "being", "balance", "business"];
const tagged = (t, tag) => t[`tag_${tag}`] !== undefined;
export function fireWeek(all, now = new Date()) {
  const from = startOfISOWeek(now).getTime() / 1000;
  const to = endOfISOWeek(now).getTime() / 1000;
  const within = (value) => Number(value) >= from && Number(value) <= to;
  const tasks = all.filter((t) => (t.status === "pending" || t.status === "completed")
    && !tagged(t, "door") && (tagged(t, "fire") || tagged(t, "hit") || t.alphatype === "bigrock")
    && (within(t.due) || (t.status === "completed" && within(t.end))));
  const groups = Object.fromEntries([...FIRE_DOMAINS, "unassigned"].map((d) => [d, []]));
  for (const task of tasks) {
    const domain = String(task.domain || "").toLowerCase().trim();
    groups[FIRE_DOMAINS.includes(domain) ? domain : "unassigned"].push(task);
  }
  return groups;
}
