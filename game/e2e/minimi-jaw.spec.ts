import { prepareMinimiAudit } from "./stage-fixtures";
import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";

test("finished minimi keep face outlines while face thumbnails have no jaw or neck seams", async ({ page }, testInfo) => {
  await installPlayerObservation(page);
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await prepareMinimiAudit(page);
  const seams = await page.evaluate(async () => {
    const path = "/src/ui/minimiParts.ts";
    const { MINIMI_NECK } = await import(path) as typeof import("../src/ui/minimiParts");
    // Inspect the same six source jaw rows at their registered game position.
    // The 3px head seating moves the mouth into the old y=74..76 window;
    // color thresholds, region dimensions and thumbnail checks stay unchanged.
    const headY = MINIMI_NECK.headOffsetY;
    const game = window.__venueQaGame as Phaser.Game;
    const sheet = document.createElement("canvas");
    sheet.id = "jaw-review"; sheet.width = 768; sheet.height = 576;
    Object.assign(sheet.style, { position: "fixed", inset: "0", zIndex: "999", background: "#f7e7e1" });
    const context = sheet.getContext("2d")!; context.imageSmoothingEnabled = false;
    document.body.append(sheet);
    const seams: string[] = [];
    const faceSheet = game.textures.get("minimi-faces").getSourceImage() as HTMLCanvasElement;
    for (let face = 0; face < 3; face++) {
      const pixels = faceSheet.getContext("2d")!.getImageData(face * 128, 0, 128, 192).data;
      for (let y = 74; y < 79; y++) for (let x = 34; x < 94; x++) {
        const i = (y * 128 + x) * 4;
        if (pixels[i + 3] > 127 && (pixels[i] < 225 || pixels[i + 1] < 180 || pixels[i + 2] < 140)) seams.push(`thumbnail/${face}/${x},${y}`);
      }
    }
    for (const [genderIndex, gender] of ["male", "female"].entries()) {
      const source = game.textures.get(`minimi-${gender}`).getSourceImage() as HTMLCanvasElement;
      for (let hair = 0; hair < 3; hair++) {
        context.drawImage(source, hair * 128 + 32, 48, 64, 48, hair * 256, genderIndex * 288, 256, 192);
        const pixels = source.getContext("2d")!.getImageData(hair * 128, 0, 128, 192).data;
        let outline = 0;
        for (let y = 65 + headY; y < 77 + headY; y++) for (let x = 40; x < 89; x++) {
          const i = (y * 128 + x) * 4;
          if (pixels[i + 3] > 127 && Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) < 100) outline++;
        }
        if (outline < 10) seams.push(`missing-outline/${gender}/${hair}`);
        for (let y = 74 + headY; y < 80 + headY; y++) for (let x = 59; x < 69; x++) {
          const i = (y * 128 + x) * 4;
          if (pixels[i + 3] > 127 && (pixels[i] < 225 || pixels[i + 1] < 170)) seams.push(`${gender}/${hair}/${x},${y}: ${[...pixels.slice(i, i + 4)]}`);
        }
      }
    }
    return seams;
  });
  await page.locator("#jaw-review").screenshot({ path: testInfo.outputPath("chin-closeup.png") });
  expect(seams).toEqual([]);
});
