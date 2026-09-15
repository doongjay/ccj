import { expect, test, type Page } from "@playwright/test";
import { installPlayerObservation } from "./corridor-observables";
import { chooseStory, clickGame, fillProfile, receiveEnvelope, takeBridalPhoto, enterLobby, returnFromPhoto } from "./story-helpers";

// Preserve the approved A1 evidence when running later regression batches.
const capture = (name: string) => test.info().outputPath(`${name}.png`);
const activities = ["포토부스에서 사진 찍기", "포토테이블 구경하기", "축의대에서 접수하기", "현서와 사진 찍기"];

function observeErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", entry => { if (entry.type() === "error" || /(?:Texture|Frame|Animation).*(?:missing|not found|has no frame|does not exist)/i.test(entry.text())) errors.push(entry.text()); });
  page.on("requestfailed", request => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  return errors;
}

test("A1-01/02/03: compact arrival and gate keep the bride itinerary in an informational notebook", async ({ page }, testInfo) => {
  test.setTimeout(90000);
  const errors = observeErrors(page);
  await installPlayerObservation(page);
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  const canvas = page.locator("#app canvas");
  await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
  await clickGame(page, 360, 1180);
  await fillProfile(page, "신부친구", "female");
  await chooseStory(page, "신부측");
  await chooseStory(page, "자차로 간다");
  await chooseStory(page, "파란색");
  await expect(canvas).toHaveAttribute("data-lobby-info", "arrival-guide", { timeout: 15000 });
  await expect(page.locator(".story-copy")).toHaveText("도착! 로비가 넓군.\n어디부터 갈까?");
  await expect(canvas).toHaveAttribute("data-lobby-progress", "0/4");
  const arrival = await assertCompactPanel(page);
  await page.screenshot({ path: capture("a1-first-lobby-arrival-393x852") });
  await expect(page.getByRole("button", { name: "확인", exact: true })).toHaveCount(0);
  await page.locator(".story-info-tutorial .story-narration").click();
  await clickGame(page, 128, 60);
  await expectNotebook(page, 4);
  await page.screenshot({ path: capture("a1-notebook-393x852") });
  const before = await page.evaluate(() => window.__venuePlayerSnapshot());
  await page.locator(".story-copy").click();
  expect(await page.evaluate(() => window.__venuePlayerSnapshot())).toMatchObject({ x: before!.x, y: before!.y, moving: false });
  await expect(canvas).toHaveAttribute("data-active-scene", "VenueLobbyScene");
  await expect(canvas).toHaveAttribute("data-lobby-progress", "0/4");
  await page.keyboard.press("Escape");
  await clickGame(page, 590, 150);
  await expect(canvas).toHaveAttribute("data-lobby-info", "explore-required");
  await expect(page.locator(".story-copy")).toContainText("아직 4개의 추억이 남았어요.");
  expect(await page.locator(".hall-requirements button").allTextContents()).toEqual(["GO!", "GO!", "GO!", "GO!"]);
  await expect(page.locator(".info-actions button")).toHaveCount(0);
  const gate = await assertCompactPanel(page);
  await page.screenshot({ path: capture("a1-hall-requirements-393x852") });
  await page.keyboard.press("Escape");
  await clickGame(page, 128, 60);
  await expectNotebook(page, 4);
  await expect(canvas).toHaveAttribute("data-active-scene", "VenueLobbyScene");
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  // Required activities are reached through their normal lobby facilities.
  await clickGame(page, 130, 590);
  await expect(canvas).toHaveAttribute("data-active-scene", "PhotoBoothScene");
  await clickGame(page, 360, 860);
  await returnFromPhoto(page);
  await expect(canvas).toHaveAttribute("data-active-scene", "VenueLobbyScene", { timeout: 10000 });
  await expect(canvas).toHaveAttribute("data-lobby-ready", "true");
  await expect(canvas).toHaveAttribute("data-lobby-progress", "1/4");
  await clickGame(page, 128, 60);
  await expect(page.locator(".story-copy")).toContainText("♥  포토부스에서 사진 찍기");
  await expect(page.locator(".info-actions button")).toHaveCount(1);
  await page.screenshot({ path: capture("a1-notebook-completed-393x852") });
  await page.keyboard.press("Escape");
  await clickGame(page, 550, 450);
  await expect(canvas).toHaveAttribute("data-photo-gallery-open", "true");
  await page.keyboard.press("Escape");
  await expect(canvas).toHaveAttribute("data-lobby-progress", "2/4");
  await clickGame(page, 360, 420);
  await receiveEnvelope(page);
  await expect(canvas).toHaveAttribute("data-lobby-progress", "3/4");
  await clickGame(page, 590, 150);
  await expect(page.locator(".story-copy")).toHaveText("아직 1개의 추억이 남았어요.");
  await expect(page.locator(".hall-requirements")).toContainText("♡  현서와 사진 찍기");
  await page.keyboard.press("Escape");
  await clickGame(page, 590, 990);
  await takeBridalPhoto(page);
  await expect(canvas).toHaveAttribute("data-lobby-progress", "4/4");
  await clickGame(page, 590, 150);
  await expect(canvas).toHaveAttribute("data-active-scene", "VenueHallScene");
  await testInfo.attach("panel-coverage", { body: JSON.stringify({ arrival, gate, errors }, null, 2), contentType: "application/json" });
  expect(errors).toEqual([]);
});

test("A1-04: tap-to-close panels retain touch size, focus, Escape and input blocking", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const errors = observeErrors(page);
  await installPlayerObservation(page);
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto("/");
  await enterLobby(page, "subway", "groom");
  await clickGame(page, 128, 60);
  await expectNotebook(page, 3);
  await page.keyboard.press("Escape");
  const metrics = [];
  for (const [index, item] of [
    { x: 667, y: 560, id: "atm" },
    { x: 590, y: 870, id: "welcome-drink" },
    { x: 590, y: 990, id: "bridal-restriction" },
  ].entries()) {
    await clickGame(page, item.x, item.y);
    const panel = page.locator(".story-info-compact .story-narration");
    await expect(panel.getByRole("button", { name: "닫기", exact: true })).toHaveCount(0);
    await expect(page.locator(".story-choices:visible")).toHaveCount(0);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(panel).toBeFocused();
    await expect(panel).toHaveCSS("outline-style", "solid");
    await expect(panel).toHaveCSS("outline-width", "3px");
    const frame = (await panel.boundingBox())!;
    expect(frame.width).toBeGreaterThanOrEqual(44);
    expect(frame.height).toBeGreaterThanOrEqual(44);
    metrics.push({ item: item.id, frame });
    await page.screenshot({ path: capture(`a1-${item.id}-430x932`) });
    const before = await page.evaluate(() => window.__venuePlayerSnapshot());
    if (index === 1) await clickGame(page, 130, 590);
    else await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    const returned = index === 0 ? { x: 470, y: 590 } : index === 1 ? { x: 456, y: 970 } : { x: before!.x, y: before!.y };
    expect(await page.evaluate(() => window.__venuePlayerSnapshot())).toMatchObject({ ...returned, moving: false });
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "VenueLobbyScene");
  }
  await clickGame(page, 360, 1180);
  // A browser click can round by one CSS pixel before mapping to game coordinates.
  await expect.poll(() => page.evaluate(() => {
    const player = window.__venuePlayerSnapshot();
    return player && { scene: player.scene, moving: player.moving, nearTarget: Math.hypot(player.x - 360, player.y - 1180) < 3 };
  })).toMatchObject({ scene: "VenueLobbyScene", moving: false, nearTarget: true });
  await testInfo.attach("info-panel-checks", { body: JSON.stringify({ metrics, errors }, null, 2), contentType: "application/json" });
  expect(errors).toEqual([]);
});

async function expectNotebook(page: Page, count: number): Promise<void> {
  await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-info", "memory-book");
  for (const label of activities.slice(0, count)) await expect(page.locator(".story-copy")).toContainText(label);
  for (const location of ["로비 왼쪽", "로비 오른쪽 위", "로비 정면"].concat(count === 4 ? ["오른쪽 아래 신부대기실 통로"] : [])) {
    await expect(page.locator(".story-copy")).toContainText(location);
  }
  await expect(page.locator(".info-actions button")).toHaveCount(1);
}

async function assertCompactPanel(page: Page): Promise<{ heightFraction: number; coveredAreaFraction: number }> {
  const canvas = (await page.locator("#app canvas").boundingBox())!;
  const panel = (await page.locator(".story-info .story-narration").boundingBox())!;
  const heightFraction = panel.height / canvas.height;
  const coveredAreaFraction = panel.width * panel.height / (canvas.width * canvas.height);
  expect(heightFraction).toBeLessThan(0.5);
  expect(coveredAreaFraction).toBeLessThan(0.5);
  expect(panel.y).toBeGreaterThan(canvas.y + canvas.height * 104 / 1280);
  return { heightFraction, coveredAreaFraction };
}
