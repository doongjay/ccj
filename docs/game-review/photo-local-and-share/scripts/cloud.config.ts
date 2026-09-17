import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
import { resolve } from "node:path";
process.env.VITE_SUPABASE_URL = "http://127.0.0.1:54321";
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "test-key";
export default defineConfig({
  testDir: "../../../../game/e2e", testMatch: "cloud-photos.spec.ts", workers: 1, timeout: 60000,
  reporter: [["list"], ["json", { outputFile: "../logs/cloud-02.json" }]], outputDir: "../runs/cloud-02",
  use: { baseURL: "http://127.0.0.1:5198", deviceScaleFactor: 3, trace: "retain-on-failure", video: "on" },
  webServer: { command: "npm run dev -- --host 127.0.0.1 --port 5198 --strictPort", cwd: resolve(__dirname, "../../../../game"), url: "http://127.0.0.1:5198", reuseExistingServer: false },
});
