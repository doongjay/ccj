import { REVIEW_EVIDENCE } from "./review-evidence";
import { test, expect } from "@playwright/test";
import { clickGame, enterLobby } from "./story-helpers";
import { installPlayerObservation } from "./corridor-observables";
import { insideFloor, findWalkPath } from "../src/systems/walkPath";
import { LOBBY_FLOOR, GUEST_GROUND_OFFSET_Y } from "../src/data/lobbyFloor";

test("F02: reject wall/glass taps and keep the complete walk on the lobby floor", async ({ page }) => {
  test.setTimeout(60000);
  await installPlayerObservation(page);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error" || /(?:Texture|Frame|Animation).*(?:missing|not found|has no frame|does not exist)/i.test(message.text())) errors.push(message.text()); });
  page.on("requestfailed", request => errors.push(request.url()));
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await enterLobby(page, "car", "groom");
  for (const [x, y] of [[30, 250], [45, 180], [35, 420], [20, 1040], [160, 1190], [620, 1190], [700, 1260]]) {
    await clickGame(page, x!, y!);
    await expect.poll(() => page.evaluate(() => window.__venuePlayerSnapshot())).toMatchObject({ x: 360, y: 1060, moving: false });
  }
  await expect(page.locator("canvas")).toHaveAttribute("data-lobby-invalid-tap", "true");
  await page.screenshot({ path: `${REVIEW_EVIDENCE}/regressions/f02-invalid-wall-tap-393.png` });
  for (const [x, y] of [[455, 410], [230, 1000], [360, 1180], [360, 1060]]) {
    await clickGame(page, x!, y!);
    const samples = await page.evaluate(async target => {
      const points = [];
      for (let i = 0; i < 300; i++) {
        await new Promise(requestAnimationFrame);
        const player = window.__venuePlayerSnapshot();
        if (!player) throw new Error(`Unexpected scene: ${document.querySelector("canvas")?.dataset.activeScene}`);
        points.push({ x: player.x, y: player.y });
        if (!player.moving && Math.hypot(player.x - target.x, player.y - target.y) < 3) break;
      }
      return points;
    }, { x: x!, y: y! });
    for (const point of samples) expect(insideFloor({ x: point.x, y: point.y + GUEST_GROUND_OFFSET_Y }, LOBBY_FLOOR)).toBe(true);
    const last = samples.at(-1)!;
    expect(Math.hypot(last.x - x!, last.y - y!), JSON.stringify({ target: { x, y }, last })).toBeLessThan(3);
    if (x === 455) await page.screenshot({ path: `${REVIEW_EVIDENCE}/regressions/f02-valid-edge-route-393.png` });
  }
  expect(errors).toEqual([]);
});

test("F02: concave entrance boundary cannot be cut across glass", () => {
  const floor = LOBBY_FLOOR.map(point => ({ x: point.x, y: point.y - GUEST_GROUND_OFFSET_Y }));
  const start = { x: 200, y: 1000 }, end = { x: 400, y: 1200 };
  const path = findWalkPath(start, end, { x: 0, y: 0, width: 720, height: 1280 }, [], floor);
  expect(path.length).toBeGreaterThan(1);
  let previous = start;
  for (const next of path) {
    for (let step = 0; step <= 100; step++) expect(insideFloor({ x: previous.x + (next.x - previous.x) * step / 100, y: previous.y + (next.y - previous.y) * step / 100 }, floor)).toBe(true);
    previous = next;
  }
  expect(path.at(-1)).toEqual(end);
});
