import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PIXEL_FONT } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Hello Wedding Game', {
        fontFamily: PIXEL_FONT,
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const goToIntro = () => this.scene.start('IntroScene');
    this.time.delayedCall(5000, goToIntro);
    this.input.once('pointerdown', goToIntro);
  }
}
