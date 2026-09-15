import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/screen-title-sharing/after";
export default defineConfig({ testDir: "../../../../game/e2e", testMatch: ["review-batch-d-resources.spec.ts"], workers: 2,
reporter: [["list"], ["json", { outputFile: "../logs/resources-retry.json" }]], outputDir: "../runs/resources-retry",
use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure", video: "retain-on-failure" } });
