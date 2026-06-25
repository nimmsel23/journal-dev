import { spawn } from "node:child_process";

const env = {
  ...process.env,
  PORT: process.env.PORT || "9000",
  HOST: process.env.HOST || "0.0.0.0",
  FUEL_BUILD_DIR: process.env.FUEL_BUILD_DIR || "./dist",
  FUEL_VITE_ORIGIN: process.env.FUEL_VITE_ORIGIN || "http://127.0.0.1:9001",
};

const procs = [];

function start(name, command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    env: { ...env, ...extraEnv },
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code, signal) => {
    if (signal || code !== 0) {
      stopAll();
      process.exit(code ?? 0);
    }
  });

  procs.push(child);
  console.log(`[dev] started ${name} (${child.pid})`);
}

function stopAll() {
  for (const child of procs) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGTERM", () => {
  stopAll();
  process.exit(0);
});

process.on("SIGINT", () => {
  stopAll();
  process.exit(0);
});

start("api", "node", ["server.mjs"]);
start("ui", "node_modules/.bin/vite", ["--host", "127.0.0.1", "--port", "9001"]);
