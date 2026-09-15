import { expect, test } from "@playwright/test";
import { chooseStory, clickGame } from "./story-helpers";
import { installPlayerObservation } from "./corridor-observables";
import type Phaser from "phaser";

for (const outfit of [1, 2]) {
  test(`game guest keeps female outfit ${outfit + 1} and hair in the invitation without another picker`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await installPlayerObservation(page);
    await page.goto("/");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    await clickGame(page, 360, 1180);
    await page.getByRole("textbox", { name: "내 이름은", exact: true }).fill("게임 친구");
    await page.getByRole("button", { name: "여자", exact: true }).click();
    await page.locator(".hair-card").nth(2).click();
    await page.locator(".outfit-card").nth(outfit).click();
    await page.locator(".face-card").nth(outfit).click();
    await page.getByRole("button", { name: "시작하기", exact: true }).click();
    await chooseStory(page, "신부측");
    expect(await page.evaluate(() => {
      const game = window.__venueQaGame as Phaser.Game;
      const player = game.scene.getScene("HomeSelectScene").children.list.find(child => "isMoving" in child) as unknown as Phaser.GameObjects.Container;
      return (player.list.find(child => child.type === "Sprite") as Phaser.GameObjects.Sprite).texture.key;
    })).toBe(`minimi-female-face-${outfit}`);
    // Jump over the travel scenes after making the real in-game profile selection.
    await page.evaluate(() => (window.__venueQaGame as Phaser.Game).scene.getScene("HomeSelectScene").scene.start("EndingScene"));
    await page.getByRole("textbox", { name: "축하 메시지" }).fill("게임도 재밌었어. 결혼 축하해!");
    await page.getByRole("button", { name: "메시지 남기기", exact: true }).click();
    await chooseStory(page, "청첩장 보기");
    await expect(page.locator(".minimi-guest")).toHaveCount(1);
    expect(await page.evaluate(outfit => {
      const game = window.__venueQaGame as Phaser.Game;
      const texture = game.textures.get(`minimi-female-face-${outfit}`);
      const frame = texture.get(`${outfit}-2-down`);
      const expected = document.createElement("canvas");
      expected.width = 128; expected.height = 192;
      const context = expected.getContext("2d")!;
      context.imageSmoothingEnabled = false;
      context.drawImage(texture.getSourceImage() as HTMLCanvasElement, frame.cutX, frame.cutY, 128, 192, 0, 0, 128, 192);
      return (document.querySelector(".minimi-guest canvas") as HTMLCanvasElement).toDataURL() === expected.toDataURL();
    }, outfit)).toBe(true);
    await expect(page.locator(".minimi-picker")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "나의 미니미로 메시지 남기기" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "이름", exact: true })).toHaveValue("게임 친구");
    await expect(page.getByRole("combobox", { name: "메시지 받는 사람" })).toHaveValue("bride");
    await page.locator(".invitation-guest-form").scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath("game-minimi-invitation.png") });
    await page.getByRole("textbox", { name: "축하 메시지" }).fill("그날 만나자 ♥");
    await page.getByRole("button", { name: "미니미와 메시지 남기기" }).click();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("wedding.guestMessages") ?? "[]"));
    expect(stored).toHaveLength(2);
    for (const entry of stored) expect(entry).toMatchObject({ name: "게임 친구", gender: "female", outfit, hair: 2, face: outfit, side: "bride" });
    // Standalone invitation retains its original menu; subsequent fixture starts at the root URL.
    await page.goto("/");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    await clickGame(page, 604, 78);
    await expect(page.locator(".minimi-picker")).toHaveCount(1);
  });
}

test("skip opens original-content invitation with original photos and local minimi guestbook", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 393, height: 852 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await clickGame(page, 604, 78);
  await expect(page.getByRole("heading", { name: "재준 그리고 현서" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("invitation-main.png") });
  await expect(page.locator(".invitation-gallery img")).toHaveCount(23);
  await expect(page.locator(".invitation-family")).toContainText("김동근 · 김경숙");
  await expect(page.locator(".invitation-family img")).toHaveAttribute("alt", "고인을 기리는 국화");
  await expect(page.locator(".invitation-page")).toContainText("예식 30분 전부터 이용 가능합니다.");
  await expect(page.locator(".minimi-guest")).toHaveCount(0);
  await page.getByRole("button", { name: "1번째 사진 크게 보기", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("dialog").locator(".is-current img")).toHaveAttribute("src", /gallery\/2.jpg/);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("textbox", { name: "이름", exact: true }).fill("친구 미니미");
  await page.getByRole("button", { name: "여자", exact: true }).click();
  await page.locator(".hair-card").nth(2).click();
  await page.locator(".outfit-card").nth(1).click();
  await page.getByRole("button", { name: "여자", exact: true }).click();
  await expect(page.locator(".outfit-card").nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".hair-card").nth(2)).toHaveAttribute("aria-pressed", "true");
  await page.locator(".face-card").nth(1).click();
  await page.getByRole("combobox", { name: "메시지 받는 사람" }).selectOption("bride");
  await page.getByRole("textbox", { name: "축하 메시지" }).fill("현서야, 결혼 축하해! <script>안전한 텍스트</script>");
  await page.getByRole("button", { name: "미니미와 메시지 남기기" }).click();
  await expect(page.locator(".minimi-guest")).toHaveCount(1);
  await page.screenshot({ path: testInfo.outputPath("invitation-minimi.png") });
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("wedding.guestMessages") ?? "[]"));
  expect(stored[0]).toMatchObject({ name: "친구 미니미", gender: "female", outfit: 1, hair: 2, face: 1, side: "bride" });
  await page.getByRole("button", { name: "친구 미니미님의 메시지 보기" }).click();
  await expect(page.getByRole("dialog")).toContainText("<script>안전한 텍스트</script>");
  await page.keyboard.press("Escape");
  await page.goto("/#invitation");
  await expect(page.locator(".minimi-guest")).toHaveCount(1);
  expect(errors).toEqual([]);
});

for (const viewport of [{ width: 320, height: 568 }, { width: 1440, height: 900 }]) {
  test(`profile cards stay inside the game at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    await clickGame(page, 360, 1180);
    await page.getByRole("button", { name: "남자", exact: true }).click();
    await expect(page.locator(".hair-card")).toHaveCount(3);
    await expect(page.locator(".outfit-card")).toHaveCount(6);
    await page.screenshot({ path: testInfo.outputPath("profile.png") });
    const overflow = await page.locator(".text-entry-overlay").evaluate(node => node.scrollWidth > node.clientWidth + 1);
    expect(overflow).toBe(false);
  });
}

test("minimi group pages keep every guest selectable without covering the couple", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.addInitScript(() => localStorage.setItem("wedding.guestMessages", JSON.stringify(Array.from({ length: 32 }, (_, index) => ({
    id: `guest-${index}`, name: `친구 ${index + 1}`, side: "bride", recipient: "현서", message: `${index + 1}번째 축하 메시지`,
    createdAt: "2026-09-09T10:00:00.000Z", gender: index < 9 ? "male" : "female", outfit: Math.floor(index / 3) % 3, hair: index % 3,
  })))));
  await page.goto("/#invitation");
  const wall = page.locator(".minimi-wall");
  await expect(wall).toHaveAttribute("aria-label", "신랑신부와 함께한 미니미 32명");
  await expect(page.locator(".minimi-guest")).toHaveCount(30);
  await wall.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("minimi-full-group.png") });
  const overlap = await page.locator(".minimi-couple").last().evaluate(couple => {
    const center = couple.getBoundingClientRect();
    return [...document.querySelectorAll(".minimi-guest")].slice(0, 6).some(guest => {
      const bounds = guest.getBoundingClientRect();
      const guestCenter = (bounds.left + bounds.right) / 2;
      return guestCenter > center.left && guestCenter < center.right;
    });
  });
  expect(overlap).toBe(false);
  await page.getByRole("button", { name: "다음 미니미", exact: true }).click();
  await expect(page.locator(".minimi-guest")).toHaveCount(2);
  const selected = page.locator(".minimi-guest").last();
  const index = Number((await selected.getAttribute("data-guest-id"))!.replace("guest-", ""));
  await selected.click();
  await expect(page.getByRole("dialog")).toContainText(`${index + 1}번째 축하 메시지`);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "이전 미니미", exact: true }).click();
  await expect(page.locator(".minimi-guest")).toHaveCount(30);
});
