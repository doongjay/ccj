import { prepareMinimiAudit } from "./stage-fixtures";
import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";
import { clickGame } from "./story-helpers";

test("all minimi hairstyles, outfits and poses render on transparent tiles", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", entry => { if (entry.type() === "error" || /(?:Texture|Frame|Animation).*(?:missing|not found|has no frame|does not exist)/i.test(entry.text())) errors.push(entry.text()); });
  await page.setViewportSize({ width: 1200, height: 1300 });
  await installPlayerObservation(page);
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await prepareMinimiAudit(page);
  for (const gender of ["male", "female"]) {
    await page.evaluate(async gender => {
      const game = window.__venueQaGame as Phaser.Game;
      const texture = game.textures.get(`outfits-${gender}`);
      const modulePath = "/src/data/guestOutfits.ts";
      const { outfitFrameBounds } = await import(modulePath) as typeof import("../src/data/guestOutfits");
      const source = texture.getSourceImage() as HTMLImageElement;
      const sheet = document.createElement("canvas");
      sheet.id = "minimi-source";
      sheet.width = 384;
      sheet.height = 1152;
      Object.assign(sheet.style, { position: "fixed", inset: "0", zIndex: "999", background: "#f6eddf", imageRendering: "pixelated" });
      const context = sheet.getContext("2d")!;
      context.imageSmoothingEnabled = false;
      for (let row = 0; row < 6; row++) {
        for (let outfit = 0; outfit < 3; outfit += 1) {
          const bounds = outfitFrameBounds(source.width, source.height, gender as "male" | "female", outfit, row);
          context.drawImage(source, bounds.x, bounds.y, bounds.width, bounds.height, outfit * 128, row * 192, 128, 192);
        }
      }
      document.body.append(sheet);
    }, gender);
    await page.locator("#minimi-source").screenshot({ path: testInfo.outputPath(`${gender}-source.png`) });
    await page.locator("#minimi-source").evaluate(element => element.remove());
    const tiles = await page.evaluate(gender => {
      const game = window.__venueQaGame as Phaser.Game;
      const texture = game.textures.get(`minimi-${gender}`);
      const source = texture.getSourceImage() as HTMLCanvasElement;
      const columns = source.width / 128;
      const sheet = document.createElement("canvas");
      sheet.id = "minimi-audit";
      sheet.width = source.width;
      sheet.height = 1152;
      Object.assign(sheet.style, { position: "fixed", inset: "0", zIndex: "999", background: "#f6eddf", imageRendering: "pixelated" });
      sheet.getContext("2d")!.drawImage(source, 0, 0);
      document.body.append(sheet);
      const context = sheet.getContext("2d")!;
      return Array.from({ length: columns * 6 }, (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const data = context.getImageData(column * 128, row * 192, 128, 192).data;
        let opaque = 0;
        for (let pixel = 3; pixel < data.length; pixel += 4) if (data[pixel]! > 0) opaque += 1;
        return { opaque, corner: data[3] };
      });
    }, gender);
    expect(tiles.every(tile => tile.opaque > 1000 && tile.corner === 0)).toBe(true);
    await page.locator("#minimi-audit").screenshot({ path: testInfo.outputPath(`${gender}-all-poses.png`) });
    await page.locator("#minimi-audit").evaluate(element => element.remove());
    const blinkChanges = await page.evaluate(gender => {
      const game = window.__venueQaGame as Phaser.Game;
      const source = game.textures.get(`minimi-${gender}`).getSourceImage() as HTMLCanvasElement;
      const columns = source.width / 128;
      const sheet = document.createElement("canvas");
      sheet.id = "minimi-blink";
      sheet.width = source.width;
      sheet.height = 576;
      Object.assign(sheet.style, { position: "fixed", inset: "0", zIndex: "999", background: "#f6eddf", imageRendering: "pixelated" });
      const context = sheet.getContext("2d")!;
      context.drawImage(source, 0, 1152, source.width, 576, 0, 0, source.width, 576);
      document.body.append(sheet);
      const original = source.getContext("2d")!;
      return Array.from({ length: columns * 3 }, (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const open = original.getImageData(column * 128, [0, 4, 5][row]! * 192, 128, 192).data;
        const closed = context.getImageData(column * 128, row * 192, 128, 192).data;
        let changed = 0, changedBody = 0;
        for (let offset = 0; offset < open.length; offset += 4) {
          if (open[offset] !== closed[offset] || open[offset + 1] !== closed[offset + 1] || open[offset + 2] !== closed[offset + 2]) {
            changed += 1;
            if (offset >= 82 * 128 * 4) changedBody++;
          }
        }
        return { changed, changedBody };
      });
    }, gender);
    // Blinking changes only the face and preserves every garment.
    expect(blinkChanges.every(({ changed, changedBody }) => changed > 10 && changed <= 60 * 58 && changedBody === 0)).toBe(true);
    await page.locator("#minimi-blink").screenshot({ path: testInfo.outputPath(`${gender}-blink.png`) });
    await page.locator("#minimi-blink").evaluate(element => element.remove());
  }
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await expect.poll(() => page.locator("#app canvas").evaluate(canvas => Math.round(canvas.getBoundingClientRect().width))).toBe(393);
  await clickGame(page, 360, 1180);
  for (const gender of ["남자", "여자"]) {
    await page.getByRole("button", { name: gender, exact: true }).click();
    for (let hair = 0; hair < 3; hair += 1) {
      await page.locator(".hair-card").nth(hair).click();
      for (let outfit = 0; outfit < 6; outfit += 1) {
        if (!await page.locator(".outfit-card").nth(outfit).isVisible()) await page.getByRole("button", { name: "다음 의상 보기", exact: true }).click();
        await page.locator(".outfit-card").nth(outfit).click();
        await page.screenshot({ path: testInfo.outputPath(`${gender}-${hair}-${outfit}-profile.png`) });
      }
    }
  }
  expect(errors).toEqual([]);
});
