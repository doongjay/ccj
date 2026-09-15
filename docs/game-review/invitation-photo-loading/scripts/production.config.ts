import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
import { resolve } from "node:path";
export default defineConfig({ testDir: ".", testMatch: "performance.spec.ts", workers: 1, timeout: 60000,
  reporter: [["list"], ["json", { outputFile: "../logs/production.json" }]], outputDir: "../runs/production",
  use: { baseURL: "http://127.0.0.1:5199", viewport: { width: 393, height: 852 }, trace: "retain-on-failure", video: "on" },
  webServer: { command: "npm run preview -- --host 127.0.0.1 --port 5199 --strictPort", cwd: resolve(__dirname, "../../../../game"), url: "http://127.0.0.1:5199", reuseExistingServer: false } });
