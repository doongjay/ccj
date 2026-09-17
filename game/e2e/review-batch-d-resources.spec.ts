import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { writeFile } from "node:fs/promises";
import { enterLobby, clickGame, returnFromPhoto } from "./story-helpers";
import { installPlayerObservation } from "./corridor-observables";
import { REVIEW_EVIDENCE as evidence } from "./review-evidence";

test("D resource revisit: two real play/restart cycles reuse textures, photos and native motion listeners", async ({ page }) => {
  test.setTimeout(100000); await installPlayerObservation(page);
  await page.addInitScript(() => {
    const counts = new Map<MediaQueryList, Set<EventListenerOrEventListenerObject>>();
    const add = MediaQueryList.prototype.addEventListener, remove = MediaQueryList.prototype.removeEventListener;
    MediaQueryList.prototype.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
      if (type === "change" && listener) { if (!counts.has(this)) counts.set(this, new Set()); counts.get(this)!.add(listener); }
      if (listener) return add.call(this, type, listener, options);
    };
    MediaQueryList.prototype.removeEventListener = function(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions) {
      if (type === "change" && listener) counts.get(this)?.delete(listener);
      if (listener) return remove.call(this, type, listener, options);
    };
    (window as unknown as { motionListeners: () => number }).motionListeners = () => [...counts.values()].reduce((n, set) => n + set.size, 0);
  });
  await page.setViewportSize({ width: 393, height: 852 }); await page.goto("/");
  const observations: { textures: string[]; listeners: number; photos: string | undefined; overlays: number; controls: number; pixelBytes: number }[] = [];
  for (let cycle = 0; cycle < 2; cycle++) {
    await enterLobby(page, "car", "groom"); await clickGame(page, 130, 590);
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "PhotoBoothScene");
    await clickGame(page, 360, 860); await returnFromPhoto(page);
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "VenueLobbyScene");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-ready", "true");
    await clickGame(page, 128, 60); await expect(page.locator(".notebook-keepsakes canvas")).toHaveCount(1); await page.keyboard.press("Escape");
    // Let the lobby's scheduled background requests finish in BOTH cycles before
    // comparing retained textures. Opening the invitation pauses that scene timer.
    await expect.poll(() => page.evaluate(async () => {
      const path = "/src/data/runtimeAssets.ts";
      const { ASSET_STAGES } = await import(path) as typeof import("../src/data/runtimeAssets");
      const game = window.__venueQaGame as Phaser.Game;
      return [...ASSET_STAGES.hall, ...ASSET_STAGES.reception].filter(key => !game.textures.exists(key));
    }), { timeout: 15000 }).toEqual([]);
    await page.getByRole("button", { name: "청첩장", exact: true }).click();
    await page.getByRole("button", { name: "게임으로", exact: true }).click();
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "VenueLobbyScene");
    // The invitation footer now shares the invitation. Exercise the same restart
    // lifecycle directly after verifying that the remaining navigation resumes play.
    await page.evaluate(async () => {
      const path = "/src/state/checkpoint.ts";
      const { restartVisit } = await import(path) as typeof import("../src/state/checkpoint");
      const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("VenueLobbyScene");
      restartVisit(scene); scene.scene.start("IntroScene");
    });
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    await page.waitForTimeout(100);
    observations.push(await page.evaluate(() => {
      const game = window.__venueQaGame as Phaser.Game;
      const textures = game.textures.getTextureKeys().sort();
      return { textures, listeners: (window as unknown as { motionListeners: () => number }).motionListeners(), photos: game.canvas.dataset.sessionKeepsakeCount, overlays: document.querySelectorAll(".story-overlay").length, controls: document.querySelectorAll(".canvas-keyboard-button").length, pixelBytes: textures.reduce((sum, key) => { const image = game.textures.get(key).getSourceImage(); return sum + image.width * image.height * 4; }, 0) };
    }));
  }
  // Phaser Text creates fresh UUID textures per scene. Compare their count/bytes, and require old IDs to be released.
  const transient = (key: string) => /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(key);
  const stable = (value: typeof observations[number]) => ({ ...value, textures: value.textures.filter(key => !transient(key)), textTextureCount: value.textures.filter(transient).length });
  expect(stable(observations[1]!)).toEqual(stable(observations[0]!));
  expect(observations[1]!.textures.filter(transient).some(key => observations[0]!.textures.includes(key))).toBe(false);
  expect(observations[1]!.photos).toBe("0"); expect(observations[1]!.overlays).toBe(0);
  await writeFile(`${evidence}/resource-revisit.json`, JSON.stringify({ observations, note: "Equal finite texture keys/decoded-pixel accounting and native listener counts after actual same-profile restart. This is not a whole-browser memory certification." }, null, 2));
});
