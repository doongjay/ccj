import { expect, test } from "@playwright/test";
import { enterLobby, clickGame } from "./story-helpers";
import { REVIEW_EVIDENCE as evidence } from "./review-evidence";

test("F21/F22 production: viewport frame, visible notebook and portrait alternative without source hooks", async ({ page }) => {
  test.setTimeout(60000); const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.setViewportSize({ width: 393, height: 852 }); await page.goto("/"); await enterLobby(page, "car", "bride");
  for (const [width, height] of [[320, 568], [393, 852], [430, 932], [1440, 900], [852, 393]]) {
    await page.setViewportSize({ width: width!, height: height! }); await page.waitForTimeout(200);
    const bounds = (await page.locator("#app canvas").boundingBox())!;
    expect(bounds.width / bounds.height).toBeCloseTo(720 / 1280, 2);
    expect(await page.evaluate(() => document.body.scrollHeight <= innerHeight)).toBe(true);
    if (height! > 600 || width! < height!) {
      await clickGame(page, 128, 60); await expect(page.locator(".story-info-notebook")).toBeVisible();
      await expect(page.locator(".story-copy")).toContainText("현서와 사진 찍기"); await page.keyboard.press("Escape");
    } else await expect(page.getByRole("button", { name: "청첩장 바로 보기", exact: true })).toBeVisible();
    await page.screenshot({ path: `${evidence}/production-f21-f22-lobby-${width}x${height}.png` });
  }
  expect(errors).toEqual([]);
});
