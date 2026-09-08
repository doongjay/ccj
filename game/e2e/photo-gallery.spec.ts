import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { installPlayerObservation } from "./corridor-observables";

for (const viewport of [{ width: 390, height: 844 }, { width: 430, height: 932 },
  { width: 720, height: 1280 }, { width: 1440, height: 1000 }] as const) {
  test(`photo gallery wraps, blocks movement and reopens only after re-entry at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await page.setViewportSize(viewport);
    await installPlayerObservation(page);
    await page.goto("/");
    await state(page, "activeScene", "IntroScene");
    await click(page, 360, 876);
    await state(page, "activeScene", "HomeSelectScene");
    await click(page, 190, 790);
    await state(page, "activeScene", "CarRouteScene");
    await click(page, 568, 650);
    await state(page, "routeQuizModalOpen", "true");
    await click(page, 360, 964);
    await state(page, "lobbyReady", "true");
    await click(page, 550, 500);
    await state(page, "photoGalleryOpen", "true");
    await state(page, "q3ModalOpen", "false");
    await state(page, "photoGalleryIndex", "0");
    await testInfo.attach("gallery-first", { body: await page.screenshot(), contentType: "image/png" });
    const stopped = await page.evaluate(() => window.__venuePlayerSnapshot());
    if (stopped === null) throw new Error("Gallery player is missing.");
    expect(stopped.moving).toBe(false);

    await click(page, 140, 1050);
    await state(page, "photoGalleryIndex", "1");
    await testInfo.attach("gallery-second", { body: await page.screenshot(), contentType: "image/png" });
    await click(page, 580, 1050);
    await state(page, "photoGalleryIndex", "0");
    await page.keyboard.press("ArrowLeft");
    await state(page, "photoGalleryIndex", "1");
    await page.keyboard.press("ArrowRight");
    await state(page, "photoGalleryIndex", "0");
    for (const [x, y] of [[360, 1200], [590, 990], [130, 990], [360, 850], [360, 150]]) {
      if (x === undefined || y === undefined) throw new Error("Invalid navigation coordinate.");
      await click(page, x, y);
      const samples = await observe(page);
      expect(samples.every((s) => s.open === "true" && s.quiz === "false"
        && s.player?.scene === "VenueLobbyScene" && s.player.x === stopped.x
        && s.player.y === stopped.y && !s.player.moving)).toBe(true);
    }
    await page.keyboard.press("Escape");
    await state(page, "photoGalleryOpen", "false");
    expect((await observe(page)).every((s) => s.open === "false")).toBe(true);
    await click(page, 360, 1080);
    await expect.poll(() => page.evaluate(() => {
      const player = window.__venuePlayerSnapshot();
      return player !== null && player.y > 1000 && !player.moving;
    })).toBe(true);
    await click(page, 550, 500);
    await state(page, "photoGalleryOpen", "true");
    await click(page, 620, 190);
    await state(page, "photoGalleryOpen", "false");
    expect((await observe(page)).every((s) => s.open === "false" && s.quiz === "false")).toBe(true);
  });
}

async function observe(page: Page) {
  return page.evaluate(async () => {
    const samples = [];
    const started = performance.now();
    do {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const data = document.querySelector("canvas")?.dataset;
      samples.push({ open: data?.photoGalleryOpen, quiz: data?.q3ModalOpen, player: window.__venuePlayerSnapshot() });
    } while (performance.now() - started < 300);
    return samples;
  });
}

async function state(page: Page, key: string, value: string): Promise<void> {
  await expect.poll(() => page.locator("canvas").evaluate((canvas, name) => canvas.dataset[name], key)).toBe(value);
}

async function click(page: Page, x: number, y: number): Promise<void> {
  const box = await page.locator("canvas").boundingBox();
  if (box === null) throw new Error("Game canvas is missing.");
  await page.mouse.click(box.x + box.width * x / 720, box.y + box.height * y / 1280);
}
