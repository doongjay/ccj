import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/invitation-menu-restore/after";
export default defineConfig({ testDir: "../../../../game/e2e", testMatch: ["invitation-sharing.spec.ts", "review-batch-b-access.spec.ts"], grep: /explicit link copy/, workers: 2,
reporter: [["list"], ["json", { outputFile: "../logs/gallery.json" }]], outputDir: "../runs/gallery",
use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure", video: "retain-on-failure" } });
