import { test, expect } from "../../../../game/node_modules/@playwright/test/index.mjs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

test("read the supplied invitation image sizes and confirm the local server", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("http://127.0.0.1:5174/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  expect(errors).toEqual([]);
  await page.screenshot({ path: test.info().outputPath("local-opening.png") });
  const responses: { url: string; bytes: string | undefined; type: string | undefined }[] = [];
  page.on("response", response => {
    if (response.headers()["content-type"]?.startsWith("image/") || response.url().includes("bucket")) responses.push({ url: response.url(), bytes: response.headers()["content-length"], type: response.headers()["content-type"] });
  });
  await page.goto("https://www.heumcard.com/cards/now-2026-11-21", { waitUntil: "domcontentloaded" });
  await expect(page.getByAltText("cover_image").first()).toBeVisible({ timeout: 30000 });
  for (let step = 0; step < 14; step++) { await page.mouse.wheel(0, 650); await page.waitForTimeout(300); }
  await page.screenshot({ path: test.info().outputPath("heumcard-page.png"), fullPage: true });
  const images = await page.locator("img").evaluateAll(nodes => nodes.map(image => ({ src: (image.currentSrc || image.src).startsWith("data:") ? `${image.src.slice(0,50)}... (${image.src.length} characters)` : image.currentSrc || image.src, width: image.naturalWidth, height: image.naturalHeight, displayWidth: image.getBoundingClientRect().width, loading: image.loading })));
  await writeFile(resolve(__dirname, "../reference/images.json"), JSON.stringify({ url: page.url(), viewport: page.viewportSize(), images, responses }, null, 2));
});
