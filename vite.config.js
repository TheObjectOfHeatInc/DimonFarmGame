import { defineConfig } from "vite";

export default defineConfig({
  base: "/DimonFarmGame/",
  build: {
    target: "es2015",
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },
});
