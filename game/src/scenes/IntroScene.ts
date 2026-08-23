import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PIXEL_FONT } from '../config';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  create() {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '이재준 ♥ 김현서의\n결혼식으로 가는 길\n\n(탭하면 시작)', {
        fontFamily: PIXEL_FONT,
        fontSize: '32px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('HomeSelectScene'));
  }
}
