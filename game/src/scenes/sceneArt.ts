import type Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import type { ImageKey } from "../data/assetManifest";

export function sceneArt(scene: Phaser.Scene, key: ImageKey, x = GAME_WIDTH / 2, y = GAME_HEIGHT / 2, width = GAME_WIDTH, height = GAME_HEIGHT): Phaser.GameObjects.Image {
  if (!scene.textures.exists(key)) {
    throw new Error(`Missing scene texture: ${key}`);
  }
  return scene.add.image(x, y, key).setDisplaySize(width, height).setDepth(-1);
}
