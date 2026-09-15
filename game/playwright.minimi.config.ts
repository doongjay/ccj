import { defineConfig } from "@playwright/test";
process.env.REVIEW_EVIDENCE = "../docs/game-review/minimi-fix/regressions";
export function minimiConfig(phase = process.env.MINIMI_PHASE ?? "after") {
process.env.MINIMI_PHASE = phase;
const run = process.env.MINIMI_RUN ?? (phase === "after" ? "final-capture" : phase);
return defineConfig({
  testDir: "./e2e", testMatch: "review-minimi-fix.spec.ts", workers: 1, retries: 0,
  reporter: [["list"], ["json", { outputFile: `../docs/game-review/minimi-fix/logs/${run}.json` }]],
  outputDir: `../docs/game-review/minimi-fix/runs/${run}`,
  projects: [{ name: "chromium-minimi" }],
  use: { baseURL: "http://127.0.0.1:5174", viewport: { width: 393, height: 852 }, trace: "retain-on-failure" },
});

}
export default minimiConfig();
