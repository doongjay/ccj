import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/original-photo-quality/after";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: "original-photo-quality.spec.ts", grep: /all 29/,
  workers: 1, retries: 0,
  reporter: [["list"], ["json", { outputFile: "../logs/integrity-retry.json" }]], outputDir: "../runs/integrity-retry",
  use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure" },
});
