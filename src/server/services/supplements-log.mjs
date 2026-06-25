import path from "path";
import { readJsonFile, writeJsonFile } from "../lib/file-io.mjs";
import { randomId } from "../../shared/utils/ids.mjs";
import { SUPPLEMENTS_LOG_DIR } from "../config/paths.mjs";

function getLogPath(date) {
  return path.join(SUPPLEMENTS_LOG_DIR, `${date}.json`);
}

export function loadLog(date) {
  const filePath = getLogPath(date);
  const log = readJsonFile(filePath, {
    date,
    intakes: [],
  });
  if (!log.intakes) log.intakes = [];
  return log;
}

export function saveLog(log) {
  const filePath = getLogPath(log.date);
  writeJsonFile(filePath, log);
}

export function addIntake(log, intakeInput) {
  const supplementId = (intakeInput.supplement_id || "").toString().trim();
  const name = (intakeInput.name || supplementId).toString().trim();
  if (!supplementId || !name) return null;

  const dose = intakeInput.dose == null ? null : Number(intakeInput.dose);
  const unit = (intakeInput.unit || "mg").toString().trim() || "mg";
  const timeOfDay = (intakeInput.time_of_day || "any").toString().trim() || "any";
  const notes = (intakeInput.notes || "").toString().trim();

  const intake = {
    id: randomId("supp"),
    supplement_id: supplementId,
    name,
    dose,
    unit,
    time_of_day: timeOfDay,
    notes,
    time: new Date().toISOString(),
  };

  log.intakes.push(intake);
  return intake;
}

export function deleteIntake(log, intakeId) {
  const idx = log.intakes.findIndex((i) => i.id === intakeId);
  if (idx >= 0) {
    log.intakes.splice(idx, 1);
    return true;
  }
  return false;
}
