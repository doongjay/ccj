import type { Page } from "@playwright/test";
import type Phaser from "phaser";
import type { SceneKey } from "../src/state/gameState";

/** Isolated scene tests must use the same asset gate as real scene transitions. */
export async function startPreparedScene(page: Page, target: SceneKey): Promise<void> {
  await page.evaluate(async target => {
    const modulePath = "/src/systems/stageAssets.ts";
    const { ensureSceneAssets } = await import(modulePath) as typeof import("../src/systems/stageAssets");
    const game = window.__venueQaGame as Phaser.Game;
    const owner = game.scene.getScenes(true)[0]!;
    await ensureSceneAssets(owner, target);
    owner.scene.start(target);
  }, target);
}

/** Exhaustive art assertions explicitly build their audit profiles, never at game startup. */
export async function prepareMinimiAudit(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const loaderPath = "/src/systems/stageAssets.ts", minimiPath = "/src/ui/minimi.ts";
    const { ensureAvatarAssets } = await import(loaderPath) as typeof import("../src/systems/stageAssets");
    const { buildMinimiTextures } = await import(minimiPath) as typeof import("../src/ui/minimi");
    const scene = (window.__venueQaGame as Phaser.Game).scene.getScenes(true)[0]!;
    for (const gender of ["male", "female"] as const) {
      await ensureAvatarAssets(scene, gender);
      for (let face = 0; face < 3; face++) for (let outfit = 0; outfit < 6; outfit++) for (let hair = 0; hair < 3; hair++) {
        buildMinimiTextures(scene, { gender, face, outfit, hair });
      }
    }
  });
}
