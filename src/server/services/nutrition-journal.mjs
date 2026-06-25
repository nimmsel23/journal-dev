import fs from "fs";
import path from "path";
import { NUTRITION_JOURNAL_DIR } from "../config/paths.mjs";

function getPath(date) {
  return path.join(NUTRITION_JOURNAL_DIR, `${date}.md`);
}

export function readEntry(date) {
  const filePath = getPath(date);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8");
  }
  return "";
}

export function writeEntry(date, content) {
  const filePath = getPath(date);
  fs.writeFileSync(filePath, content, "utf-8");
}

export function listEntries() {
  if (!fs.existsSync(NUTRITION_JOURNAL_DIR)) {
    return [];
  }
  return fs
    .readdirSync(NUTRITION_JOURNAL_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse()
    .map((name) => ({ name, date: name.replace(/\.md$/, "") }));
}
