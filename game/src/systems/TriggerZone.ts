import Phaser from 'phaser';

/** One-shot overlap trigger between the player sprite and a rectangular zone. */
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
      this.triggered = true;
      onEnter();
    });
  }
}
