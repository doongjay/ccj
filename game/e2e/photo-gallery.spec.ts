import { startPreparedScene } from "./stage-fixtures";
import { enterLobby } from "./story-helpers";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { installPlayerObservation } from "./corridor-observables";
import type Phaser from "phaser";

test("replacing registered photos updates all three framed screens", async ({ page }) => {
  await installPlayerObservation(page);
  const colors = ["#e84f4f", "#43b779", "#5775de"];
  await page.route(url => url.pathname === "/src/data/photoGallery.ts", async route => {
    const response = await route.fetch();
    let body = await response.text();
    for (let index = 1; index <= 3; index += 1) body = body.replace(`/assets/photo-table/groom-0${index}.jpeg`, `/replacement-${index}.svg`);
    await route.fulfill({ response, body });
  });
  await page.route(/\/replacement-[123]\.svg$/, async route => {
    const index = Number(route.request().url().match(/replacement-(\d)/)?.[1]) - 1;
    const width = [400, 200, 300][index], height = [200, 400, 300][index];
    await route.fulfill({ contentType: "image/svg+xml", body: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path fill="${colors[index]}" d="M0 0H${width}V${height}H0Z"/></svg>` });
  });
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await startPreparedScene(page, "VenueLobbyScene");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-ready", "true");
  const pixels = await page.evaluate(() => {
    const texture = (window.__venueQaGame as Phaser.Game).textures.get("lobby-photo-wall") as Phaser.Textures.CanvasTexture;
    return [[670, 374], [712, 398], [754, 420], [600, 300]].map(([x, y]) => Array.from(texture.context.getImageData(x!, y!, 1, 1).data));
  });
  expect(pixels).toEqual([[232, 79, 79, 255], [67, 183, 121, 255], [87, 117, 222, 255], [0, 0, 0, 0]]);
});

for (const viewport of [{ width: 390, height: 844 }, { width: 430, height: 932 },
  { width: 720, height: 1280 }, { width: 1440, height: 1000 }] as const) {
  test(`lobby photo-wall panels use registered photos and the gallery shows photos at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await page.setViewportSize(viewport);
    await installPlayerObservation(page);
    await page.goto("/");
    await enterLobby(page);
    expect(await page.evaluate(() => {
      const game = window.__venueQaGame as Phaser.Game;
      const scene = game.scene.getScene("VenueLobbyScene");
      return {
        photoWall: scene.children.getByName("lobby-photo-wall")?.type,
        backgroundLoaded: performance.getEntriesByType("resource").some(entry => entry.name.endsWith("/optimized/lacitta-pixel-venue-lobby.webp")),
      };
    })).toEqual({ photoWall: "Image", backgroundLoaded: true });
    await page.screenshot({ path: testInfo.outputPath("lobby-registered-photos.png") });
    await click(page, 550, 450);
    await state(page, "photoGalleryOpen", "true");
    await state(page, "q3ModalOpen", "false");
    expect(await page.evaluate(() => {
      const game = window.__venueQaGame as Phaser.Game;
      const scene = game.scene.getScene("VenueLobbyScene");
      return {
        photo: (scene.children.getByName("photo-gallery-image") as Phaser.GameObjects.Image).texture.key,
        photosLoaded: [1, 2, 3].every(index => game.textures.exists(`wedding-photo-groom-${index}`)),
      };
    })).toEqual({ photo: "wedding-photo-groom-1", photosLoaded: true });
    await state(page, "photoGalleryIndex", "0");
    await page.locator(".photo-table-original").evaluate(image => (image as HTMLImageElement).decode());
    await testInfo.attach("gallery-first", { body: await page.screenshot({ path: testInfo.outputPath("photo-gallery-restored.png") }), contentType: "image/png" });
    const stopped = await page.evaluate(() => window.__venuePlayerSnapshot());
    if (stopped === null) throw new Error("Gallery player is missing.");
    expect(stopped.moving).toBe(false);

    await click(page, 140, 1050);
    await state(page, "photoGalleryIndex", "2");
    await click(page, 580, 1050);
    await state(page, "photoGalleryIndex", "0");
    await page.keyboard.press("ArrowLeft");
    await state(page, "photoGalleryIndex", "2");
    await page.keyboard.press("ArrowRight");
    await state(page, "photoGalleryIndex", "0");
    await state(page, "photoGalleryOpen", "true");
    for (const [x, y] of [[130, 590], [590, 990], [130, 990], [360, 145], [550, 150]]) {
      if (x === undefined || y === undefined) throw new Error("Invalid navigation coordinate.");
      await click(page, x, y);
      const samples = await observe(page);
      expect(samples.every((s) => s.open === "true" && s.quiz === "false"
        && s.player?.scene === "VenueLobbyScene" && s.player.x === stopped.x
        && s.player.y === stopped.y && !s.player.moving)).toBe(true);
    }
    await page.keyboard.press("Escape");
    await state(page, "photoGalleryOpen", "false");
    await state(page, "photoTableVisited", "true");
    expect(await page.evaluate(() => (window.__venueQaGame as Phaser.Game).scene.getScene("VenueLobbyScene").children.getByName("photo-gallery-image"))).toBeNull();
    expect((await observe(page)).every((s) => s.open === "false")).toBe(true);
    await click(page, 360, 1080);
    await expect.poll(() => page.evaluate(() => {
      const player = window.__venuePlayerSnapshot();
      return player !== null && player.y > 1000 && !player.moving;
    })).toBe(true);
    await click(page, 550, 450);
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
