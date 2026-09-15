import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/route-tried-disabled/before";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: "review-batch-b-guidance.spec.ts", fullyParallel: true, workers: 2, retries: 0,
  reporter: [["list"], ["json", { outputFile: "../logs/before.json" }]], outputDir: "../runs/before",
  use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure" },
});
