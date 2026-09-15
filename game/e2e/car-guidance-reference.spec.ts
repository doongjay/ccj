import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";
import { startPreparedScene } from "./stage-fixtures";
import { chooseStory } from "./story-helpers";

for (const [lane, width, height, destination] of [["노란색", 320, 568, "emart"], ["분홍색", 393, 852, "tower"], ["파란색", 430, 932, "b3"]] as const) {
  test(`reference car dialogue, placement and actual ${lane} drive at ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await installPlayerObservation(page);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", entry => { if (entry.type() === "error") errors.push(entry.text()); });
    await page.goto("/");
    await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    await startPreparedScene(page, "CarRouteScene");
    const copy = page.locator(".story-car .story-narration");
    await expect(copy).toHaveAttribute("aria-label", "양재IC랑 가깝군. 그런데 진입구에 유도선이 많은데?");
    const initial = (await copy.boundingBox())!;
    await page.screenshot({ path: testInfo.outputPath(`car-typing-${width}.png`) });
    await copy.click();
    await expect(copy.locator(".story-copy")).toHaveText("양재IC랑 가깝군.\n그런데 진입구에 유도선이 많은데?");
    const questionLines = await copy.locator(".story-copy").evaluate(element => {
      const text = element.firstChild!;
      const range = document.createRange();
      range.setStart(text, text.textContent!.indexOf("그런데"));
      range.setEnd(text, text.textContent!.length);
      return range.getClientRects().length;
    });
    expect(questionLines).toBe(1);
    const revealed = (await copy.boundingBox())!;
    expect(Math.abs(initial.y - revealed.y)).toBeLessThanOrEqual(0.5);
    const canvas = (await page.locator("canvas").boundingBox())!;
    expect(revealed.y).toBeGreaterThan(canvas.y + canvas.height * .21);
    expect(revealed.y).toBeLessThan(canvas.y + canvas.height * .25);
    const options = page.locator(".story-car .story-choice");
    await expect(options.first()).toBeEnabled();
    expect(await options.allTextContents()).toEqual(["노란색", "분홍색", "파란색"]);
    for (const option of await options.all()) {
      const bounds = (await option.boundingBox())!;
      expect(bounds.y).toBeGreaterThan(revealed.y + revealed.height);
      expect(bounds.y + bounds.height).toBeLessThan(canvas.y + canvas.height * .48);
    }
    await page.screenshot({ path: testInfo.outputPath(`car-choice-${width}.png`) });
    await page.evaluate(() => {
      const game = window.__venueQaGame as Phaser.Game;
      const frames: { x: number; y: number; at: number }[] = [];
      (window as unknown as { carDriveFrames: typeof frames }).carDriveFrames = frames;
      const record = () => {
        const player = window.__venuePlayerSnapshot();
        if (player?.scene === "CarRouteScene" && player.moving && !document.querySelector("canvas")?.dataset.parkingMap) frames.push({ x: player.x, y: player.y, at: performance.now() });
      };
      game.events.on("poststep", record);
      game.scene.getScene("CarRouteScene").events.once("shutdown", () => game.events.off("poststep", record));
    });
    await page.getByRole("button", { name: lane, exact: true }).click();
    await expect(page.locator("canvas")).toHaveAttribute("data-parking-map", destination, { timeout: 15000 });
    await page.screenshot({ path: testInfo.outputPath(`car-destination-${width}.png`) });
    const frames = await page.evaluate(() => (window as unknown as { carDriveFrames: { x: number; y: number; at: number }[] }).carDriveFrames);
    expect(frames.length).toBeGreaterThan(20);
    if (lane === "분홍색") { expect(frames.at(-1)!.x).toBeLessThan(110); expect(frames.at(-1)!.y).toBeLessThan(660); }
    if (lane === "파란색") { expect(frames.at(-1)!.x).toBeLessThan(540); expect(frames.at(-1)!.y).toBeLessThan(580); }
    const path = await page.locator("canvas").getAttribute("data-car-lane-path");
    if (lane === "노란색") {
      await expect(page.getByRole("button", { name: "파란색", exact: true })).toBeEnabled({ timeout: 15000 });
      await expect(copy).toHaveAttribute("aria-label", "양재IC랑 가깝군. 그런데 진입구에 유도선이 많은데?");
      await chooseStory(page, "파란색");
    }
    await expect(page.locator("canvas")).toHaveAttribute("data-lobby-ready", "true", { timeout: 15000 });
    await testInfo.attach("actual-car-drive", { body: JSON.stringify({ lane, destination, width, height, path: JSON.parse(path!), frames, errors }, null, 2), contentType: "application/json" });
    expect(errors).toEqual([]);
  });
}
