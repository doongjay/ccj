import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Grid } from './Grid';
import { TapToMove } from './TapToMove';
import { TriggerZone } from './TriggerZone';
import { QuizModal } from './QuizModal';
import { ensureCircleTexture } from './placeholderAssets';
import type { Quiz } from '../data/scenario';

const CELL_SIZE = 80;
const COLS = GAME_WIDTH / CELL_SIZE;
const ROWS = GAME_HEIGHT / CELL_SIZE;
const PLAYER_TEXTURE = 'player-placeholder';

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

  scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x2b2f3a);
  scene.add
    .text(GAME_WIDTH / 2, 60, options.title, {
      fontSize: '26px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: GAME_WIDTH - 80 },
    })
    .setOrigin(0.5);

  ensureCircleTexture(scene, PLAYER_TEXTURE, 24, 0xff6fa8);
  const start = grid.cellToWorld(13, 4);
  const player = scene.physics.add.sprite(start.x, start.y, PLAYER_TEXTURE);
  player.setCollideWorldBounds(true);

  const tapToMove = new TapToMove(scene, grid, player);

  const zoneCenter = grid.cellToWorld(4, 4);
  const zoneWidth = 3 * CELL_SIZE;
  const zoneHeight = 2 * CELL_SIZE;
  scene.add.rectangle(zoneCenter.x, zoneCenter.y, zoneWidth, zoneHeight, 0xf2a65a, 0.35).setStrokeStyle(2, 0xf2a65a);
  scene.add
    .text(zoneCenter.x, zoneCenter.y, options.zoneLabel, {
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
