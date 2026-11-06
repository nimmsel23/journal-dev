import test from "node:test";
import assert from "node:assert/strict";
import {
  dailyNutritionRecordOption,
  dailyRelaxSessionOption,
  hasDailySkillRecordData,
} from "../src/views/Habits/dailySkillRecordModel.js";

const date = "2026-11-03";

test("Nutrition day log exposes meal and water details without copying its source record", () => {
  const log = { date, meals: [{ description: "Haferflocken" }, { description: "Reis mit Huhn" }], water_ml: 500 };
  assert.deepEqual(dailyNutritionRecordOption(date, log), {
    recordId: date,
    date,
    title: "Haferflocken, Reis mit Huhn",
    detail: "2 Mahlzeiten · 500 ml Wasser",
  });
  assert.equal(hasDailySkillRecordData("nutrition", log), true);
  assert.equal(hasDailySkillRecordData("nutrition", { meals: [], water_ml: 0 }), false);
  assert.equal(dailyNutritionRecordOption(date, { date: "2026-11-02", meals: [{ description: "Falsch" }] }), null);
});

test("Relax day log accepts legacy practices without IDs and ignores empty items", () => {
  const record = {
    date,
    items: [
      { technique: "", minutes: 0 },
      { technique: "Atemübung", minutes: 10 },
      { reflection: "Danach ruhiger" },
    ],
  };
  assert.deepEqual(dailyRelaxSessionOption(date, record), {
    recordId: date,
    date,
    title: "Atemübung, Relax-Praxis",
    detail: "2 Praxen · 10 Min.",
  });
  assert.equal(hasDailySkillRecordData("relax", record), true);
  assert.equal(dailyRelaxSessionOption(date, { date, items: [{ technique: "", minutes: 0 }] }), null);
  assert.equal(dailyRelaxSessionOption(date, { date: "2026-11-02", items: [{ technique: "Meditation" }] }), null);
});
