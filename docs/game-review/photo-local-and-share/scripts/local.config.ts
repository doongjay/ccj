import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
process.env.REVIEW_EVIDENCE = resolve(__dirname, "../after");
mkdirSync(process.env.REVIEW_EVIDENCE, { recursive: true });
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: ["cloud-photos.spec.ts", "invitation-sharing.spec.ts", "photo-table-personalized.spec.ts"], workers: 2, timeout: 60000,
  reporter: [["list"], ["json", { outputFile: "../logs/local-01.json" }]], outputDir: "../runs/local-01",
  use: { baseURL: "http://127.0.0.1:5174", deviceScaleFactor: 3, trace: "retain-on-failure", video: "on" },
});
