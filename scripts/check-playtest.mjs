import { execSync } from "node:child_process";

execSync("pnpm build:playtest", { stdio: "inherit" });

const status = execSync("git status --porcelain -- playtest", { encoding: "utf8" });
if (status.trim()) {
  console.error("playtest/ does not match a fresh build. Commit the result of pnpm build:playtest.");
  console.error(status);
  execSync("git diff -- playtest", { stdio: "inherit" });
  process.exit(1);
}
