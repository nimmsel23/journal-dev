import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format } from "date-fns";

export const useApp = create((set) => ({
  activeTab: "journal",
  activeDate: format(new Date(), "yyyy-MM-dd"),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveDate: (activeDate) => set({ activeDate }),
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
