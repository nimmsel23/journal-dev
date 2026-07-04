#!/usr/bin/env node
// Deployt einen 24h-Firebase-Preview-Channel und schickt den Link per Telegram.
// Läuft bewusst LOKAL (nicht in CI): die Crossover-Aliase in vite.config.cjs
// (@fuel/@habits/@fitness/@db) zeigen absolut auf die Nachbar-Repos unter
// /home/alpha — nur hier existiert der echte Build-Kontext.
// Telegram-Creds kommen aus ~/.env/fitness.env (TELEGRAM_TOKEN, TELEGRAM_CHAT_ID).

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const PROJECT = "fitness-aos";
const CHANNEL = "preview";
const EXPIRES = "24h";

function loadEnvFile(path) {
  const env = {};
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* Datei fehlt → Telegram wird einfach übersprungen */ }
  return env;
}

console.log(`🚀 Deploye Preview-Channel "${CHANNEL}" (${EXPIRES}) → ${PROJECT} ...`);
const raw = execSync(
  `firebase hosting:channel:deploy ${CHANNEL} --expires ${EXPIRES} --project ${PROJECT} --json`,
  { encoding: "utf8", stdio: ["inherit", "pipe", "inherit"] }
);

const result = JSON.parse(raw);
const sites = Object.values(result.result || {});
const url = sites[0]?.url;
const expireTime = sites[0]?.expireTime;
if (!url) {
  console.error("❌ Keine Preview-URL in der Firebase-Antwort gefunden:", raw);
  process.exit(1);
}
console.log(`✅ Preview: ${url}`);
if (expireTime) console.log(`⏱️  Gültig bis: ${expireTime}`);

const env = loadEnvFile(join(homedir(), ".env", "fitness.env"));
const token = env.TELEGRAM_TOKEN;
const chatIds = (env.TELEGRAM_CHAT_ID || "").split(",").map((s) => s.trim()).filter(Boolean);

if (!token || chatIds.length === 0) {
  console.log("ℹ️  Kein TELEGRAM_TOKEN/TELEGRAM_CHAT_ID in ~/.env/fitness.env — überspringe Telegram.");
  process.exit(0);
}

let commit = "";
try {
  commit = execSync("git log -1 --format=%s", { encoding: "utf8" }).trim();
} catch { /* kein git → egal */ }

const text = [
  "🚀 Neue Preview für Journal (dev) deployed!",
  "",
  `🔗 ${url}`,
  `⏱️ Gültig für ${EXPIRES}.`,
  commit ? `\nCommit: ${commit}` : "",
].join("\n");

for (const chatId of chatIds) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const body = await res.json();
  console.log(body.ok ? `📨 Telegram → ${chatId} ok` : `⚠️ Telegram → ${chatId} fehlgeschlagen: ${body.description}`);
}
