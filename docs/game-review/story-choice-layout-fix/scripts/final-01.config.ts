import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "/Users/user/wedding/ccj/docs/game-review/story-choice-layout-fix/final-evidence";
process.env.MINIMI_PHASE = "after";
export default defineConfig({ testDir: "../../../../game/e2e", testMatch: ["story-choice-layout.spec.ts", "hall-go-guidance.spec.ts", "review-neck-loading.spec.ts"], grep: /all nine|real choice scenes|hall GO|separated route|unobscured guidance|local server opening/, workers: 2, retries: 0, reporter: [["list"], ["json", { outputFile: "../logs/final-01.json" }]], outputDir: "../runs/final-01", use: { baseURL: "http://127.0.0.1:5174", screenshot: "only-on-failure", trace: "off", video: { mode: "on", size: { width: 430, height: 932 } } } });
