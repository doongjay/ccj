import { expect, test, type Page } from "@playwright/test";
import { clickGame, fillProfile, chooseStory, receiveEnvelope, completeLobbyTours, takeGroupPhoto, dismissLobbyArrival, takeBridalPhoto, returnFromPhoto } from "./story-helpers";
import { installPlayerObservation } from "./corridor-observables";
import type Phaser from "phaser";

// Keep the original Batch A visual evidence immutable during later refinements.
const after = (name: string) => test.info().outputPath(`${name}.png`);

function observeErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error" || /(?:Texture|Frame|Animation).*(?:missing|not found|has no frame|does not exist)/i.test(message.text())) errors.push(message.text()); });
  page.on("requestfailed", request => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  return errors;
}

test("F03: inline validation replaces browser bubbles in setup and invitation", async ({ page }) => {
  test.setTimeout(60000);
  const errors = observeErrors(page);
  await page.setViewportSize({ width: 393, height: 852 });
  await page.addInitScript(() => {
    document.addEventListener("invalid", () => document.documentElement.dataset.nativeInvalid = "true", true);
  });
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await clickGame(page, 360, 1180);
  await page.getByRole("button", { name: "시작하기", exact: true }).click();
  const name = page.getByRole("textbox", { name: "내 이름은", exact: true });
  await expect(page.getByRole("alert")).toHaveText("이름을 알려주세요!");
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await page.screenshot({ path: after("f03-avatar-validation-393") });
  await name.fill("   ");
  await page.getByRole("button", { name: "시작하기", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("이름을 알려주세요!");
  await name.fill("하객");
  await page.getByRole("button", { name: "시작하기", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("남자 또는 여자을 선택해 주세요.");
  await fillProfile(page);
  await chooseStory(page, "신랑측");
  await expect(page.locator("html")).not.toHaveAttribute("data-native-invalid", "true");
  await page.goto("/#invitation");
  await page.reload();
  const form = page.locator(".invitation-guest-form");
  await form.getByRole("textbox", { name: "이름", exact: true }).fill("");
  await form.getByRole("button", { name: "미니미와 메시지 남기기" }).click();
  await expect(form.getByRole("alert")).toHaveText("이름을 알려주세요!");
  await form.getByRole("textbox", { name: "이름", exact: true }).fill("하객");
  await form.getByRole("button", { name: "미니미와 메시지 남기기" }).click();
  await expect(form.getByRole("alert")).toHaveText("축하 메시지를 입력해 주세요.");
  await expect(page.locator("html")).not.toHaveAttribute("data-native-invalid", "true");
  expect(errors).toEqual([]);
});

test("F04 F05: safe scene subjects, explicit information dismissal and one ceremony transition", async ({ page }) => {
  test.setTimeout(90000);
  const errors = observeErrors(page);
  await installPlayerObservation(page);
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await clickGame(page, 360, 1180);
  await fillProfile(page);
  await chooseStory(page, "신랑측");
  await chooseStory(page, "자차로 간다");
  await expect(page.locator(".story-car .story-narration")).toBeVisible();
  await page.locator(".story-narration").click();
  for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }]) {
    await page.setViewportSize(viewport);
    await assertSafeArea(page, 690, 1060);
    await page.screenshot({ path: after(`f04-car-choice-${viewport.width}`) });
  }
  await page.getByRole("button", { name: "파란색", exact: true }).click();
  await expect(page.locator(".story-hint")).toBeHidden();
  await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-ready", "true", { timeout: 15000 });
  await dismissLobbyArrival(page);
  for (const [index, item] of [{ x: 667, y: 560, id: "atm" }, { x: 590, y: 870, id: "drinks" }, { x: 590, y: 990, id: "bridal-restricted" }].entries()) {
    await clickGame(page, item.x, item.y);
    await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-info", item.id);
    await expect(page.getByRole("button", { name: "닫기", exact: true })).toHaveCount(0);
    const before = await page.evaluate(() => window.__venuePlayerSnapshot());
    await page.screenshot({ path: after(`f05-${item.id}`) });
    if (index === 1) await page.keyboard.press("Escape");
    else await clickGame(page, 350, 1100);
    await expect(page.locator(".story-info")).toHaveCount(0);
    const returned = index === 0 ? { x: 470, y: 590 } : index === 1 ? { x: 456, y: 970 } : { x: before!.x, y: before!.y };
    expect(await page.evaluate(() => window.__venuePlayerSnapshot())).toMatchObject({ ...returned, moving: false });
  }
  await completeLobbyTours(page);
  await clickGame(page, 360, 420);
  await receiveEnvelope(page);
  await clickGame(page, 590, 150);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "VenueHallScene");
  await page.locator(".story-narration").click();
  for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }]) {
    await page.setViewportSize(viewport);
    await assertSafeArea(page, 610, 770);
    await page.screenshot({ path: after(`f04-ceremony-choice-${viewport.width}`) });
  }
  await page.getByRole("button", { name: "박수를 친다", exact: true }).dblclick();
  await takeGroupPhoto(page);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-hall-transition-count", "1");
  expect(errors).toEqual([]);
});

async function assertSafeArea(page: Page, top: number, bottom: number): Promise<void> {
  // Inspect the settled scene, after its normal 350 ms arrival fade.
  await page.waitForTimeout(400);
  const canvas = (await page.locator("#app canvas").boundingBox())!;
  const start = canvas.y + canvas.height * top / 1280;
  const end = canvas.y + canvas.height * bottom / 1280;
  for (const control of await page.locator(".story-narration, .story-choice").all()) {
    if (!await control.isVisible()) continue;
    const box = (await control.boundingBox())!;
    expect(box.y + box.height <= start || box.y >= end).toBe(true);
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(await control.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(14);
  }
}

test("F01/A1: bride itinerary is discoverable in the notebook and progress updates after every required visit", async ({ page }) => {
  test.setTimeout(90000);
  const errors = observeErrors(page);
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  const canvas = page.locator("#app canvas");
  await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
  await clickGame(page, 360, 1180);
  await fillProfile(page, "신부친구", "female");
  await chooseStory(page, "신부측");
  await chooseStory(page, "지하철을 탄다");
  await chooseStory(page, "5번 출구");
  await expect(canvas).toHaveAttribute("data-lobby-info", "arrival-guide", { timeout: 15000 });
  await expect(page.locator(".story-copy")).toHaveText("도착! 로비가 넓군.\n어디부터 갈까?");
  await expect(page.locator(".story-copy")).not.toContainText("포토부스");
  await page.screenshot({ path: after("f01-first-lobby-arrival-393") });
  await dismissLobbyArrival(page);
  await clickGame(page, 128, 60);
  for (const name of ["포토부스에서 사진 찍기", "포토테이블 구경하기", "축의대에서 접수하기", "현서와 사진 찍기"]) {
    await expect(page.locator(".story-copy")).toContainText(`♡  ${name}`);
  }
  await expect(canvas).toHaveAttribute("data-lobby-progress", "0/4");
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await clickGame(page, 590, 150);
  await expect(canvas).toHaveAttribute("data-lobby-info", "explore-required");
  await expect(page.locator(".hall-requirements .story-choice")).toHaveCount(4);
  await page.screenshot({ path: after("f01-hall-requirements-393") });
  await page.keyboard.press("Escape");
  await clickGame(page, 590, 150);
  await expect(canvas).toHaveAttribute("data-lobby-info", "explore-required");
  await page.keyboard.press("Escape");
  await clickGame(page, 130, 590);
  await expect(canvas).toHaveAttribute("data-active-scene", "PhotoBoothScene");
  await clickGame(page, 360, 860);
  await returnFromPhoto(page);
  await expect(canvas).toHaveAttribute("data-active-scene", "VenueLobbyScene", { timeout: 10000 });
  await expect(canvas).toHaveAttribute("data-lobby-ready", "true");
  await expect(canvas).toHaveAttribute("data-lobby-progress", "1/4");
  await expect(canvas).not.toHaveAttribute("data-lobby-info", "arrival-guide");
  await clickGame(page, 128, 60);
  await expect(page.locator(".story-copy")).toContainText("♥  포토부스에서 사진 찍기");
  await page.screenshot({ path: after("f01-notebook-progress-393") });
  await page.keyboard.press("Escape");
  await clickGame(page, 550, 450);
  await expect(canvas).toHaveAttribute("data-photo-gallery-open", "true");
  await expect(canvas).toHaveAttribute("data-lobby-progress", "2/4");
  await page.keyboard.press("Escape");
  await clickGame(page, 360, 420);
  await receiveEnvelope(page);
  await expect(canvas).toHaveAttribute("data-lobby-progress", "3/4");
  await clickGame(page, 590, 150);
  await expect(page.locator(".hall-requirements .story-choice")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await clickGame(page, 590, 990);
  await takeBridalPhoto(page);
  await expect(canvas).toHaveAttribute("data-lobby-progress", "4/4");
  await clickGame(page, 590, 150);
  await chooseStory(page, "환호를 한다");
  await takeGroupPhoto(page);
  expect(errors).toEqual([]);
});

test("F06: portrait labels and controls retain displayed minimum sizes, with a landscape alternative", async ({ page }) => {
  test.setTimeout(90000);
  const errors = observeErrors(page);
  await installPlayerObservation(page);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  const canvas = page.locator("#app canvas");
  await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
  await expectCanvasTargets(page);
  await clickGame(page, 360, 1180);
  await page.getByRole("textbox", { name: "내 이름은", exact: true }).fill("모바일하객");
  await page.getByRole("button", { name: "여자", exact: true }).click();
  for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }]) {
    await page.setViewportSize(viewport);
    const form = page.locator(".text-entry-overlay");
    expect(await form.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    const invitation = (await page.locator(".game-access").boundingBox())!;
    const heading = (await form.locator("h2").boundingBox())!;
    expect(invitation.y + invitation.height <= heading.y || invitation.x >= heading.x + heading.width).toBe(true);
    for (const option of await page.locator(".minimi-part-option:visible, .minimi-outfit-arrow, .text-entry-actions button").all()) {
      const box = (await option.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole("button", { name: "시작하기", exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: after(`f06-avatar-${viewport.width}`) });
  }
  await page.getByRole("button", { name: "시작하기", exact: true }).click();
  await chooseStory(page, "신랑측");
  await chooseStory(page, "자차로 간다");
  await chooseStory(page, "분홍색");
  await expect(canvas).toHaveAttribute("data-lobby-info", "arrival-guide", { timeout: 15000 });
  await expect(page.locator(".story-copy")).not.toContainText("현서와 사진 찍기");
  await expect(canvas).toHaveAttribute("data-lobby-progress", "0/3");
  await dismissLobbyArrival(page);
  for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(150);
    await expectCanvasTargets(page);
    const labels = await page.evaluate(() => {
      const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("VenueLobbyScene");
      const scale = scene.game.canvas.getBoundingClientRect().width / 720;
      return scene.children.list.filter(child => child.name.startsWith("lobby-label-")).map(child => {
        const text = child as Phaser.GameObjects.Text;
        const bounds = text.getBounds();
        return { name: text.text, font: parseFloat(String(text.style.fontSize)) * scale,
          x: bounds.x, y: bounds.y, right: bounds.right, bottom: bounds.bottom };
      });
    });
    expect(labels).toHaveLength(8);
    for (const [i, label] of labels.entries()) {
      expect(label.font, label.name).toBeGreaterThanOrEqual(14);
      expect(label.x, label.name).toBeGreaterThanOrEqual(0);
      expect(label.right, label.name).toBeLessThanOrEqual(720);
      for (const next of labels.slice(i + 1)) {
        expect(label.right <= next.x || next.right <= label.x || label.bottom <= next.y || next.bottom <= label.y, `${label.name} / ${next.name}`).toBe(true);
      }
    }
    await page.screenshot({ path: after(`f06-lobby-${viewport.width}x${viewport.height}`) });
  }
  await page.setViewportSize({ width: 852, height: 393 });
  await expect(page.getByRole("dialog", { name: "화면 방향 안내" })).toBeVisible();
  await page.screenshot({ path: after("f06-landscape-852x393") });
  await page.getByRole("button", { name: "청첩장 바로 보기", exact: true }).click();
  await expect(canvas).toHaveAttribute("data-active-scene", "InvitationScene");
  expect(errors).toEqual([]);
});

async function expectCanvasTargets(page: Page): Promise<void> {
  const targets = await page.evaluate(() => {
    const game = window.__venueQaGame as Phaser.Game;
    const scale = game.canvas.getBoundingClientRect().width / 720;
    return game.scene.getScenes(true).flatMap(scene => scene.children.list.filter(child => child.name.startsWith("ui-")).map(child => {
      const target = child as Phaser.GameObjects.Rectangle;
      const hit = target.input!.hitArea as Phaser.Geom.Rectangle;
      return { name: target.name, width: hit.width * scale, height: hit.height * scale };
    }));
  });
  expect(targets.length).toBeGreaterThan(0);
  for (const target of targets) {
    expect(target.width, target.name).toBeGreaterThanOrEqual(44);
    expect(target.height, target.name).toBeGreaterThanOrEqual(44);
  }
}
