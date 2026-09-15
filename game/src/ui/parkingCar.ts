import Phaser from "phaser";

/** One code-authored 38×52 top-down icon, shared by moving and parked map cars. */
export function parkingCarTexture(scene: Phaser.Scene): string {
  const key = "parking-map-car";
  if (scene.textures.exists(key)) return key;
  const art = scene.make.graphics({ x: 0, y: 0 });
  art.fillStyle(0x293c36).fillRect(0, 9, 5, 11).fillRect(33, 9, 5, 11).fillRect(0, 34, 5, 10).fillRect(33, 34, 5, 10);
  art.fillStyle(0xeeeade).fillRect(5, 0, 28, 52).fillRect(3, 4, 32, 44);
  art.fillStyle(0x3d5b5a).fillRect(7, 13, 24, 7).fillRect(8, 37, 22, 6);
  art.fillStyle(0xc2c8bd).fillRect(5, 21, 3, 15).fillRect(30, 21, 3, 15);
  art.fillStyle(0xfff2c2).fillRect(5, 2, 6, 3).fillRect(27, 2, 6, 3);
  art.fillStyle(0xb97371).fillRect(5, 47, 6, 3).fillRect(27, 47, 6, 3);
  art.generateTexture(key, 38, 52); art.destroy();
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
  return key;
}
