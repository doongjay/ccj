import type Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import type { GuidePath, LogicalPoint } from "../data/scenario";
import type { Player } from "../objects/Player";
import { SCENE_UI_COLORS } from "../ui/sceneUi";

export type ArrowGuideConfig = Readonly<{
  path: GuidePath;
  onComplete?: () => void;
  radius?: number;
  visible?: boolean;
  enabled?: boolean;
}>;

type WorldPoint = Readonly<{
  x: number;
  y: number;
}>;

const LOGICAL_GRID_SIZE = 100;
const DEFAULT_ARRIVAL_RADIUS = 44;
const PATH_LINE_WIDTH = 4;
const MARKER_RADIUS = 16;

export class ArrowGuide {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly scene: Phaser.Scene;
  private readonly markers: Phaser.GameObjects.Image[] = [];
  private readonly points: readonly WorldPoint[];
  private readonly onComplete: (() => void) | undefined;
  private readonly radius: number;
  private currentPointIndex = 0;
  private completed = false;
  private destroyed = false;
  private enabled: boolean;
  private visible: boolean;

  public constructor(scene: Phaser.Scene, config: ArrowGuideConfig) {
    this.scene = scene;
    this.graphics = scene.add.graphics().setDepth(5);
    this.points = config.path.points.map((point) => this.toWorldPoint(point));
    this.onComplete = config.onComplete;
    this.radius = config.radius ?? DEFAULT_ARRIVAL_RADIUS;
    this.enabled = config.enabled ?? true;
    this.visible = config.visible ?? true;
    this.graphics.setVisible(this.visible);
    this.render();
  }

  public update(player: Player): boolean {
    if (this.destroyed || !this.enabled || this.completed) {
      return false;
    }

    const target = this.points[this.currentPointIndex];

    if (target === undefined) {
      return false;
    }

    const deltaX = player.x - target.x;
    const deltaY = player.y - target.y;

    if (deltaX * deltaX + deltaY * deltaY > this.radius * this.radius) {
      return false;
    }

    this.currentPointIndex += 1;

    if (this.currentPointIndex === this.points.length) {
      this.completed = true;
      this.graphics.clear();
      this.clearMarkers();
      this.onComplete?.();
      return true;
    }

    this.render();
    return true;
  }

  public reset(): this {
    if (this.destroyed) {
      return this;
    }

    this.currentPointIndex = 0;
    this.completed = false;
    this.render();
    return this;
  }

  public setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    return this;
  }

  public setVisible(visible: boolean): this {
    this.visible = visible;
    this.graphics.setVisible(visible);
    this.render();
    return this;
  }

  public destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.graphics.destroy();
    this.clearMarkers();
  }

  private render(): void {
    this.graphics.clear();
    this.clearMarkers();

    if (!this.visible || this.completed) {
      return;
    }

    this.graphics.lineStyle(PATH_LINE_WIDTH, SCENE_UI_COLORS.greenery.fill, 0.9);

    for (let index = 1; index < this.points.length; index += 1) {
      const previous = this.points[index - 1];
      const point = this.points[index];

      if (previous !== undefined && point !== undefined) {
        this.graphics.lineBetween(previous.x, previous.y, point.x, point.y);
      }
    }

    for (const [index, point] of this.points.entries()) {
      const isCurrent = index === this.currentPointIndex;
      const color = isCurrent ? SCENE_UI_COLORS.coral.fill : SCENE_UI_COLORS.gold.fill;
      const alpha = isCurrent ? 1 : 0.65;

      this.markers.push(this.scene.add.image(point.x, point.y, "guide-marker")
        .setTint(color).setAlpha(alpha).setDepth(5));
    }

    const currentPoint = this.points[this.currentPointIndex];
    const nextPoint = this.points[this.currentPointIndex + 1];

    if (currentPoint !== undefined && nextPoint !== undefined) {
      this.drawArrow(currentPoint, nextPoint);
    }
  }

  private drawArrow(start: WorldPoint, end: WorldPoint): void {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance === 0) {
      return;
    }

    const directionX = deltaX / distance;
    const directionY = deltaY / distance;
    this.markers.push(this.scene.add.image(start.x + directionX * (MARKER_RADIUS + 20),
      start.y + directionY * (MARKER_RADIUS + 20), "arrow-marker")
      .setDisplaySize(40, 40).setRotation(Math.atan2(deltaY, deltaX)).setDepth(6));
  }

  private clearMarkers(): void {
    for (const marker of this.markers) marker.destroy();
    this.markers.length = 0;
  }

  private toWorldPoint(point: LogicalPoint): WorldPoint {
    return {
      x: (point.x / LOGICAL_GRID_SIZE) * GAME_WIDTH,
      y: (point.y / LOGICAL_GRID_SIZE) * GAME_HEIGHT,
    };
  }
}
