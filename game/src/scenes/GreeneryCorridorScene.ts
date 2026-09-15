import Phaser from "phaser";
import { Player } from "../objects/Player";
import { GUEST_SIDES, readGuestSide, SCENE_KEYS } from "../state/gameState";
import { createKoreanText, fadeToScene, markActiveScene, SCENE_UI_COLORS } from "../ui/sceneUi";
import { photoArt } from "./photoArt";
import type { SceneTransitionData } from "../ui/sceneUi";

export class GreeneryCorridorScene extends Phaser.Scene {
  private player: Player | undefined;
  private leaving = false;
  private lobbyReturn: SceneTransitionData["lobbyReturn"];

  constructor() {
    super(SCENE_KEYS.GreeneryCorridor);
  }

  create(data: SceneTransitionData = {}): void {
    this.lobbyReturn = data.lobbyReturn;
    if (readGuestSide(this.registry) !== GUEST_SIDES.bride) {
      this.scene.start(SCENE_KEYS.VenueLobby);
      return;
    }
    this.leaving = false;
    markActiveScene(this, SCENE_KEYS.GreeneryCorridor);
    this.game.canvas.dataset.venueRoom = "corridor";
    this.game.canvas.dataset.roomBridePresent = "false";
    this.game.canvas.dataset.roomReady = "false";
    photoArt(this, "garden");
    this.label(360, 96, "신부대기실 가는 길", 360, 28);
    this.player = new Player(this, { x: 360, y: 1060, speed: 240 });
    this.player.moveTo(450, 600);
    this.game.canvas.dataset.bridalVisitStage = "walking";
    this.cameras.main.fadeIn(300);
    this.events.once(Phaser.Scenes.Events.POST_UPDATE, () => {
      this.game.canvas.dataset.roomReady = "true";
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.player = undefined;
    });
  }

  update(_time: number, delta: number): void {
    if (this.leaving || !this.player) return;
    this.player.updateMovement(delta);
    if (!this.player.isMoving()) {
      this.leaving = true;
      fadeToScene(this, SCENE_KEYS.BridalRoom, { lobbyReturn: this.lobbyReturn });
    }
  }

  private label(x: number, y: number, copy: string, width: number, fontSize: number): void {
    createKoreanText(this, {
      x, y, copy, width, fontSize, lineHeight: fontSize + 8,
      maxCharactersPerLine: 12, maxLines: 1, color: "labelText",
    }).setBackgroundColor(SCENE_UI_COLORS.labelSurface.text);
  }
}
