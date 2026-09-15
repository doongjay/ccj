import { expect, test, type Page } from "@playwright/test";
import { installPlayerObservation } from "./corridor-observables";
import { clickGame, enterLobby, receiveEnvelope, takeBridalPhoto, returnFromPhoto } from "./story-helpers";

for (const side of ["groom", "bride"] as const) {
  test(`${side} explores facilities normally after dismissing the hall reminder`, async ({ page }, testInfo) => {
    test.setTimeout(100000);
    await page.setViewportSize({ width: 393, height: 852 });
    await installPlayerObservation(page);
    await page.goto("/");
    await enterLobby(page, "car", side);
    const canvas = page.locator("#app canvas");
    await clickGame(page, 590, 150);
    await expect(canvas).toHaveAttribute("data-lobby-info", "explore-required");
    await page.keyboard.press("Escape");
    await clickGame(page, 550, 450);
    await expect(canvas).toHaveAttribute("data-photo-gallery-open", "true");
    await page.keyboard.press("Escape");
    await expectLobbyPosition(page, 474, 360);
    await clickGame(page, 590, 150);
    await page.keyboard.press("Escape");
    await clickGame(page, 130, 590);
    await expect(canvas).toHaveAttribute("data-active-scene", "PhotoBoothScene");
    await clickGame(page, 360, 860);
    await expect(canvas).toHaveAttribute("data-photo-booth-visited", "true");
  await returnFromPhoto(page);
    await expectLobbyPosition(page, 236, 610);
    await clickGame(page, 590, 150);
    await page.keyboard.press("Escape");
    await clickGame(page, 360, 420);
    await receiveEnvelope(page);
    await expectLobbyPosition(page, 474, 360);
    if (side === "bride") {
      await clickGame(page, 590, 150);
      await expect(canvas).toHaveAttribute("data-lobby-info", "explore-required");
      await page.keyboard.press("Escape");
      await clickGame(page, 590, 990);
      await takeBridalPhoto(page);
      await expectLobbyPosition(page, 360, 1060);
    }
    await page.screenshot({ path: testInfo.outputPath("back-in-lobby.png") });
    await clickGame(page, 130, 590);
    await expect(canvas).toHaveAttribute("data-active-scene", "PhotoBoothScene");
    await clickGame(page, 360, 1180);
    await expect(canvas).toHaveAttribute("data-active-scene", "VenueLobbyScene");
    await expect(canvas).toHaveAttribute("data-lobby-ready", "true");
    await expect.poll(() => page.evaluate(() => window.__venuePlayerSnapshot())).toMatchObject({ x: 236, y: 610, moving: false });
    await clickGame(page, 590, 150);
    await expect(canvas).toHaveAttribute("data-active-scene", "VenueHallScene");
  });
}

async function expectLobbyPosition(page: Page, x: number, y: number): Promise<void> {
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "VenueLobbyScene", { timeout: 10000 });
  await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-ready", "true");
  await expect.poll(() => page.evaluate(() => window.__venuePlayerSnapshot())).toMatchObject({ x, y, moving: false });
  await expect(page.locator(".story-overlay:visible")).toHaveCount(0);
}
