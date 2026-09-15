import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { writeFile } from "node:fs/promises";
import { installPlayerObservation } from "./corridor-observables";
import { enterLobby, clickGame, chooseStory, receiveEnvelope, completeLobbyTours, takeBridalPhoto } from "./story-helpers";
import { insideFloor } from "../src/systems/walkPath";
import { LOBBY_FLOOR } from "../src/data/lobbyFloor";
import { REVIEW_EVIDENCE as evidence } from "./review-evidence";

test.use({ viewport: { width: 393, height: 852 }, video: { mode: "on", size: { width: 393, height: 852 } } });
test.beforeEach(async ({ page }) => installPlayerObservation(page));

test("F23/C-P01 isolated art audit: all 108 profiles keep heads, foot anchors and existing photo poses", async ({ page }) => {
  test.setTimeout(120000); await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  const results = await page.evaluate(async () => {
    const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("IntroScene");
    const loaderPath = "/src/systems/stageAssets.ts", motionPath = "/src/ui/minimiMotion.ts", minimiPath = "/src/ui/minimi.ts";
    const { ensureAvatarAssets } = await import(loaderPath) as typeof import("../src/systems/stageAssets");
    const { walkingTexture, clappingTexture } = await import(motionPath) as typeof import("../src/ui/minimiMotion");
    const { minimiTextureKey } = await import(minimiPath) as typeof import("../src/ui/minimi");
    const parkingPath = "/src/ui/parkingCar.ts";
    const { parkingCarTexture } = await import(parkingPath) as typeof import("../src/ui/parkingCar");
    const parking = scene.textures.get(parkingCarTexture(scene));
    const parkingSource = parking.getSourceImage();
    if (parkingSource.width !== 38 || parkingSource.height !== 52 || parking.source[0]!.scaleMode !== 1) throw new Error("D-A01 generated parking icon contract: 38×52 with NEAREST filter");
    if (parkingCarTexture(scene) !== parking.key) throw new Error("Parking icon must reuse its texture");
    const results = [];
    const pixels = (key: string, name: string | number) => {
      const texture = scene.textures.get(key), frame = texture.get(name), source = texture.getSourceImage() as HTMLCanvasElement;
      return source.getContext("2d")!.getImageData(frame.cutX, frame.cutY, 128, 192).data;
    };
    const same = (a: Uint8ClampedArray, b: Uint8ClampedArray, start: number, end: number) => a.slice(start * 128 * 4, end * 128 * 4).every((v, i) => v === b[start * 128 * 4 + i]);
    for (const gender of ["male", "female"] as const) {
      await ensureAvatarAssets(scene, gender);
      const sheet = document.createElement("canvas"); sheet.id = `motion-audit-${gender}`; sheet.width = 896; sheet.height = 1152;
      const ctx = sheet.getContext("2d")!; ctx.fillStyle = "#fff9ef"; ctx.fillRect(0, 0, sheet.width, sheet.height);
      for (let face = 0; face < 3; face++) for (let hair = 0; hair < 3; hair++) for (let outfit = 0; outfit < 6; outfit++) {
        const profile = { gender, face, hair, outfit }, walk = walkingTexture(scene, profile), clap = clappingTexture(scene, profile), base = minimiTextureKey(profile);
        const prefix = `${outfit}-${hair}-`;
        const observations = ["down", "left", "right", "up"].map(pose => {
          const a = pixels(walk, `${pose}-0`), b = pixels(walk, `${pose}-1`), idle = pixels(base, prefix + pose);
          return { pose, headAndBodyStable: same(a, idle, 0, 142) && same(b, idle, 0, 142), actualLegChange: !same(a, b, 142, 192) };
        });
        const idle = pixels(base, prefix + "down"), closed = pixels(clap, 0), open = pixels(clap, 1);
        const bent = pixels(base, prefix + "seated");
        const bottom = (data: Uint8ClampedArray) => { for (let i = data.length - 1; i > 0; i -= 4) if (data[i]! > 127) return Math.floor(i / (128 * 4)); return -1; };
        results.push({ profile, observations, clapHeadStable: same(idle, closed, 0, 82) && same(idle, open, 0, 82), clapFeetStable: same(bent, closed, 142, 192) && same(bent, open, 142, 192) && bottom(idle) === bottom(closed), handsChange: !same(closed, open, 96, 140) });
        if (face === outfit % 3 && hair === outfit % 3) {
          for (const [i, [key, name]] of [[base, prefix + "down"], [walk, "down-0"], [walk, "down-1"], [walk, "left-0"], [walk, "left-1"], [clap, 0], [clap, 1]].entries()) {
            const texture = scene.textures.get(key as string), frame = texture.get(name!);
            ctx.drawImage(texture.getSourceImage() as HTMLCanvasElement, frame.cutX, frame.cutY, 128, 192, i * 128, outfit * 192, 128, 192);
          }
        }
      }
      Object.assign(sheet.style, { position: "fixed", top: "0", left: "0", zIndex: "9999", imageRendering: "pixelated" }); document.body.append(sheet);
    }
    return results;
  });
  expect(results).toHaveLength(108);
  for (const result of results) {
    expect(result.observations.every(p => p.headAndBodyStable && p.actualLegChange), JSON.stringify(result)).toBe(true);
    expect(result.clapHeadStable && result.clapFeetStable && result.handsChange, JSON.stringify(result)).toBe(true);
  }
  await page.setViewportSize({ width: 1000, height: 1000 });
  for (const gender of ["female", "male"]) {
    await page.locator(`#motion-audit-${gender}`).screenshot({ path: `${evidence}/f23-cp01-${gender}-frames.png` });
    await page.locator(`#motion-audit-${gender}`).evaluate(n => n.remove());
  }
  await writeFile(`${evidence}/animation-profile-audit.json`, JSON.stringify({ isolatedArtFixture: true, generatedParkingContract: { width: 38, height: 52, nearest: true, reused: true }, count: results.length, results }, null, 2));
});

test("F23 actual walking, destination change, obstacle clearance, distance cadence and idle", async ({ page }) => {
  test.setTimeout(60000); await page.goto("/"); await enterLobby(page, "subway", "groom");
  const start = Date.now();
  await page.evaluate(() => {
    const samples: unknown[] = []; (window as unknown as { walks: unknown[] }).walks = samples;
    const owner = (window.__venueQaGame as Phaser.Game).scene.getScene("VenueLobbyScene");
    const record = () => {
      const player = owner.children.list.find(c => "isMoving" in c) as Phaser.GameObjects.Container & { isMoving(): boolean };
      const sprite = player.list[0] as Phaser.GameObjects.Sprite;
      samples.push({ at: performance.now(), x: player.x, y: player.y, moving: player.isMoving(), texture: sprite.texture.key, frame: sprite.frame.name, origin: sprite.originY, localY: sprite.y });
    }; owner.events.on("postupdate", record);
  });
  await clickGame(page, 455, 410); await page.waitForTimeout(350);
  await page.screenshot({ path: `${evidence}/f23-walking.png` });
  // Real CSS taps are quantized by the browser; keep the established floor test's <3 world-pixel arrival criterion.
  const arrived = async (x: number, y: number) => expect.poll(async () => {
    const value = await page.evaluate(() => window.__venuePlayerSnapshot());
    return Boolean(value && !value.moving && Math.hypot(value.x - x, value.y - y) < 3);
  }, { timeout: 12000 }).toBe(true);
  await clickGame(page, 230, 1000);
  await arrived(230, 1000);
  await clickGame(page, 455, 410); await arrived(455, 410);
  await clickGame(page, 360, 1060); await arrived(360, 1060);
  await page.screenshot({ path: `${evidence}/f23-stopped.png` });
  const samples = await page.evaluate(() => (window as unknown as { walks: { at: number; x: number; y: number; moving: boolean; texture: string; frame: string; origin: number; localY: number }[] }).walks);
  expect(samples.every(s => insideFloor({ x: s.x, y: s.y + 48 }, LOBBY_FLOOR))).toBe(true);
  expect(samples.every(s => s.origin === 1 && s.localY === 48)).toBe(true);
  expect(new Set(samples.filter(s => s.moving && s.texture.includes("-walk-")).map(s => s.frame)).size).toBeGreaterThan(2);
  expect(samples.at(-1)!.texture).not.toContain("-walk-");
  // An isolated deterministic movement fixture checks frame-rate independence on the same class.
  const fps = await page.evaluate(async () => {
    const path = "/src/objects/Player.ts"; const { Player } = await import(path) as typeof import("../src/objects/Player");
    const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("VenueLobbyScene");
    return [10, 50, 250].map(delta => {
      const player = new Player(scene, { x: 360, y: 1000, speed: 240 }); player.setVisible(false);
      player.walkPath([{ x: 400, y: 1000 }, { x: 400, y: 1200 }]);
      for (let t = 0; t < 500; t += delta) player.updateMovement(delta);
      const sprite = player.list[0] as Phaser.GameObjects.Sprite;
      const value = { delta, x: player.x, y: player.y, frame: sprite.frame.name }; player.destroy(); return value;
    });
  });
  for (const result of fps) { expect(result.x).toBeCloseTo(400, 8); expect(result.y).toBeCloseTo(1080, 8); expect(result.frame).toBe(fps[0]!.frame); }
  await writeFile(`${evidence}/walking-observations.json`, JSON.stringify({ start, samples, isolatedFPSFixture: fps, video: await page.video()?.path() }, null, 2));
});

for (const reaction of ["applause", "cheer"] as const) test(`C-P01 ${reaction}: uninterrupted normal response into one group photo`, async ({ page }) => {
  test.setTimeout(100000); const start = Date.now(); const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message)); page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
  await page.goto("/"); const side = reaction === "applause" ? "bride" : "groom";
  await enterLobby(page, side === "bride" ? "car" : "subway", side);
  await clickGame(page, 360, 420); await receiveEnvelope(page); await completeLobbyTours(page);
  if (side === "bride") { await clickGame(page, 590, 990); await takeBridalPhoto(page); }
  await clickGame(page, 590, 150); await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "VenueHallScene");
  const clipStart = Date.now() - start;
  await chooseStory(page, reaction === "applause" ? "박수를 친다" : "환호를 한다");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-ceremony-stage", "reaction");
  await page.screenshot({ path: `${evidence}/cp01-${reaction}.png` });
  await expect(page.locator("#app canvas")).toHaveAttribute("data-ceremony-stage", "group-photo");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-group-photo-entry-count", "1");
  const times = await page.locator("#app canvas").evaluate(n => ({ start: Number(n.dataset.ceremonyReactionStartedAt), end: Number(n.dataset.ceremonyReactionEndedAt) }));
  expect(times.end - times.start).toBeGreaterThanOrEqual(1200); expect(times.end - times.start).toBeLessThan(1800);
  await page.waitForTimeout(1200); await page.screenshot({ path: `${evidence}/cp01-${reaction}-group.png` });
  expect(errors).toEqual([]);
  await writeFile(`${evidence}/normal-${reaction}.json`, JSON.stringify({ start, clipStart, clipEnd: Date.now() - start, times, invitationDuringClip: false, errors, video: await page.video()?.path() }, null, 2));
});
