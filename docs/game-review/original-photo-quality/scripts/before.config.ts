import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/original-photo-quality/before";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: "original-photo-quality.spec.ts", grep: /capture current/,
  workers: 1, retries: 0, timeout: 60000,
  reporter: [["list"], ["json", { outputFile: "../logs/before.json" }]], outputDir: "../runs/before",
  use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure" },
});
