import { expect, test } from "@playwright/test";
import { finishMealByTap, chooseStory, clickGame, fillProfile, receiveEnvelope, takeBridalPhoto, takeGroupPhoto, dismissLobbyArrival, returnFromPhoto } from "./story-helpers";

for (const side of ["bride", "groom"] as const) {
  test(`profile, reception, photo poses, ${side === "bride" ? "meal first" : "ceremony first"} and save/skip local message: ${side}`, async ({ page }, testInfo) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 393, height: 852 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", entry => { if (entry.type() === "error" || /(?:Texture|Frame|Animation).*(?:missing|not found|has no frame|does not exist)/i.test(entry.text())) errors.push(entry.text()); });
    page.on("requestfailed", request => errors.push(request.url()));
    await page.goto("/");
    const canvas = page.locator("#app canvas");
    await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
    await clickGame(page, 360, 1180);
    await expect(page.locator('input[type="radio"], input[type="checkbox"]')).toHaveCount(0);
    await expect(page.locator(".profile-entry input")).toHaveCSS("text-align", "center");
    await fillProfile(page, "김테스트", side === "bride" ? "female" : "male");
    await expect(canvas).toHaveAttribute("data-guest-name", "김테스트");
    await chooseStory(page, side === "bride" ? "신부측" : "신랑측");
    await chooseStory(page, side === "bride" ? "자차로 간다" : "지하철을 탄다");
    await expect(canvas).toHaveAttribute("data-active-scene", side === "bride" ? "CarRouteScene" : "SubwayRouteScene");
    await page.screenshot({ path: testInfo.outputPath("car.png") });
    await chooseStory(page, side === "bride" ? "파란색" : "5번 출구");
    await expect(canvas).toHaveAttribute("data-active-scene", "VenueLobbyScene", { timeout: 15000 });
    await expect(canvas).toHaveAttribute("data-lobby-ready", "true");
    await dismissLobbyArrival(page);
    await page.screenshot({ path: testInfo.outputPath("lobby.png") });
    await clickGame(page, 590, 150);
    await expect(canvas).toHaveAttribute("data-lobby-info", "explore-required");
    await page.locator(".story-narration").click();
    await expect(page.locator(".hall-requirements .story-choice")).toHaveCount(side === "bride" ? 4 : 3);
    await page.keyboard.press("Escape");
    await clickGame(page, 360, 420);
    await expect(canvas).toHaveAttribute("data-active-scene", "ReceptionScene");
    await expect(canvas).toHaveAttribute("data-reception-family", side === "bride" ? "parents-and-brother" : "parents");
    await page.screenshot({ path: testInfo.outputPath("parents.png") });
    await receiveEnvelope(page);
    await expect(canvas).toHaveAttribute("data-reception-complete", "true");
    await clickGame(page, 130, 590);
    await expect(canvas).toHaveAttribute("data-active-scene", "PhotoBoothScene");
    await clickGame(page, 360, 860);
    await expect(canvas).toHaveAttribute("data-photo-booth-stage", "posing");
    await page.screenshot({ path: testInfo.outputPath("v-pose.png") });
    await returnFromPhoto(page);
    await expect(canvas).toHaveAttribute("data-active-scene", "VenueLobbyScene", { timeout: 10000 });
    await expect(canvas).toHaveAttribute("data-lobby-ready", "true");
    await clickGame(page, 550, 450);
    await expect(canvas).toHaveAttribute("data-photo-gallery-open", "true");
    await page.keyboard.press("Escape");
    if (side === "bride") {
      await clickGame(page, 590, 150);
      await expect(canvas).toHaveAttribute("data-lobby-info", "explore-required");
      await page.keyboard.press("Escape");
      await clickGame(page, 590, 990);
      await takeBridalPhoto(page, async () => { await page.screenshot({ path: testInfo.outputPath("bridal-seated.png") }); });
    } else {
      await clickGame(page, 590, 990);
      await expect(canvas).toHaveAttribute("data-lobby-info", "bridal-restricted");
      await page.locator(".story-info-compact .story-narration").click();
    }
    await clickGame(page, side === "bride" ? 360 : 590, 150);
    if (side === "bride") await chooseStory(page, "1시반부터 밥먹기");
    if (side === "bride") {
      await expect(canvas).toHaveAttribute("data-dinner-stage", "buffet-route", { timeout: 20000 });
      await page.locator(".story-narration").click();
      await finishMealByTap(page);
      await expect(canvas).toHaveAttribute("data-active-scene", "VenueHallScene", { timeout: 15000 });
    }
    await chooseStory(page, side === "bride" ? "박수를 친다" : "환호를 한다");
    await expect(canvas).toHaveAttribute("data-ceremony-stage", "group-photo");
    await expect(canvas).toHaveAttribute("data-group-photo-guest-side", side);
    await expect(canvas).toHaveAttribute("data-group-photo-camera", "viewfinder");
    await expect(canvas).toHaveAttribute("data-group-photo-guest-count", "30");
    await page.screenshot({ path: testInfo.outputPath("group-photo.png") });
    await takeGroupPhoto(page);
    await expect(canvas).toHaveAttribute("data-active-scene", "DinnerJourneyScene", { timeout: 10000 });
    if (side === "groom") {
      await expect(canvas).toHaveAttribute("data-dinner-stage", "buffet-route", { timeout: 20000 });
      await page.locator(".story-narration").click();
      await finishMealByTap(page);
    } else {
      await expect(canvas).toHaveAttribute("data-dinner-stage", "after-meal");
      await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", /밥은 아까 먹었으니/);
    }
    await expect(canvas).toHaveAttribute("data-active-scene", "EndingScene", { timeout: 25000 });
    await expect(page.getByRole("heading", { name: `${side === "bride" ? "현서" : "재준"}에게 메시지 남기기` })).toBeVisible();
    await page.getByRole("button", { name: "메시지 남기기", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("축하 메시지를 입력해 주세요.");
    await expect(page.getByRole("textbox", { name: "축하 메시지" })).toHaveAttribute("aria-invalid", "true");
    if (side === "bride") {
    await page.getByRole("textbox", { name: "축하 메시지" }).fill("우리 오래오래 행복하자! <3");
    await page.getByRole("button", { name: "메시지 남기기" }).click();
    await expect(canvas).toHaveAttribute("data-message-saved", "true");
    const messages = await page.evaluate(() => JSON.parse(localStorage.getItem("wedding.guestMessages") ?? "[]"));
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ name: "김테스트", side, message: "우리 오래오래 행복하자! <3" });
    } else {
      await page.getByRole("button", { name: "나중에 남기기", exact: true }).click();
      await expect(canvas).toHaveAttribute("data-message-saved", "false");
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem("wedding.guestMessages") ?? "[]"))).toHaveLength(0);
    }
    await page.locator(".story-narration").click();
    await page.getByRole("button", { name: "청첩장 보기", exact: true }).click();
    await expect(page.locator(".invitation-page")).toBeVisible();
    // The removed invitation replay CTA is no longer a route trigger.
    await expect(page.getByRole("button", { name: "링크 복사", exact: true })).toBeVisible();
    await page.goto("/");
    await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
    expect(errors).toEqual([]);
  });
}
