import { chooseStory, clickGame, completeLobbyTours, enterLobby, finishDinner, receiveEnvelope, takeBridalPhoto } from "./story-helpers";
import { expect, test } from "@playwright/test";
import { installPlayerObservation } from "./corridor-observables";

for (const viewport of [{ width: 390, height: 844, side: "groom", route: "car" }, { width: 430, height: 932, side: "bride", route: "subway" }, { width: 720, height: 1280, side: "groom", route: "car" }, { width: 1440, height: 1000, side: "bride", route: "subway" }] as const) {
  test(`room navigation preserves reception and selected side at ${viewport.width}px`, async ({ page }, testInfo) => {
    test.setTimeout(120000);
    await page.setViewportSize(viewport);
    await installPlayerObservation(page);
    await page.goto("/");
    await enterLobby(page, viewport.route, viewport.side);
    const canvas = page.locator("#app canvas");
    await completeLobbyTours(page);
    await expect(canvas).toHaveAttribute("data-reception-complete", "false");
    if (viewport.side === "bride") {
      await clickGame(page, 590, 990);
      await expect(canvas).toHaveAttribute("data-active-scene", "GreeneryCorridorScene");
      const start = await page.evaluate(() => window.__venuePlayerSnapshot());
      await clickGame(page, 100, 1000);
      const afterTap = await page.evaluate(() => window.__venuePlayerSnapshot());
      expect(afterTap?.moving).toBe(true);
      expect(afterTap?.x).toBeGreaterThanOrEqual(start?.x ?? 360);
      await takeBridalPhoto(page);
    } else {
      await clickGame(page, 590, 990);
      await expect(canvas).toHaveAttribute("data-lobby-info", "bridal-restricted");
      await page.locator(".story-info-compact .story-narration").click();
    }
    await clickGame(page, 360, 460);
    await receiveEnvelope(page);
    await expect(canvas).toHaveAttribute("data-reception-desk", viewport.side);
    await clickGame(page, 590, 150);
    await expect(canvas).toHaveAttribute("data-active-scene", "VenueHallScene");
    await page.screenshot({ path: testInfo.outputPath("hall.png") });
    await chooseStory(page, "박수를 친다");
    await finishDinner(page);
    await expect(canvas).toHaveAttribute("data-guest-side", viewport.side);
    await page.getByRole("button", { name: "청첩장 보기", exact: true }).click();
    await expect(canvas).toHaveAttribute("data-active-scene", "InvitationScene");
    await expect(page.getByRole("heading", { name: "재준 그리고 현서" })).toBeVisible();
    await expect(page.locator(".minimi-guest")).toHaveCount(1);
  });
}
