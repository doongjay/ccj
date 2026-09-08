import Phaser from "phaser";
import type { ImageKey } from "../data/assetManifest";
import { Npc } from "../objects/Npc";
import { Player } from "../objects/Player";
import { SCENE_KEYS } from "../state/gameState";
import { TapToMove } from "../systems/TapToMove";
import { createKoreanText, createTouchButton, fadeToScene, markActiveScene, SCENE_UI_COLORS } from "../ui/sceneUi";
import { sceneArt } from "./sceneArt";

type RoomKind = "photo" | "banquet" | "bridal" | "waiting";
type RoomSceneKey = typeof SCENE_KEYS.PhotoBooth | typeof SCENE_KEYS.Banquet | typeof SCENE_KEYS.BridalRoom | typeof SCENE_KEYS.WaitingRoom;
type RoomConfig = Readonly<{ kind: RoomKind; key: RoomSceneKey; title: string; background: ImageKey }>;

class VenueRoomScene extends Phaser.Scene {
  private readonly room: RoomConfig;
  private movement: TapToMove | undefined;
  private leaving = false;

  constructor(room: RoomConfig) {
    super(room.key);
    this.room = room;
  }

  create(): void {
    this.leaving = false;
    markActiveScene(this, this.room.key);
    this.game.canvas.dataset.venueRoom = this.room.kind;
    this.game.canvas.dataset.roomBridePresent = String(this.room.kind === "bridal");
    this.game.canvas.dataset.roomReady = "false";
    sceneArt(this, this.room.background);
    createKoreanText(this, {
      x: 360, y: 96, copy: this.room.title, width: 400,
      maxCharactersPerLine: 12, maxLines: 1, fontSize: 32, lineHeight: 40,
      color: "labelText",
    }).setBackgroundColor(SCENE_UI_COLORS.labelSurface.text);
    this.renderRoom();
    const player = new Player(this, { x: 360, y: 1000, label: "하객", speed: 640 });
    this.movement = new TapToMove(this, player, {
      bounds: { x: 64, y: 740, width: 592, height: 340 },
      blockedAreas: [{ x: 0, y: 1120, width: 720, height: 160 }],
    });
    createTouchButton(this, {
      x: 360, y: 1180, width: 280, height: 88,
      label: this.room.kind === "bridal" ? "통로로 돌아가기" : "로비로 돌아가기", depth: 10,
      onPress: () => {
        if (this.leaving || this.game.canvas.dataset.roomReady !== "true") return;
        this.leaving = true;
        this.movement?.setEnabled(false);
        if (this.room.kind === "bridal") {
          fadeToScene(this, SCENE_KEYS.GreeneryCorridor, { entrance: "bridal" });
        } else {
          fadeToScene(this, SCENE_KEYS.VenueLobby);
        }
      },
    });
    this.events.once(Phaser.Scenes.Events.POST_UPDATE, () => {
      this.game.canvas.dataset.roomReady = "true";
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.movement?.destroy();
      this.movement = undefined;
    });
  }

  update(_time: number, delta: number): void {
    if (!this.leaving) this.movement?.update(delta);
  }

  private renderRoom(): void {
    switch (this.room.kind) {
      case "photo":
        sceneArt(this, "photo-booth", 360, 500, 240, 240);
        break;
      case "banquet":
        sceneArt(this, "buffet-island", 220, 480, 256, 160);
        sceneArt(this, "drinks-station", 560, 480, 144, 96);
        this.add.sprite(160, 590, "player-guest", 12).setScale(2);
        this.add.sprite(280, 590, "player-guest", 12).setScale(2);
        break;
      case "bridal":
        new Npc(this, { x: 360, y: 480, label: "신부", variant: "bride" });
        break;
      case "waiting":
        break;
    }
  }
}

export class PhotoBoothScene extends VenueRoomScene {
  constructor() {
    super({ kind: "photo", key: SCENE_KEYS.PhotoBooth, title: "포토부스", background: "photo-room-background" });
  }
}

export class BanquetScene extends VenueRoomScene {
  constructor() {
    super({ kind: "banquet", key: SCENE_KEYS.Banquet, title: "연회장", background: "banquet-background" });
  }
}

export class BridalRoomScene extends VenueRoomScene {
  constructor() {
    super({ kind: "bridal", key: SCENE_KEYS.BridalRoom, title: "신부대기실", background: "bridal-room-background" });
  }
}

export class WaitingRoomScene extends VenueRoomScene {
  constructor() {
    super({ kind: "waiting", key: SCENE_KEYS.WaitingRoom, title: "대기실", background: "waiting-room-background" });
  }
}
