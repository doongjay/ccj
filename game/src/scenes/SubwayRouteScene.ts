import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class SubwayRouteScene extends Phaser.Scene {
  constructor() {
    super('SubwayRouteScene');
  }

  create() {
    const route = this.registry.get('route');
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `SubwayRouteScene\n(route = ${route})`, {
        fontSize: '28px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);
  }
}
