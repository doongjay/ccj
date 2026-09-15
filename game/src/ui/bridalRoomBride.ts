import type Phaser from "phaser";

/** Same existing bride texture and guest-size placement in the room and keepsake. */
export const BRIDAL_ROOM_BRIDE = { texture: "npc-bride", x: 552, feet: 475, width: 64, height: 96 } as const;

export function addBridalRoomBride(scene: Phaser.Scene): void {
  const bride = BRIDAL_ROOM_BRIDE;
  scene.add.image(bride.x, bride.feet, bride.texture, 0).setOrigin(0.5, 1)
    .setDisplaySize(bride.width, bride.height).setDepth(1).setName("bridal-room-bride");
}

export function drawBridalRoomBride(scene: Phaser.Scene, context: CanvasRenderingContext2D, crop: { x: number; y: number }, scale: number): void {
  const bride = BRIDAL_ROOM_BRIDE;
  const texture = scene.textures.get(bride.texture), frame = texture.get(0);
  context.drawImage(texture.getSourceImage() as CanvasImageSource, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight,
    (bride.x - bride.width / 2 - crop.x) * scale, (bride.feet - bride.height - crop.y) * scale,
    bride.width * scale, bride.height * scale);
}
