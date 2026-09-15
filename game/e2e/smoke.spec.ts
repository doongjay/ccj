import { chooseStory, completeLobbyTours, finishDinner, fillProfile, receiveEnvelope, takeBridalPhoto, dismissLobbyArrival } from "./story-helpers";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

test("Given the Vite app When the home page loads Then the wedding game title is visible", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle("JJ ♥︎ HS");
});

test("Given the car route When the guest makes mistakes then finishes Then the game reaches ending and replay resets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await startToHome(page, "신랑측");
  test.setTimeout(100_000);
  await chooseStory(page, "자차로 간다");
  await waitScene(page, "CarRouteScene");
  await chooseStory(page, "노란색");
  await waitDataset(page, "routeQuizWrongCount", "1");
  await expect(await datasetValue(page, "routeQuizSolved")).toBe("false");
  await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", /이마트[\s\S]*파란색[\s\S]*분홍색/);
  await page.getByRole("button", { name: "파란색", exact: true }).click({ timeout: 15000 });
  await waitScene(page, "VenueLobbyScene");
  await waitDataset(page, "lobbyReady", "true");
  await dismissLobbyArrival(page);

  await completeReception(page, "groom");
  await completeLobbyTours(page);
  await enterHall(page);
  await celebrateToEnding(page, "박수를 친다");
  await replay(page);
});

test("Given the subway route When the guest chooses wrong exits then bride side Then the game completes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 430, height: 932 });

  await startToHome(page, "신부측");
  test.setTimeout(100_000);
  await chooseStory(page, "지하철을 탄다");
  await waitScene(page, "SubwayRouteScene");
  await chooseStory(page, "1번 출구");
  await waitDataset(page, "routeQuizWrongCount", "1");
  await expect(await datasetValue(page, "routeQuizSolved")).toBe("false");
  await page.getByRole("button", { name: "2번 출구", exact: true }).click({ timeout: 15000 });
  await waitDataset(page, "routeQuizWrongCount", "2");
  await page.getByRole("button", { name: "5번 출구", exact: true }).click({ timeout: 15000 });
  await waitScene(page, "VenueLobbyScene");
  await waitDataset(page, "lobbyReady", "true");
  await dismissLobbyArrival(page);

  await completeReception(page, "bride");
  await completeLobbyTours(page);
  await clickLogical(page, 590, 150);
  await waitDataset(page, "lobbyInfo", "explore-required");
  await page.keyboard.press("Escape");
  await clickLogical(page, 590, 990);
  await waitScene(page, "GreeneryCorridorScene");
  await takeBridalPhoto(page);
  await enterHall(page);
  await celebrateToEnding(page, "환호를 한다");
  await expect(await datasetValue(page, "guestSide")).toBe("bride");
});

async function startToHome(page: Page, side: string): Promise<void> {
  await page.goto("/");
  await waitScene(page, "IntroScene");
  await clickLogical(page, 360, 1180);
  await waitScene(page, "HomeSelectScene");
  await fillProfile(page);
  await chooseStory(page, side);
}

async function completeReception(page: Page, expectedSide: string): Promise<void> {
  await clickLogical(page, 360, 460);
  await receiveEnvelope(page);
  await waitDataset(page, "guestSide", expectedSide);
  await waitDataset(page, "receptionComplete", "true");
  await expect(await datasetValue(page, "q3ModalOpen")).toBe("false");
  await expect(await datasetValue(page, "receptionDesk")).toBe(expectedSide);
}

async function enterHall(page: Page): Promise<void> {
  await clickLogical(page, 590, 150);
  await waitScene(page, "VenueHallScene");
}

async function celebrateToEnding(page: Page, reaction: string): Promise<void> {
  await chooseStory(page, reaction);
  await finishDinner(page);
  await waitScene(page, "EndingScene");
  await waitDataset(page, "endingReplayReady", "true");
}

async function replay(page: Page): Promise<void> {
  await page.getByRole("button", { name: "처음부터 다시", exact: true }).click();
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
