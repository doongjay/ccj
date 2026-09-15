import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";
import { startPreparedScene } from "./stage-fixtures";
import { chooseStory } from "./story-helpers";

for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }]) test(`group screen matches opening artwork and lettering positions at ${viewport.width}`, async ({ page }, info) => {
  await page.setViewportSize(viewport);
  await installPlayerObservation(page);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", entry => { if (entry.type() === "error") errors.push(entry.text()); });
  await page.goto("/");
  const canvas = page.locator("#app canvas");
  await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
  await page.screenshot({ path: info.outputPath(`opening-reference-${viewport.width}.png`) });
  const background = () => page.evaluate(() => {
    const game = window.__venueQaGame as Phaser.Game;
    const image = game.scene.getScene("IntroScene").children.list.find(child =>
      child.type === "Image" && (child as Phaser.GameObjects.Image).texture.key === "venue-hall") as Phaser.GameObjects.Image;
    return { frame: image.frame.name, width: image.frame.cutWidth, height: image.frame.cutHeight,
      defaultFrame: game.textures.get("venue-hall").firstFrame };
  });
  const initial = await background();
  const openingLettering = await page.evaluate(() => {
    const game = window.__venueQaGame as Phaser.Game;
    const source = game.textures.get("venue-hall").getSourceImage() as HTMLImageElement;
    const screen = { x: 232 * 720 / source.width, y: 468 * 1280 / source.height, width: 478 * 720 / source.width, height: 270 * 1280 / source.height };
    return game.scene.getScene("IntroScene").children.list.filter(child => child.getData("screenBranding")).map(child => {
      const item = child as Phaser.GameObjects.Container | Phaser.GameObjects.Text;
      return { copy: item.getData("screenBrandingCopy"), relativeX: (item.x - screen.x) / screen.width, relativeY: (item.y - screen.y) / screen.height };
    });
  });
  await startPreparedScene(page, "VenueHallScene");
  await chooseStory(page, "박수를 친다");
  await expect(canvas).toHaveAttribute("data-ceremony-stage", "group-photo");
  await chooseStory(page, "사진 찍기");
  await expect(canvas).toHaveAttribute("data-ceremony-stage", "countdown");
  const comparison = await page.evaluate(async () => {
    const game = window.__venueQaGame as Phaser.Game;
    const actual = await new Promise<HTMLImageElement>(resolve =>
      game.renderer.snapshotArea(121, 229, 478, 270, image => resolve(image as HTMLImageElement)));
    const actualCanvas = document.createElement("canvas"), reference = document.createElement("canvas");
    actualCanvas.width = reference.width = 478; actualCanvas.height = reference.height = 270;
    const a = actualCanvas.getContext("2d")!, b = reference.getContext("2d")!;
    a.drawImage(actual, 0, 0);
    b.drawImage(game.textures.get("venue-hall").getSourceImage() as CanvasImageSource, 232, 468, 478, 270, 0, 0, 478, 270);
    const pixels = a.getImageData(0, 0, 478, 270).data, original = b.getImageData(0, 0, 478, 270).data;
    const lettering = game.scene.getScene("VenueHallScene").children.list.filter(child => child.getData("screenBranding")) as Phaser.GameObjects.Text[];
    const bounds = lettering.map(text => text.getBounds());
    let differentPixels = 0, letteringPixels = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] === original[i] && pixels[i + 1] === original[i + 1] && pixels[i + 2] === original[i + 2] && pixels[i + 3] === original[i + 3]) continue;
      const x = (i / 4) % 478 + 121, y = Math.floor(i / 4 / 478) + 229;
      if (bounds.some(b => x >= b.left - 1 && x <= b.right + 1 && y >= b.top - 1 && y <= b.bottom + 1)) letteringPixels++;
      else differentPixels++;
    }
    const monogram = game.scene.getScene("VenueHallScene").children.getByName("wedding-screen-monogram") as Phaser.GameObjects.Container;
    return { comparedPixels: 478 * 270, differentPixels, letteringPixels, lettering: lettering.map(text => text.getData("screenBrandingCopy")),
      positions: lettering.map(item => ({ relativeX: (item.x - 121) / 478, relativeY: (item.y - 229) / 270 })),
      heartColours: [...new Set(monogram.list.filter(child => child.type === "Rectangle").map(child => (child as Phaser.GameObjects.Rectangle).fillColor))],
      letterText: monogram.list.filter(child => child.type === "Text").map(child => (child as Phaser.GameObjects.Text).text),
    };
  });
  expect(comparison.differentPixels).toBe(0);
  expect(comparison.lettering).toEqual(["JJ ♥ HS", "WE ARE GETTING MARRIED"]);
  expect(comparison.letteringPixels).toBeGreaterThan(100);
  for (const [index, position] of comparison.positions.entries()) {
    expect(Math.abs(position.relativeX - openingLettering[index]!.relativeX)).toBeLessThan(.004);
    expect(Math.abs(position.relativeY - openingLettering[index]!.relativeY)).toBeLessThan(.004);
  }
  expect(comparison.heartColours).toEqual([0xe9a0a7]);
  expect(comparison.letterText).toEqual(["JJ", "HS"]);
  await page.screenshot({ path: info.outputPath(`group-screen-uncovered-${viewport.width}.png`) });
  await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", "찰칵! 결혼 축하해!", { timeout: 8000 });
  await chooseStory(page, "다음으로");
  await expect(canvas).toHaveAttribute("data-active-scene", "DinnerJourneyScene");
  await startPreparedScene(page, "IntroScene");
  await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
  expect(await background()).toEqual(initial);
  await page.screenshot({ path: info.outputPath(`opening-after-group-${viewport.width}.png`) });
  expect(errors).toEqual([]);
  await info.attach("screen-art-comparison", { body: JSON.stringify({ viewport, initial, openingLettering, comparison, returned: await background(), errors }), contentType: "application/json" });
});
