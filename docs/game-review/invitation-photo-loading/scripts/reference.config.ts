import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
export default defineConfig({ testDir: ".", testMatch: "reference.spec.ts", workers: 1,
  reporter: [["list"], ["json", { outputFile: "../logs/reference-02.json" }]], outputDir: "../reference/browser-02",
  use: { viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, trace: "retain-on-failure" }, timeout: 60000 });
