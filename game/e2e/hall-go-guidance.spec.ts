import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";
import { startPreparedScene } from "./stage-fixtures";
import { chooseStory, clickGame, dismissLobbyArrival, returnFromPhoto, takeBridalPhoto } from "./story-helpers";

for (const [width, height] of [[320, 568], [393, 852], [430, 932]]) {
  test(`hall GO links complete every required visit without walking first at ${width}`, async ({ page }, testInfo) => {
    test.setTimeout(100000);
    await page.setViewportSize({ width: width!, height: height! });
    await installPlayerObservation(page);
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
    await page.goto("/");
    await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    await page.evaluate(() => (window.__venueQaGame as Phaser.Game).registry.set("wedding.guestSide", "bride"));
    await startPreparedScene(page, "VenueLobbyScene");
    await expect(page.locator("canvas")).toHaveAttribute("data-lobby-ready", "true");
    await dismissLobbyArrival(page);
    const records = [];
    for (const [index, label] of ["포토테이블 구경하기", "축의대에서 접수하기", "포토부스에서 사진 찍기", "현서와 사진 찍기"].entries()) {
      const before = await page.evaluate(() => window.__venuePlayerSnapshot());
      await clickGame(page, 590, 150);
      await expect(page.locator(".story-info-reminder")).toBeVisible();
      expect(await page.evaluate(() => window.__venuePlayerSnapshot())).toMatchObject({ x: before!.x, y: before!.y, moving: false });
      await expect(page.locator(".hall-requirements button")).toHaveCount(4 - index);
      await expect(page.getByRole("button", { name: "수첩 보기", exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "돌아가기", exact: true })).toHaveCount(0);
      await expect(page.locator(".story-info-reminder .story-narration")).not.toHaveAttribute("role", "button");
      for (const button of await page.locator(".hall-requirements button").all()) {
        const box = (await button.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      if (index === 0) {
        await page.screenshot({ path: testInfo.outputPath(`hall-go-${width}.png`) });
        const panel = (await page.locator(".story-info-reminder .story-narration").boundingBox())!;
        const canvas = (await page.locator("canvas").boundingBox())!;
        if (width === 393) expect(panel.height / canvas.height).toBeLessThan(0.5);
        // Outside tap dismisses without walking into the lobby underneath.
        await clickGame(page, 360, 1120);
        await expect(page.locator(".story-info-reminder")).toBeHidden();
        expect(await page.evaluate(() => window.__venuePlayerSnapshot())).toMatchObject({ x: before!.x, y: before!.y, moving: false });
        await clickGame(page, 590, 150);
      }
      await page.evaluate(() => {
        (window as unknown as { goWalkFrames: number }).goWalkFrames = 0;
        const game = window.__venueQaGame as Phaser.Game;
        const observe = () => {
          const player = window.__venuePlayerSnapshot();
          if (player?.scene === "VenueLobbyScene" && player.moving) (window as unknown as { goWalkFrames: number }).goWalkFrames++;
        };
        game.events.on("poststep", observe);
        game.scene.getScene("VenueLobbyScene").events.once("shutdown", () => game.events.off("poststep", observe));
      });
      const go = page.getByRole("button", { name: `${label} GO!`, exact: true });
      if (width === 393 && index === 0) {
        await go.focus();
        await page.keyboard.press("Tab");
        await page.keyboard.press("Shift+Tab");
        await expect(go).toBeFocused();
        await expect(go).toHaveCSS("outline-style", "solid");
        await page.keyboard.press("Enter");
      } else await go.click();
      if (index === 0) {
        await expect(page.locator("canvas")).toHaveAttribute("data-photo-gallery-open", "true");
        expect(await page.evaluate(() => (window.__venueQaGame as Phaser.Game).scene.getScene("VenueLobbyScene").children.list.some(child => "text" in child && child.text === "현서와 재준, 현재의 시작"))).toBe(true);
        await page.screenshot({ path: testInfo.outputPath(`photo-table-caption-${width}.png`) });
        await page.keyboard.press("Escape");
      } else if (index === 1) {
        await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "ReceptionScene");
        await chooseStory(page, "인사하기");
        await clickGame(page, 360, 500);
        await clickGame(page, 360, 500);
      } else if (index === 2) {
        await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "PhotoBoothScene");
        await clickGame(page, 360, 860);
        await returnFromPhoto(page);
      } else {
        await takeBridalPhoto(page);
      }
      await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "VenueLobbyScene", { timeout: 15000 });
      await expect(page.locator("canvas")).toHaveAttribute("data-lobby-ready", "true");
      await expect(page.locator("canvas")).toHaveAttribute("data-lobby-progress", `${index + 1}/4`);
      const walked = await page.evaluate(() => (window as unknown as { goWalkFrames: number }).goWalkFrames);
      expect(walked).toBe(0);
      records.push({ label, walked, returned: await page.evaluate(() => window.__venuePlayerSnapshot()) });
    }
    await clickGame(page, 590, 150);
    await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "VenueHallScene");
    await testInfo.attach("go-visits", { body: JSON.stringify({ records, errors }, null, 2), contentType: "application/json" });
    expect(errors).toEqual([]);
  });
}
