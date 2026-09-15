import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/original-photo-quality/after";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: "original-photo-quality.spec.ts", grep: /numeric order|DPR 3/,
  workers: 1, retries: 0, timeout: 90000,
  reporter: [["list"], ["json", { outputFile: "../logs/gallery-retry.json" }]], outputDir: "../runs/gallery-retry",
  use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure", video: { mode: "on", size: { width: 430, height: 932 } } },
});
