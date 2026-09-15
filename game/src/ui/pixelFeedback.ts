import { reducedMotion, watchMotion } from "./motionPreference";
import type Phaser from "phaser";

export function createPixelHeart(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Graphics {
  const heart = scene.add.graphics().setPosition(Math.round(x), Math.round(y)).setDepth(40);
  heart.fillStyle(0x59393f).fillRect(-10, -4, 8, 4).fillRect(2, -4, 8, 4).fillRect(-14, 0, 28, 8).fillRect(-10, 8, 20, 4).fillRect(-6, 12, 12, 4).fillRect(-2, 16, 4, 4);
  heart.fillStyle(0xed9aaa).fillRect(-8, 0, 6, 4).fillRect(2, 0, 6, 4).fillRect(-10, 4, 20, 4).fillRect(-6, 8, 12, 4).fillRect(-2, 12, 4, 4);
  heart.fillStyle(0xffdfdf).fillRect(-6, 1, 3, 3);
  return heart;
}

export function showPixelHeart(scene: Phaser.Scene, x: number, y: number): void {
  const heart = createPixelHeart(scene, x, y);
  if (reducedMotion()) {
    scene.time.delayedCall(1000, () => heart.destroy());
    return;
  }
  const tween = scene.tweens.add({ targets: heart, y: y - 32, alpha: 0, delay: 400, duration: 800, ease: "Sine.easeOut", onComplete: () => heart.destroy() });
  let settled = false;
  const stop = watchMotion(scene, () => {
    if (!reducedMotion() || settled) return;
    settled = true; tween.remove(); heart.setPosition(Math.round(x), Math.round(y)).setAlpha(1);
    scene.time.delayedCall(1000, () => heart.destroy());
  });
  heart.once("destroy", stop);
}
