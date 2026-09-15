import { startPreparedScene } from "./stage-fixtures";
import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";
import { chooseStory, clickGame } from "./story-helpers";
import { createInitialProgressionState } from "../src/state/gameState";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await installPlayerObservation(page);
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
});

test("buffet touch reveals all photos and waits for a separate meal completion input", async ({ page }, testInfo) => {
  await page.evaluate(progress => {
    const game = window.__venueQaGame as Phaser.Game;
    game.registry.set("wedding.progression", { ...progress, banquetGuideComplete: true });
    game.registry.set("wedding.routeChoice", "car");
  }, createInitialProgressionState());
  await startPreparedScene(page, "DinnerJourneyScene");
  const canvas = page.locator("#app canvas");
  await expect(canvas).toHaveAttribute("data-dinner-stage", "banquet-arrival", { timeout: 8000 });
  await clickGame(page, 360, 500);
  await expect(canvas).toHaveAttribute("data-dinner-stage", "buffet");
  await expect(canvas).toHaveAttribute("data-buffet-photo-count", "6");
  await clickGame(page, 360, 500);
  await expect(canvas).toHaveAttribute("data-buffet-reveal-complete", "true");
  await expect(canvas).toHaveAttribute("data-dinner-stage", "buffet");
  await expect(canvas).not.toHaveAttribute("data-meal-complete", "true");
  await expect(page.locator(".buffet-navigation")).toHaveCount(0);
  await page.locator(".story-narration").click(); await page.locator(".story-narration").click();
  await expect(canvas).toHaveAttribute("data-dinner-stage", "buffet-route");
  await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", /차를 가져와서 술은 못/);
  await page.locator(".story-narration").click();
  await page.waitForTimeout(3800);
  await expect(canvas).toHaveAttribute("data-dinner-stage", "buffet-route");
  await page.screenshot({ path: testInfo.outputPath("food-touch-preview.png") });
  await page.locator(".story-narration").click();
  await expect(canvas).toHaveAttribute("data-dinner-stage", "after-meal");
  await page.locator(".story-narration").click(); await page.locator(".story-narration").click();
  await expect(canvas).toHaveAttribute("data-dinner-stage", "homeward");
  await page.locator(".story-narration").click(); await page.locator(".story-narration").click();
  await expect(canvas).toHaveAttribute("data-active-scene", "EndingScene");
});

test("tapping envelope writing completes it and returns once", async ({ page }) => {
  await page.evaluate(() => {
    const game = window.__venueQaGame as Phaser.Game;
    game.registry.set("wedding.guestName", "아주긴이름테스트");
    game.registry.set("wedding.guestSide", "groom");
  });
  await startPreparedScene(page, "ReceptionScene");
  await chooseStory(page, "인사하기");
  await clickGame(page, 360, 500);
  await clickGame(page, 360, 500);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-reception-complete", "true");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "VenueLobbyScene");
});

test("group photo countdown and photo hold can be skipped with separate taps", async ({ page }, testInfo) => {
  await startPreparedScene(page, "VenueHallScene");
  await chooseStory(page, "박수를 친다");
  await chooseStory(page, "사진 찍기");
  await clickGame(page, 360, 600);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-ceremony-stage", "photo");
  await clickGame(page, 360, 600);
  await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", "찰칵! 결혼 축하해!");
  await page.screenshot({ path: testInfo.outputPath("white-bride-group-photo.png") });
  await chooseStory(page, "다음으로");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "DinnerJourneyScene");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-hall-transition-count", "1");
});
