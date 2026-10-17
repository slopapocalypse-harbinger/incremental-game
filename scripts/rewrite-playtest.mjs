import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";

const branch =
  process.env.PLAYTEST_BRANCH ||
  execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
const assetHost = `https://cdn.jsdelivr.net/gh/slopapocalypse-harbinger/incremental-game@${branch}/playtest/`;
const file = "playtest/index.html";
const html = readFileSync(file, "utf8").replaceAll('href="./', `href="${assetHost}`);
writeFileSync(file, html);
rmSync("playtest/og.png", { force: true });
