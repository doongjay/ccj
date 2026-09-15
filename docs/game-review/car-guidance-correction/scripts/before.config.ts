import {defineConfig} from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.REVIEW_EVIDENCE="/Users/user/wedding/ccj/docs/game-review/car-guidance-correction";process.env.MINIMI_PHASE="before";
export default defineConfig({testDir:"../../../../game/e2e",testMatch:"review-neck-loading.spec.ts",grep:/unobscured guidance|separated route/,workers:2,retries:0,reporter:[["list"],["json",{outputFile:"../logs/before.json"}]],outputDir:"../runs/before",use:{baseURL:"http://127.0.0.1:5174",viewport:{width:393,height:852},trace:"retain-on-failure"}});
