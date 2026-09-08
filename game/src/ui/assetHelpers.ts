import Phaser from "phaser";
import { ASSET_MANIFEST, characterAnimationKey, type ImageKey } from "../data/assetManifest";

export function registerCharacterAnimations(scene: Phaser.Scene): void {
  for (const asset of ASSET_MANIFEST) {
    if (asset.kind !== "spritesheet") continue;
    for (const [row, direction] of asset.rows.entries()) {
      for (const motion of ["idle", "walk"] as const) {
        const key = characterAnimationKey(asset.key, direction, motion);
        if (scene.anims.exists(key)) continue;
        const start = row * asset.columns + (motion === "idle" ? 0 : 1);
        scene.anims.create({ key, frames: scene.anims.generateFrameNumbers(asset.key, {
          start, end: motion === "idle" ? start : row * asset.columns + 3,
        }), frameRate: motion === "idle" ? 1 : 8, repeat: motion === "idle" ? 0 : -1 });
      }
    }
  }
}

export function createAssetBackground(scene: Phaser.Scene, key: ImageKey): Phaser.GameObjects.Image {
  return scene.add.image(0, 0, key).setOrigin(0).setDisplaySize(720, 1280).setDepth(-100);
}

export async function loadGameFont(canvas: HTMLCanvasElement): Promise<void> {
  canvas.dataset.fontLoadState = "loading";
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const loaded = await Promise.race([
      document.fonts.load('24px "Galmuri11"', "초대장 양재시민의숲역"),
      new Promise<readonly FontFace[]>((resolve) => { timeout = setTimeout(() => resolve([]), 5000); }),
    ]);
    canvas.dataset.fontLoadState = loaded.length > 0 ? "complete" : "fallback";
  } catch (error: unknown) {
    if (!(error instanceof Error)) throw error;
    canvas.dataset.fontLoadState = "fallback";
    canvas.dataset.fontLoadError = error.message;
  } finally {
    clearTimeout(timeout);
  }
}
