import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
export default defineConfig({ testDir: ".", testMatch: "prepare.spec.ts", workers: 1,
  reporter: [["list"], ["json", { outputFile: "../logs/prepare.json" }]], outputDir: "../runs/prepare" });
