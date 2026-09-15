import { prepareMinimiAudit } from "./stage-fixtures";
import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";

test("heads and outfits stay connected in every minimi pose", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1200, height: 1300 });
  await installPlayerObservation(page);
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await prepareMinimiAudit(page);
  const disconnected: unknown[] = [];
  const darkSeams: unknown[] = [];
  for (const gender of ["male", "female"]) {
    const results = await page.evaluate(gender => {
      const game = window.__venueQaGame as Phaser.Game;
      const source = game.textures.get(`minimi-${gender}`).getSourceImage() as HTMLCanvasElement;
      const sourceContext = source.getContext("2d")!;
      const sheet = document.createElement("canvas");
      sheet.id = "neck-audit";
      sheet.width = source.width;
      sheet.height = 864;
      Object.assign(sheet.style, { position: "fixed", inset: "0", zIndex: "999", background: "#d09ca6", imageRendering: "pixelated" });
      const context = sheet.getContext("2d")!;
      context.imageSmoothingEnabled = false;
      document.body.append(sheet);
      const collarRows = Array<number>(9).fill(86);
      return Array.from({ length: source.width / 128 * 9 }, (_, index) => {
        const column = index % (source.width / 128);
        const row = Math.floor(index / (source.width / 128));
        const pixels = sourceContext.getImageData(column * 128, row * 192, 128, 192).data;
        context.drawImage(source, column * 128 + 32, row * 192 + collarRows[row]! - 22, 64, 44, column * 128, row * 96, 128, 88);
        const visited = new Uint8Array(128 * 192);
        const components: { count: number; top: number; bottom: number }[] = [];
        for (let start = 0; start < visited.length; start += 1) {
          if (visited[start] || pixels[start * 4 + 3]! < 128) continue;
          const connected = [start];
          visited[start] = 1;
          let top = 192, bottom = 0;
          for (let cursor = 0; cursor < connected.length; cursor += 1) {
            const current = connected[cursor]!;
            const currentRow = Math.floor(current / 128);
            top = Math.min(top, currentRow); bottom = Math.max(bottom, currentRow);
            for (const [deltaX, deltaY] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
              const pixelX = current % 128 + deltaX!;
              const pixelY = currentRow + deltaY!;
              if (pixelX < 0 || pixelX >= 128 || pixelY < 0 || pixelY >= 192) continue;
              const next = pixelY * 128 + pixelX;
              if (!visited[next] && pixels[next * 4 + 3]! >= 128) { visited[next] = 1; connected.push(next); }
            }
          }
          if (connected.length > 200) components.push({ count: connected.length, top, bottom });
        }
        const collarX = 64;
        const seamRow = 83;
        let darkPixels = 0;
        for (let pixelX = collarX - 3; pixelX < collarX + 3; pixelX += 1) {
          const offset = (seamRow * 128 + pixelX) * 4;
          if (pixels[offset]! < 85 && pixels[offset + 1]! < 85 && pixels[offset + 2]! < 85 && pixels[offset + 3]! >= 128) darkPixels += 1;
        }
        return { gender, outfit: Math.floor(column / 3), hair: column % 3, row, components, darkPixels };
      });
    }, gender);
    await page.locator("#neck-audit").screenshot({ path: testInfo.outputPath(`${gender}-neck.png`) });
    await page.locator("#neck-audit").evaluate(element => element.remove());
    disconnected.push(...results.filter(result => !result.components.some(component => component.top < 60 && component.bottom > 135)));
    darkSeams.push(...results.filter(result => [0, 4, 5, 6, 7, 8].includes(result.row) && result.outfit !== 1 && result.darkPixels === 6));
    await testInfo.attach(`${gender}-components`, { body: JSON.stringify(results, null, 2), contentType: "application/json" });
  }
  expect(disconnected).toEqual([]);
  expect(darkSeams).toEqual([]);
});
