import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
export default defineConfig({testDir:"../../../../game/e2e",testMatch:["minimi-customization.spec.ts"],grep:/direct thumbnails|invitation outfit arrowheads/,workers:2,
reporter:[["list"],["json",{outputFile:"../logs/browser.json"}]],outputDir:"../runs/browser",
use:{baseURL:"http://127.0.0.1:5174",trace:"retain-on-failure",video:"retain-on-failure"}});
