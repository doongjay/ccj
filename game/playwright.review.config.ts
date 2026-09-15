import { defineConfig, devices } from "@playwright/test";
export function reviewConfig(production = process.env.REVIEW_PRODUCTION === "1") {
const run = process.env.REVIEW_RUN ?? (production ? "production-final" : "regression-final");
const evidence = process.env.REVIEW_EVIDENCE ?? "../docs/game-review/after-batch-d";
return defineConfig({
  testDir: "./e2e", fullyParallel: true, workers: 2, retries: 0,
  ...(production ? { testMatch: ["review-batch-b-performance.spec.ts", "review-batch-b-access.spec.ts", "review-batch-b-guidance.spec.ts", "review-batch-c-photos.spec.ts", "review-batch-c-ceremony.spec.ts", "current-journey.spec.ts", "review-batch-d-checkpoint.spec.ts", "review-batch-d-venue.spec.ts", "review-batch-d-animation.spec.ts", "review-batch-d-production.spec.ts"], grepInvert: /F23\/C-P01 isolated art audit|F23 actual walking/ } : { testIgnore: "review-batch-d-production.spec.ts" }),
  reporter: [["list"], ["json", { outputFile: `${evidence}/logs/${run}.json` }]],
  outputDir: `${evidence}/runs/${run}`,
  use: { baseURL: `http://127.0.0.1:${production ? 5199 : 5198}`, trace: "retain-on-failure" },
  projects: [{ name: production ? "chromium-production" : "chromium", use: devices["Desktop Chrome"] }],
  webServer: { command: `npm run ${production ? "preview" : "dev"} -- --host 127.0.0.1 --port ${production ? 5199 : 5198} --strictPort`, url: `http://127.0.0.1:${production ? 5199 : 5198}`, reuseExistingServer: false, timeout: 120000 },
});
}
export default reviewConfig();
