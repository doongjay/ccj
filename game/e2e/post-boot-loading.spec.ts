import { expect, test } from "@playwright/test";
import { clickGame, fillProfile, chooseStory } from "./story-helpers";

test("slow post-boot assets keep the current scene without a loading panel", async ({ page }, info) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 393, height: 852 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", entry => { if (entry.type() === "error") errors.push(entry.text()); });
  let releaseSetup!: () => void, releaseCar!: () => void;
  const setup = new Promise<void>(resolve => { releaseSetup = resolve; });
  const car = new Promise<void>(resolve => { releaseCar = resolve; });
  await page.route("**/optimized/lacitta-routes-home-ground-v2.webp", async route => { await setup; await route.continue(); });
  await page.route("**/optimized/lacitta-characters-white-car.webp", async route => { await car; await route.continue(); });
  try {
    await page.goto("/");
    const canvas = page.locator("#app canvas");
    await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
    await clickGame(page, 360, 1180);
    await expect(canvas).toHaveAttribute("data-asset-load-stage", "setup");
    await page.waitForTimeout(800);
    await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
    await expect(page.locator(".stage-loading, .stage-loading-inline")).toHaveCount(0);
    await page.screenshot({ path: info.outputPath("slow-setup-keeps-scene.png") });
    releaseSetup();
    await fillProfile(page);
    await chooseStory(page, "신랑측");
    await chooseStory(page, "자차로 간다");
    await expect(canvas).toHaveAttribute("data-asset-load-stage", /car/);
    await page.waitForTimeout(800);
    await expect(canvas).toHaveAttribute("data-active-scene", "HomeSelectScene");
    await expect(page.locator(".stage-loading, .stage-loading-inline")).toHaveCount(0);
    await page.screenshot({ path: info.outputPath("slow-route-keeps-scene.png") });
    releaseCar();
    await chooseStory(page, "파란색");
    await expect(canvas).toHaveAttribute("data-lobby-ready", "true", { timeout: 20000 });
    await expect(page.locator(".stage-loading, .stage-loading-inline")).toHaveCount(0);
    await page.screenshot({ path: info.outputPath("lobby-after-delayed-assets.png") });
    expect(errors).toEqual([]);
  } finally { releaseSetup(); releaseCar(); }
});
