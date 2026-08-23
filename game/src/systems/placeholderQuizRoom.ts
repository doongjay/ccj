import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PIXEL_FONT } from '../config';
import { Grid } from './Grid';
import { TapToMove } from './TapToMove';
import { TriggerZone } from './TriggerZone';
import { QuizModal } from './QuizModal';
import { ensurePixelCharacter, PLAYER_PALETTE } from './pixelCharacter';
import { drawPixelFloor } from './pixelFloor';
import type { Quiz } from '../data/scenario';

const CELL_SIZE = 80;
const COLS = GAME_WIDTH / CELL_SIZE;
const ROWS = GAME_HEIGHT / CELL_SIZE;

/** Placeholder room shared by CarRouteScene/SubwayRouteScene until real maps exist (Phase 5):
 *  walk up to a labeled zone, answer its quiz, then fade into the next scene on a correct answer. */
export function buildPlaceholderQuizRoom(
  scene: Phaser.Scene,
  options: {
    title: string;
    zoneLabel: string;
    quiz: Quiz;
    nextSceneKey: string;
  },
) {
  const walkable: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(true));
  const grid = new Grid({ cols: COLS, rows: ROWS, cellSize: CELL_SIZE, originX: 0, originY: 0, walkable });

  drawPixelFloor(scene, GAME_WIDTH, GAME_HEIGHT, CELL_SIZE, 0x2b2f3a, 0x000000);
  scene.add
    .text(GAME_WIDTH / 2, 60, options.title, {
      fontFamily: PIXEL_FONT,
      fontSize: '26px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: GAME_WIDTH - 80 },
    })
    .setOrigin(0.5);

  const playerAnims = ensurePixelCharacter(scene, 'player', PLAYER_PALETTE);
  const start = grid.cellToWorld(13, 4);
  const player = scene.physics.add.sprite(start.x, start.y, playerAnims.idle);
  player.setCollideWorldBounds(true);

  const tapToMove = new TapToMove(scene, grid, player, playerAnims);

  const zoneCenter = grid.cellToWorld(4, 4);
  const zoneWidth = 3 * CELL_SIZE;
  const zoneHeight = 2 * CELL_SIZE;
  scene.add.rectangle(zoneCenter.x, zoneCenter.y, zoneWidth, zoneHeight, 0xf2a65a, 0.35).setStrokeStyle(2, 0xf2a65a);
  scene.add
    .text(zoneCenter.x, zoneCenter.y, options.zoneLabel, {
      fontFamily: PIXEL_FONT,
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: zoneWidth - 10 },
    })
    .setOrigin(0.5);

  new TriggerZone(scene, player, zoneCenter.x, zoneCenter.y, zoneWidth, zoneHeight, () => {
    tapToMove.setEnabled(false);

    new QuizModal(scene, options.quiz, () => {
      scene.cameras.main.fadeOut(300, 0, 0, 0);
      scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        scene.scene.start(options.nextSceneKey);
      });
    });
  });
}
