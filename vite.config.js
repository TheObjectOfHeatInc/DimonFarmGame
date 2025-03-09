import { defineConfig } from "vite";

export default {
  base: "/DimonFarmGame/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      external: ["crypto"],
    },
  },
};
ы;
