import {defineConfig} from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.MINIMI_EVIDENCE="/Users/user/wedding/ccj/docs/game-review/female-eye-correction";
process.env.MINIMI_PHASE="after-01";
process.env.REVIEW_EVIDENCE="/Users/user/wedding/ccj/docs/game-review/female-eye-correction/animation";
export default defineConfig({testDir:"../../../../game/e2e",testMatch:["review-minimi-fix.spec.ts","review-batch-d-animation.spec.ts","review-touch-refinement.spec.ts"],grep:/source layers|isolated art audit|Gender-specific/,workers:2,retries:0,reporter:[["list"],["json",{outputFile:"../logs/art-01.json"}]],outputDir:"../runs/art-01",use:{baseURL:"http://127.0.0.1:5174",viewport:{width:393,height:852},trace:"retain-on-failure"}});
