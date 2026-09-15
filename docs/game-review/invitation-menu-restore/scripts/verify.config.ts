import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/invitation-menu-restore/after";
export default defineConfig({ testDir: "../../../../game/e2e", testMatch: ["invitation-sharing.spec.ts", "review-batch-b-access.spec.ts"], grep: /share|sharing|Kakao|F08: lobby invitation/, workers: 2,
reporter: [["list"], ["json", { outputFile: "../logs/browser.json" }]], outputDir: "../runs/browser",
use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure", video: "retain-on-failure" } });
