import { reducedMotion } from "../ui/motionPreference";
import Phaser from "phaser";
import { readGuestGender, readGuestOutfit, readGuestHair, readGuestFace } from "../state/gameState";
import { buildMinimiTextures, minimiTextureKey, type MinimiProfile } from "../ui/minimi";
import { walkingTexture, clappingTexture } from "../ui/minimiMotion";
import { showPixelHeart } from "../ui/pixelFeedback";
import { parkingCarTexture } from "../ui/parkingCar";

export type PlayerConfig = Readonly<{
  x: number;
  y: number;
  label?: string;
  speed?: number;
  appearance?: "guest" | "car" | "seated" | "posing" | "clapping";
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
  private waypoints: MovementTarget[] = [];
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly labelText: Phaser.GameObjects.Text;
  private appearance: "guest" | "car" | "seated" | "posing" | "clapping" = "guest";
  private lastReaction = -Infinity;
  private parkingMap = false;
  private walkedDistance = 0;

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
    labelPlate.setVisible(false);
    this.labelText.setVisible(false);

    this.sprite = new Phaser.GameObjects.Sprite(scene, 0, 48,
      config.appearance === "car" ? "white-car" : this.guestTexture,
      config.appearance === "car" ? undefined : this.frameName("down"))
      .setOrigin(0.5, 1).setScale(2);
    this.add([this.sprite, labelPlate, this.labelText]);
    this.setAppearance(config.appearance ?? "guest");
    scene.add.existing(this);
    scene.events.on(Phaser.Scenes.Events.UPDATE, this.updateBlink, this);
    this.once(Phaser.GameObjects.Events.DESTROY, () => scene.events.off(Phaser.Scenes.Events.UPDATE, this.updateBlink, this));
    this.setInteractive(new Phaser.Geom.Rectangle(PLAYER_WIDTH / 2 - 40, PLAYER_HEIGHT / 2 - 56, 80, 112), Phaser.Geom.Rectangle.Contains);
    this.on(Phaser.Input.Events.POINTER_DOWN, (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      if (this.isMoving() || this.appearance === "car") return;
      event.stopPropagation();
      if (scene.time.now - this.lastReaction < 1200) return;
      this.lastReaction = scene.time.now;
      showPixelHeart(scene, this.x, this.y - 66);
    });
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
      this.waypoints = [];
      this.movementTarget = { x: childOrX, y: indexOrY };
      return this;
    }

    return super.moveTo(childOrX, indexOrY);
  }

  public setDirection(direction: PlayerDirection): this {
    this.direction = direction;
    if (this.appearance === "guest") {
      this.sprite.setTexture(this.guestTexture, this.frameName(direction));
    }

    return this;
  }

  public setLabel(label: string): this {
    this.labelText.setText(formatLabel(label));
    return this;
  }

  public stop(): this {
    this.walkedDistance = 0;
    this.movementTarget = undefined;
    this.waypoints = [];
    if (this.sprite.scene !== undefined && this.appearance === "guest") {
      this.sprite.setTexture(this.guestTexture, this.frameName(this.direction)).setY(48);
    }
    return this;
  }

  public walkPath(points: readonly MovementTarget[]): this {
    this.waypoints = [...points];
    this.movementTarget = this.waypoints.shift();
    return this;
  }

  public setAppearance(appearance: "guest" | "car" | "seated" | "posing" | "clapping"): this {
    this.appearance = appearance;
    this.sprite.anims.stop();
    this.sprite.setAngle(0);
    if (appearance === "clapping") {
      this.sprite.setTexture(clappingTexture(this.scene, this.profile), 0).setPosition(0, 48).setOrigin(0.5, 1).setDisplaySize(64, 96);
    } else if (appearance === "guest") {
      this.sprite.setTexture(this.guestTexture, this.frameName("down")).setPosition(0, 48).setOrigin(0.5, 1).setDisplaySize(64, 96);
    } else {
      if (appearance === "car") this.sprite.setTexture("white-car");
      else this.sprite.setTexture(this.guestTexture, this.frameName(appearance));
      this.sprite.setPosition(0, 0).setOrigin(0.5).setDisplaySize(appearance === "car" ? 112 : 64, appearance === "car" ? 84 : 96);
    }
    return this;
  }

  public setParkingMap(enabled: boolean): this {
    this.parkingMap = enabled;
    if (enabled) this.sprite.setTexture(parkingCarTexture(this.scene)).setPosition(0, 0).setOrigin(0.5).setDisplaySize(76, 104).setAngle(0);
    else this.setAppearance("car");
    return this;
  }

  private get guestTexture(): string {
    const profile = this.profile;
    buildMinimiTextures(this.scene, profile);
    return minimiTextureKey(profile);
  }

  private get profile(): MinimiProfile {
    return { gender: readGuestGender(this.scene.registry), face: readGuestFace(this.scene.registry), outfit: readGuestOutfit(this.scene.registry), hair: readGuestHair(this.scene.registry) };
  }

  private frameName(pose: string): string {
    return `${readGuestOutfit(this.scene.registry)}-${readGuestHair(this.scene.registry)}-${pose}`;
  }

  private readonly updateBlink = (time: number): void => {
    // A scene redraw may destroy children while this frame's UPDATE callbacks are already queued.
    if (!this.scene || !this.sprite.scene) return;
    if (this.appearance === "clapping") {
      this.sprite.setTexture(clappingTexture(this.scene, this.profile), reducedMotion() ? 0 : Math.floor(this.scene.time.now / 150) % 2);
      return;
    }
    if (this.appearance === "car" || this.isMoving() || !this.visible) return;
    const pose = this.appearance === "guest" ? this.direction : this.appearance;
    if (!["down", "posing", "seated"].includes(pose)) return;
    const blinking = time % 3700 < 150 && !reducedMotion();
    const frame = this.frameName(`${pose}${blinking ? "-blink" : ""}`);
    if (this.sprite.frame.name !== frame) this.sprite.setTexture(this.guestTexture, frame);
  };

  public updateMovement(deltaMs: number): this {
    if (!this.movementTarget || !Number.isFinite(deltaMs) || deltaMs <= 0) return this;
    let remaining = this.speed * deltaMs / 1000;
    // Consume the same travel distance across waypoints even on a slow frame.
    while (this.movementTarget && remaining > 0) {
      const target = this.movementTarget, dx = target.x - this.x, dy = target.y - this.y;
      const distance = Math.hypot(dx, dy), step = Math.min(distance, remaining);
      if (distance > 0) {
        this.direction = directionFromDelta(dx, dy);
        if (this.parkingMap) this.sprite.setAngle({ up: 0, right: 90, down: 180, left: -90 }[this.direction]);
        this.setPosition(this.x + dx / distance * step, this.y + dy / distance * step);
      }
      this.walkedDistance += step; remaining -= step;
      if (step < distance) break;
      this.setPosition(target.x, target.y); this.movementTarget = this.waypoints.shift();
      if (!this.movementTarget) return this.stop();
    }
    if (this.appearance === "guest") this.sprite.setTexture(walkingTexture(this.scene, this.profile), `${this.direction}-${Math.floor(this.walkedDistance / 32) % 2}`).setY(48);
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
