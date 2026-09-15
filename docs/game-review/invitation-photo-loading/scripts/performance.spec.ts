import { test, expect } from "../../../../game/node_modules/@playwright/test/index.mjs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

test("production opening stays below 5 MB without invitation preloading", async ({ page }, info) => {
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  const measurement = await page.evaluate(() => {
    const entries = [...performance.getEntriesByType("navigation"), ...performance.getEntriesByType("resource")] as PerformanceResourceTiming[];
    return { at: performance.now(), entries: entries.map(r => ({ url: r.name, transferSize: r.transferSize, encodedBodySize: r.encodedBodySize })),
      transferBytes: entries.reduce((sum, r) => sum + r.transferSize, 0), encodedBytes: entries.reduce((sum, r) => sum + r.encodedBodySize, 0) };
  });
  expect(measurement.transferBytes).toBeLessThan(5_000_000);
  expect(measurement.entries.filter(r => r.url.includes("/invitation/display/"))).toEqual([]);
  await writeFile(resolve(__dirname, "../first-screen-performance.json"), JSON.stringify({ environment: "Local production preview, Chromium, cold cache, 393x852; measured when IntroScene becomes interactive", ...measurement }, null, 2));
  await page.screenshot({ path: info.outputPath("production-opening-393.png") });
});

test("direct production invitation loads together on a simulated 20 Mbps connection", async ({ page }, info) => {
  const session = await page.context().newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.emulateNetworkConditions", { offline: false, latency: 40, downloadThroughput: 20_000_000 / 8, uploadThroughput: 5_000_000 / 8 });
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
  await page.goto("/#invitation", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".invitation-page")).toHaveAttribute("data-photos-state", "ready", { timeout: 45000 });
  const measurement = await page.evaluate(() => {
    const entries = [...performance.getEntriesByType("navigation"), ...performance.getEntriesByType("resource")] as PerformanceResourceTiming[];
    return { readyMs: performance.now(), transferBytes: entries.reduce((sum, r) => sum + r.transferSize, 0),
      images: [...document.querySelectorAll<HTMLImageElement>(".invitation-paper img")].map(i => ({ src: i.src, complete: i.complete, width: i.naturalWidth, height: i.naturalHeight })) };
  });
  expect(measurement.images.every(i => i.complete && i.width > 0)).toBe(true);
  expect(errors).toEqual([]);
  await writeFile(resolve(__dirname, "../invitation-performance.json"), JSON.stringify({ environment: "Local production preview, Chromium, cold cache, 393x852; 20 Mbps down/5 Mbps up, 40 ms latency; not a real-device timing guarantee", ...measurement, errors }, null, 2));
  await page.locator(".invitation-nav").getByRole("button", { name: "사진", exact: true }).click();
  await page.screenshot({ path: info.outputPath("production-gallery-393.png") });
});
