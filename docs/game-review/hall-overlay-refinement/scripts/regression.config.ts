import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/hall-overlay-refinement/regression";
export default defineConfig({
  testDir: "../../../../game/e2e", fullyParallel: true, workers: 2, retries: 0,
  reporter: [["list"], ["json", { outputFile: "../logs/regression.json" }]],
  outputDir: "../runs/regression",
  projects: [
    { name: "journeys-layout", testMatch: ["story-choice-layout.spec.ts", "review-batch-c-ceremony.spec.ts", "tap-pacing.spec.ts", "current-journey.spec.ts"] },
    { name: "motion", testMatch: ["review-batch-d-animation.spec.ts", "review-batch-d-input-motion.spec.ts"], grep: /uninterrupted normal response|three actual photo scenes/ },
  ],
  use: { baseURL: "http://127.0.0.1:5174", viewport: { width: 393, height: 852 }, reducedMotion: "no-preference", trace: "retain-on-failure", video: { mode: "on", size: { width: 430, height: 932 } } },
});
