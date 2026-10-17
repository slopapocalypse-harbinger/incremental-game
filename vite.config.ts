import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  const preview = mode === "preview";
  const playtest = mode === "playtest";
  const base =
    command === "serve" ? "/" : playtest ? "./" : preview ? "/incremental-game/next/" : "/incremental-game/";
  return {
    base,
    plugins: [react()],
    build: {
      outDir: playtest ? "playtest" : preview ? "dist-pages/next" : "dist-pages",
      emptyOutDir: true,
    },
  };
});
