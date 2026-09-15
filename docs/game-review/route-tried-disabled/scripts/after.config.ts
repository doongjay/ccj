import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/route-tried-disabled/after";
export default defineConfig({
  testDir: "../../../../game/e2e",
  testMatch: ["route-tried-disabled.spec.ts", "review-batch-b-guidance.spec.ts", "story-choice-layout.spec.ts", "car-guidance-reference.spec.ts", "current-journey.spec.ts"],
  fullyParallel: true, workers: 2, retries: 0,
  reporter: [["list"], ["json", { outputFile: "../logs/after.json" }]], outputDir: "../runs/after",
  use: { baseURL: "http://127.0.0.1:5174", viewport: { width: 393, height: 852 }, trace: "retain-on-failure", video: { mode: "on", size: { width: 430, height: 932 } } },
});
