import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/original-photo-quality/production";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: "review-batch-b-performance.spec.ts",
  workers: 1, retries: 0,
  reporter: [["list"], ["json", { outputFile: "../logs/production-02.json" }]], outputDir: "../runs/production-02",
  use: { baseURL: "http://127.0.0.1:5199", trace: "retain-on-failure" },
  webServer: { command: "npm run preview -- --host 127.0.0.1 --port 5199 --strictPort", cwd: "../../../../game", url: "http://127.0.0.1:5199", reuseExistingServer: false, timeout: 60000 },
});
