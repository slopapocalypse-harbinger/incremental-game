import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  const preview = mode === "preview";
  const playtest = mode === "playtest";
  const playtestBase =
    "https://cdn.jsdelivr.net/gh/slopapocalypse-harbinger/incremental-game@cursor/birds-rebuild-233d/playtest/";
  const base =
    command === "serve" ? "/" : playtest ? playtestBase : preview ? "/incremental-game/next/" : "/incremental-game/";
  return {
    base,
    plugins: [react()],
    build: {
      outDir: playtest ? "playtest" : preview ? "dist-pages/next" : "dist-pages",
      emptyOutDir: true,
    },
  };
});
