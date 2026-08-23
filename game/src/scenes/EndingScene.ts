import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PIXEL_FONT } from '../config';

export class EndingScene extends Phaser.Scene {
  constructor() {
    super('EndingScene');
  }

  create() {
    const route = this.registry.get('route');
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `EndingScene\n(route = ${route})\n\n엔딩 콘텐츠는 추후 확정 예정`, {
        fontFamily: PIXEL_FONT,
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);
  }
}
