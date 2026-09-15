import { photoFlash } from "../ui/motionPreference";
import Phaser from "phaser";
import { saveCheckpoint } from "../state/checkpoint";
import type { ImageKey } from "../data/assetManifest";
import { Player } from "../objects/Player";
import { completeProgressionFlag, isProgressionFlagComplete, GUEST_SIDES, PROGRESSION_FLAGS, readGuestSide, SCENE_KEYS } from "../state/gameState";
import { TapToMove } from "../systems/TapToMove";
import { createKoreanText, createTouchButton, fadeToScene, markActiveScene, SCENE_UI_COLORS } from "../ui/sceneUi";
import { sceneArt } from "./sceneArt";
import { photoArt } from "./photoArt";
import { StoryDialog } from "../ui/StoryDialog";
import type { SceneTransitionData } from "../ui/sceneUi";
import { captureKeepsake, keepsakeFigure } from "../ui/sessionMemories";
import { addBridalRoomBride } from "../ui/bridalRoomBride";

type RoomKind = "photo" | "banquet" | "bridal" | "waiting";
type RoomSceneKey = typeof SCENE_KEYS.PhotoBooth | typeof SCENE_KEYS.Banquet | typeof SCENE_KEYS.BridalRoom | typeof SCENE_KEYS.WaitingRoom;
type RoomConfig = Readonly<{ kind: RoomKind; key: RoomSceneKey; title: string; background: ImageKey }>;

class VenueRoomScene extends Phaser.Scene {
  private readonly room: RoomConfig;
  private movement: TapToMove | undefined;
  private leaving = false;
  private automaticPlayer: Player | undefined;
  private seated = false;
  private photoControls: ReturnType<typeof createTouchButton>[] = [];
  private lobbyReturn: SceneTransitionData["lobbyReturn"];

  constructor(room: RoomConfig) {
    super(room.key);
    this.room = room;
  }

  create(data: SceneTransitionData = {}): void {
    this.lobbyReturn = data.lobbyReturn;
    if (this.room.kind === "bridal" && readGuestSide(this.registry) !== GUEST_SIDES.bride) {
      this.scene.start(SCENE_KEYS.VenueLobby);
      return;
    }
    this.leaving = false;
    this.automaticPlayer = undefined;
    this.seated = false;
    this.photoControls = [];
    this.game.canvas.dataset.photoResultOpen = "false";
    markActiveScene(this, this.room.key);
    this.game.canvas.dataset.venueRoom = this.room.kind;
    this.game.canvas.dataset.roomBridePresent = String(this.room.kind === "bridal");
    this.game.canvas.dataset.roomReady = "false";
    if (this.room.kind === "waiting") photoArt(this, "lounge");
    else if (this.room.kind === "photo") {
      photoArt(this, "photo-booth");
    }
    else if (this.room.kind === "banquet") photoArt(this, "banquet");
    else if (this.room.kind === "bridal") {
      photoArt(this, "bridal-room");
      addBridalRoomBride(this);
    }
    else sceneArt(this, this.room.background);
    createKoreanText(this, {
      x: 360, y: 96, copy: this.room.title, width: 400,
      maxCharactersPerLine: 12, maxLines: 1, fontSize: 32, lineHeight: 40,
      color: "labelText",
    }).setBackgroundColor(SCENE_UI_COLORS.labelSurface.text);
    this.renderRoom();
    if (this.room.kind === "photo") {
      this.beginPhotoVisit();
      return;
    }
    if (this.room.kind === "bridal") {
      this.beginBridalVisit();
      return;
    }
    const player = new Player(this, { x: 360, y: 1000, label: "하객", speed: 640 });
    this.movement = new TapToMove(this, player, {
      bounds: { x: 64, y: 740, width: 592, height: 340 },
      blockedAreas: [{ x: 0, y: 1120, width: 720, height: 160 }],
    });
    createTouchButton(this, {
      x: 360, y: 1180, width: 280, height: 88,
      label: "로비로 돌아가기", depth: 10,
      onPress: () => {
        if (this.leaving || this.game.canvas.dataset.roomReady !== "true") return;
        this.leaving = true;
        this.movement?.setEnabled(false);
        fadeToScene(this, SCENE_KEYS.VenueLobby, { entrance: this.lobbyReturn });
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
    if (!this.automaticPlayer || this.leaving) return;
    this.automaticPlayer.updateMovement(delta);
    const stage = this.room.kind === "photo" ? this.game.canvas.dataset.photoBoothStage : this.game.canvas.dataset.bridalVisitStage;
    if (stage === "approaching" && !this.automaticPlayer.isMoving() && !this.seated) {
      this.seated = true;
      this.automaticPlayer.setAppearance(this.room.kind === "photo" ? "posing" : "seated");
      this.setPhotoStage(this.room.kind === "photo" ? "posing" : "seated");
      // This short capture hold cannot be skipped by the shutter's repeat input.
      this.time.delayedCall(900, () => this.finishPhoto());
    }
  }

  private setPhotoStage(stage: string): void {
    if (this.room.kind === "photo") this.game.canvas.dataset.photoBoothStage = stage;
    else this.game.canvas.dataset.bridalVisitStage = stage;
  }

  private setPhotoControls(visible: boolean): void {
    for (const control of this.photoControls) {
      control.hitArea.setVisible(visible);
      if (control.hitArea.input) control.hitArea.input.enabled = visible;
      control.label.setVisible(visible);
    }
  }

  private leavePhoto(): void {
    if (this.leaving) return;
    this.leaving = true;
    this.setPhotoControls(false);
    this.game.canvas.dataset.photoResultOpen = "false";
    this.game.canvas.dataset.photoReturnedAt = String(performance.now());
    fadeToScene(this, SCENE_KEYS.VenueLobby, { entrance: this.lobbyReturn });
  }

  private finishPhoto(): void {
    const kind = this.room.kind === "photo" ? "booth" : "bridal";
    const flag = kind === "booth" ? PROGRESSION_FLAGS.photoBoothVisited : PROGRESSION_FLAGS.bridalRoomVisited;
    const photo = captureKeepsake(this, kind);
    this.game.canvas.dataset.photoCharacterTextureCount = String(this.textures.getTextureKeys().filter(key => /^(?:minimi-(?:male|female)(?:-face-[12])?|heads-(?:male|female)-face-[012]|formal-guest-portraits)$/.test(key)).length);
    if (!isProgressionFlagComplete(this.registry, flag)) {
      completeProgressionFlag(this.registry, flag);
      const count = kind === "booth" ? "photoBoothCompletionCount" : "bridalPhotoCompletionCount";
      this.game.canvas.dataset[count] = String(Number(this.game.canvas.dataset[count] ?? "0") + 1);
    }
    this.game.canvas.dataset[flag] = "true";
    saveCheckpoint(this, "lobby");
    this.game.canvas.dataset.photoCapturedAt = String(performance.now());
    photoFlash(this, 200);
    this.time.delayedCall(220, () => {
      this.setPhotoStage("result");
      this.game.canvas.dataset.photoResultOpen = "true";
      this.game.canvas.dataset.photoResultAt = String(performance.now());
      const result = new StoryDialog(this);
      result.showInfo(`${photo.title}\n추억을 수첩에 남겼어요 ♥`, () => this.leavePhoto(), {
        variant: "photo-result", closeLabel: "로비로 돌아가기", content: keepsakeFigure(photo),
      });
    });
  }

  private createPhotoControls(): void {
    this.photoControls.push(createTouchButton(this, {
      x: 360, y: 860, width: 280, height: 88, label: "사진 찍기", depth: 10,
      onPress: () => {
        const stage = this.room.kind === "photo" ? this.game.canvas.dataset.photoBoothStage : this.game.canvas.dataset.bridalVisitStage;
        if (this.leaving || stage !== "ready") return;
        this.setPhotoControls(false);
        this.setPhotoStage("approaching");
        if (this.room.kind === "photo") this.automaticPlayer?.moveTo(400, 650);
        else this.automaticPlayer?.walkPath([{ x: 450, y: 720 }, { x: 500, y: 540 }, { x: 512, y: 480 }, { x: 512, y: 429 }]);
      },
    }), createTouchButton(this, {
      x: 360, y: 1180, width: 280, height: 88, label: "로비로 돌아가기", depth: 10,
      onPress: () => {
        const stage = this.room.kind === "photo" ? this.game.canvas.dataset.photoBoothStage : this.game.canvas.dataset.bridalVisitStage;
        if (stage === "ready") this.leavePhoto();
      },
    }));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.automaticPlayer = undefined;
      this.game.canvas.dataset.photoResultOpen = "false";
    });
  }

  private beginBridalVisit(): void {
    this.cameras.main.fadeIn(300);
    this.game.canvas.dataset.roomReady = "true";
    this.setPhotoStage("greeting");
    this.automaticPlayer = new Player(this, { x: 270, y: 950, speed: 300 });
    this.automaticPlayer.disableInteractive();
    this.createPhotoControls();
    this.setPhotoControls(false);
    const dialog = new StoryDialog(this, "bottom");
    dialog.narrate("현서야 결혼 축하해!", () => {
      this.setPhotoStage("ready");
      this.setPhotoControls(true);
    }, 700);
  }

  private beginPhotoVisit(): void {
    this.game.canvas.dataset.roomReady = "true";
    this.setPhotoStage("ready");
    this.automaticPlayer = new Player(this, { x: 360, y: 1000, speed: 300 });
    this.automaticPlayer.disableInteractive();
    this.createPhotoControls();
  }


  private renderRoom(): void {
    switch (this.room.kind) {
      case "banquet":
        break;
      case "bridal":
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
    super({ kind: "waiting", key: SCENE_KEYS.WaitingRoom, title: "휴게공간", background: "waiting-room-background" });
  }
}
