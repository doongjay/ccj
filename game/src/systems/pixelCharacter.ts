import Phaser from 'phaser';

export type PixelCharacterKeys = {
  idle: string;
  walk: string; // animation key
};

export type PixelCharacterPalette = {
  hair: number;
  skin: number;
  outfit: number;
};

export const PLAYER_PALETTE: PixelCharacterPalette = { hair: 0x4a3728, skin: 0xf2c9a1, outfit: 0xe0728f };
export const BRIDE_PALETTE: PixelCharacterPalette = { hair: 0x3a2a20, skin: 0xf5d5b0, outfit: 0xfaf3ea };

const PIXEL_SIZE = 3;
const GRID_W = 12;
const GRID_H = 16;
const LEG_COLOR = 0x2b2b2b;

type LegPose = 'together' | 'left' | 'right';

function drawFrame(scene: Phaser.Scene, textureKey: string, palette: PixelCharacterPalette, legPose: LegPose) {
  if (scene.textures.exists(textureKey)) return;

  const graphics = scene.add.graphics();
  const block = (col: number, row: number, w: number, h: number, color: number) => {
    graphics.fillStyle(color, 1);
    graphics.fillRect(col * PIXEL_SIZE, row * PIXEL_SIZE, w * PIXEL_SIZE, h * PIXEL_SIZE);
  };

  block(2, 0, 8, 3, palette.hair); // hair
  block(3, 3, 6, 3, palette.skin); // face
  block(2, 6, 8, 5, palette.outfit); // torso
  block(1, 7, 1, 3, palette.outfit); // left arm
  block(10, 7, 1, 3, palette.outfit); // right arm

  if (legPose === 'together') {
    block(3, 11, 2, 4, LEG_COLOR);
    block(7, 11, 2, 4, LEG_COLOR);
  } else if (legPose === 'left') {
    block(3, 10, 2, 5, LEG_COLOR);
    block(7, 12, 2, 3, LEG_COLOR);
  } else {
    block(3, 12, 2, 3, LEG_COLOR);
    block(7, 10, 2, 5, LEG_COLOR);
  }

  graphics.generateTexture(textureKey, GRID_W * PIXEL_SIZE, GRID_H * PIXEL_SIZE);
  graphics.destroy();
  scene.textures.get(textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
}

/** Generates a small blocky pixel-art character (idle + 2-frame walk cycle) since no
 *  real sprite art exists yet — a step up from a plain placeholder circle. Textures/
 *  animations are cached per scene by name, so calling this again is cheap. */
export function ensurePixelCharacter(
  scene: Phaser.Scene,
  name: string,
  palette: PixelCharacterPalette,
): PixelCharacterKeys {
  const idleKey = `${name}-idle`;
  const walkAKey = `${name}-walk-a`;
  const walkBKey = `${name}-walk-b`;
  const walkAnimKey = `${name}-walk`;

  drawFrame(scene, idleKey, palette, 'together');
  drawFrame(scene, walkAKey, palette, 'left');
  drawFrame(scene, walkBKey, palette, 'right');

  if (!scene.anims.exists(walkAnimKey)) {
    scene.anims.create({
      key: walkAnimKey,
      frames: [
        { key: walkAKey, frame: '__BASE' },
        { key: idleKey, frame: '__BASE' },
        { key: walkBKey, frame: '__BASE' },
        { key: idleKey, frame: '__BASE' },
      ],
      frameRate: 6,
      repeat: -1,
    });
  }

  return { idle: idleKey, walk: walkAnimKey };
}
