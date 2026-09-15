import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/groom-photo-lines-recheck/before";
export default defineConfig({ testDir:"../../../../game/e2e",testMatch:["photo-table-personalized.spec.ts"],grep:/groom portraits/,workers:2,
reporter:[["list"],["json",{outputFile:"../logs/browser-02.json"}]],outputDir:"../runs/browser-02",
use:{baseURL:"http://127.0.0.1:5174",deviceScaleFactor:3,trace:"retain-on-failure"}});
