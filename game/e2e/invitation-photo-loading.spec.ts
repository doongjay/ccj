import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { installPlayerObservation } from "./corridor-observables";
import { startPreparedScene } from "./stage-fixtures";
import { clickGame } from "./story-helpers";
import display from "../src/data/invitationPhotoDisplay.json" with { type: "json" };
import source from "../src/data/invitationSource.json" with { type: "json" };

for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }]) {
  test(`direct invitation reveals decoded photos together at ${viewport.width}`, async ({ page }, info) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [], requests: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
    page.on("request", r => requests.push(r.url()));
    let release!: () => void;
    const gate = new Promise<void>(r => { release = r; });
    await page.route("**/assets/invitation/display/gallery/3.webp", async route => { await gate; await route.continue(); });
    await page.goto("/#invitation");
    const root = page.locator(".invitation-page"), paper = page.locator(".invitation-paper");
    await expect(root).toHaveAttribute("data-photos-state", "loading");
    await expect(page.locator(".invitation-photo-loading")).toBeVisible();
    await expect(paper).toBeHidden();
    await page.screenshot({ path: info.outputPath(`photos-preparing-${viewport.width}.png`) });
    release();
    await expect(root).toHaveAttribute("data-photos-state", "ready", { timeout: 20000 });
    await expect(paper).toBeVisible();
    expect(await paper.locator("img").evaluateAll(images => images.every(i => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
    expect(requests.filter(url => /\/assets\/invitation\/(gallery\/|intro\.jpg|calendar\.jpg|timer\.jpg)/.test(url))).toEqual([]);
    expect(await root.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(false);
    await page.screenshot({ path: info.outputPath(`invitation-ready-${viewport.width}.png`) });
    await page.locator(".invitation-nav").getByRole("button", { name: "사진", exact: true }).click();
    await expect(page.locator(".invitation-gallery img")).toHaveCount(23);
    await expect(page.locator(".invitation-gallery img").nth(2)).toHaveCSS("object-position", "0% 50%");
    await page.screenshot({ path: info.outputPath(`gallery-ready-${viewport.width}.png`) });
    for (const index of [1, 3, 12, 23]) {
      await page.getByRole("button", { name: `${index}번째 사진 크게 보기`, exact: true }).click();
      const active = page.locator(".invitation-gallery-slide.is-current img");
      await active.evaluate(image => (image as HTMLImageElement).decode());
      await expect(active).toHaveAttribute("src", display[source.galleryFiles[index - 1]!.localFile as keyof typeof display].url);
      await page.screenshot({ path: info.outputPath(`gallery-large-${index}-${viewport.width}.png`) });
      await page.keyboard.press("Escape");
    }
    expect(errors).toEqual([]);
    await info.attach("photo-load-result", { body: JSON.stringify({ viewport, images: await paper.locator("img").count(), requests, errors }), contentType: "application/json" });
  });
}

test("game boot excludes invitation downloads, play warms them, and opening reuses cached bytes", async ({ page }, info) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await installPlayerObservation(page);
  const responses: { url: string; bytes: number; cached: boolean }[] = [];
  const session = await page.context().newCDPSession(page);
  await session.send("Network.enable");
  const byId = new Map<string, string>();
  const cached = new Set<string>();
  session.on("Network.responseReceived", e => {
    if (e.response.url.includes("/assets/invitation/display/")) {
      byId.set(e.requestId, e.response.url);
      if (e.response.fromDiskCache || e.response.fromPrefetchCache) cached.add(e.requestId);
    }
  });
  session.on("Network.requestServedFromCache", e => cached.add(e.requestId));
  session.on("Network.loadingFinished", e => {
    const url = byId.get(e.requestId);
    if (url) responses.push({ url, bytes: e.encodedDataLength, cached: cached.has(e.requestId) });
  });
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await page.waitForTimeout(1800);
  expect(responses).toHaveLength(0);
  await clickGame(page, 360, 1180);
  await expect(page.getByRole("textbox", { name: "내 이름은", exact: true })).toBeVisible();
  await expect.poll(() => new Set(responses.map(r => r.url)).size, { timeout: 20000 }).toBe(26);
  await page.screenshot({ path: info.outputPath("game-while-photos-warm.png") });
  const boundary = responses.length;
  await startPreparedScene(page, "InvitationScene");
  await expect(page.locator(".invitation-page")).toHaveAttribute("data-photos-state", "ready", { timeout: 15000 });
  const reused = responses.slice(boundary);
  expect(reused.reduce((sum, r) => sum + r.bytes, 0)).toBeLessThan(26 * 1500);
  await info.attach("background-cache", { body: JSON.stringify({ background: responses.slice(0, boundary), opening: reused }), contentType: "application/json" });
  await page.screenshot({ path: info.outputPath("invitation-after-game-prefetch.png") });
});

test("photo failure keeps the incomplete page covered and offers a keyboard retry", async ({ page }, info) => {
  let failed = false;
  await page.route("**/assets/invitation/display/gallery/1.webp", async route => {
    if (!failed) { failed = true; await route.abort("failed"); } else await route.continue();
  });
  await page.goto("/#invitation");
  await expect(page.locator(".invitation-page")).toHaveAttribute("data-photos-state", "error", { timeout: 20000 });
  await expect(page.locator(".invitation-paper")).toBeHidden();
  const retry = page.getByRole("button", { name: "다시 불러오기", exact: true });
  await expect(retry).toBeFocused();
  await page.screenshot({ path: info.outputPath("photo-load-retry.png") });
  await page.keyboard.press("Enter");
  await expect(page.locator(".invitation-page")).toHaveAttribute("data-photos-state", "ready", { timeout: 20000 });
  await expect(page.locator(".invitation-page")).toBeFocused();
});

test("display variants retain all original gallery bytes and numerical ordering", async () => {
  const report = JSON.parse(await readFile(resolve("../docs/game-review/invitation-photo-loading/photo-variants.json"), "utf8"));
  for (const file of report.files) {
    const bytes = await readFile(resolve("..", file.original));
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.originalSHA256);
    expect(file.displayDimensions[0]).toBeLessThanOrEqual(1920);
    expect(file.displayDimensions[1]).toBeLessThanOrEqual(1920);
  }
  expect(source.galleryFiles.map(f => Number(f.fileName.split(".")[0]))).toEqual([1, 2, 3, 4, 5, 6, 11, 12, 13, 21, 22, 23, 24, 25, 26, 31, 32, 33, 41, 42, 43, 44, 45]);
  expect(report.displayBytes).toBeLessThan(5_000_000);
});
