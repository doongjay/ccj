import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/photo-table-personalized/after";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: ["photo-table-personalized.spec.ts", "photo-gallery.spec.ts", "lobby-return.spec.ts"],
  fullyParallel: true, workers: 2, retries: 0,
  reporter: [["list"], ["json", { outputFile: "../logs/after.json" }]], outputDir: "../runs/after",
  use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure", video: { mode: "on", size: { width: 430, height: 932 } } },
});
