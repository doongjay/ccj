import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/hall-overlay-refinement/after";
process.env.HALL_CAPTURE_PHASE = "after";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: "hall-overlay-layout.spec.ts", workers: 2, retries: 0,
  reporter: [["list"], ["json", { outputFile: "../logs/after.json" }]],
  outputDir: "../runs/after",
  use: { baseURL: "http://127.0.0.1:5174", reducedMotion: "no-preference", trace: "retain-on-failure", video: { mode: "on", size: { width: 430, height: 932 } } },
});
