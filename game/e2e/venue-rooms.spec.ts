import { expect, test } from "@playwright/test";
import type { Page, TestInfo } from "@playwright/test";
import { expectCorridorPosition, installPlayerObservation } from "./corridor-observables";

const JOURNEYS = [
  {
    route: "car", scene: "CarRouteScene",
    homeX: 190, quizX: 568, quizY: 650, quizOpen: "routeQuizModalOpen",
    answerY: 964, side: "groom", sideAnswerY: 838, deskX: 110, wrongDeskX: 260, guideX: 403,
  },
  {
    route: "subway", scene: "SubwayRouteScene",
    homeX: 530, quizX: 120, quizY: 620, quizOpen: "routeQuizOpen",
    answerY: 880, side: "bride", sideAnswerY: 922, deskX: 260, wrongDeskX: 110, guideX: 230,
  },
] as const;

const VIEWPORT_CASES = [
  { journey: JOURNEYS[0], width: 390, height: 844 },
  { journey: JOURNEYS[1], width: 430, height: 932 },
  { journey: JOURNEYS[0], width: 720, height: 1280 },
  { journey: JOURNEYS[1], width: 1440, height: 1000 },
] as const;

const ROOMS = [
  { name: "photo", scene: "PhotoBoothScene", x: 360, y: 1200, bridePresent: "false" },
  { name: "banquet", scene: "BanquetScene", x: 360, y: 850, bridePresent: "false" },
  { name: "waiting", scene: "WaitingRoomScene", x: 130, y: 990, bridePresent: "false" },
  { name: "bridal", scene: "BridalRoomScene", x: 590, y: 990, bridePresent: "true" },
] as const;

type ReceptionState = Readonly<{
  guestSide: string;
  receptionComplete: string;
  receptionDesk: string;
  receptionExpectedDesk: string;
}>;

for (const { journey, width, height } of VIEWPORT_CASES) {
  test(`Given the ${journey.route} route at ${width}x${height} When visiting venue rooms and returning from the hall Then reception state survives and the journey finishes`, async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    const capture = (name: string): Promise<void> => captureScene(page, testInfo, name);
    await page.setViewportSize({ width, height });
    await installPlayerObservation(page);
    await page.goto("/");
    await waitScene(page, "IntroScene");
    await clickLogical(page, 360, 876);
    await waitScene(page, "HomeSelectScene");
    await clickLogical(page, journey.homeX, 790);
    await waitScene(page, journey.scene);
    await clickLogical(page, journey.quizX, journey.quizY);
    await waitDataset(page, journey.quizOpen, "true");
    await clickLogical(page, 360, journey.answerY);
    await waitLobby(page);

    const unselected: ReceptionState = {
      guestSide: "", receptionComplete: "false", receptionDesk: "", receptionExpectedDesk: "",
    };
    await expectReception(page, unselected);
    await capture("VenueLobbyScene-unselected");
    await test.step("All rooms return without selecting a side or completing reception", async () => {
      await visitAllRooms(page, unselected, capture);
    });

    await clickLogical(page, journey.wrongDeskX, 500);
    await waitDataset(page, "q3ModalOpen", "true");
    await clickLogical(page, 360, journey.sideAnswerY);
    await waitDataset(page, "q3ModalOpen", "false");
    await waitDataset(page, "receptionWarning", "wrong-desk");
    const selected: ReceptionState = {
      ...unselected, guestSide: journey.side, receptionExpectedDesk: journey.side,
    };
    await expectReception(page, selected);
    await test.step("All rooms retain the selected side without completing reception", async () => {
      await visitAllRooms(page, selected);
    });

    await clickLogical(page, journey.deskX, 500);
    await waitDataset(page, "receptionComplete", "true");
    const completed: ReceptionState = {
      ...selected, receptionComplete: "true", receptionDesk: journey.side,
    };
    await expectReception(page, completed);
    await test.step("All rooms retain completed reception", async () => {
      await visitAllRooms(page, completed);
    });
    await capture("VenueLobbyScene-completed");

    await test.step("Hall return retains reception and permits finishing the guide", async () => {
      await enterHall(page);
      await capture("VenueHallScene");
      await clickLogical(page, journey.guideX, 896);
      await waitDataset(page, "hallGuideArrivalCount", "1");
      await clickLogical(page, 110, 96);
      await waitLobby(page);
      await expectReception(page, completed);
      await capture("VenueLobbyScene-hall-return");
      await enterHall(page);
      await clickLogical(page, journey.guideX, 896);
      await waitDataset(page, "hallGuideArrivalCount", "1");
      await clickLogical(page, 187, 1050);
      await waitDataset(page, "hallGuideArrivalCount", "2");
      await clickLogical(page, 202, 1152);
      await waitScene(page, "EndingScene");
      await waitDataset(page, "endingReplayReady", "true");
      await waitDataset(page, "guestSide", journey.side);
    });
  });
}

async function visitAllRooms(
  page: Page,
  expected: ReceptionState,
  capture?: (name: string) => Promise<void>,
): Promise<void> {
  for (const room of ROOMS) {
    await test.step(`${room.name} room has the correct bride presence and returns to lobby`, async () => {
      await clickLogical(page, room.x, room.y);
      const entryScene = room.name === "bridal" ? "GreeneryCorridorScene" : room.scene;
      await page.waitForFunction((scene) => {
        const data = document.querySelector("canvas")?.dataset;
        return data?.q3ModalOpen === "true" || data?.activeScene === scene;
      }, entryScene);
      await expect(page.locator("canvas"), `${room.name} navigation must not open Q3`)
        .toHaveAttribute("data-q3-modal-open", "false");
      if (room.name === "bridal") await traverseCorridor(page, expected, capture);
      await waitScene(page, room.scene);
      await waitDataset(page, "roomReady", "true");
      await waitDataset(page, "venueRoom", room.name);
      await waitDataset(page, "roomBridePresent", room.bridePresent);
      await capture?.(room.scene);
      await clickLogical(page, 360, 1180);
      if (room.name === "bridal") {
        await expectCorridor(page, expected, 420);
        await capture?.("GreeneryCorridorScene-bridal-return");
        await clickLogical(page, 360, 1180);
      }
      await waitLobby(page);
      await expectReception(page, expected);
    });
  }
}

async function expectCorridor(page: Page, expected: ReceptionState, y: number): Promise<void> {
  await waitScene(page, "GreeneryCorridorScene");
  await waitDataset(page, "roomReady", "true");
  await waitDataset(page, "venueRoom", "corridor");
  await waitDataset(page, "roomBridePresent", "false");
  await waitDataset(page, "q3ModalOpen", "false");
  await expectCorridorPosition(page, 360, y);
  await expectReception(page, expected);
}

async function traverseCorridor(
  page: Page, expected: ReceptionState, capture?: (name: string) => Promise<void>,
): Promise<void> {
  await expectCorridor(page, expected, 1000);
  await capture?.("GreeneryCorridorScene-lobby-entry");
  await clickLogical(page, 210, 650);
  const markerClick = await page.evaluate(() => window.__venuePlayerSnapshot());
  if (markerClick === null) throw new Error("The corridor marker click could not be observed.");
  // Observe through the entire potential walk, not just the click's first frame.
  const markerStates = await page.evaluate(async () => {
    const states: { scene: string | undefined; quiz: string | undefined }[] = [];
    const started = performance.now();
    while (performance.now() - started < 2200) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const data = document.querySelector("canvas")?.dataset;
      states.push({ scene: data?.activeScene, quiz: data?.q3ModalOpen });
    }
    return states;
  });
  expect(markerStates.length).toBeGreaterThan(1);
  expect(markerStates.every((state) => state.scene === "GreeneryCorridorScene" && state.quiz === "false"))
    .toBe(true);
  await expectCorridorPosition(page, 280, markerClick.pointerY);
  await clickLogical(page, 360, 1180);
  await waitLobby(page);
  await expectReception(page, expected);
  await clickLogical(page, 590, 990);
  await expectCorridor(page, expected, 1000);
  await clickLogical(page, 360, 300);
  await page.waitForFunction(() => {
    const player = window.__venuePlayerSnapshot();
    return player !== null && (player.scene !== "GreeneryCorridorScene" || (player.y < 700 && player.y > 500));
  });
  const midpoint = await page.evaluate(() => window.__venuePlayerSnapshot());
  if (midpoint === null) throw new Error("The moving corridor player is missing.");
  expect(midpoint.scene).toBe("GreeneryCorridorScene");
  expect(midpoint.y).toBeGreaterThan(500);
  expect(midpoint.y).toBeLessThan(700);
  expect(midpoint.moving).toBe(true);
  await waitScene(page, "BridalRoomScene");
  await expectReception(page, expected);
}

async function captureScene(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

async function waitLobby(page: Page): Promise<void> {
  await waitScene(page, "VenueLobbyScene");
  await waitDataset(page, "lobbyReady", "true");
  await waitDataset(page, "roomBridePresent", "false");
  await waitDataset(page, "q3ModalOpen", "false");
}

async function enterHall(page: Page): Promise<void> {
  await clickLogical(page, 360, 150);
  await waitScene(page, "VenueHallScene");
  await waitDataset(page, "hallGuideArrivalCount", "0");
}

async function expectReception(page: Page, expected: ReceptionState): Promise<void> {
  await expect.poll(() => page.locator("canvas").evaluate((canvas) => ({
    guestSide: canvas.dataset.guestSide,
    receptionComplete: canvas.dataset.receptionComplete,
    receptionDesk: canvas.dataset.receptionDesk,
    receptionExpectedDesk: canvas.dataset.receptionExpectedDesk,
  }))).toEqual(expected);
}

async function waitScene(page: Page, sceneKey: string): Promise<void> {
  await waitDataset(page, "activeScene", sceneKey);
}

async function waitDataset(page: Page, key: string, value: string): Promise<void> {
  await page.waitForFunction(
    ({ key, value }) => document.querySelector("canvas")?.dataset[key] === value,
    { key, value },
  );
}

async function clickLogical(page: Page, x: number, y: number): Promise<void> {
  const box = await page.locator("canvas").boundingBox();
  if (box === null) throw new Error("Cannot click the game because the canvas is missing.");
  await page.mouse.click(box.x + box.width * x / 720, box.y + box.height * y / 1280);
}
