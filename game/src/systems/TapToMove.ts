import Phaser from "phaser";

import type { Player } from "../objects/Player";
import { findWalkPath, insideFloor, type WalkPoint } from "./walkPath";

export type TapToMoveBounds = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type TapToMoveBlockedArea = TapToMoveBounds;

export type TapToMoveDestination = Readonly<{
  x: number;
  y: number;
}>;

export type TapToMoveArrivalHandler = (destination: TapToMoveDestination) => void;

export type TapToMoveConfig = Readonly<{
  bounds: TapToMoveBounds;
  blockedAreas?: readonly TapToMoveBlockedArea[];
  enabled?: boolean;
  onArrival?: TapToMoveArrivalHandler;
  /** Authored floor boundary at the character's ground/feet anchor. */
  floor?: readonly WalkPoint[];
  groundOffsetY?: number;
  onInvalidTap?: (point: WalkPoint) => void;
}>;

export class TapToMove {
  private readonly onArrival: TapToMoveArrivalHandler | undefined;
  private readonly player: Player;
  private readonly scene: Phaser.Scene;
  private blockedAreas: readonly TapToMoveBlockedArea[];
  private bounds: TapToMoveBounds;
  private destination: TapToMoveDestination | undefined;
  private enabled: boolean;
  private destroyed = false;
  private waypoints: TapToMoveDestination[] = [];
  private floor: readonly WalkPoint[] | undefined;
  private onInvalidTap: ((point: WalkPoint) => void) | undefined;

  public constructor(
    scene: Phaser.Scene,
    player: Player,
    bounds: TapToMoveBounds,
    blockedAreas?: readonly TapToMoveBlockedArea[],
    enabled?: boolean,
    onArrival?: TapToMoveArrivalHandler,
  );
  public constructor(scene: Phaser.Scene, player: Player, config: TapToMoveConfig);
  public constructor(
    scene: Phaser.Scene,
    player: Player,
    boundsOrConfig: TapToMoveBounds | TapToMoveConfig,
    blockedAreas: readonly TapToMoveBlockedArea[] = [],
    enabled = true,
    onArrival?: TapToMoveArrivalHandler,
  ) {
    this.scene = scene;
    this.player = player;

    if ("bounds" in boundsOrConfig) {
      this.bounds = boundsOrConfig.bounds;
      this.blockedAreas = boundsOrConfig.blockedAreas ?? [];
      this.enabled = boundsOrConfig.enabled ?? true;
      this.onArrival = boundsOrConfig.onArrival;
      this.floor = boundsOrConfig.floor?.map(point => ({ x: point.x, y: point.y - (boundsOrConfig.groundOffsetY ?? 0) }));
      this.onInvalidTap = boundsOrConfig.onInvalidTap;
    } else {
      this.bounds = boundsOrConfig;
      this.blockedAreas = blockedAreas;
      this.enabled = enabled;
      this.onArrival = onArrival;
    }

    this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
  }

  public update(deltaMs: number): void {
    const destination = this.destination;

    if (this.destroyed || destination === undefined) {
      return;
    }

    this.player.updateMovement(deltaMs);

    if (!this.player.isMoving() && this.waypoints.length > 0) {
      const next = this.waypoints.shift()!;
      this.player.moveTo(next.x, next.y);
      return;
    }

    if (!this.player.isMoving() && this.isAtDestination(destination)) {
      this.destination = undefined;
      this.onArrival?.(destination);
    }
  }

  public setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    if (!enabled) {
      this.destination = undefined;
      this.waypoints = [];
      this.player.stop();
    }
    return this;
  }

  public getDestination(): TapToMoveDestination | undefined {
    return this.destination;
  }

  public setBounds(bounds: TapToMoveBounds): this {
    this.bounds = bounds;
    return this;
  }

  public setBlockedAreas(blockedAreas: readonly TapToMoveBlockedArea[]): this {
    this.blockedAreas = blockedAreas;
    return this;
  }

  public destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.destination = undefined;
    this.waypoints = [];
    this.player.stop();
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    this.moveTo(pointer.worldX, pointer.worldY);
  }

  public moveTo(x: number, y: number): void {
    if (this.destroyed || !this.enabled) {
      return;
    }

    const destination = this.clampToBounds(x, y);

    if ((this.floor && !insideFloor({ x, y }, this.floor)) || this.isBlocked(destination)) {
      this.onInvalidTap?.({ x, y });
      return;
    }

    const path = findWalkPath(this.player, destination, this.bounds, this.blockedAreas, this.floor);
    const first = path.shift();
    if (!first) return;
    this.destination = destination;
    this.waypoints = path;
    this.player.moveTo(first.x, first.y);
  }

  private clampToBounds(x: number, y: number): TapToMoveDestination {
    return {
      x: Phaser.Math.Clamp(x, this.bounds.x, this.bounds.x + this.bounds.width),
      y: Phaser.Math.Clamp(y, this.bounds.y, this.bounds.y + this.bounds.height),
    };
  }

  private isBlocked(destination: TapToMoveDestination): boolean {
    return this.blockedAreas.some(
      (area) =>
        destination.x >= area.x &&
        destination.x <= area.x + area.width &&
        destination.y >= area.y &&
        destination.y <= area.y + area.height,
    );
  }

  private isAtDestination(destination: TapToMoveDestination): boolean {
    return this.player.x === destination.x && this.player.y === destination.y;
  }
}
