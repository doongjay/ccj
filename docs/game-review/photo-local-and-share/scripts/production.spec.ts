import { test, expect } from "../../../../game/node_modules/@playwright/test/index.mjs";
import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

test("first screen stays under 5 MB and the groom portrait is the supplied original", async ({ page, request }, info) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  const resources: { url: string; bytes: number }[] = [], urls = new Map<string, string>(), errors: string[] = [];
  cdp.on("Network.responseReceived", event => urls.set(event.requestId, event.response.url));
  cdp.on("Network.loadingFinished", event => resources.push({ url: urls.get(event.requestId) ?? "", bytes: event.encodedDataLength }));
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", entry => { if (entry.type() === "error") errors.push(entry.text()); });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  const bytes = resources.reduce((sum, item) => sum + item.bytes, 0);
  expect(bytes).toBeLessThan(5_000_000);
  expect(resources.some(item => item.url.endsWith("wedding-couple.webp"))).toBe(true);
  expect(resources.some(item => item.url.includes("/photo-table/"))).toBe(false);
  await page.screenshot({ path: info.outputPath("first-screen-393.png") });
  const photo = await request.get("/assets/photo-table/groom-01-v2.jpeg");
  expect(photo.status()).toBe(200);
  const photoBytes = await photo.body();
  expect(createHash("sha256").update(photoBytes).digest("hex")).toBe("5e8432da926dda230a010a9f06c0b0125deb334868496db243154e41f97887e3");
  await writeFile(resolve(__dirname, "../first-screen-performance.json"), JSON.stringify({ bytes, limit: 5_000_000, resources, portraitBytes: photoBytes.length, originalIdentical: true, errors }, null, 2));
  expect(errors).toEqual([]);
});
