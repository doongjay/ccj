import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const baseURL = process.env.LACITTA_QA_URL ?? "http://127.0.0.1:5197";
const evidence = fileURLToPath(new URL("../../.omo/evidence/lacitta-asset-production/", import.meta.url));
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  const modes = process.argv.includes("--missing-only") ? ["missing-image"] : ["ready", "missing-image", "missing-font"];
  for (const mode of modes) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    const requests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.url().includes("/assets/lacitta/")) requests.push({ url: response.url(), status: response.status() });
    });
    if (mode === "missing-image") await page.route("**/assets/lacitta/routes/home-background.png", (route) => route.fulfill({ status: 404, body: "Missing QA fixture" }));
    if (mode === "missing-font") await page.route("**/assets/lacitta/fonts/Galmuri11.woff2", (route) => route.abort());
    await page.goto(baseURL);
    const expected = mode === "missing-image" ? "error" : "complete";
    await page.waitForFunction((expected) => document.querySelector("canvas")?.dataset.assetLoadState === expected, expected, { timeout: 20000 });
    if (mode !== "missing-image") await page.waitForFunction(() => document.querySelector("canvas")?.dataset.activeScene === "IntroScene");
    const state = await page.locator("canvas").evaluate((canvas) => ({ ...canvas.dataset }));
    assert.deepEqual(errors, []);
    if (mode === "missing-image") {
      assert.equal(state.activeScene, "BootScene");
      assert.ok(state.assetLoadError.includes("home-background"));
    } else {
      assert.equal(state.fontLoadState, mode === "missing-font" ? "fallback" : "complete");
      assert.ok(requests.filter((request) => !request.url.endsWith(".woff2")).every((request) => request.status === 200));
    }
    if (mode === "ready") assert.ok(requests.some((request) => request.url.endsWith(".woff2") && request.status === 200));
    await page.screenshot({ path: `${evidence}task-4-${mode}-390.png` });
    results.push({ mode, state, errors, requests });
    await context.close();
  }
} finally {
  await writeFile(`${evidence}task-4-loading-browser.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify(results.map(({ mode, state }) => ({ mode, state })), null, 2));
