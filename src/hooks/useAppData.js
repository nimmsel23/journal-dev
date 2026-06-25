import { useNutritionData, useMacroTrend, useJournal } from "./useNutrition.js";
import { useSuppStats, useSuppCatalog, useSuppLog } from "./useSupplements.js";

export function useAppData(activeDate) {
  const { data: nutrition }  = useNutritionData(activeDate);
  const { data: sup }        = useSuppStats(activeDate);
  const { data: suppCatalog } = useSuppCatalog();
  const { data: suppLog }    = useSuppLog(activeDate);
  const { data: journal }    = useJournal(activeDate);
  const { data: macroTrend } = useMacroTrend(activeDate);
  return { nutrition, sup, suppCatalog, suppLog, journal, macroTrend };
}
