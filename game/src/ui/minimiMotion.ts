import Phaser from "phaser";
import { buildMinimiTextures, minimiTextureKey, type MinimiProfile } from "./minimi";
import { partCanvas } from "./minimiParts";

const directions = ["down", "left", "right", "up"] as const;
function frame(scene: Phaser.Scene, profile: MinimiProfile, pose: string): HTMLCanvasElement {
  buildMinimiTextures(scene, profile);
  const texture = scene.textures.get(minimiTextureKey(profile)), cut = texture.get(`${profile.outfit}-${profile.hair}-${pose}`);
  const canvas = partCanvas();
  canvas.getContext("2d")!.drawImage(texture.getSourceImage() as HTMLCanvasElement, cut.cutX, cut.cutY, 128, 192, 0, 0, 128, 192);
  return canvas;
}
const keyFor = (kind: string, profile: MinimiProfile) => `minimi-${kind}-${profile.gender}-${profile.face ?? 0}-${profile.hair}-${profile.outfit}`;

/** Two leg poses per direction. All displacements are integer source pixels; head/torso and pivot stay fixed. */
export function walkingTexture(scene: Phaser.Scene, profile: MinimiProfile): string {
  const key = keyFor("walk", profile);
  if (scene.textures.exists(key)) return key;
  const atlas = scene.textures.createCanvas(key, 1024, 192)!;
  atlas.context.imageSmoothingEnabled = false;
  for (const [direction, pose] of directions.entries()) {
    const source = frame(scene, profile, pose);
    for (let step = 0; step < 2; step++) {
      const tile = partCanvas(), context = tile.getContext("2d")!;
      context.drawImage(source, 0, 0, 128, 142, 0, 0, 128, 142);
      for (let y = 142; y < 192; y++) for (let leg = 0; leg < 2; leg++) {
        const amount = Math.min(1, (y - 142) / 38);
        const side = pose === "left" || pose === "right";
        const dx = side ? Math.round((leg ? -1 : 1) * step * 14 * amount) : Math.round((leg ? 1 : -1) * 3 * amount);
        const dy = side ? 0 : (leg === step ? -Math.round(7 * amount) : 0);
        context.drawImage(source, leg * 64, y, 64, 1, leg * 64 + dx, y + dy, 64, 1);
      }
      const x = (direction * 2 + step) * 128;
      atlas.context.drawImage(tile, x, 0); atlas.add(`${pose}-${step}`, 0, x, 0, 128, 192);
    }
  }
  atlas.refresh().setFilter(Phaser.Textures.FilterMode.NEAREST);
  return key;
}

/** Reuse the selected outfit's complete authored bent-arm pose, with its native head, feet and pivot. */
export function clappingTexture(scene: Phaser.Scene, profile: MinimiProfile): string {
  const key = keyFor("clap", profile);
  if (scene.textures.exists(key)) return key;
  const bent = frame(scene, profile, "seated");
  const atlas = scene.textures.createCanvas(key, 256, 192)!;
  atlas.context.imageSmoothingEnabled = false;
  for (let step = 0; step < 2; step++) {
    const tile = partCanvas(), context = tile.getContext("2d")!;
    context.drawImage(bent, 0, 0);
    context.clearRect(0, 82, 128, 60);
    // A continuous authored torso avoids cutting notches through coats and skirts.
    context.drawImage(bent, 48, 82, 32, 60, 48, 82, 32, 60);
    for (let y = 82; y < 142; y++) {
      const bend = Math.max(0, 1 - Math.abs(y - 118) / 22);
      const shift = Math.round((step ? -4 : 3) * bend);
      context.drawImage(bent, 0, y, 64, 1, shift, y, 64, 1);
      context.drawImage(bent, 64, y, 64, 1, 64 - shift, y, 64, 1);
    }
    atlas.context.drawImage(tile, step * 128, 0); atlas.add(step, 0, step * 128, 0, 128, 192);
  }
  atlas.refresh().setFilter(Phaser.Textures.FilterMode.NEAREST);
  return key;
}
