import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE = "../docs/game-review/sentence-five-character-rule/after-02";
export default defineConfig({testDir:"../../../../game/e2e",testMatch:["story-sentence-lines.spec.ts","car-guidance-reference.spec.ts"],workers:2,
reporter:[["list"],["json",{outputFile:"../logs/browser-02.json"}]],outputDir:"../runs/browser-02",
use:{baseURL:"http://127.0.0.1:5174",trace:"retain-on-failure",video:"retain-on-failure"}});
