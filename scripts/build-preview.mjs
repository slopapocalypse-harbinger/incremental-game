import { spawnSync } from "node:child_process";

function run(args) {
  const result = spawnSync("pnpm", ["exec", ...args], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(["vite", "build", "--config", "vite.legacy.config.ts"]);
run(["vite", "build", "--mode", "preview"]);
