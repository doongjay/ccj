import { expect, test, type Page } from "@playwright/test";
import { enterLobby, takeBridalPhoto } from "./story-helpers";
import { installPlayerObservation } from "./corridor-observables";

test.use({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });

test("lobby items open immediately and tap returns to the facility", async ({ page }, testInfo) => {
  await installPlayerObservation(page);
  await page.goto("/");
  await enterLobby(page, "car", "bride");
  await page.screenshot({ path: testInfo.outputPath("lobby.png") });
  await click(page, 76, 60);
  await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", /오늘의 추억 수첩[\s\S]*♡  포토부스[\s\S]*♡  현서와 사진/);
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  for (const item of [{ x: 667, y: 560, returnX:470, returnY:590, text: "지하1층으로 가면 은행 ATM(국민, 우리, 신한, SC제일은행)이 있다고 한다." },
    { x: 590, y: 870, returnX:590, returnY:970, text: "오 목좀 축이고 쉬고있을까." }]) {
    await click(page, item.x, item.y);
    const panel = page.locator(".story-narration");
    await expect(panel).toHaveAttribute("aria-label", item.text);
    expect((await page.evaluate(() => window.__venuePlayerSnapshot()))?.moving).toBe(false);
    await click(page, 350, 1100);
    const after = await page.evaluate(() => window.__venuePlayerSnapshot());
    expect(after?.x).toBe(item.returnX);
    expect(after?.y).toBe(item.returnY);
    expect(after?.moving).toBe(false);
    await expect(page.locator(".story-overlay")).toBeHidden();
  }
  await click(page, 590, 990);
  await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "GreeneryCorridorScene");
  await page.screenshot({ path: testInfo.outputPath("garden.png") });
  await takeBridalPhoto(page);
  await expect(page.locator("canvas")).toHaveAttribute("data-bridal-room-visited", "true");
});

async function click(page: Page, x: number, y: number): Promise<void> {
  const bounds = await page.locator("canvas").boundingBox();
  if (!bounds) throw new Error("Missing canvas");
  await page.mouse.click(bounds.x + bounds.width * x / 720, bounds.y + bounds.height * y / 1280);
}
