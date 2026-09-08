import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

type PlayerSnapshot = Readonly<{
  scene: string | undefined;
  x: number;
  y: number;
  moving: boolean;
  pointerY: number;
}>;

declare global {
  interface Window {
    __venueQaGame: unknown;
    __venuePlayerSnapshot: () => PlayerSnapshot | null;
  }
}

export async function installPlayerObservation(page: Page): Promise<void> {
  await page.route((url) => url.pathname === "/src/main.ts", async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    expect(body.split("new Phaser.Game(")).toHaveLength(2);
    await route.fulfill({ response, body: body.replace("new Phaser.Game(", "window.__venueQaGame = new Phaser.Game(") });
  });
  await page.addInitScript(() => {
    window.__venuePlayerSnapshot = () => {
      const game = window.__venueQaGame;
      if (typeof game !== "object" || game === null || !("scene" in game)) return null;
      const manager = game.scene;
      if (typeof manager !== "object" || manager === null || !("getScenes" in manager)
        || typeof manager.getScenes !== "function") return null;
      const scenes: unknown = manager.getScenes(true);
      if (!Array.isArray(scenes)) return null;
      for (const entry of scenes) {
        const scene: unknown = entry;
        if (typeof scene !== "object" || scene === null || !("children" in scene)) continue;
        const children = scene.children;
        if (!("input" in scene) || typeof scene.input !== "object" || scene.input === null
          || !("activePointer" in scene.input)) continue;
        const pointer = scene.input.activePointer;
        if (typeof pointer !== "object" || pointer === null || !("worldY" in pointer)
          || typeof pointer.worldY !== "number") continue;
        if (typeof children !== "object" || children === null || !("list" in children)
          || !Array.isArray(children.list)) continue;
        for (const item of children.list) {
          const player: unknown = item;
          if (typeof player !== "object" || player === null || !("x" in player)
            || !("y" in player) || !("isMoving" in player) || typeof player.x !== "number"
            || typeof player.y !== "number" || typeof player.isMoving !== "function") continue;
          const moving: unknown = player.isMoving();
          if (typeof moving !== "boolean") continue;
          return { scene: document.querySelector("canvas")?.dataset.activeScene,
            x: player.x, y: player.y, moving, pointerY: pointer.worldY };
        }
      }
      return null;
    };
  });
}

export async function expectCorridorPosition(page: Page, x: number, y: number): Promise<void> {
  await expect.poll(() => page.evaluate(() => window.__venuePlayerSnapshot())).toMatchObject({
    scene: "GreeneryCorridorScene", x, y, moving: false,
  });
}
