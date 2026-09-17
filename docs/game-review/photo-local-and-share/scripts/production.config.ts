import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
import { resolve } from "node:path";
export default defineConfig({
  testDir: ".", testMatch: "production.spec.ts", workers: 1,
  reporter: [["list"], ["json", { outputFile: "../logs/production-02.json" }]], outputDir: "../runs/production-02",
  use: { baseURL: "http://127.0.0.1:5199", viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, trace: "retain-on-failure" },
  webServer: { command: "npm run preview -- --host 127.0.0.1 --port 5199 --strictPort", cwd: resolve(__dirname, "../../../../game"), url: "http://127.0.0.1:5199", reuseExistingServer: false },
});
