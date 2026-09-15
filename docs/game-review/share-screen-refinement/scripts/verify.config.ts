import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
export default defineConfig({ testDir:"../../../../game/e2e",testMatch:["invitation-sharing.spec.ts","group-screen-reuse.spec.ts"],workers:2,
reporter:[["list"],["json",{outputFile:"../logs/browser.json"}]],outputDir:"../runs/browser",
use:{baseURL:"http://127.0.0.1:5174",trace:"retain-on-failure",video:"retain-on-failure"}});
