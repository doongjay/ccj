import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/route-wrong-copy/after";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: ["review-batch-b-guidance.spec.ts", "route-tried-disabled.spec.ts"], fullyParallel: true, workers: 2, retries: 0,
  reporter: [["list"], ["json", { outputFile: "../logs/after.json" }]], outputDir: "../runs/after",
  use: { baseURL: "http://127.0.0.1:5174", reducedMotion: "no-preference", trace: "retain-on-failure" },
});
