import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PIXEL_FONT } from '../config';
import { Grid } from '../systems/Grid';
import { TapToMove } from '../systems/TapToMove';
import { TriggerZone } from '../systems/TriggerZone';
import { QuizModal } from '../systems/QuizModal';
import { ensurePixelCharacter, PLAYER_PALETTE, BRIDE_PALETTE } from '../systems/pixelCharacter';
import { drawPixelFloor } from '../systems/pixelFloor';
import { QUIZZES } from '../data/scenario';

const CELL_SIZE = 80;
const COLS = GAME_WIDTH / CELL_SIZE;
const ROWS = GAME_HEIGHT / CELL_SIZE;

export class VenueLobbyScene extends Phaser.Scene {
  constructor() {
    super('VenueLobbyScene');
  }

  create() {
    const walkable: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(true));
    const grid = new Grid({ cols: COLS, rows: ROWS, cellSize: CELL_SIZE, originX: 0, originY: 0, walkable });

    drawPixelFloor(this, GAME_WIDTH, GAME_HEIGHT, CELL_SIZE, 0x332e2a, 0x000000);
    this.add
      .text(GAME_WIDTH / 2, 60, '예식장 로비 — 두 루트가 여기서 합류!', {
        fontFamily: PIXEL_FONT,
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 80 },
      })
      .setOrigin(0.5);

    const playerAnims = ensurePixelCharacter(this, 'player', PLAYER_PALETTE);
    const brideAnims = ensurePixelCharacter(this, 'bride', BRIDE_PALETTE);

    const start = grid.cellToWorld(13, 4);
    const player = this.physics.add.sprite(start.x, start.y, playerAnims.idle);
    player.setCollideWorldBounds(true);

    const tapToMove = new TapToMove(this, grid, player, playerAnims);

    // 축의대 zones are visual-only here — the player is routed to one automatically after Q3.
    const groomDesk = grid.cellToWorld(9, 2);
    const brideDesk = grid.cellToWorld(9, 6);
    this.drawDesk(groomDesk, '축의대 1\n(신랑측)', 0xf2a65a);
    this.drawDesk(brideDesk, '축의대 2\n(신부측)', 0x8ecae6);

    const npcPos = grid.cellToWorld(6, 4);
    this.add.sprite(npcPos.x, npcPos.y, brideAnims.idle);
    this.add
      .text(npcPos.x, npcPos.y - 40, '신부 (포토테이블)', { fontFamily: PIXEL_FONT, fontSize: '14px', color: '#ffffff' })
      .setOrigin(0.5);

    new TriggerZone(this, player, npcPos.x, npcPos.y, CELL_SIZE * 2, CELL_SIZE * 2, () => {
      tapToMove.setEnabled(false);
      player.setVelocity(0, 0);

      new QuizModal(this, QUIZZES.Q3, (option) => {
        const target = option.id === 'groom' ? groomDesk : brideDesk;
        this.tweens.add({
          targets: player,
          x: target.x,
          y: target.y,
          duration: 700,
          onComplete: () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
              this.scene.start('VenueHallScene');
            });
          },
        });
      });
    });
  }

  private drawDesk(pos: { x: number; y: number }, label: string, color: number) {
    this.add.rectangle(pos.x, pos.y, CELL_SIZE * 2, CELL_SIZE, color, 0.35).setStrokeStyle(2, color);
    this.add
      .text(pos.x, pos.y, label, { fontFamily: PIXEL_FONT, fontSize: '15px', color: '#ffffff', align: 'center' })
      .setOrigin(0.5);
  }
}
