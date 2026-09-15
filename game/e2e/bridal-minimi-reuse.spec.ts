import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { writeFile } from "node:fs/promises";
import { installPlayerObservation } from "./corridor-observables";
import { enterLobby, clickGame } from "./story-helpers";

const evidence = process.env.REVIEW_EVIDENCE!;
const before = process.env.BRIDAL_PHASE === "before";
for (const viewport of before ? [{ width: 393, height: 852 }] : [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }]) {
  test(`existing bridal minimi is consistent in the room, photo result and notebook at ${viewport.width}`, async ({ page }, info) => {
    test.setTimeout(90000);
    await page.setViewportSize(viewport);
    await installPlayerObservation(page);
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
    await page.goto("/"); await enterLobby(page, "car", "bride");
    await clickGame(page, 590, 990);
    const canvas = page.locator("#app canvas");
    await expect(canvas).toHaveAttribute("data-active-scene", "BridalRoomScene", { timeout: 20000 });
    await page.locator(".story-narration").click();
    await expect(canvas).toHaveAttribute("data-bridal-visit-stage", "ready");
    await page.screenshot({ path: `${evidence}/bridal-ready-${viewport.width}.png` });
    if (!before) {
      const bride = await page.evaluate(() => {
        const game = window.__venueQaGame as Phaser.Game;
        const bride = game.scene.getScene("BridalRoomScene").children.getByName("bridal-room-bride") as Phaser.GameObjects.Image;
        return { texture: bride.texture.key, frame: bride.frame.name, width: bride.displayWidth, height: bride.displayHeight, x: bride.x, y: bride.y };
      });
      expect(bride).toEqual({ texture: "npc-bride", frame: 0, width: 64, height: 96, x: 552, y: 475 });
      await info.attach("reused-bride", { body: JSON.stringify(bride), contentType: "application/json" });
    }
    await clickGame(page, 360, 860);
    await expect(canvas).toHaveAttribute("data-bridal-visit-stage", "seated");
    await page.screenshot({ path: `${evidence}/bridal-together-${viewport.width}.png` });
    const result = page.locator('.keepsake[data-keepsake="bridal"] canvas');
    await expect(result).toBeVisible();
    const photo = await result.evaluate(c => (c as HTMLCanvasElement).toDataURL());
    await writeFile(`${evidence}/bridal-keepsake-${viewport.width}.png`, Buffer.from(photo.split(",")[1]!, "base64"));
    await page.screenshot({ path: `${evidence}/bridal-result-${viewport.width}.png` });
    await page.waitForTimeout(5100);
    await expect(result).toBeVisible();
    await page.getByRole("button", { name: "로비로 돌아가기", exact: true }).click();
    await expect(canvas).toHaveAttribute("data-active-scene", "VenueLobbyScene");
    await expect(canvas).toHaveAttribute("data-lobby-ready", "true");
    await expect(canvas).toHaveAttribute("data-bridal-room-visited", "true");
    await clickGame(page, 128, 60);
    expect(await page.locator('.notebook-keepsakes [data-keepsake="bridal"] canvas').evaluate(c => (c as HTMLCanvasElement).toDataURL())).toBe(photo);
    await page.screenshot({ path: `${evidence}/bridal-notebook-${viewport.width}.png` });
    await page.keyboard.press("Escape");
    expect(errors).toEqual([]);
  });
}
