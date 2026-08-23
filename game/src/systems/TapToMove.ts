import Phaser from 'phaser';
import { Grid } from './Grid';
import type { PixelCharacterKeys } from './pixelCharacter';

const MOVE_SPEED_PX_PER_SEC = 260;

/** Tap-to-move: tapping the scene walks the given sprite to that point via grid pathfinding.
 *  Optionally drives a walk/idle animation on the sprite (see pixelCharacter.ts). */
export class TapToMove {
  private readonly scene: Phaser.Scene;
  private readonly grid: Grid;
  private readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly animKeys?: PixelCharacterKeys;
  private waypoints: { x: number; y: number }[] = [];
  private enabled = true;

  constructor(scene: Phaser.Scene, grid: Grid, sprite: Phaser.Physics.Arcade.Sprite, animKeys?: PixelCharacterKeys) {
    this.scene = scene;
    this.grid = grid;
    this.sprite = sprite;
    this.animKeys = animKeys;

    if (this.animKeys) this.sprite.setTexture(this.animKeys.idle);

    this.scene.input.on('pointerdown', this.handlePointerDown, this);
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.handleUpdate, this);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.waypoints = [];
      this.sprite.setVelocity(0, 0);
      this.playIdle();
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (!this.enabled) return;

    const from = this.grid.worldToCell(this.sprite.x, this.sprite.y);
    const to = this.grid.worldToCell(pointer.worldX, pointer.worldY);
    const path = this.grid.findPath(from, to);
    if (path.length === 0) return;

    this.waypoints = path.slice(1).map((cell) => this.grid.cellToWorld(cell.row, cell.col));
    this.moveTowardNextWaypoint();
  }

  private moveTowardNextWaypoint() {
    const next = this.waypoints[0];
    if (next) {
      this.scene.physics.moveTo(this.sprite, next.x, next.y, MOVE_SPEED_PX_PER_SEC);
      if (this.animKeys) this.sprite.play(this.animKeys.walk, true);
    } else {
      this.sprite.setVelocity(0, 0);
      this.playIdle();
    }
  }

  private playIdle() {
    if (!this.animKeys) return;
    this.sprite.anims.stop();
    this.sprite.setTexture(this.animKeys.idle);
  }

  private handleUpdate() {
    if (this.waypoints.length === 0) return;

    const target = this.waypoints[0];
    const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, target.x, target.y);
    const arrivalThreshold = (MOVE_SPEED_PX_PER_SEC * this.scene.game.loop.delta) / 1000;

    if (distance <= arrivalThreshold) {
      // body.reset() moves both the physics body and the visual transform together —
      // setPosition() alone would leave the body stale until the next physics step
      // overwrites the visual snap, causing drift (and runaway movement past the target).
      this.sprite.body!.reset(target.x, target.y);
      this.waypoints.shift();
      this.moveTowardNextWaypoint();
    }
  }

  private destroy() {
    this.scene.input.off('pointerdown', this.handlePointerDown, this);
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.handleUpdate, this);
  }
}
