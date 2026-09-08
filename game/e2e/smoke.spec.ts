import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

test("Given the Vite app When the home page loads Then the wedding game title is visible", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle("이재준 ♥ 김현서 결혼식으로 가는 길");
});

test("Given the car route When the guest makes mistakes then finishes Then the game reaches ending and replay resets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await startToHome(page);
  await clickLogical(page, 190, 790);
  await waitScene(page, "CarRouteScene");
  await clickLogical(page, 568, 650);
  await waitDataset(page, "routeQuizModalOpen", "true");

  await page.keyboard.press("1");
  await waitDataset(page, "routeQuizWrongCount", "1");
  await expect(await datasetValue(page, "routeQuizSolved")).toBe("false");
  await expect(await datasetValue(page, "routeQuizHintCount")).toBe("1");
  await expect(await datasetValue(page, "activeScene")).toBe("CarRouteScene");

  await page.keyboard.press("2");
  await waitDataset(page, "routeQuizWrongCount", "2");
  await expect(await datasetValue(page, "activeScene")).toBe("CarRouteScene");

  await page.keyboard.press("3");
  await waitScene(page, "VenueLobbyScene");
  await waitDataset(page, "lobbyReady", "true");

  await chooseGuestSide(page, "1", "groom", 110, 260);
  await enterHall(page);
  await followGuideToEnding(page, 403);
  await replay(page);
});

test("Given the subway route When the guest chooses wrong exits then bride side Then the game completes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 430, height: 932 });

  await startToHome(page);
  await clickLogical(page, 530, 790);
  await waitScene(page, "SubwayRouteScene");
  await clickLogical(page, 120, 620);
  await waitDataset(page, "routeQuizOpen", "true");

  await page.keyboard.press("1");
  await waitDataset(page, "routeQuizWrongCount", "1");
  await expect(await datasetValue(page, "routeQuizSolved")).toBe("false");
  await expect(await datasetValue(page, "routeQuizHintCount")).toBe("1");
  await expect(await datasetValue(page, "activeScene")).toBe("SubwayRouteScene");

  await page.keyboard.press("2");
  await waitDataset(page, "routeQuizWrongCount", "2");
  await expect(await datasetValue(page, "activeScene")).toBe("SubwayRouteScene");

  await page.keyboard.press("3");
  await waitScene(page, "VenueLobbyScene");
  await waitDataset(page, "lobbyReady", "true");

  await chooseGuestSide(page, "2", "bride", 260);
  await enterHall(page);
  await followGuideToEnding(page, 230);
  await expect(await datasetValue(page, "guestSide")).toBe("bride");
});

async function startToHome(page: Page): Promise<void> {
  await page.goto("/");
  await waitScene(page, "IntroScene");
  await clickLogical(page, 360, 876);
  await waitScene(page, "HomeSelectScene");
}

async function chooseGuestSide(
  page: Page,
  optionKey: string,
  expectedSide: string,
  deskX: number,
  wrongDeskX?: number,
): Promise<void> {
  await clickLogical(page, wrongDeskX ?? deskX, 500);
  await waitDataset(page, "q3ModalOpen", "true");
  await page.keyboard.press(optionKey);
  await waitDataset(page, "guestSide", expectedSide);

  if (wrongDeskX !== undefined) {
    await waitDataset(page, "receptionWarning", "wrong-desk");
    await expect(await datasetValue(page, "receptionComplete")).toBe("false");
    await clickLogical(page, deskX, 500);
  }

  await waitDataset(page, "receptionComplete", "true");
  await expect(await datasetValue(page, "q3ModalOpen")).toBe("false");
  await expect(await datasetValue(page, "receptionDesk")).toBe(expectedSide);
}

async function enterHall(page: Page): Promise<void> {
  await clickLogical(page, 360, 150);
  await waitScene(page, "VenueHallScene");
  await waitDataset(page, "hallGuideArrivalCount", "0");
}

async function followGuideToEnding(page: Page, firstX: number): Promise<void> {
  await clickLogical(page, firstX, 896);
  await waitDataset(page, "hallGuideArrivalCount", "1");
  await clickLogical(page, 187, 1050);
  await waitDataset(page, "hallGuideArrivalCount", "2");
  await clickLogical(page, 202, 1152);
  await waitScene(page, "EndingScene");
  await waitDataset(page, "endingReplayReady", "true");
}

async function replay(page: Page): Promise<void> {
  await clickLogical(page, 360, 994);
  await waitScene(page, "IntroScene");
  await waitDataset(page, "routeChoice", "");
  await waitDataset(page, "guestSide", "");
  await expect(await datasetValue(page, "replayRequested")).toBe("true");
}

async function waitScene(page: Page, sceneKey: string): Promise<void> {
  await waitDataset(page, "activeScene", sceneKey);
}

async function waitDataset(page: Page, key: string, expectedValue: string): Promise<void> {
  await page.waitForFunction(
    (options) => document.querySelector("canvas")?.dataset[options.key] === options.expectedValue,
    { expectedValue, key },
  );
}

async function datasetValue(page: Page, key: string): Promise<string | undefined> {
  return page.locator("canvas").evaluate((canvas, datasetKey) => canvas.dataset[datasetKey], key);
}

async function clickLogical(page: Page, x: number, y: number): Promise<void> {
  const box = await page.locator("canvas").boundingBox();

  if (box === null) {
    throw new Error("Cannot click the game because the canvas is missing.");
  }

  await page.mouse.click(box.x + (box.width * x) / 720, box.y + (box.height * y) / 1280);
}
