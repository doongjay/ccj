import { defineConfig } from "../../../../game/node_modules/@playwright/test/index.mjs";
export default defineConfig({ testDir: ".", testMatch: "typing.spec.ts", workers: 1,
  reporter: [["list"], ["json", { outputFile: "../logs/typing.json" }]], outputDir: "../runs/typing",
  use: { baseURL: "http://127.0.0.1:5174", deviceScaleFactor: 3, trace: "retain-on-failure", video: "on" } });
