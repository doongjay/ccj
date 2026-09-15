import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
export default defineConfig({ testDir:"../../../../game/e2e",testMatch:["invitation-sharing.spec.ts"],workers:2,
reporter:[["list"],["json",{outputFile:"../logs/share-final.json"}]],outputDir:"../runs/share-final",
use:{baseURL:"http://127.0.0.1:5174",trace:"retain-on-failure",video:"retain-on-failure"}});
