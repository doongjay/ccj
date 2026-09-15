import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/bridal-minimi-reuse/before";
process.env.BRIDAL_PHASE = "before";
export default defineConfig({ testDir: "../../../../game/e2e", testMatch: "bridal-minimi-reuse.spec.ts", workers: 1,
  reporter: [["list"], ["json", { outputFile: "../logs/before.json" }]], outputDir: "../runs/before",
  use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure" } });
