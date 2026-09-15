import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/hall-overlay-refinement/before";
process.env.HALL_CAPTURE_PHASE = "before";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: "hall-overlay-layout.spec.ts", workers: 1, retries: 0,
  reporter: [["list"], ["json", { outputFile: "../logs/before.json" }]],
  outputDir: "../runs/before",
  use: { baseURL: "http://127.0.0.1:5174", reducedMotion: "no-preference", trace: "retain-on-failure", video: "off" },
});
