import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
export default defineConfig({ testDir: "../../../../game/e2e", testMatch: ["invitation-photo-loading.spec.ts", "group-screen-reuse.spec.ts", "minimi-customization.spec.ts", "invitation-sharing.spec.ts"], workers: 2, timeout: 60000,
  reporter: [["list"], ["json", { outputFile: "../logs/final.json" }]], outputDir: "../runs/final",
  use: { baseURL: "http://127.0.0.1:5174", viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, trace: "retain-on-failure", video: "retain-on-failure" } });
