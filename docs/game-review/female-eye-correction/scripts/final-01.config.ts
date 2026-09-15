import {defineConfig} from "../../../../game/node_modules/@playwright/test/index.mjs";
process.env.MINIMI_EVIDENCE="/Users/user/wedding/ccj/docs/game-review/female-eye-correction";
process.env.MINIMI_PHASE="after";
process.env.REVIEW_EVIDENCE="/Users/user/wedding/ccj/docs/game-review/female-eye-correction/regressions";
export default defineConfig({testDir:"../../../../game/e2e",testMatch:["minimi-customization.spec.ts","review-minimi-fix.spec.ts","review-batch-d-animation.spec.ts","review-touch-refinement.spec.ts","review-batch-a.spec.ts","review-minimi-flow.spec.ts"],grep:/source layers|isolated art audit|Gender-specific|direct thumbnails|original minimi artwork|F03|actual 04-female|actual 06-female/,workers:2,retries:0,reporter:[["list"],["json",{outputFile:"../logs/final-01.json"}]],outputDir:"../runs/final-01",use:{baseURL:"http://127.0.0.1:5174",viewport:{width:393,height:852},trace:"retain-on-failure"}});
