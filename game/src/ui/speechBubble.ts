import type Phaser from "phaser";
import { uiWorldSize } from "./sceneUi";

/** Short pixel tails identify the speaker without covering a face. */
export function speechBubble(scene: Phaser.Scene, x: number, y: number, copy: string, fromAbove = false, size: 1 | 0.5 = 1): Phaser.GameObjects.Text {
  // Draw at the requested pixel size instead of scaling a finished text bitmap.
  const pixel = (value: number) => Math.round(value * size);
  const label = scene.add.text(x, y, copy, {
    fontFamily: "Galmuri11, monospace", fontSize: `${pixel(Math.max(32, uiWorldSize(scene, 14)))}px`,
    color: fromAbove ? "#725136" : "#fffaf2", backgroundColor: fromAbove ? "#fff9ef" : "#1e2920",
    padding: { x: pixel(12), y: pixel(8) }, resolution: 2,
  }).setOrigin(0.5).setDepth(32);
  const tail = scene.add.graphics().setDepth(31);
  const edge = y + (fromAbove ? -1 : 1) * label.height / 2;
  const steps = Array.from({ length: 3 }, (_, step) => ({
    x: x - pixel(8) + step * pixel(2), y: edge + (fromAbove ? -pixel(4) * (step + 1) : pixel(4) * step), width: pixel(12 - step * 4),
  }));
  // Outline the body and stepped tail together, with no seam at their join.
  const border = pixel(Math.max(4, Math.round(uiWorldSize(scene, 2))));
  tail.fillStyle(fromAbove ? 0x26332a : 0xc8a24b);
  tail.fillRect(x - label.width / 2 - border, y - label.height / 2 - border,
    label.width + border * 2, label.height + border * 2);
  for (const step of steps) tail.fillRect(step.x - border, step.y - border, step.width + border * 2, pixel(4) + border * 2);
  tail.fillStyle(fromAbove ? 0xfff9ef : 0x1e2920);
  for (const step of steps) tail.fillRect(step.x, step.y, step.width, pixel(4));
  label.once("destroy", () => tail.destroy());
  return label;
}
