import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";
import { startPreparedScene } from "./stage-fixtures";
import { chooseStory, clickGame, fillProfile } from "./story-helpers";

for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }]) {
  test(`envelope narration breaks after the sentence and still completes on touch at ${viewport.width}`, async ({ page }, info) => {
    await page.setViewportSize(viewport);
    await installPlayerObservation(page);
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
    await page.goto("/");
    const canvas = page.locator("canvas");
    await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
    await startPreparedScene(page, "HomeSelectScene");
    await fillProfile(page, "검수하객");
    await chooseStory(page, "신랑측");
    await startPreparedScene(page, "ReceptionScene");
    await chooseStory(page, "인사하기");
    const heading = await page.evaluate(() => {
      const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("ReceptionScene");
      const title = scene.children.list.find(child => child.type === "Text" && (child as Phaser.GameObjects.Text).text.includes("봉투에 이름")) as Phaser.GameObjects.Text;
      const box = title.getBounds();
      return { text: title.text, top: box.top, bottom: box.bottom };
    });
    expect(heading.text).toBe("봉투에 이름을 적자.\n슥슥슥…");
    expect(heading.top).toBeGreaterThan(0);
    expect(heading.bottom).toBeLessThan(280);
    await page.screenshot({ path: `${process.env.REVIEW_EVIDENCE}/envelope-lines-${viewport.width}.png` });
    await clickGame(page, 360, 500);
    await clickGame(page, 360, 500);
    await expect(canvas).toHaveAttribute("data-reception-complete", "true");
    await expect(canvas).toHaveAttribute("data-active-scene", "VenueLobbyScene");
    await expect(canvas).toHaveAttribute("data-lobby-progress", "1/3");
    await expect(page.locator(".reception-notice")).toHaveCount(0);
    expect(errors).toEqual([]);
    await info.attach("envelope-heading", { body: JSON.stringify({ viewport, heading, errors }), contentType: "application/json" });
  });
}
