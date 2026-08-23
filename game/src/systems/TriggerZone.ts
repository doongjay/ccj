import Phaser from 'phaser';

// Below this speed the player counts as "arrived" rather than mid-stride.
const ARRIVED_SPEED_SQ = 25; // 5px/s, squared

/** One-shot overlap trigger between the player sprite and a rectangular zone.
 *  Only fires once the player has actually come to rest inside the zone — a BFS route
 *  to some other destination can otherwise cut straight through a zone it never meant
 *  to visit, firing it by accident while merely passing through. */
export class TriggerZone {
  private triggered = false;

  constructor(
    scene: Phaser.Scene,
    player: Phaser.Physics.Arcade.Sprite,
    x: number,
    y: number,
    width: number,
    height: number,
    onEnter: () => void,
  ) {
    const zone = scene.add.zone(x, y, width, height) as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody;
    scene.physics.add.existing(zone, true);

    scene.physics.add.overlap(player, zone, () => {
      if (this.triggered) return;
      if (player.body!.velocity.lengthSq() > ARRIVED_SPEED_SQ) return;
      this.triggered = true;
      onEnter();
    });
  }
}
