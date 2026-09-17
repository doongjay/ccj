import { REVIEW_EVIDENCE } from "./review-evidence";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { clickGame, enterLobby } from "./story-helpers";

const after = (name: string) => `${REVIEW_EVIDENCE}/regressions/${name}.png`;

function errorsOn(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", entry => { if (entry.type() === "error" || /(?:Texture|Frame|Animation).*(?:missing|not found|has no frame|does not exist)/i.test(entry.text())) errors.push(entry.text()); });
  page.on("requestfailed", request => errors.push(request.url()));
  return errors;
}

async function tabTo(page: Page, target: Locator, backwards = false): Promise<void> {
  await expect(target).toBeAttached({ timeout: 30000 });
  for (let i = 0; i < 100; i++) {
    if (await target.evaluate(el => el === document.activeElement)) return;
    await page.keyboard.press(backwards ? "Shift+Tab" : "Tab");
  }
  throw new Error(`Cannot reach ${await target.getAttribute("aria-label") ?? await target.textContent()} by Tab`);
}

async function keyButton(page: Page, name: string, key = "Enter"): Promise<void> {
  const button = page.getByRole("button", { name, exact: true });
  await tabTo(page, button);
  await expect(button).toBeEnabled();
  await page.keyboard.press(key);
}

async function storyKey(page: Page, name: string): Promise<void> {
  const panel = page.locator(".story-overlay:not([hidden]) .story-narration");
  await expect(panel).toBeVisible({ timeout: 30000 });
  if (await page.locator("#app canvas").getAttribute("data-story-state") === "typing") {
    await tabTo(page, panel);
    await page.keyboard.press("Space");
  }
  await keyButton(page, name);
}

async function finishMealByKey(page: Page): Promise<void> {
  const panel = page.locator(".story-overlay:not([hidden]) .story-narration");
  await expect(page.getByRole("button", { name: "식사를 마친다", exact: true })).toHaveCount(0);
  await tabTo(page, panel);
  if (await page.locator("#app canvas").getAttribute("data-story-state") === "typing") await page.keyboard.press("Space");
  await page.keyboard.press("Enter");
}

async function sceneIs(page: Page, name: string): Promise<void> {
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", name, { timeout: 30000 });
}

async function invitationRoundTrip(page: Page, from: string): Promise<void> {
  const before = await page.locator("#app canvas").evaluate(canvas => ({ progress: canvas.dataset.lobbyProgress, side: canvas.dataset.guestSide, route: canvas.dataset.routeChoice }));
  await keyButton(page, "청첩장");
  await expect(page.getByRole("main", { name: "재준과 현서의 청첩장" })).toBeVisible();
  await sceneIs(page, "InvitationScene");
  await keyButton(page, "게임으로");
  await sceneIs(page, from);
  expect(await page.locator("#app canvas").evaluate(canvas => ({ progress: canvas.dataset.lobbyProgress, side: canvas.dataset.guestSide, route: canvas.dataset.routeChoice }))).toEqual(before);
}

test("F08: lobby invitation returns to the same notebook and progress; stable refresh starts safely", async ({ page }) => {
  test.setTimeout(60000);
  const errors = errorsOn(page);
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await enterLobby(page, "car", "groom");
  await page.screenshot({ path: after("f08-invitation-access-lobby-393") });
  await clickGame(page, 128, 60);
  await page.getByRole("button", { name: "청첩장", exact: true }).click();
  await expect(page.locator(".invitation-page")).toBeVisible();
  await page.keyboard.press("Escape");
  await sceneIs(page, "VenueLobbyScene");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-info", "memory-book");
  await expect(page.locator(".story-info-notebook")).toBeVisible();
  await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-progress", "0/3");
  await page.keyboard.press("Escape");
  await page.reload();
  await sceneIs(page, "IntroScene");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("wedding.guestMessages") ?? "[]"))).toEqual([]);
  expect(errors).toEqual([]);
});

for (const side of ["bride", "groom"] as const) {
  test(`F08/F10: keyboard-only ${side} completes ${side === "bride" ? "car, meal first, save" : "subway, ceremony first, skip"}`, async ({ page }) => {
    test.setTimeout(180000);
    const errors = errorsOn(page);
    await page.addInitScript(() => {
      document.addEventListener("pointerdown", () => document.documentElement.dataset.pointerCount = String(Number(document.documentElement.dataset.pointerCount ?? "0") + 1), true);
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await sceneIs(page, "IntroScene");
    const start = page.getByRole("button", { name: "출발", exact: true });
    await tabTo(page, start);
    await expect(start).toHaveCSS("outline-style", "solid");
    if (side === "bride") await page.screenshot({ path: after("f10-intro-keyboard-focus-desktop") });
    await page.keyboard.press("Space");
    await sceneIs(page, "HomeSelectScene");
    await tabTo(page, page.getByRole("textbox", { name: "내 이름은", exact: true }));
    await page.keyboard.type("Keyboard Guest");
    await keyButton(page, side === "bride" ? "여자" : "남자", "Space");
    await keyButton(page, "안경 얼굴", "Space");
    await keyButton(page, side === "bride" ? "포니테일" : "웨이브");
    await keyButton(page, "다음 의상 보기");
    await keyButton(page, side === "bride" ? "핑크 원피스" : "네이비 수트");
    await keyButton(page, "시작하기");
    await storyKey(page, side === "bride" ? "신부측" : "신랑측");
    await storyKey(page, side === "bride" ? "자차로 간다" : "지하철을 탄다");
    const travel = side === "bride" ? "CarRouteScene" : "SubwayRouteScene";
    await sceneIs(page, travel);
    await invitationRoundTrip(page, travel);
    await storyKey(page, side === "bride" ? "분홍색" : "5번 출구");
    await sceneIs(page, "VenueLobbyScene");
    await tabTo(page, page.locator(".story-info-tutorial .story-narration"));
    await page.keyboard.press("Enter");
    await tabTo(page, page.getByRole("button", { name: "포토부스", exact: true }));
    if (side === "bride") await page.screenshot({ path: after("f10-lobby-keyboard-destinations-desktop") });
    await keyButton(page, `수첩 0/${side === "bride" ? 4 : 3}`);
    await expect(page.locator(".story-copy")).toContainText("포토테이블");
    await page.keyboard.press("Escape");
    await keyButton(page, "ATM");
    await expect(page.locator(".story-info-compact .story-narration")).toBeFocused();
    await page.keyboard.press("Escape");
    await keyButton(page, "웰컴드링크");
    await page.keyboard.press("Enter");
    await invitationRoundTrip(page, "VenueLobbyScene");
    await keyButton(page, "포토부스");
    await sceneIs(page, "PhotoBoothScene");
    await keyButton(page, "로비로 돌아가기");
    await sceneIs(page, "VenueLobbyScene");
    await keyButton(page, "포토부스");
    await sceneIs(page, "PhotoBoothScene");
    await keyButton(page, "사진 찍기", "Space");
    await expect(page.locator(".story-info-photo-result")).toBeVisible({ timeout: 15000 });
    await invitationRoundTrip(page, "PhotoBoothScene");
    await tabTo(page, page.getByRole("button", { name: "로비로 돌아가기", exact: true }));
    await expect(page.getByRole("button", { name: "로비로 돌아가기", exact: true })).toHaveCSS("outline-style", "solid");
    if (side === "bride") await page.screenshot({ path: `${REVIEW_EVIDENCE}/keyboard-photo-result-desktop.png` });
    await keyButton(page, "로비로 돌아가기");
    await sceneIs(page, "VenueLobbyScene");
    await keyButton(page, "포토테이블");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-photo-gallery-open", "true");
    await keyButton(page, "다음 사진");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-photo-gallery-index", "1");
    await page.keyboard.press("Escape");
    await keyButton(page, "축의대");
    await sceneIs(page, "ReceptionScene");
    await storyKey(page, "인사하기");
    await keyButton(page, "계속");
    await sceneIs(page, "VenueLobbyScene");
    if (side === "bride") {
      await keyButton(page, "신부대기실");
      await sceneIs(page, "BridalRoomScene");
      await expect(page.locator("#app canvas")).toHaveAttribute("data-bridal-visit-stage", "ready");
      await keyButton(page, "사진 찍기");
      await expect(page.locator(".story-info-photo-result")).toBeVisible({ timeout: 15000 });
      await keyButton(page, "로비로 돌아가기");
      await sceneIs(page, "VenueLobbyScene");
      await keyButton(page, "연회장");
      await storyKey(page, "1시반부터 밥먹기");
      await sceneIs(page, "DinnerJourneyScene");
      await invitationRoundTrip(page, "DinnerJourneyScene");
      await expect(page.locator("#app canvas")).toHaveAttribute("data-dinner-stage", "buffet-route", { timeout: 25000 });
      await finishMealByKey(page);
    } else await keyButton(page, "웨딩홀");
    await sceneIs(page, "VenueHallScene");
    await invitationRoundTrip(page, "VenueHallScene");
    await storyKey(page, side === "bride" ? "환호를 한다" : "박수를 친다");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-ceremony-stage", "reaction");
    await page.screenshot({ path: `${REVIEW_EVIDENCE}/f11-keyboard-${side}-desktop.png` });
    await storyKey(page, "사진 찍기");
    await keyButton(page, "계속");
    await storyKey(page, "다음으로");
    await sceneIs(page, "DinnerJourneyScene");
    if (side === "groom") {
      await invitationRoundTrip(page, "DinnerJourneyScene");
      await expect(page.locator("#app canvas")).toHaveAttribute("data-dinner-stage", "buffet-route", { timeout: 25000 });
      await finishMealByKey(page);
    }
    await sceneIs(page, "EndingScene");
    await invitationRoundTrip(page, "EndingScene");
    if (side === "bride") {
      await tabTo(page, page.getByRole("textbox", { name: "축하 메시지" }));
      await page.keyboard.type("Congratulations!");
      await keyButton(page, "메시지 남기기");
      await expect(page.locator("#app canvas")).toHaveAttribute("data-message-saved", "true");
    } else {
      await page.setViewportSize({ width: 393, height: 852 });
      await tabTo(page, page.getByRole("button", { name: "나중에 남기기", exact: true }));
      await page.screenshot({ path: after("f08-ending-skip-message-393") });
      await page.keyboard.press("Space");
      await expect(page.locator("#app canvas")).toHaveAttribute("data-message-saved", "false");
    }
    const messages = await page.evaluate(() => JSON.parse(localStorage.getItem("wedding.guestMessages") ?? "[]"));
    expect(messages).toHaveLength(side === "bride" ? 1 : 0);
    if (side === "bride") expect(messages[0]).toMatchObject({ name: "Keyboard Guest", side, message: "Congratulations!", gender: "female", face: 1, hair: 2, outfit: 3 });
    await storyKey(page, "청첩장 보기");
    await sceneIs(page, "InvitationScene");
    await expect(page.locator(".invitation-page")).toBeVisible();
    await tabTo(page, page.getByRole("button", { name: "링크 복사", exact: true }), true);
    // Standalone invitation has no replay CTA; a new visit starts through the root URL.
    await page.goto("/");
    await sceneIs(page, "IntroScene");
    await keyButton(page, "건너뛰기");
    await sceneIs(page, "InvitationScene");
    expect(await page.locator("html").getAttribute("data-pointer-count")).toBeNull();
    expect(errors).toEqual([]);
  });
}
