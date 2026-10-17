import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/postcss";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const legacyRoot = fileURLToPath(new URL("./legacy/github-pages", import.meta.url));

export default defineConfig({
  root: legacyRoot,
  base: "/incremental-game/",
  publicDir: fileURLToPath(new URL("./legacy/public", import.meta.url)),
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  build: {
    outDir: fileURLToPath(new URL("./dist-pages", import.meta.url)),
    emptyOutDir: true,
  },
});
