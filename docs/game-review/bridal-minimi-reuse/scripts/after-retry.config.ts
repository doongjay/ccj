import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/bridal-minimi-reuse/after-retry";
export default defineConfig({ testDir: "../../../../game/e2e", testMatch: ["bridal-minimi-reuse.spec.ts", "review-batch-d-checkpoint.spec.ts"], workers: 2, grep: /existing bridal minimi|actual one\/two photos restore/,
  reporter: [["list"], ["json", { outputFile: "../logs/after-retry.json" }]], outputDir: "../runs/after-retry",
  use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure", video: { mode: "on", size: { width: 430, height: 932 } } } });
