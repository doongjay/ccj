import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Grid } from '../systems/Grid';
import { TapToMove } from '../systems/TapToMove';
import { ArrowGuide } from '../systems/ArrowGuide';
import { ensureCircleTexture } from '../systems/placeholderAssets';

const CELL_SIZE = 80;
const COLS = GAME_WIDTH / CELL_SIZE;
const ROWS = GAME_HEIGHT / CELL_SIZE;
const PLAYER_TEXTURE = 'player-placeholder';

export class VenueHallScene extends Phaser.Scene {
  constructor() {
    super('VenueHallScene');
  }

  create() {
    const walkable: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(true));
    const grid = new Grid({ cols: COLS, rows: ROWS, cellSize: CELL_SIZE, originX: 0, originY: 0, walkable });

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x2a2f26);
    this.add
      .text(GAME_WIDTH / 2, 60, '접수 완료! 화살표를 따라 연회장으로 가볼까요?', {
        fontSize: '22px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 80 },
      })
      .setOrigin(0.5);

    ensureCircleTexture(this, PLAYER_TEXTURE, 24, 0xff6fa8);
    const start = grid.cellToWorld(13, 4);
    const player = this.physics.add.sprite(start.x, start.y, PLAYER_TEXTURE);
    player.setCollideWorldBounds(true);

    new TapToMove(this, grid, player);

    const path = [grid.cellToWorld(10, 4), grid.cellToWorld(7, 4), grid.cellToWorld(7, 6), grid.cellToWorld(4, 6)];
    const venueHallCenter = path[path.length - 1];

    this.add
      .rectangle(venueHallCenter.x, venueHallCenter.y, CELL_SIZE * 3, CELL_SIZE * 2, 0x6a994e, 0.3)
      .setStrokeStyle(2, 0x6a994e);
    this.add.text(venueHallCenter.x, venueHallCenter.y, '연회장', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);

    new ArrowGuide(this, player, path, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('EndingScene');
      });
    });
  }
}
