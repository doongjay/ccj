import { expect, test, type Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { clickGame, enterLobby, chooseStory, fillProfile } from "./story-helpers";
import { REVIEW_EVIDENCE as evidence } from "./review-evidence";

test.use({ viewport: { width: 393, height: 852 }, video: { mode: "on", size: { width: 430, height: 932 } } });
const canvas = (page: Page) => page.locator("#app canvas");
async function scene(page: Page, name: string) { await expect(canvas(page)).toHaveAttribute("data-active-scene", name, { timeout: 20000 }); }

for (const lane of ["tower", "b3"] as const) test(`F19 ${lane}: real car guide map, wrong-route return and valid arrival`, async ({ page }) => {
  test.setTimeout(60000); const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.setViewportSize({ width: 320, height: 568 }); await page.goto("/"); await scene(page, "IntroScene");
  await clickGame(page, 360, 1180); await fillProfile(page); await chooseStory(page, lane === "tower" ? "신부측" : "신랑측"); await chooseStory(page, "자차로 간다");
  const clips: unknown[] = []; const start = Date.now();
  if (lane === "tower") {
    await chooseStory(page, "노란색"); await expect(canvas(page)).toHaveAttribute("data-parking-map", "emart", { timeout: 15000 });
    await expect(page.locator(".story-copy")).toHaveText(await page.locator(".story-narration").getAttribute("aria-label") ?? "");
    await page.screenshot({ path: `${evidence}/f19-emart-320.png` });
    await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", "여긴 이마트 주차장이네.\n주차 정산이 안될테니 다른 유도선을 타야겠군.");
    clips.push({ type: "wrong-map", at: Date.now() - start });
    await expect(page.getByRole("button", { name: "분홍색", exact: true })).toBeVisible({ timeout: 15000 });
  }
  await chooseStory(page, lane === "tower" ? "분홍색" : "파란색");
  await expect(canvas(page)).toHaveAttribute("data-parking-map", lane, { timeout: 15000 });
  await expect(page.locator(".story-copy")).toHaveText(await page.locator(".story-narration").getAttribute("aria-label") ?? "");
  await page.screenshot({ path: `${evidence}/f19-${lane}-320.png` });
  await page.setViewportSize({ width: 393, height: 852 }); await page.screenshot({ path: `${evidence}/f19-${lane}-393.png` });
  clips.push({ type: lane, at: Date.now() - start });
  await scene(page, "VenueLobbyScene"); await expect(canvas(page)).toHaveAttribute("data-route-quiz-solved", "true");
  expect(errors).toEqual([]);
  await writeFile(`${evidence}/parking-${lane}.json`, JSON.stringify({ start, clips, errors, video: await page.video()?.path() }, null, 2));
});

// User refinement replaces album arrows with the original staged photos and full-screen taps.
for (const width of [320, 393, 430]) test(`F20 ${width}: tap completes all six photos then advances without arrows`, async ({ page }) => {
  test.setTimeout(75000); const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  const height = width === 320 ? 568 : width === 393 ? 852 : 932;
  await page.setViewportSize({ width, height }); await page.goto("/"); await enterLobby(page, width === 430 ? "subway" : "car", "groom");
  await clickGame(page, 360, 150); await chooseStory(page, "1시반부터 밥먹기");
  await expect(canvas(page)).toHaveAttribute("data-dinner-stage", "buffet", { timeout: 30000 });
  await expect(canvas(page)).toHaveAttribute("data-buffet-photo-count", "6");
  await expect(canvas(page)).toHaveAttribute("data-buffet-reveal-complete", "false");
  await clickGame(page, 360, 640);
  await expect(canvas(page)).toHaveAttribute("data-buffet-reveal-complete", "true");
  await expect(canvas(page)).toHaveAttribute("data-dinner-stage", "buffet");
  await expect(page.locator(".buffet-navigation")).toHaveCount(0);
  await page.screenshot({ path: `${evidence}/f20-buffet-${width}.png` });
  await page.locator(".story-narration").click(); await page.locator(".story-narration").click();
  await expect(canvas(page)).toHaveAttribute("data-dinner-stage", "buffet-route");
  await page.locator(".story-narration").click();
  await expect(page.getByRole("button", { name: "식사를 마친다", exact: true })).toHaveCount(0);
  const action = page.locator(".story-narration");
  await expect(action).toBeVisible();const box=(await action.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44); expect(box.y+box.height).toBeLessThanOrEqual(height);
  await page.screenshot({path:`${evidence}/f20-meal-tap-${width}.png`});
  // The completed narration remains keyboard accessible without a separate CTA.
  if(width===393){await action.focus();await page.keyboard.press("Enter");}
  else await clickGame(page, 360, 300);
  await expect(canvas(page)).toHaveAttribute("data-meal-complete", "true"); await scene(page, "VenueLobbyScene");
  expect(errors).toEqual([]);
});
