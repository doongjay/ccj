import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
import { resolve } from "node:path";
process.env.REVIEW_EVIDENCE = resolve(__dirname, "../after");
export default defineConfig({ testDir: "../../../../game/e2e", testMatch: "route-tried-disabled.spec.ts", grep: /tried subway/, workers: 2,
  reporter: [["list"], ["json", { outputFile: "../logs/browser.json" }]], outputDir: "../runs/browser",
  use: { baseURL: "http://127.0.0.1:5174", deviceScaleFactor: 3, trace: "retain-on-failure", video: "on" } });
