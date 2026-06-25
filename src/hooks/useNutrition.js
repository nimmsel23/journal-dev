import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "../lib/api.js";
import * as firestore from "../lib/firestore-db.js";

const isCloud = () => window.location.hostname.includes("web.app") || window.location.hostname.includes("firebaseapp.com");

export function useNutritionData(date) {
  return useQuery({
    queryKey: ["nutrition", date],
    queryFn: async () => {
      if (isCloud()) {
        return await firestore.getNutritionLog(date);
      }
      try {
        const data = await fetchJson(`/nutrition/log?date=${date}`);
        return data.data;
      } catch (err) {
        console.warn("API fallback to Firestore:", err);
        return await firestore.getNutritionLog(date);
      }
    },
    staleTime: 30_000,
  });
}

export function useMacroTrend(anchorDate, days = 10) {
  return useQuery({
    queryKey: ["macro-trend", anchorDate, days],
    queryFn: async () => {
      const anchor = new Date(anchorDate);
      const dates = Array.from({ length: days }, (_, i) => {
        const d = new Date(anchor);
        d.setDate(d.getDate() - (days - 1 - i));
        return d.toISOString().slice(0, 10);
      });

      if (isCloud()) {
        const logs = await firestore.getNutritionLogsInRange(dates);
        return dates.map(d => {
          const meals = logs[d]?.meals || [];
          return {
            day: d.slice(5),
            kcal: Math.round(meals.reduce((s, m) => s + (m.kcal || 0), 0)),
            protein: Math.round(meals.reduce((s, m) => s + (m.protein || 0), 0)),
            carbs: Math.round(meals.reduce((s, m) => s + (m.carbs || 0), 0)),
            fat: Math.round(meals.reduce((s, m) => s + (m.fat || 0), 0)),
          };
        });
      }

      const results = await Promise.all(
        dates.map((d) =>
          fetchJson(`/nutrition/log?date=${d}`)
            .then((r) => ({ date: d, meals: r.data?.meals || [] }))
            .catch(() => ({ date: d, meals: [] }))
        )
      );
      return results.map(({ date, meals }) => ({
        day: date.slice(5),
        kcal: Math.round(meals.reduce((s, m) => s + (m.kcal || 0), 0)),
        protein: Math.round(meals.reduce((s, m) => s + (m.protein || 0), 0)),
        carbs: Math.round(meals.reduce((s, m) => s + (m.carbs || 0), 0)),
        fat: Math.round(meals.reduce((s, m) => s + (m.fat || 0), 0)),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useJournal(date) {
  return useQuery({
    queryKey: ["journal", date],
    queryFn: async () => {
      if (isCloud()) {
        return await firestore.getJournal(date);
      }
      try {
        const data = await fetchJson(`/nutrition/journal?date=${date}`);
        return data.content;
      } catch (err) {
        console.warn("API fallback to Firestore:", err);
        return await firestore.getJournal(date);
      }
    },
    staleTime: 30_000,
  });
}
