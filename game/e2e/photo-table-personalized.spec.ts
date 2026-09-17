import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { writeFile } from "node:fs/promises";
import { installPlayerObservation } from "./corridor-observables";
import { enterLobby, clickGame } from "./story-helpers";
import { startPreparedScene } from "./stage-fixtures";

const evidence = process.env.REVIEW_EVIDENCE!;
const viewports = [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }];
for (const side of ["groom", "bride"] as const) for (const viewport of viewports) {
  test(`${side} portraits follow filename order in the lobby and photo table at ${viewport.width}`, async ({ page }, info) => {
    test.setTimeout(60000);
    await page.setViewportSize(viewport);
    await installPlayerObservation(page);
    const errors: string[] = [], requested: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
    page.on("requestfailed", r => errors.push(r.url()));
    page.on("request", r => requested.push(new URL(r.url()).pathname));
    await page.goto("/");
    await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    expect(requested.filter(url => url.includes("/photo-table/"))).toEqual([]);
    await enterLobby(page, side === "groom" ? "car" : "subway", side);
    const canvas = page.locator("canvas");
    const expected = [1, 2, 3].map(index => `wedding-photo-${side}-${index}`);
    const wall = await page.evaluate(() => {
      const game = window.__venueQaGame as Phaser.Game;
      const scene = game.scene.getScene("VenueLobbyScene");
      const texture = game.textures.get("lobby-photo-wall") as Phaser.Textures.CanvasTexture;
      const crop = document.createElement("canvas"); crop.width = 640; crop.height = 768;
      const ctx = crop.getContext("2d")!; ctx.imageSmoothingEnabled = false;
      ctx.drawImage(texture.canvas, 640, 300, 160, 192, 0, 0, 640, 768);
      return { photos: scene.children.getByName("lobby-photo-wall")!.getData("photos"), image: crop.toDataURL("image/png") };
    });
    expect(wall.photos).toEqual(expected);
    await page.screenshot({ path: `${evidence}/lobby-${side}-${viewport.width}.png` });
    if (viewport.width === 393) await writeFile(`${evidence}/lobby-frames-${side}-4x.png`, Buffer.from(wall.image.split(",")[1]!, "base64"));
    const photos = requested.filter(url => /\/photo-table\/(?:groom|bride)-\d+(?:-v2)?\.jpeg$/.test(url));
    expect(photos.sort()).toEqual([1, 2, 3].map(i => `/assets/photo-table/${side}-0${i}${side === "groom" && i === 1 ? "-v2" : ""}.jpeg`));
    expect(requested.some(url => /gallery-0[123]-game|\/invitation\/gallery-/.test(url))).toBe(false);
    await clickGame(page, 550, 450);
    await expect(canvas).toHaveAttribute("data-photo-gallery-open", "true");
    const records = [];
    for (let index = 0; index < 3; index++) {
      await expect(canvas).toHaveAttribute("data-photo-gallery-index", String(index));
      const original = page.locator(".photo-table-original");
      await expect(original).toHaveAttribute("data-texture", expected[index]!);
      await original.evaluate(image => (image as HTMLImageElement).decode());
      await expect(original).toHaveCSS("image-rendering", "auto");
      const photo = await page.evaluate(() => {
        const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("VenueLobbyScene");
        const photo = scene.children.getByName("photo-gallery-image") as Phaser.GameObjects.Image;
        const box = photo.getBounds();
        return { key: photo.texture.key, width: photo.width, height: photo.height,
          displayWidth: photo.displayWidth, displayHeight: photo.displayHeight,
          top: box.top, bottom: box.bottom, left: box.left, right: box.right };
      });
      expect(photo.key).toBe(expected[index]);
      expect(photo.displayWidth / photo.displayHeight).toBeCloseTo(photo.width / photo.height, 4);
      expect(photo.left).toBeGreaterThanOrEqual(88);
      expect(photo.right).toBeLessThanOrEqual(632);
      expect(photo.top).toBeGreaterThanOrEqual(288);
      expect(photo.bottom).toBeLessThanOrEqual(944);
      await page.screenshot({ path: `${evidence}/photo-table-${side}-${index + 1}-${viewport.width}.png` });
      records.push(photo);
      if (index === 0) await page.keyboard.press("ArrowRight");
      else if (index === 1) await clickGame(page, 580, 1050);
    }
    await clickGame(page, 580, 1050);
    await expect(canvas).toHaveAttribute("data-photo-gallery-index", "0");
    await page.keyboard.press("Escape");
    await expect(canvas).toHaveAttribute("data-photo-gallery-open", "false");
    await expect(page.locator(".photo-table-original")).toHaveCount(0);
    await expect(canvas).toHaveAttribute("data-photo-table-visited", "true");
    expect(await page.evaluate(() => window.__venuePlayerSnapshot())).toMatchObject({ x: 474, y: 360, moving: false });
    await clickGame(page, 550, 450);
    await expect(canvas).toHaveAttribute("data-photo-gallery-index", "0");
    await clickGame(page, 620, 190);
    await expect(canvas).toHaveAttribute("data-photo-gallery-open", "false");
    expect(errors).toEqual([]);
    await info.attach("portraits", { body: JSON.stringify({ side, viewport, wallPhotos: wall.photos, photos, records, errors }), contentType: "application/json" });
  });
}

test("switching guest side rebuilds all three lobby frames and gallery without stale photos", async ({ page }, info) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await installPlayerObservation(page);
  await page.goto("/");
  await enterLobby(page);
  const wallData = () => page.evaluate(() => {
    const game = window.__venueQaGame as Phaser.Game;
    return { keys: game.scene.getScene("VenueLobbyScene").children.getByName("lobby-photo-wall")!.getData("photos"),
      pixels: (game.textures.get("lobby-photo-wall") as Phaser.Textures.CanvasTexture).canvas.toDataURL() };
  });
  const groom = await wallData();
  for (const side of ["bride", "groom"] as const) {
    await startPreparedScene(page, "HomeSelectScene");
    await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "HomeSelectScene");
    await page.evaluate(async side => {
      const path = "/src/state/gameState.ts";
      const { setGuestSide } = await import(path) as typeof import("../src/state/gameState");
      setGuestSide((window.__venueQaGame as Phaser.Game).registry, side);
    }, side);
    await startPreparedScene(page, "VenueLobbyScene");
    await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "VenueLobbyScene");
    await expect(page.locator("canvas")).toHaveAttribute("data-lobby-ready", "true");
    const current = await wallData();
    expect(current.keys).toEqual([1, 2, 3].map(i => `wedding-photo-${side}-${i}`));
    if (side === "groom") expect(current.pixels).toBe(groom.pixels);
    else expect(current.pixels).not.toBe(groom.pixels);
    await clickGame(page, 550, 450);
    expect(await page.evaluate(() => {
      const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("VenueLobbyScene");
      return (scene.children.getByName("photo-gallery-image") as Phaser.GameObjects.Image).texture.key;
    })).toBe(`wedding-photo-${side}-1`);
    await page.keyboard.press("Escape");
  }
  await info.attach("side-switch", { body: "groom → bride → groom; wall pixels restored exactly; gallery starts at matching photo 1", contentType: "text/plain" });
});
