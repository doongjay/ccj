import Phaser from "phaser";
import { characterAnimationKey } from "../data/assetManifest";

export type PlayerConfig = Readonly<{
  x: number;
  y: number;
  label?: string;
  speed?: number;
}>;

export type PlayerDirection = "down" | "left" | "right" | "up";

type MovementTarget = Readonly<{
  x: number;
  y: number;
}>;

const PLAYER_WIDTH = 64;
const PLAYER_HEIGHT = 96;
const PLAYER_LABEL_WIDTH = 112;
const PLAYER_LABEL_HEIGHT = 36;
const DEFAULT_SPEED = 240;
const ARRIVAL_DISTANCE = 1;
const LABEL_CHARACTERS_PER_LINE = 7;
const MAX_LABEL_CHARACTERS = LABEL_CHARACTERS_PER_LINE * 2;

const COLORS = {
  coral: 0xdb6c63,
  ivory: 0xfff9ef,
  inkOutline: 0x26332a,
  labelSurface: 0x1e2920,
  labelText: "#fffaf2",
} as const;

export class Player extends Phaser.GameObjects.Container {
  public readonly speed: number;

  private direction: PlayerDirection = "down";
  private movementTarget: MovementTarget | undefined;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly labelText: Phaser.GameObjects.Text;

  public constructor(scene: Phaser.Scene, config: PlayerConfig) {
    super(scene, config.x, config.y);

    this.speed = config.speed ?? DEFAULT_SPEED;
    this.setSize(PLAYER_WIDTH, PLAYER_HEIGHT);

    const labelPlate = new Phaser.GameObjects.Rectangle(
      scene,
      0,
      -66,
      PLAYER_LABEL_WIDTH,
      PLAYER_LABEL_HEIGHT,
      COLORS.labelSurface,
    ).setStrokeStyle(4, COLORS.ivory);
    this.labelText = new Phaser.GameObjects.Text(scene, 0, -66, formatLabel(config.label ?? "하객"), {
      align: "center",
      color: COLORS.labelText,
      padding: { top: 2, bottom: 2 },
      fixedWidth: PLAYER_LABEL_WIDTH - 8,
      fontFamily: "Galmuri11, system-ui, sans-serif",
      fontSize: "14px",
      resolution: 2,
      testString: "|M가나다라마바사아자차카타파하힣",
      fontStyle: "700",
      lineSpacing: 0,
    }).setOrigin(0.5);

    this.sprite = new Phaser.GameObjects.Sprite(scene, 0, 48, "player-guest", 0)
      .setOrigin(0.5, 1).setScale(2);
    this.add([this.sprite, labelPlate, this.labelText]);
    scene.add.existing(this);
  }

  public getDirection(): PlayerDirection {
    return this.direction;
  }

  public isMoving(): boolean {
    return this.movementTarget !== undefined;
  }

  public moveTo<T extends Phaser.GameObjects.GameObject>(child: T, index: number): this;
  public moveTo(x: number, y: number): this;
  public moveTo<T extends Phaser.GameObjects.GameObject>(childOrX: T | number, indexOrY: number): this {
    if (typeof childOrX === "number") {
      this.movementTarget = { x: childOrX, y: indexOrY };
      return this;
    }

    return super.moveTo(childOrX, indexOrY);
  }

  public setDirection(direction: PlayerDirection): this {
    this.direction = direction;

    this.sprite.play(characterAnimationKey("player-guest", direction, this.isMoving() ? "walk" : "idle"), true);

    return this;
  }

  public setLabel(label: string): this {
    this.labelText.setText(formatLabel(label));
    return this;
  }

  public stop(): this {
    this.movementTarget = undefined;
    if (this.sprite.scene !== undefined) {
      this.sprite.play(characterAnimationKey("player-guest", this.direction, "idle"), true);
    }
    return this;
  }

  public updateMovement(deltaMs: number): this {
    const target = this.movementTarget;

    if (target === undefined || deltaMs <= 0) {
      return this;
    }

    const deltaX = target.x - this.x;
    const deltaY = target.y - this.y;
    const distance = Math.hypot(deltaX, deltaY);
    const step = (this.speed * deltaMs) / 1000;

    if (distance <= ARRIVAL_DISTANCE || step >= distance) {
      this.setPosition(target.x, target.y);
      return this.stop();
    }

    this.setDirection(directionFromDelta(deltaX, deltaY));
    this.setPosition(this.x + (deltaX / distance) * step, this.y + (deltaY / distance) * step);
    return this;
  }
}

function directionFromDelta(deltaX: number, deltaY: number): PlayerDirection {
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX < 0 ? "left" : "right";
  }

  return deltaY < 0 ? "up" : "down";
}

function formatLabel(label: string): string {
  const characters = Array.from(label.trim() || "하객");
  const visibleCharacters = characters.slice(0, MAX_LABEL_CHARACTERS);

  if (characters.length > MAX_LABEL_CHARACTERS) {
    visibleCharacters.splice(MAX_LABEL_CHARACTERS - 3, 3, ".", ".", ".");
  }

  return [
    visibleCharacters.slice(0, LABEL_CHARACTERS_PER_LINE).join("").trim(),
    visibleCharacters.slice(LABEL_CHARACTERS_PER_LINE).join("").trim(),
  ]
    .filter((line) => line.length > 0)
    .join("\n");
}
