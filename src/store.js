import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format } from "date-fns";

export const useApp = create((set) => ({
  activeTab: import.meta.env.VITE_DEFAULT_TAB || "journal",
  activeDate: format(new Date(), "yyyy-MM-dd"),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveDate: (activeDate) => set({ activeDate }),
  // Journal v2: Ansichtsmodus "tag" | "woche" | "monat" (Hash: #v2/woche/<datum>)
  v2Mode: "tag",
  setV2Mode: (v2Mode) => set({ v2Mode }),
}));

export const useSettings = create(
  persist(
    (set) => ({
      kcal_goal: 2000,
      protein_goal: 150,
      water_goal: 2500,
      age: 30,
      gender: "m",
      setSetting: (key, val) => set({ [key]: val }),
    }),
    { name: "journal-settings" }
  )
);
