import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/dialogue-detail-refinement/after-envelope";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: ["envelope-copy-lines.spec.ts"], workers: 1, retries: 0,
  reporter: [["list"], ["json", { outputFile: "../logs/envelope.json" }]], outputDir: "../runs/envelope",
  use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure" },
});
