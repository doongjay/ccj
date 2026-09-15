import { enterLobby, receiveEnvelope, takeBridalPhoto } from "./story-helpers";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { installPlayerObservation } from "./corridor-observables";

for (const desk of [{ x: 360, side: "groom", answerY: 838 }, { x: 360, side: "bride", answerY: 922 }] as const) {
  test(`single reception desk: photo and navigation stay inert, desk ${desk.side} pauses movement and completes once`, async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await installPlayerObservation(page);
    await page.goto("/");
    await enterLobby(page, "car", desk.side);
    await state(page, "parentsSide", desk.side);
    expect(await receptionMessage(page)).toBeUndefined();

    await click(page, 550, 450);
    const photoStates = await observe(page, 2500);
    await testInfo.attach("photo-table", { body: await page.screenshot(), contentType: "image/png" });
    expect(photoStates.every((sample) => sample.quiz === "false"), "Photo table must never open Q3").toBe(true);
    await state(page, "photoGalleryOpen", "true");
    await page.keyboard.press("Escape");
    await state(page, "photoGalleryOpen", "false");
    for (const room of [{ x: 130, y: 590, scene: "PhotoBoothScene" }, { x: 590, y: 990, scene: "GreeneryCorridorScene" }]) {
      await click(page, room.x, room.y);
      if (room.scene === "GreeneryCorridorScene" && desk.side === "groom") {
        await state(page, "lobbyInfo", "bridal-restricted");
        await expect(page.locator(".story-narration")).toHaveText(/신부측 하객에게 양보/);
        await page.locator(".story-info-compact .story-narration").click();
        await state(page, "activeScene", "VenueLobbyScene");
        continue;
      }
      await state(page, "activeScene", room.scene);
      if (room.scene === "GreeneryCorridorScene") {
        await takeBridalPhoto(page);
        continue;
      }
      await state(page, "roomReady", "true");
      expect((await observe(page, 200)).every((sample) => sample.quiz === "false")).toBe(true);
      await click(page, 360, 1180);
      await state(page, "activeScene", "VenueLobbyScene");
      await state(page, "lobbyReady", "true");
    }

    await click(page, desk.x, 460);
    await receiveEnvelope(page);
    await state(page, "q3ModalOpen", "false");
    await state(page, "receptionComplete", "true");
    await state(page, "receptionDesk", desk.side);
    await expect(page.locator(".reception-notice")).toHaveCount(0);
    expect(await receptionMessage(page)).toBeUndefined();
    await page.screenshot({ path: testInfo.outputPath(`${desk.side}-reception.png`) });
    await click(page, 550, 450);
    await state(page, "photoGalleryOpen", "true");
    expect((await observe(page, 200)).every((sample) => sample.quiz === "false")).toBe(true);
    await page.keyboard.press("Escape");
    await state(page, "photoGalleryOpen", "false");
    await click(page, desk.x, 460);
    const repeated = await observe(page, 2500);
    expect(repeated.every((sample) => sample.quiz === "false")).toBe(true);
    await expect(page.locator(".reception-notice")).toHaveCount(0);
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

async function receptionMessage(page: Page) {
  return page.evaluate(() => {
    const game = window.__venueQaGame as {
      scene: { getScene(key: string): { children: { list: { visible?: boolean; text?: string; style?: { backgroundColor?: string } }[] } } };
    };
    const text = game.scene.getScene("VenueLobbyScene").children.list
      .find(object => object.visible && object.text?.includes("접수"));
    return text ? { text: text.text, background: text.style?.backgroundColor } : undefined;
  });
}

async function state(page: Page, key: string, value: string): Promise<void> {
  await expect(page.locator("canvas")).toHaveAttribute(`data-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`, value);
}

async function click(page: Page, x: number, y: number): Promise<void> {
  const box = await page.locator("canvas").boundingBox();
  if (box === null) throw new Error("Game canvas is missing.");
  await page.mouse.click(box.x + box.width * x / 720, box.y + box.height * y / 1280);
}
