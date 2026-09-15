import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/photo-table-personalized/after-side-switch";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: "photo-table-personalized.spec.ts", grep: /switching guest side/,
  workers: 1, retries: 0, reporter: [["list"], ["json", { outputFile: "../logs/side-switch.json" }]], outputDir: "../runs/side-switch",
  use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure", video: { mode: "on", size: { width: 393, height: 852 } } },
});
