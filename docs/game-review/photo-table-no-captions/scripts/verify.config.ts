import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/photo-table-no-captions/after";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: "photo-table-personalized.spec.ts", grep: /at 393/,
  fullyParallel: true, workers: 2, retries: 0,
  reporter: [["list"], ["json", { outputFile: "../logs/browser.json" }]], outputDir: "../runs",
  use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure" },
});
