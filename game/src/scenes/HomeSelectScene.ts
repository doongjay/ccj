import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Grid } from '../systems/Grid';
import { TapToMove } from '../systems/TapToMove';
import { TriggerZone } from '../systems/TriggerZone';
import { ensureCircleTexture } from '../systems/placeholderAssets';

const CELL_SIZE = 80;
const COLS = GAME_WIDTH / CELL_SIZE; // 9
const ROWS = GAME_HEIGHT / CELL_SIZE; // 16

const PLAYER_TEXTURE = 'player-placeholder';

export class HomeSelectScene extends Phaser.Scene {
  private tapToMove?: TapToMove;

  constructor() {
    super('HomeSelectScene');
  }

  create() {
    const walkable: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(true));
    // Placeholder obstacle in the middle, so tap-to-move has to path around something.
    for (let row = 6; row <= 9; row++) {
      for (let col = 3; col <= 5; col++) {
        walkable[row][col] = false;
      }
    }

    const grid = new Grid({
      cols: COLS,
      rows: ROWS,
      cellSize: CELL_SIZE,
      originX: 0,
      originY: 0,
      walkable,
    });

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x2f3b2f);
    this.drawObstacle(walkable);

    this.add
      .text(GAME_WIDTH / 2, 60, '집 앞 — 어떻게 가시겠어요?', {
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    ensureCircleTexture(this, PLAYER_TEXTURE, 24, 0xff6fa8);
    const start = grid.cellToWorld(13, 4);
    const player = this.physics.add.sprite(start.x, start.y, PLAYER_TEXTURE);
    player.setCollideWorldBounds(true);

    this.tapToMove = new TapToMove(this, grid, player);

    this.createRouteZone(grid, player, '자차로 간다', 1, 3, 2, 2, 0xf2c14e, () =>
      this.selectRoute(player, 'car', 'CarRouteScene'),
    );

    this.createRouteZone(grid, player, '지하철을 타고 간다', 6, 3, 2, 2, 0x4ea1f2, () =>
      this.selectRoute(player, 'subway', 'SubwayRouteScene'),
    );
  }

  private drawObstacle(walkable: boolean[][]) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1f1a, 1);
    for (let row = 0; row < walkable.length; row++) {
      for (let col = 0; col < walkable[row].length; col++) {
        if (!walkable[row][col]) {
          graphics.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }

  private createRouteZone(
    grid: Grid,
    player: Phaser.Physics.Arcade.Sprite,
    label: string,
    col: number,
    row: number,
    widthInCells: number,
    heightInCells: number,
    color: number,
    onEnter: () => void,
  ) {
    const topLeft = grid.cellToWorld(row, col);
    const width = widthInCells * CELL_SIZE;
    const height = heightInCells * CELL_SIZE;
    const centerX = topLeft.x - CELL_SIZE / 2 + width / 2;
    const centerY = topLeft.y - CELL_SIZE / 2 + height / 2;

    this.add.rectangle(centerX, centerY, width, height, color, 0.35).setStrokeStyle(2, color);
    this.add
      .text(centerX, centerY, label, {
        fontSize: '15px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: width - 24 },
      })
      .setOrigin(0.5);

    new TriggerZone(this, player, centerX, centerY, width, height, onEnter);
  }

  private selectRoute(player: Phaser.Physics.Arcade.Sprite, route: 'car' | 'subway', nextSceneKey: string) {
    this.tapToMove?.setEnabled(false);
    player.setVelocity(0, 0);
    this.registry.set('route', route);

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(nextSceneKey);
    });
  }
}
