import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["review-batch-b-performance.spec.ts", "review-batch-b-access.spec.ts", "review-batch-b-guidance.spec.ts"],
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  outputDir: "test-results-production",
  use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:5199", trace: "retain-on-failure" },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 5199 --strictPort",
    url: "http://127.0.0.1:5199",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
