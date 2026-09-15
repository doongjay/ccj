import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/photo-table-personalized/production";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: ["review-batch-b-performance.spec.ts"],
  fullyParallel: false, workers: 1, retries: 0,
  reporter: [["list"], ["json", { outputFile: "../logs/production.json" }]], outputDir: "../runs/production",
  use: { baseURL: "http://127.0.0.1:5199", trace: "retain-on-failure" },
  webServer: { command: "npm run preview -- --host 127.0.0.1 --port 5199 --strictPort", cwd: "../../../../game", url: "http://127.0.0.1:5199", reuseExistingServer: false, timeout: 60000 },
});
