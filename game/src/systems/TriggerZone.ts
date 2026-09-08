import type Phaser from "phaser";

export const TRIGGER_ZONE_SHAPES = {
  rectangle: "rectangle",
  circle: "circle",
} as const;

export type TriggerZoneShape = (typeof TRIGGER_ZONE_SHAPES)[keyof typeof TRIGGER_ZONE_SHAPES];

export const TRIGGER_ZONE_MODES = {
  once: "once",
  repeat: "repeat",
} as const;

export type TriggerZoneMode = (typeof TRIGGER_ZONE_MODES)[keyof typeof TRIGGER_ZONE_MODES];

export type TriggerZonePlayerLike = Readonly<{
  x: number;
  y: number;
}>;

export type TriggerZoneEnterHandler = (player: TriggerZonePlayerLike) => void;

type TriggerZoneBaseConfig = Readonly<{
  x: number;
  y: number;
  mode?: TriggerZoneMode;
  enabled?: boolean;
  debug?: boolean;
  onEnter?: TriggerZoneEnterHandler;
}>;

export type TriggerZoneRectangleConfig = TriggerZoneBaseConfig &
  Readonly<{
    shape: "rectangle";
    width: number;
    height: number;
  }>;

export type TriggerZoneCircleConfig = TriggerZoneBaseConfig &
  Readonly<{
    shape: "circle";
    radius: number;
  }>;

export type TriggerZoneConfig = TriggerZoneRectangleConfig | TriggerZoneCircleConfig;

const DEBUG_COLOR = 0xc8a24b;
const DEBUG_FILL_ALPHA = 0.12;
const DEBUG_LINE_WIDTH = 2;
const DEBUG_LINE_ALPHA = 0.8;

export class TriggerZone {
  private readonly scene: Phaser.Scene;
  private readonly config: TriggerZoneConfig;
  private readonly mode: TriggerZoneMode;
  private readonly onEnter: TriggerZoneEnterHandler | undefined;
  private readonly debugGraphics: Phaser.GameObjects.Graphics | undefined;
  private enabled: boolean;
  private wasInside = false;
  private hasTriggered = false;
  private destroyed = false;

  public constructor(scene: Phaser.Scene, config: TriggerZoneConfig) {
    this.scene = scene;
    this.config = config;
    this.mode = config.mode ?? TRIGGER_ZONE_MODES.once;
    this.enabled = config.enabled ?? true;
    this.onEnter = config.onEnter;
    this.debugGraphics = config.debug ? this.createDebugGraphics() : undefined;
  }

  public update(playerLike: TriggerZonePlayerLike): boolean {
    if (this.destroyed || !this.enabled) {
      return false;
    }

    const inside = this.contains(playerLike);
    const entered = inside && !this.wasInside;
    this.wasInside = inside;

    if (!entered || (this.mode === TRIGGER_ZONE_MODES.once && this.hasTriggered)) {
      return false;
    }

    this.hasTriggered = true;
    this.onEnter?.(playerLike);
    return true;
  }

  public check(playerLike: TriggerZonePlayerLike): boolean {
    return this.update(playerLike);
  }

  public reset(): this {
    this.wasInside = false;
    this.hasTriggered = false;
    return this;
  }

  public setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    return this;
  }

  public destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.debugGraphics?.destroy();
  }

  private contains(playerLike: TriggerZonePlayerLike): boolean {
    switch (this.config.shape) {
      case TRIGGER_ZONE_SHAPES.rectangle:
        return (
          playerLike.x >= this.config.x &&
          playerLike.x <= this.config.x + this.config.width &&
          playerLike.y >= this.config.y &&
          playerLike.y <= this.config.y + this.config.height
        );
      case TRIGGER_ZONE_SHAPES.circle:
        return this.isInsideCircle(playerLike, this.config);
      default:
        return assertNever(this.config);
    }
  }

  private createDebugGraphics(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(DEBUG_COLOR, DEBUG_FILL_ALPHA);
    graphics.lineStyle(DEBUG_LINE_WIDTH, DEBUG_COLOR, DEBUG_LINE_ALPHA);

    switch (this.config.shape) {
      case TRIGGER_ZONE_SHAPES.rectangle:
        graphics.fillRect(this.config.x, this.config.y, this.config.width, this.config.height);
        graphics.strokeRect(this.config.x, this.config.y, this.config.width, this.config.height);
        break;
      case TRIGGER_ZONE_SHAPES.circle:
        graphics.fillCircle(this.config.x, this.config.y, this.config.radius);
        graphics.strokeCircle(this.config.x, this.config.y, this.config.radius);
        break;
      default:
        return assertNever(this.config);
    }

    return graphics;
  }

  private isInsideCircle(
    playerLike: TriggerZonePlayerLike,
    config: TriggerZoneCircleConfig,
  ): boolean {
    const deltaX = playerLike.x - config.x;
    const deltaY = playerLike.y - config.y;
    return deltaX * deltaX + deltaY * deltaY <= config.radius * config.radius;
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported trigger zone shape: ${String(value)}`);
}
