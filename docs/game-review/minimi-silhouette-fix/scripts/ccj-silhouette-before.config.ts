import {defineConfig} from "/Users/user/wedding/ccj/game/node_modules/@playwright/test/index.mjs";
const root="/Users/user/wedding/ccj/docs/game-review/minimi-silhouette-fix";
process.env.MINIMI_EVIDENCE=root;process.env.MINIMI_PHASE="before";
export default defineConfig({testDir:"/Users/user/wedding/ccj/game/e2e",testMatch:"review-minimi-flow.spec.ts",grep:/M05 actual 0[123]-/,workers:1,retries:0,reporter:[["list"],["json",{outputFile:`${root}/logs/before-flows.json`}]],outputDir:`${root}/runs/before-flows`,use:{baseURL:"http://127.0.0.1:5176",viewport:{width:393,height:852},trace:"retain-on-failure"}});
