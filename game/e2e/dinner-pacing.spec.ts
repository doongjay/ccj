import { startPreparedScene } from "./stage-fixtures";
import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";
import { finishMealByTap } from "./story-helpers";
import { createInitialProgressionState } from "../src/state/gameState";

test("banquet travel follows the corridor floor promptly and departure stays at the buffet", async ({ page }, testInfo) => {
  test.setTimeout(45000);
  await page.setViewportSize({ width: 393, height: 852 });
  await installPlayerObservation(page);
  await page.goto("/");
  const canvas = page.locator("#app canvas");
  await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
  await page.evaluate(progress => {
    const game = window.__venueQaGame as Phaser.Game;
    game.registry.set("wedding.progression", { ...progress, banquetGuideComplete: true });
    game.registry.set("wedding.routeChoice", "car");
  }, createInitialProgressionState());
  await startPreparedScene(page, "DinnerJourneyScene");
  await expect(canvas).toHaveAttribute("data-dinner-stage", "to-banquet");
  const journey = await page.evaluate(() => new Promise<{ samples: { x: number; y: number }[]; elapsed: number }>((resolve, reject) => {
    const started = performance.now();
    const samples: { x: number; y: number }[] = [];
    const timer = window.setInterval(() => {
      const player = window.__venuePlayerSnapshot();
      if (player?.scene === "DinnerJourneyScene") samples.push({ x: player.x, y: player.y });
      const elapsed = performance.now() - started;
      if (document.querySelector<HTMLCanvasElement>("#app canvas")?.dataset.dinnerStage === "banquet-arrival") {
        window.clearInterval(timer);
        resolve({ samples, elapsed });
      } else if (elapsed > 6000) {
        window.clearInterval(timer);
        reject(new Error("The short corridor transition took longer than six seconds."));
      }
    }, 16);
  }));
  expect(journey.elapsed).toBeLessThan(6000);
  expect(journey.samples.some(point => point.x > 600)).toBe(true);
  expect(journey.samples.some(point => point.x < 100)).toBe(true);
  expect(journey.samples.every(point => point.y >= 790 && point.y <= 815)).toBe(true);
  expect(journey.samples.every((point, index, samples) => index === 0 || point.x <= samples[index - 1]!.x)).toBe(true);
  await expect(canvas).toHaveAttribute("data-dinner-stage", "buffet-route", { timeout: 20000 });
  await finishMealByTap(page);
  await expect(canvas).toHaveAttribute("data-dinner-stage", "homeward", { timeout: 10000 });
  const backgrounds = await page.evaluate(() => {
    const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("DinnerJourneyScene");
    return scene.children.list.filter(child => child.type === "Image").map(child => (child as Phaser.GameObjects.Image).texture.key);
  });
  expect(backgrounds).toEqual(["venue-banquet"]);
  expect(await page.evaluate(() => window.__venuePlayerSnapshot())).toBeNull();
  await page.screenshot({ path: testInfo.outputPath("departure-at-buffet.png") });
});
