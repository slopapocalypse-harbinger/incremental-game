import { readFileSync, writeFileSync, rmSync } from "node:fs";

const assetHost =
  "https://cdn.jsdelivr.net/gh/slopapocalypse-harbinger/incremental-game@cursor/birds-rebuild-233d/playtest/";
const file = "playtest/index.html";
const html = readFileSync(file, "utf8").replaceAll('href="./', `href="${assetHost}`);
writeFileSync(file, html);
rmSync("playtest/og.png", { force: true });
