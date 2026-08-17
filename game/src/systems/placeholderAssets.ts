import Phaser from 'phaser';

/** Generates a simple colored-circle texture once, for placeholder art before real sprites exist. */
export function ensureCircleTexture(scene: Phaser.Scene, key: string, radius: number, color: number) {
  if (scene.textures.exists(key)) return;

  const graphics = scene.add.graphics();
  graphics.fillStyle(color, 1);
  graphics.fillCircle(radius, radius, radius);
  graphics.generateTexture(key, radius * 2, radius * 2);
  graphics.destroy();
}
