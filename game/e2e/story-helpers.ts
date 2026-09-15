import { expect, type Page } from "@playwright/test";

export async function chooseStory(page: Page, label: string): Promise<void> {
  await expect(page.locator(".story-narration")).toBeVisible();
  await page.locator(".story-narration").click();
  await page.getByRole("button", { name: label, exact: true }).click();
}

export async function finishMealByTap(page: Page): Promise<void> {
  await expect(page.locator("#app canvas")).toHaveAttribute("data-dinner-stage", "buffet-route", { timeout: 35000 });
  await expect(page.getByRole("button", { name: "식사를 마친다", exact: true })).toHaveCount(0);
  if (await page.locator("#app canvas").getAttribute("data-story-state") === "typing") await page.locator(".story-narration").click();
  // A tap away from the narration must also advance the completed text.
  await clickGame(page, 360, 300);
}

export async function fillProfile(page: Page, name = "테스트하객", gender: "male" | "female" = "male"): Promise<void> {
  await page.getByRole("textbox", { name: "내 이름은", exact: true }).fill(name);
  await page.getByRole("button", { name: gender === "female" ? "여자" : "남자", exact: true }).click();
  await page.locator(".outfit-card").nth(0).click();
  await page.getByRole("button", { name: "시작하기", exact: true }).click();
}

export async function receiveEnvelope(page: Page): Promise<void> {
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "ReceptionScene");
  await chooseStory(page, "인사하기");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "VenueLobbyScene", { timeout: 10000 });
  await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-ready", "true");
}

export async function takeBridalPhoto(page: Page, onSeated?: () => Promise<void>): Promise<void> {
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "BridalRoomScene", { timeout: 10000 });
  await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", "현서야 결혼 축하해!");
  await page.locator(".story-narration").click();
  await expect(page.locator("#app canvas")).toHaveAttribute("data-bridal-visit-stage", "ready");
  await clickGame(page, 360, 860);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-bridal-visit-stage", "seated");
  await onSeated?.();
  await returnFromPhoto(page);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "VenueLobbyScene", { timeout: 10000 });
  await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-ready", "true");
}

export async function enterLobby(page: Page, route: "car" | "subway" = "car", side: "groom" | "bride" = "groom"): Promise<void> {
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  const bounds = await page.locator("#app canvas").boundingBox();
  if (!bounds) throw new Error("Missing canvas");
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height * 1180 / 1280);
  await fillProfile(page);
  await chooseStory(page, side === "groom" ? "신랑측" : "신부측");
  await expect(page.locator(".story-narration")).not.toHaveAttribute("aria-label", /술|와인|맥주|뷔페/);
  await chooseStory(page, route === "car" ? "자차로 간다" : "지하철을 탄다");
  await chooseStory(page, route === "car" ? "파란색" : "5번 출구");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "VenueLobbyScene", { timeout: 15000 });
  await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-ready", "true");
  await dismissLobbyArrival(page);
}

export async function clickGame(page: Page, x: number, y: number): Promise<void> {
  const bounds = await page.locator("#app canvas").boundingBox();
  if (!bounds) throw new Error("Missing canvas");
  await page.mouse.click(bounds.x + bounds.width * x / 720, bounds.y + bounds.height * y / 1280);
}

export async function dismissLobbyArrival(page: Page): Promise<void> {
  if (await page.locator("#app canvas").getAttribute("data-lobby-info") === "arrival-guide") {
    await page.locator(".story-info-tutorial .story-narration").click();
  }
}

export async function completeLobbyTours(page: Page): Promise<void> {
  await clickGame(page, 130, 590);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "PhotoBoothScene");
  await clickGame(page, 360, 860);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-photo-booth-visited", "true");
  await returnFromPhoto(page);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "VenueLobbyScene");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-ready", "true");
  await clickGame(page, 550, 450);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-photo-gallery-open", "true");
  await page.keyboard.press("Escape");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-photo-gallery-open", "false");
}

export async function finishDinner(page: Page): Promise<void> {
  if (await page.locator("#app canvas").getAttribute("data-active-scene") === "VenueHallScene") await takeGroupPhoto(page);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "DinnerJourneyScene");
  const route = await page.locator("#app canvas").getAttribute("data-route-choice");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-dinner-stage", "buffet-route", { timeout: 35000 });
  await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", route === "car" ? /차를 가져와서 술은 못/ : /지하철 타고 오길 잘했네/);
  await finishMealByTap(page);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-dinner-stage", "homeward", { timeout: 10000 });
  await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", route === "car" ? /자동으로 3시간/ : /다시 셔틀/);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "EndingScene", { timeout: 20000 });
  await page.getByRole("textbox", { name: "축하 메시지" }).fill("결혼 축하해! 행복하게 잘 살아.");
  await page.getByRole("button", { name: "메시지 남기기", exact: true }).click();
  await page.locator(".story-narration").click();
  await expect(page.locator("#app canvas")).toHaveAttribute("data-ending-replay-ready", "true");
}

export async function takeGroupPhoto(page: Page): Promise<void> {
  await expect(page.locator("#app canvas")).toHaveAttribute("data-ceremony-stage", "group-photo");
  await chooseStory(page, "사진 찍기");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-ceremony-stage", "photo", { timeout: 8000 });
  await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", "찰칵! 결혼 축하해!");
  await chooseStory(page, "다음으로");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "DinnerJourneyScene");
}

export async function returnFromPhoto(page: Page): Promise<void> {
  await expect(page.locator(".story-info-photo-result")).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "로비로 돌아가기", exact: true }).click();
}
