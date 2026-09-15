import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/bridal-minimi-reuse/after";
export default defineConfig({ testDir: "../../../../game/e2e", testMatch: ["bridal-minimi-reuse.spec.ts", "review-batch-c-photos.spec.ts"], workers: 2,
  reporter: [["list"], ["json", { outputFile: "../logs/after.json" }]], outputDir: "../runs/after",
  use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure", video: { mode: "on", size: { width: 430, height: 932 } } } });
