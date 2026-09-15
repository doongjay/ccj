import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/group-screen-match/after-final";
process.env.HALL_CAPTURE_PHASE = "after";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: ["hall-overlay-layout.spec.ts", "group-screen-reuse.spec.ts"],
  grep: /applause groom|393 cheer bride reduced|group screen matches/,
  fullyParallel: true, workers: 2, retries: 0,
  reporter: [["list"], ["json", { outputFile: "../logs/final.json" }]], outputDir: "../runs/final",
  use: { baseURL: "http://127.0.0.1:5174", reducedMotion: "no-preference", trace: "retain-on-failure", video: { mode: "on", size: { width: 430, height: 932 } } },
});
