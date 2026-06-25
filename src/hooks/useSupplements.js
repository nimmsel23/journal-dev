import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "../lib/api.js";
import * as firestore from "../lib/firestore-db.js";

const isCloud = () => window.location.hostname.includes("web.app") || window.location.hostname.includes("firebaseapp.com");

export function useSuppStats(date) {
  return useQuery({
    queryKey: ["supp-stats", date],
    queryFn: async () => {
      if (isCloud()) {
        return await firestore.getSupplementStats(date);
      }
      try {
        return await fetchJson(`/supplements/stats?days=30&anchor=${date}`);
      } catch (err) {
        console.warn("API fallback to Firestore:", err);
        return await firestore.getSupplementStats(date);
      }
    },
    staleTime: 30_000,
  });
}

export function useSuppCatalog() {
  return useQuery({
    queryKey: ["supp-catalog"],
    queryFn: async () => {
      if (isCloud()) {
        return await firestore.getSupplementsCatalog();
      }
      try {
        const data = await fetchJson("/supplements/catalog");
        return data.items || [];
      } catch (err) {
        console.warn("API fallback to Firestore:", err);
        return await firestore.getSupplementsCatalog();
      }
    },
    staleTime: 300_000,
  });
}

export function useSuppLog(date) {
  return useQuery({
    queryKey: ["supp-log", date],
    queryFn: async () => {
      if (isCloud()) {
        return await firestore.getSupplementLog(date);
      }
      try {
        const data = await fetchJson(`/supplements/log?date=${date}`);
        return data.data;
      } catch (err) {
        console.warn("API fallback to Firestore:", err);
        return await firestore.getSupplementLog(date);
      }
    },
    staleTime: 30_000,
  });
}
