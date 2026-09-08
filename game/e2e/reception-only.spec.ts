import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { installPlayerObservation } from "./corridor-observables";

for (const desk of [{ x: 110, side: "groom", answerY: 838 }, { x: 260, side: "bride", answerY: 922 }] as const) {
  test(`reception-only Q3: photo and navigation stay inert, desk ${desk.side} pauses movement and completes once`, async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 390, height: 844 });
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
    const photoStates = await observe(page, 2500);
    await testInfo.attach("photo-table", { body: await page.screenshot(), contentType: "image/png" });
    expect(photoStates.every((sample) => sample.quiz === "false"), "Photo table must never open Q3").toBe(true);
    await state(page, "photoGalleryOpen", "true");
    await page.keyboard.press("Escape");
    await state(page, "photoGalleryOpen", "false");
    for (const room of [{ x: 360, y: 1200, scene: "PhotoBoothScene" }, { x: 590, y: 990, scene: "GreeneryCorridorScene" }]) {
      await click(page, room.x, room.y);
      await state(page, "activeScene", room.scene);
      await state(page, "roomReady", "true");
      expect((await observe(page, 200)).every((sample) => sample.quiz === "false")).toBe(true);
      await click(page, 360, 1180);
      await state(page, "activeScene", "VenueLobbyScene");
      await state(page, "lobbyReady", "true");
    }

    await click(page, desk.x, 500);
    await state(page, "q3ModalOpen", "true");
    const stopped = await page.evaluate(() => window.__venuePlayerSnapshot());
    if (stopped === null) throw new Error("Reception player is missing.");
    expect(stopped.moving).toBe(false);
    await click(page, 650, 1100);
    const paused = await observe(page, 400);
    expect(paused.length).toBeGreaterThan(1);
    expect(paused.every((sample) => sample.quiz === "true" && sample.player?.x === stopped.x
      && sample.player.y === stopped.y && !sample.player.moving)).toBe(true);
    await click(page, 360, desk.answerY);
    await state(page, "q3ModalOpen", "false");
    await state(page, "receptionComplete", "true");
    await state(page, "receptionDesk", desk.side);
    await click(page, 550, 500);
    await state(page, "photoGalleryOpen", "true");
    expect((await observe(page, 200)).every((sample) => sample.quiz === "false")).toBe(true);
    await page.keyboard.press("Escape");
    await state(page, "photoGalleryOpen", "false");
    await click(page, desk.x, 500);
    const repeated = await observe(page, 2500);
    expect(repeated.every((sample) => sample.quiz === "false")).toBe(true);
    await state(page, "guestSide", desk.side);
    await state(page, "receptionComplete", "true");
  });
}

async function observe(page: Page, duration: number) {
  return page.evaluate(async (ms) => {
    const samples = [];
    const started = performance.now();
    do {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      samples.push({ quiz: document.querySelector("canvas")?.dataset.q3ModalOpen,
        player: window.__venuePlayerSnapshot() });
    } while (performance.now() - started < ms);
    return samples;
  }, duration);
}

async function state(page: Page, key: string, value: string): Promise<void> {
  await expect(page.locator("canvas")).toHaveAttribute(`data-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`, value);
}

async function click(page: Page, x: number, y: number): Promise<void> {
  const box = await page.locator("canvas").boundingBox();
  if (box === null) throw new Error("Game canvas is missing.");
  await page.mouse.click(box.x + box.width * x / 720, box.y + box.height * y / 1280);
}
