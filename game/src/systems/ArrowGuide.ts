import Phaser from 'phaser';
import { TriggerZone } from './TriggerZone';

const ARROW_TRIGGER_SIZE = 60;

/** Draws arrow markers along a path (e.g. 축의대 -> 연회장) and fires onComplete
 *  once the player reaches the last point — no quiz, just a guided walk (C2). */
export class ArrowGuide {
  private readonly arrows: Phaser.GameObjects.Text[] = [];

  constructor(
    scene: Phaser.Scene,
    player: Phaser.Physics.Arcade.Sprite,
    points: { x: number; y: number }[],
    onComplete: () => void,
  ) {
    points.forEach((point) => {
      const arrow = scene.add.text(point.x, point.y, '⬇', { fontSize: '32px', color: '#ffe066' }).setOrigin(0.5);
      this.arrows.push(arrow);
    });

    const last = points[points.length - 1];
    new TriggerZone(scene, player, last.x, last.y, ARROW_TRIGGER_SIZE, ARROW_TRIGGER_SIZE, () => {
      this.arrows.forEach((arrow) => arrow.destroy());
      onComplete();
    });
  }
}
