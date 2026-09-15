import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.MINIMI_EVIDENCE = "/Users/user/wedding/ccj/docs/game-review/story-choice-layout-fix/legacy-regression";
process.env.MINIMI_PHASE = "after";
process.env.REVIEW_EVIDENCE = "/Users/user/wedding/ccj/docs/game-review/story-choice-layout-fix/legacy-regression/after";
export default defineConfig({ testDir: "../../../../game/e2e", testMatch: ["lobby-return.spec.ts", "lobby-required.spec.ts", "review-batch-a.spec.ts", "review-batch-a1.spec.ts", "review-touch-refinement.spec.ts", "smoke.spec.ts"], grep: /F01\/A1|A1-01|A1-04|Station reference|only unfinished|explores facilities|Given|F04 F05/, workers: 2, retries: 0, reporter: [["list"], ["json", { outputFile: "../logs/regression-02.json" }]], outputDir: "../runs/regression-02", use: { baseURL: "http://127.0.0.1:5174", screenshot: "only-on-failure", trace: "off", video: { mode: "on", size: { width: 393, height: 852 } } } });
