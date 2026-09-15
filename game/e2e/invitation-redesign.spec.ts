import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";
import { clickGame } from "./story-helpers";

test("separate face art and wigs render with their own transparent silhouettes", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1200, height: 1250 });
  await installPlayerObservation(page);
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  for (const gender of ["male", "female"]) {
    await page.evaluate(gender => {
      const game = window.__venueQaGame as Phaser.Game;
      const sheet = document.createElement("canvas");
      sheet.id = "sprite-review"; sheet.width = 1152; sheet.height = 1152;
      Object.assign(sheet.style, { position: "fixed", inset: "0", zIndex: "999", background: "#f6eddf", imageRendering: "pixelated" });
      const context = sheet.getContext("2d")!;
      context.imageSmoothingEnabled = false;
      for (let face = 0; face < 3; face++) {
        const source = game.textures.get(`minimi-${gender}${face ? `-face-${face}` : ""}`).getSourceImage() as HTMLCanvasElement;
        context.drawImage(source, 0, 0, 1152, 192, 0, face * 192, 1152, 192);
      }
      context.drawImage(game.textures.get(`minimi-${gender}`).getSourceImage() as HTMLCanvasElement, 0, 192, 1152, 576, 0, 576, 1152, 576);
      document.body.append(sheet);
    }, gender);
    await page.locator("#sprite-review").screenshot({ path: testInfo.outputPath(`${gender}-independent-faces.png`) });
    await page.locator("#sprite-review").evaluate(node => node.remove());
  }
});

for (const width of [320, 393]) {
  test(`character thumbnails and invitation photo frames at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 852 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    await clickGame(page, 360, 1180);
    await page.getByRole("button", { name: "여자", exact: true }).click();
    await page.locator(".hair-card").nth(2).click();
    await expect(page.locator(".hair-card").nth(2)).toHaveAttribute("aria-pressed", "true");
    await page.screenshot({ path: testInfo.outputPath("character-selection.png") });
    expect(await page.locator(".text-entry-overlay").evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    await page.goto("/#invitation");
    await page.reload();
    await expect(page.locator(".invitation-cover-frame")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("invitation-cover.png") });
    await page.getByRole("button", { name: "1번째 사진 크게 보기", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "우리의 순간들" })).toHaveCount(0);
    await expect(dialog.locator(".invitation-gallery-slide img")).toHaveCount(3);
    await expect(dialog.locator(".is-previous img")).toHaveAttribute("src", /gallery\/45.jpg/);
    await expect(dialog.locator(".is-current img")).toHaveAttribute("src", /gallery\/1.jpg/);
    await expect(dialog.locator(".is-next img")).toHaveAttribute("src", /gallery\/2.jpg/);
    await dialog.locator(".invitation-gallery-slide img").evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
    await page.screenshot({ path: testInfo.outputPath("gallery-carousel.png") });
    await dialog.getByRole("button", { name: "다음 사진", exact: true }).click();
    await expect(dialog.locator(".is-current img")).toHaveAttribute("src", /gallery\/2.jpg/);
    await page.keyboard.press("ArrowLeft");
    await expect(dialog.locator(".is-current img")).toHaveAttribute("src", /gallery\/1.jpg/);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });
}

test("a message opens its author's exact minimi and keeps avatar and text together while paging", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.addInitScript(() => localStorage.setItem("wedding.guestMessages", JSON.stringify(Array.from({ length: 32 }, (_, index) => ({
    id: `guest-${index}`, name: `친구 ${index + 1}`, side: "bride", message: `${index + 1}번째 축하의 마음이에요.\n결혼 축하해 ♥`,
    createdAt: "2026-09-11T00:00:00Z", gender: index % 2 ? "female" : "male", hair: index % 3, outfit: index % 3, face: index % 3,
  })))));
  await page.goto("/#invitation");
  const wall = page.locator(".minimi-wall");
  await expect(wall.locator(".minimi-guest")).toHaveCount(30);
  await wall.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("thirty-friends.png") });
  await page.locator('.invitation-message[data-guest-id="guest-31"]').click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("32번째 축하의 마음");
  await expect(dialog.locator("canvas")).toHaveAttribute("data-guest-id", "guest-31");
  const portrait = await dialog.locator(".invitation-message-portrait").boundingBox();
  const letter = await dialog.locator(".invitation-message-letter").boundingBox();
  expect(Math.abs(portrait!.height - letter!.height)).toBeLessThanOrEqual(1);
  await expect(dialog.locator(".invitation-message-from strong")).toHaveCSS("font-weight", "700");
  await expect(dialog.locator(".invitation-message-to strong")).toHaveCSS("font-weight", "700");
  await page.screenshot({ path: testInfo.outputPath("message-postcard.png") });
  await dialog.getByRole("button", { name: "이전 축하 메시지", exact: true }).click();
  await expect(dialog).toContainText("31번째 축하의 마음");
  await expect(dialog.locator("canvas")).toHaveAttribute("data-guest-id", "guest-30");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "다음 미니미", exact: true }).click();
  await wall.locator('[data-guest-id="guest-31"]').click();
  await expect(page.getByRole("dialog").locator("canvas")).toHaveAttribute("data-guest-id", "guest-31");
  await expect(page.getByRole("dialog")).toContainText("32번째 축하의 마음");
});

for (const width of [320, 393]) {
  test(`venue directions and side colors stay readable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 852 });
    await page.goto("/#invitation");
    const location = page.locator("#invitation-location");
    await expect(location.getByRole("link", { name: "네이버 지도", exact: true })).toHaveAttribute("href", "https://naver.me/xAFClJVG");
    await expect(location.locator(".invitation-map")).toHaveAttribute("href", "https://naver.me/xAFClJVG");
    await expect(location.locator(".invitation-map img")).toHaveAttribute("src", /venue-directions.jpg$/);
    await expect(location.locator("iframe")).toHaveCount(0);
    await location.locator(".invitation-map").scrollIntoViewIfNeeded();
    await location.locator(".invitation-map img").evaluate(node => (node as HTMLImageElement).decode());
    await page.screenshot({ path: testInfo.outputPath("venue-map.png") });
    const markers = location.locator(".invitation-route-marker");
    await expect(markers).toHaveCount(3);
    expect(await markers.evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().width))).toEqual([24, 24, 24]);
    const shuttle = location.locator(".invitation-shuttle-card");
    await expect(shuttle.locator("canvas")).toHaveAttribute("data-ready", "true");
    await expect(shuttle.locator("canvas")).toHaveCSS("position", "absolute");
    await expect(shuttle.locator("canvas")).toHaveCSS("opacity", "0.85");
    await shuttle.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath("parking-shuttle.png") });
    for (const side of ["groom", "bride"]) {
      const card = page.locator(`.invitation-accounts[data-side="${side}"]`);
      await card.locator("summary").click();
      const colors = await card.evaluate(node => {
        const style = getComputedStyle(node);
        return { border: style.borderTopColor, shadow: style.boxShadow, summary: getComputedStyle(node.querySelector("summary")!).backgroundColor };
      });
      expect(colors.border).toBe(side === "groom" ? "rgb(159, 195, 221)" : "rgb(217, 166, 181)");
      expect(colors.shadow).toContain(side === "groom" ? "rgb(213, 231, 244)" : "rgb(241, 217, 226)");
    }
    await page.locator('.invitation-accounts[data-side="groom"]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath("blue-pink-accounts.png") });
    expect(await page.locator(".invitation-page").evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  });
}
