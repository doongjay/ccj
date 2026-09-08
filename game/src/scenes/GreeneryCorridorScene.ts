import Phaser from "phaser";
import { Player } from "../objects/Player";
import { SCENE_KEYS } from "../state/gameState";
import { TapToMove } from "../systems/TapToMove";
import { createKoreanText, createTouchButton, fadeToScene, markActiveScene, SCENE_UI_COLORS } from "../ui/sceneUi";
import { sceneArt } from "./sceneArt";

export class GreeneryCorridorScene extends Phaser.Scene {
  private player: Player | undefined;
  private movement: TapToMove | undefined;
  private fromBridal = false;
  private leaving = false;

  constructor() {
    super(SCENE_KEYS.GreeneryCorridor);
  }

  init(data: unknown): void {
    this.fromBridal = typeof data === "object" && data !== null && "entrance" in data && data.entrance === "bridal";
  }

  create(): void {
    this.leaving = false;
    markActiveScene(this, SCENE_KEYS.GreeneryCorridor);
    this.game.canvas.dataset.venueRoom = "corridor";
    this.game.canvas.dataset.roomBridePresent = "false";
    this.game.canvas.dataset.roomReady = "false";
    sceneArt(this, "greenery-corridor-background");
    this.label(360, 96, "그리너리 통로", 360, 28);
    this.label(360, 240, "신부대기실 입구", 240, 20);
    this.renderPhotoMarker();
    this.player = new Player(this, { x: 360, y: this.fromBridal ? 420 : 1000, label: "하객", speed: 480 });
    this.movement = new TapToMove(this, this.player, {
      bounds: { x: 280, y: 300, width: 180, height: 780 },
      onArrival: destination => {
        if (destination.y <= 320 && Math.abs(destination.x - 360) <= 64 && !this.leaving) {
          this.leaving = true;
          this.movement?.setEnabled(false);
          fadeToScene(this, SCENE_KEYS.BridalRoom);
        }
      },
    });
    createTouchButton(this, {
      x: 360, y: 1180, width: 280, height: 88, label: "로비로 돌아가기", depth: 10,
      onPress: () => {
        if (this.leaving || this.game.canvas.dataset.roomReady !== "true") return;
        this.leaving = true;
        this.movement?.setEnabled(false);
        fadeToScene(this, SCENE_KEYS.VenueLobby);
      },
    });
    this.events.once(Phaser.Scenes.Events.POST_UPDATE, () => {
      this.game.canvas.dataset.roomReady = "true";
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.movement?.destroy();
      this.movement = undefined;
      this.player = undefined;
    });
  }

  update(_time: number, delta: number): void {
    if (!this.leaving) this.movement?.update(delta);
  }

  private renderPhotoMarker(): void {
    const mark = this.add.graphics();
    mark.fillStyle(SCENE_UI_COLORS.ivory.fill).fillRoundedRect(172, 612, 76, 76, 4);
    mark.lineStyle(4, SCENE_UI_COLORS.inkOutline.fill);
    mark.strokeRoundedRect(172, 612, 76, 76, 4);
    mark.strokeRect(184, 636, 52, 34);
    mark.strokeRect(194, 628, 20, 8);
    mark.strokeCircle(210, 653, 10);
    this.label(210, 716, "포토존", 120, 20);
  }

  private label(x: number, y: number, copy: string, width: number, fontSize: number): void {
    createKoreanText(this, {
      x, y, copy, width, fontSize, lineHeight: fontSize + 8,
      maxCharactersPerLine: 12, maxLines: 1, color: "labelText",
    }).setBackgroundColor(SCENE_UI_COLORS.labelSurface.text);
  }
}
