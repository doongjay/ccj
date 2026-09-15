import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
export default defineConfig({
  testDir: ".", testMatch: "prepare-photos.spec.ts", workers: 1, retries: 0,
  reporter: [["list"], ["json", { outputFile: "../logs/prepare.json" }]], outputDir: "../runs/prepare",
});
