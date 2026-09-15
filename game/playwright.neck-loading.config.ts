import { defineConfig } from "@playwright/test";
const root = "../docs/game-review/neck-loading-fix";
process.env.MINIMI_EVIDENCE = root;
process.env.REVIEW_EVIDENCE = `${root}/regressions`;
const run = process.env.REVIEW_RUN ?? `capture-${Date.now()}`;
export default defineConfig({
  testDir: "./e2e", workers: 1, retries: 0,
  testMatch: ["review-neck-loading.spec.ts", "review-minimi-fix.spec.ts", "review-minimi-flow.spec.ts", "review-minimi-motion.spec.ts"],
  reporter: [["list"], ["json", { outputFile: `${root}/logs/${run}.json` }]],
  outputDir: `${root}/runs/${run}`,
  use: { baseURL: "http://127.0.0.1:5174", viewport: { width: 393, height: 852 }, trace: "retain-on-failure" },
});
