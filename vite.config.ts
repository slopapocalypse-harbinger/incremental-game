import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  const preview = mode === "preview";
  const base =
    command === "serve" ? "/" : preview ? "/incremental-game/next/" : "/incremental-game/";
  return {
    base,
    plugins: [react()],
    build: {
      outDir: preview ? "dist-pages/next" : "dist-pages",
      emptyOutDir: true,
    },
  };
});
