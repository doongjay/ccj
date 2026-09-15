import {defineConfig} from "/Users/user/wedding/ccj/game/node_modules/@playwright/test/index.mjs";
const root = "/Users/user/wedding/ccj/docs/game-review/minimi-silhouette-fix";
process.env.MINIMI_EVIDENCE=root;
process.env.MINIMI_PHASE="iterations/07";
process.env.REVIEW_EVIDENCE=`${root}/iterations/07/regressions`;
export default defineConfig({testDir:"/Users/user/wedding/ccj/game/e2e",testMatch:["minimi-jaw.spec.ts"],workers:1,retries:0,reporter:[["list"],["json",{outputFile:`${root}/logs/jaw-rerun-01.json`}]],outputDir:`${root}/runs/jaw-rerun-01`,use:{baseURL:"http://127.0.0.1:5174",viewport:{width:393,height:852},trace:"retain-on-failure"}});
