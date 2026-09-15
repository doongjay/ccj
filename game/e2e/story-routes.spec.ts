import { startPreparedScene } from "./stage-fixtures";
import { expect, test } from "@playwright/test";
import { chooseStory, fillProfile, dismissLobbyArrival } from "./story-helpers";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";

test.use({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

for (const route of ["pink", "subway"] as const) {
  test(`iPhone 15 Pro story: ${route}`, async ({ page }, testInfo) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    await installPlayerObservation(page);
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/");
    const canvas = page.locator("canvas");
    await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
    await testInfo.attach("intro-iphone15pro", { body: await page.screenshot({ path: testInfo.outputPath("intro.png") }), contentType: "image/png" });
    const bounds = await canvas.boundingBox();
    if (!bounds) throw new Error("Missing canvas");
    await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height * 1180 / 1280);
    await fillProfile(page);
    await expect(canvas).toHaveAttribute("data-story-state", "typing");
    await expect(page.locator(".story-choice:visible")).toHaveCount(0);
    await expect(page.locator(".story-choices")).toHaveAttribute("inert", "");
    await expect(page.locator(".story-overlay").getByRole("button")).toHaveCount(1);
    await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", "오늘 누구 하객으로 가지?");
    await page.locator(".story-narration").click();
    await expect(page.locator(".story-choice")).toHaveCount(2);
    await testInfo.attach("choices-iphone15pro", { body: await page.screenshot({ path: testInfo.outputPath("choices.png") }), contentType: "image/png" });
    await chooseStory(page, "신랑측");
    await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", /오후 2시까지 가야하는군\.\n어떻게 갈까\?/);
    await expect(page.locator(".story-narration")).toHaveCSS("white-space", "pre-line");
    await expect(page.locator(".story-narration")).not.toHaveAttribute("aria-label", /술|와인|맥주/);
    await page.screenshot({ path: testInfo.outputPath("home-sky.png") });
    await chooseStory(page, route === "pink" ? "자차로 간다" : "지하철을 탄다");
    await expect(page.locator(".story-overlay")).toBeHidden();
    if (route === "pink") {
      await chooseStory(page, "분홍색");
      await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", "어라, 타워주차장이었네. 귀찮지만 어쩔수없지.");
      const hidden = await page.addStyleTag({ content: ".story-overlay { visibility: hidden !important; }" });
      await page.screenshot({ path: testInfo.outputPath("pixel-parking.png") });
      await hidden.evaluate(element => element.parentNode?.removeChild(element));
    } else {
      await expect(canvas).toHaveAttribute("data-active-scene", "SubwayRouteScene");
      await page.locator(".story-narration").click();
      const signs = await page.evaluate(() => {
        const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("SubwayRouteScene");
        return [1, 2, 3, 4, 5].map(number => {
          const sign = scene.children.getByName(`subway-exit-${number}`) as Phaser.GameObjects.Text;
          return { text: sign.text, x: sign.x, y: sign.y };
        });
      });
      expect(signs).toEqual([96, 226, 360, 494, 624].map((exitX, index) => ({ text: String(index + 1), x: exitX, y: 516 })));
      await expect.poll(() => page.evaluate(() => (window.__venueQaGame as Phaser.Game).scene.getScene("SubwayRouteScene").cameras.main.fadeEffect.isRunning)).toBe(false);
      const narration = await page.locator(".story-narration").boundingBox();
      expect(narration!.y).toBeGreaterThan(bounds.y + bounds.height * 536 / 1280);
      await page.screenshot({ path: testInfo.outputPath("numbered-exits.png") });
      await chooseStory(page, "3번 출구");
      await expect(canvas).toHaveAttribute("data-route-quiz-wrong-count", "1");
      await page.getByRole("button", { name: "4번 출구", exact: true }).click({ timeout: 15000 });
      await expect(canvas).toHaveAttribute("data-route-quiz-wrong-count", "2");
      await page.getByRole("button", { name: "5번 출구", exact: true }).click({ timeout: 15000 });
    }
    await expect(canvas).toHaveAttribute("data-active-scene", "VenueLobbyScene", { timeout: 15000 });
    await expect(canvas).toHaveAttribute("data-lobby-ready", "true");
    await dismissLobbyArrival(page);
    await expect(page.locator(".story-overlay:visible")).toHaveCount(0);
    await testInfo.attach("lobby-iphone15pro", { body: await page.screenshot(), contentType: "image/png" });
    expect(errors).toEqual([]);
  });
}

test("station choices leave the numbered circles visible at 320px", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await installPlayerObservation(page);
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await startPreparedScene(page, "SubwayRouteScene");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "SubwayRouteScene");
  await page.locator(".story-narration").click();
  await expect(page.locator(".story-choice")).toHaveCount(5);
  await expect.poll(() => page.evaluate(() => (window.__venueQaGame as Phaser.Game).scene.getScene("SubwayRouteScene").cameras.main.fadeEffect.isRunning)).toBe(false);
  const canvas = await page.locator("#app canvas").boundingBox();
  const narration = await page.locator(".story-narration").boundingBox();
  expect(narration!.y).toBeGreaterThan(canvas!.y + canvas!.height * 536 / 1280);
  for (const choice of await page.locator(".story-choice").all()) {
    const bounds = await choice.boundingBox();
    expect(bounds!.width).toBeGreaterThanOrEqual(44);
    expect(bounds!.x).toBeGreaterThanOrEqual(canvas!.x);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(canvas!.x + canvas!.width);
  }
  await page.screenshot({ path: testInfo.outputPath("numbered-exits-small.png") });
});
