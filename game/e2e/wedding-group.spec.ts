import { startPreparedScene } from "./stage-fixtures";
import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";
import { chooseStory } from "./story-helpers";

for (const width of [320, 393]) {
  test(`100 guests remain reachable in uncrowded photos and a new friend appears immediately at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 852 });
    await page.addInitScript(() => localStorage.setItem("wedding.guestMessages", JSON.stringify(Array.from({ length: 100 }, (_, index) => ({
      id: `friend-${index}`, name: `친구 ${index + 1}`, message: `${index + 1}번째 마음`, side: "groom", recipient: "재준",
      createdAt: "2026-09-10T00:00:00Z", gender: index % 2 ? "female" : "male", outfit: index % 5, hair: Math.floor(index / 3) % 3, face: Math.floor(index / 9) % 3,
    })))));
    await page.goto("/#invitation");
    const wall = page.locator(".minimi-wall");
    await expect(wall).toHaveAttribute("aria-label", "신랑신부와 함께한 미니미 100명");
    await wall.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath("100-friends.png") });
    const seen = new Set<string>();
    let firstPage: string[] = [];
    for (let index = 0; index < 4; index++) {
      const guests = wall.locator(".minimi-guest");
      await expect(guests).toHaveCount(index === 3 ? 10 : 30);
      const ids = await guests.evaluateAll(nodes => nodes.map(node => (node as HTMLElement).dataset.guestId!));
      if (index === 0) firstPage = ids;
      expect(ids).toEqual(Array.from({ length: index === 3 ? 10 : 30 }, (_, slot) => `friend-${index * 30 + slot}`));
      ids.forEach(id => { expect(seen.has(id)).toBe(false); seen.add(id); });
      const coveredFaces = await guests.evaluateAll(nodes => nodes.filter(node => {
        const box = node.getBoundingClientRect();
        const target = document.elementFromPoint(box.x + box.width / 2, box.y + box.height * 0.27);
        return target?.closest(".minimi-guest") !== node;
      }).map(node => node.getAttribute("aria-label")));
      expect(coveredFaces).toEqual([]);
      await guests.first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: "다음 미니미", exact: true }).click();
    }
    expect(seen.size).toBe(100);
    expect(await wall.locator(".minimi-guest").evaluateAll(nodes => nodes.map(node => (node as HTMLElement).dataset.guestId))).toEqual(firstPage);
    const couple = await wall.locator(".minimi-couple canvas").first().boundingBox();
    const guest = await wall.locator(".minimi-guest canvas").first().boundingBox();
    expect(couple!.height).toBeGreaterThan(guest!.height * 1.2);
    expect(await page.locator(".invitation-page").evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    await page.getByRole("textbox", { name: "이름", exact: true }).fill("방금 온 친구");
    await page.getByRole("button", { name: "여자", exact: true }).click();
    await page.getByRole("button", { name: "이전 의상 보기", exact: true }).click();
    await page.locator(".outfit-card").nth(4).click();
    await page.getByRole("textbox", { name: "축하 메시지" }).fill("우리도 함께 사진 남겨요!");
    await page.getByRole("button", { name: "미니미와 메시지 남기기", exact: true }).click();
    await expect(wall).toHaveAttribute("aria-label", "신랑신부와 함께한 미니미 101명");
    await expect(wall.locator(".minimi-guest")).toHaveCount(11);
    await expect(wall.getByRole("button", { name: "방금 온 친구님의 메시지 보기", exact: true })).toHaveAttribute("data-new-guest", "true");
    await page.getByRole("button", { name: "이전 미니미", exact: true }).click();
    await expect(wall.locator(".minimi-guest")).toHaveCount(30);
    await page.getByRole("button", { name: "다음 미니미", exact: true }).click();
    await expect(wall.getByRole("button", { name: "방금 온 친구님의 메시지 보기", exact: true })).toBeVisible();
  });
}

test("couple faces retain full sprite detail and transparent edges in the invitation and ceremony", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await installPlayerObservation(page);
  await page.goto("/#invitation");
  await expect(page.locator(".minimi-couple").first()).toBeVisible();
  const textures = await page.evaluate(() => {
    const game = window.__venueQaGame as Phaser.Game;
    return ["npc-groom", "npc-bride"].map(key => {
      const texture = game.textures.get(key), frame = texture.get(0);
      const canvas = texture.getSourceImage() as HTMLCanvasElement;
      const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
      let green = 0, opaque = 0;
      for (let offset = 0; offset < pixels.length; offset += 4) {
        if (pixels[offset + 3] < 128) continue;
        opaque++;
        if (pixels[offset + 1] > 160 && pixels[offset + 1] - pixels[offset] > 70 && pixels[offset + 1] - pixels[offset + 2] > 70) green++;
      }
      return { key, width: frame.cutWidth, height: frame.cutHeight, corner: pixels[3], green, opaque };
    });
  });
  for (const texture of textures) {
    expect(texture).toMatchObject({ width: 128, height: 192, corner: 0, green: 0 });
    expect(texture.opaque).toBeGreaterThan(5000);
  }
  await page.screenshot({ path: testInfo.outputPath("new-couple-invitation.png") });
  // Standalone invitation retains its original menu; subsequent fixture starts at the root URL.
    await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await startPreparedScene(page, "VenueHallScene");
  await chooseStory(page, "박수를 친다");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-ceremony-stage", "group-photo");
  await page.locator(".story-group-photo .story-narration").click();
  await expect(page.getByRole("button", { name: "사진 찍기", exact: true })).toBeVisible();
  const controls = await page.locator(".story-group-photo .story-choices").boundingBox();
  const gameBounds = await page.locator("#app canvas").boundingBox();
  expect(controls!.y).toBeGreaterThan(gameBounds!.y + gameBounds!.height * 1004 / 1280);
  expect(controls!.y + controls!.height).toBeLessThanOrEqual(gameBounds!.y + gameBounds!.height);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-group-photo-background", "group-photo-portrait-v3");
  await page.screenshot({ path: testInfo.outputPath("new-couple-group-photo.png") });
});

test("hearts cover the photo evenly without intercepting invitation taps", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/#invitation");
  await expect(page.locator(".invitation-hero img")).toBeVisible();
  const layer = page.locator(".invitation-page > .wedding-ambience");
  await expect(layer).toHaveCSS("pointer-events", "none");
  const positions = await layer.locator("span").evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect(); return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }));
  for (let index = 0; index < positions.length; index++) for (let other = index + 1; other < positions.length; other++) {
    expect(Math.hypot(positions[index].x - positions[other].x, positions[index].y - positions[other].y)).toBeGreaterThan(65);
  }
  const photo = await page.locator(".invitation-hero img").boundingBox();
  expect(positions.filter(point => point.x > photo!.x && point.x < photo!.x + photo!.width && point.y > photo!.y && point.y < photo!.y + photo!.height).length).toBeGreaterThanOrEqual(4);
  await page.screenshot({ path: testInfo.outputPath("even-hearts-over-photo.png") });
  await page.getByRole("button", { name: "사진", exact: true }).click();
  await page.getByRole("button", { name: "1번째 사진 크게 보기", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
