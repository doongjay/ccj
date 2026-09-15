import Phaser from "phaser";
import { partCanvas } from "./minimiParts";

/** Keep the couple at guest-sprite resolution instead of reducing their faces to 32×48. */
export function buildWeddingCoupleTextures(scene: Phaser.Scene): void {
  const image = scene.textures.get("wedding-couple-sheet").getSourceImage() as HTMLImageElement;
  const source = partCanvas(image.width, image.height);
  const context = source.getContext("2d")!;
  context.drawImage(image, 0, 0);
  const data = context.getImageData(0, 0, image.width, image.height);
  const pixels = data.data;
  // The image master uses a flat chroma matte; discard it only in the runtime texture.
  for (let offset = 0; offset < pixels.length; offset += 4) {
    const [red, green, blue] = pixels.slice(offset, offset + 3);
    if (green > 160 && green - red > 70 && green - blue > 70) pixels[offset + 3] = 0;
  }
  context.putImageData(data, 0, 0);
  // The separating gutter is left of center because the bride's full skirt is wider.
  const split = Math.round(image.width * 0.44);
  for (const [key, start, end] of [["npc-groom", 0, split], ["npc-bride", split, image.width]] as const) {
    let left = end, right = start, top = image.height, bottom = 0;
    for (let y = 0; y < image.height; y++) for (let x = start; x < end; x++) {
      if (pixels[(y * image.width + x) * 4 + 3] < 128) continue;
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
    const width = right - left + 1, height = bottom - top + 1;
    const scale = Math.min(180 / height, 120 / width);
    const drawnWidth = Math.round(width * scale), drawnHeight = Math.round(height * scale);
    const texture = scene.textures.createCanvas(key, 128, 192)!;
    texture.context.imageSmoothingEnabled = false;
    texture.context.drawImage(source, left, top, width, height, Math.round((128 - drawnWidth) / 2), 184 - drawnHeight, drawnWidth, drawnHeight);
    // These standing NPCs retain the existing numeric-frame API used by scene helpers.
    for (let frame = 0; frame < 16; frame++) texture.add(frame, 0, 0, 0, 128, 192);
    texture.refresh().setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}
