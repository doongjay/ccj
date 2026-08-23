import Phaser from 'phaser';

/** Draws a subtle checkerboard tile pattern instead of a flat rectangle — a small
 *  step toward "tiled floor" without needing a real tileset yet (Phase 5 placeholder). */
export function drawPixelFloor(
  scene: Phaser.Scene,
  width: number,
  height: number,
  cellSize: number,
  baseColor: number,
  shadeColor: number,
) {
  scene.add.rectangle(width / 2, height / 2, width, height, baseColor);

  const graphics = scene.add.graphics();
  graphics.fillStyle(shadeColor, 0.25);
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if ((row + col) % 2 === 0) {
        graphics.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }
}
