import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "../lib/api.js";

export function localISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export function weekDates(anchor) {
  const d = new Date(anchor + "T12:00:00");
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    return localISO(day);
  });
}

async function fetchLog(date) {
  try {
    const data = await fetchJson(`/nutrition/log?date=${date}`);
    return { date, meals: data.data?.meals || [] };
  } catch (err) {
    return { date, meals: [] };
  }
}

export function useWeekLogs(anchor) {
  const dates = weekDates(anchor);
  return useQuery({
    queryKey: ["week-logs", anchor],
    queryFn: async () => {
      const results = await Promise.all(dates.map(fetchLog));
      return Object.fromEntries(results.map((r) => [r.date, r.meals]));
    },
    staleTime: 0,
  });
}
