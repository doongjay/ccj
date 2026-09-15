import Phaser from "phaser";
import { GAMEPLAY_LAYOUTS } from "../data/layout";
import { GUEST_GROUND_OFFSET_Y, LOBBY_FLOOR } from "../data/lobbyFloor";
import { warmStage, warmSceneAssets } from "../systems/stageAssets";
import { notebookKeepsakes, restoreNotebookPhotos } from "../ui/sessionMemories";
import { saveCheckpoint } from "../state/checkpoint";
import type { LayoutTrigger, TriggerShape } from "../data/layout";
import { Npc } from "../objects/Npc";
import { Player } from "../objects/Player";
import { LOBBY_OBSTACLES, LOBBY_ROOM_ENTRANCES, renderLobbyLandmarks, renderLobbyFloor } from "./lobbyArt";
import {
  completeProgressionFlag,
  GUEST_SIDES,
  GAME_STATE_REGISTRY_KEYS,
  isProgressionFlagComplete,
  PROGRESSION_FLAGS,
  readGuestSide,
  SCENE_KEYS,
} from "../state/gameState";
import { PhotoGalleryModal } from "../systems/PhotoGalleryModal";
import { StoryDialog } from "../ui/StoryDialog";
import type { StoryInfoOptions } from "../ui/StoryDialog";
import type { SceneTransitionData } from "../ui/sceneUi";
import { TapToMove } from "../systems/TapToMove";
import { TriggerZone } from "../systems/TriggerZone";
import type { TriggerZoneConfig } from "../systems/TriggerZone";
import {
  createTouchButton,
  createSceneHotspot,
  createSceneHeader,
  fadeToScene,
  markActiveScene,
  SCENE_UI_COLORS,
} from "../ui/sceneUi";

const HALL_RETURN_POINT = { x: 590, y: 230 } as const;
// Standing points on the existing floor, outside furniture and the gallery
// re-entry trigger. Facility clicks open immediately; these are return anchors.
const FACILITY_RETURN_POINTS = {
  "photo-booth": { x: 236, y: 610 },
  // Between the reception and photo-table signs, above their text plates and
  // outside both automatic-entry zones, including at the 320px text size.
  reception: { x: 474, y: 360 },
  "photo-table": { x: 474, y: 360 },
  atm: { x: 470, y: 590 },
  drinks: { x: 456, y: 970 },
} as const;

export class VenueLobbyScene extends Phaser.Scene {
  private player: Player | undefined;
  private tapToMove: TapToMove | undefined;
  private photoGallery: PhotoGalleryModal | undefined;
  private readonly triggerZones: TriggerZone[] = [];
  private lobbyReady = false;
  private receptionComplete = false;
  private transitionRequested = false;
  private infoDialog: StoryDialog | undefined;
  private infoOpen = false;
  private infoReturn: keyof typeof FACILITY_RETURN_POINTS | undefined;
  private notebookLabel: Phaser.GameObjects.Text | undefined;

  constructor() {
    super(SCENE_KEYS.VenueLobby);
  }

  create(data: SceneTransitionData = {}): void {
    const layout = GAMEPLAY_LAYOUTS["venue-lobby"];
    const spawn = layout.spawns[0];

    if (spawn === undefined) {
      throw new Error("VenueLobbyScene requires a lobby entry spawn.");
    }

    this.lobbyReady = false;
    this.infoOpen = false;
    this.infoReturn = undefined;
    this.infoDialog = undefined;
    this.receptionComplete = isProgressionFlagComplete(this.registry, PROGRESSION_FLAGS.receptionComplete);
    this.transitionRequested = false;
    this.triggerZones.length = 0;
    markActiveScene(this, SCENE_KEYS.VenueLobby);
    this.game.canvas.dataset.lobbyReady = "false";
    this.game.canvas.dataset.lobbyInfo = "";
    this.game.canvas.dataset.bridalRoomVisited = String(isProgressionFlagComplete(this.registry, PROGRESSION_FLAGS.bridalRoomVisited));
    this.game.canvas.dataset.photoBoothVisited = String(isProgressionFlagComplete(this.registry, PROGRESSION_FLAGS.photoBoothVisited));
    this.game.canvas.dataset.photoTableVisited = String(isProgressionFlagComplete(this.registry, PROGRESSION_FLAGS.photoTableVisited));
    this.game.canvas.dataset.guestSide = readGuestSide(this.registry) ?? "";
    this.game.canvas.dataset.activeQuiz = "";
    this.game.canvas.dataset.q3ModalOpen = "false";
    this.game.canvas.dataset.photoGalleryOpen = "false";
    this.game.canvas.dataset.photoGalleryIndex = "0";
    this.game.canvas.dataset.receptionComplete = String(this.receptionComplete);
    this.game.canvas.dataset.receptionDesk = this.receptionComplete ? readGuestSide(this.registry) ?? "" : "";
    this.game.canvas.dataset.receptionExpectedDesk = readGuestSide(this.registry) ?? "";
    this.game.canvas.dataset.roomBridePresent = "false";
    this.game.canvas.dataset.venueRoom = "lobby";
    this.game.canvas.dataset.roomReady = "false";
    this.game.canvas.dataset.receptionWarning = "";
    this.game.canvas.dataset.lobbyTransitionCount = "0";

    renderLobbyFloor(this);
    this.cameras.main.fadeIn(350);
    const header = createSceneHeader(this, {
      title: "라시따시어터",
      y: 48,
    });
    header.title.setStroke(SCENE_UI_COLORS.ivory.text, 4);

    renderLobbyLandmarks(this, item => this.inspectItem(item));
    new Npc(this, { x: 360, y: 288, label: "접수", variant: "reception", showLabel: false, cropHeight: 30 });

    const arrival = data.entrance === "hall" ? HALL_RETURN_POINT
      : data.entrance === "photo-booth" || data.entrance === "reception" ? FACILITY_RETURN_POINTS[data.entrance] : spawn.point;
    this.player = new Player(this, {
      x: arrival.x,
      y: arrival.y,
      label: "하객",
      speed: 640,
    });
    this.tapToMove = new TapToMove(this, this.player, {
      bounds: layout.worldBounds,
      blockedAreas: LOBBY_OBSTACLES,
      floor: LOBBY_FLOOR,
      groundOffsetY: GUEST_GROUND_OFFSET_Y,
      onInvalidTap: point => {
        this.game.canvas.dataset.lobbyInvalidTap = "true";
        const cue = this.add.text(point.x, point.y, "·", { fontFamily: "Galmuri11", fontSize: "24px", color: "#c8a24b" }).setOrigin(0.5).setDepth(21);
        this.time.delayedCall(350, () => cue.destroy());
      },
    });
    this.renderRoomNavigation();
    for (const target of [
      { name: "reception", x: 360, y: 420, width: 160, height: 100, destination: { x: 360, y: 420 } },
      { name: "photo-table", x: 550, y: 440, width: 180, height: 100, destination: { x: 550, y: 450 } },
      { name: "hall", x: 590, y: 150, width: 184, height: 100, destination: { x: 590, y: 150 } },
    ]) createSceneHotspot(this, { ...target, onPress: () => {
      if (!this.lobbyReady || this.transitionRequested || this.isModalOpen()) return;
      if (target.name === "reception") this.handleReceptionDesk();
      else if (target.name === "photo-table") this.openPhotoGallery(true);
      else if (target.name === "hall" && (this.requiredVisits().some(({ flag }) => !isProgressionFlagComplete(this.registry, flag))
        || this.player?.x === 590 && this.player.y === 150)) this.tryEnterHall();
      else this.tapToMove?.moveTo(target.destination.x, target.destination.y);
    } });
    this.notebookLabel = createTouchButton(this, {
      x: 128, y: 60, width: 224, height: 88, label: "수첩 0/0", depth: 15,
      onPress: () => this.showNotebook(),
    }).label;
    this.updateNotebook();
    this.add.rectangle(580, 360, 180, 160, 0xffffff, 0).setInteractive({ useHandCursor: true })
      .on("pointerdown", (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.openPhotoGallery(true);
      });

    this.triggerZones.push(
      new TriggerZone(this, {
        ...toTriggerZoneConfig(findTrigger(layout.triggers, "visit-photo-table").shape),
        mode: "repeat",
        onEnter: () => this.openPhotoGallery(),
      }),
    );

    this.triggerZones.push(new TriggerZone(this, {
      ...toTriggerZoneConfig(findTrigger(layout.triggers, "reception-desk").shape),
      mode: "repeat",
      onEnter: () => {
        const target = this.tapToMove?.getDestination();
        if (target && (target.x < 270 || target.x > 450 || target.y < 330 || target.y > 490)) return;
        this.handleReceptionDesk();
      },
    }));

    this.triggerZones.push(
      new TriggerZone(this, {
        ...toTriggerZoneConfig(findTrigger(layout.triggers, "enter-hall").shape),
        mode: "repeat",
        onEnter: () => this.tryEnterHall(),
      }),
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownLobby, this);
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.markLobbyReady, this);
  }

  update(_time: number, delta: number): void {
    const player = this.player;

    if (player === undefined || this.transitionRequested || this.isModalOpen()) {
      return;
    }

    this.tapToMove?.update(delta);

    for (const zone of this.player?.isMoving() ? [] : this.triggerZones) {
      zone.update(player);
    }
  }

  private renderRoomNavigation(): void {
    for (const room of LOBBY_ROOM_ENTRANCES) {
      createSceneHotspot(this, { ...room, name: room.label, width: 208, onPress: () => {
          if (!this.lobbyReady || this.transitionRequested || this.isModalOpen()) return;
          if (room.scene === SCENE_KEYS.Banquet) {
            this.tryEnterBanquet();
            return;
          }
          if (room.scene === SCENE_KEYS.GreeneryCorridor && readGuestSide(this.registry) !== GUEST_SIDES.bride) {
            this.showInfo("bridal-restricted", "신부대기실은 신부측 하객에게 양보하고, 나는 로비를 둘러보러 가야겠다.");
            return;
          }
          this.enterRoom(room.scene);
        } });
    }
  }

  private enterRoom(scene: (typeof LOBBY_ROOM_ENTRANCES)[number]["scene"]): void {
    this.player?.stop();
    this.transitionRequested = true;
    this.tapToMove?.setEnabled(false);
    fadeToScene(this, scene, scene === SCENE_KEYS.PhotoBooth ? { lobbyReturn: "photo-booth" } : {});
  }

  private handleReceptionDesk(lobbyReturn: SceneTransitionData["lobbyReturn"] = "reception"): void {
    if (!this.lobbyReady || this.isModalOpen() || this.transitionRequested) return;
    if (this.receptionComplete) return;
    this.transitionRequested = true;
    this.tapToMove?.setEnabled(false);
    fadeToScene(this, SCENE_KEYS.Reception, { lobbyReturn });
  }

  private tryEnterHall(): void {
    if (this.transitionRequested || this.isModalOpen()) return;

    const missing = this.requiredVisits().filter(({ flag }) => !isProgressionFlagComplete(this.registry, flag));
    if (missing.length > 0) {
      this.player?.stop();
      this.tapToMove?.setEnabled(false);
      this.infoOpen = true;
      this.game.canvas.dataset.lobbyInfo = "explore-required";
      this.infoDialog ??= new StoryDialog(this, "notebook");
      const list = document.createElement("ul");
      list.className = "hall-requirements";
      for (const { label, flag } of missing) {
        const row = document.createElement("li");
        const text = document.createElement("span");
        text.textContent = `♡  ${label}`;
        const go = document.createElement("button");
        go.type = "button";
        go.className = "story-choice";
        go.textContent = "GO!";
        go.setAttribute("aria-label", `${label} GO!`);
        go.onclick = () => {
          this.infoDialog?.hide();
          this.closeInfo();
          if (flag === PROGRESSION_FLAGS.photoTableVisited) this.openPhotoGallery(true);
          else if (flag === PROGRESSION_FLAGS.receptionComplete) this.handleReceptionDesk();
          else this.enterRoom(flag === PROGRESSION_FLAGS.photoBoothVisited ? SCENE_KEYS.PhotoBooth : SCENE_KEYS.GreeneryCorridor);
        };
        row.append(text, go);
        list.append(row);
      }
      this.infoDialog.setPlacement("notebook");
      this.infoDialog.showInfo(`아직 ${missing.length}개의 추억이 남았어요.`, () => this.closeInfo(), {
        variant: "reminder", closeLabel: null, content: list, dismissOnBackdrop: true,
      });
      return;
    }

    this.transitionRequested = true;
    this.tapToMove?.setEnabled(false);
    this.game.canvas.dataset.lobbyTransitionCount = "1";
    fadeToScene(this, SCENE_KEYS.VenueHall);
  }

  private tryEnterBanquet(): void {
    if (isProgressionFlagComplete(this.registry, PROGRESSION_FLAGS.mealComplete)) {
      this.tryEnterHall();
      return;
    }
    const enter = () => {
      this.infoOpen = false;
      this.transitionRequested = true;
      fadeToScene(this, SCENE_KEYS.DinnerJourney);
    };
    this.player?.stop();
    this.tapToMove?.setEnabled(false);
    if (isProgressionFlagComplete(this.registry, PROGRESSION_FLAGS.banquetGuideComplete)) {
      enter();
      return;
    }
    this.infoOpen = true;
    this.game.canvas.dataset.lobbyInfo = "meal-order";
    this.infoDialog ??= new StoryDialog(this);
    this.infoDialog.show("아직 결혼식 시작은 안했는데 밥을 어떡하지?", [
      { label: "1시반부터 밥먹기", onSelect: enter },
      { label: "결혼식 먼저 보기", onSelect: () => {
        this.infoOpen = false;
        this.tapToMove?.setEnabled(true);
        this.tryEnterHall();
      } },
    ]);
  }

  private shutdownLobby(): void {
    this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.markLobbyReady, this);
    this.photoGallery?.destroy();
    this.photoGallery = undefined;
    this.tapToMove?.destroy();
    this.tapToMove = undefined;
    this.player = undefined;

    for (const zone of this.triggerZones) {
      zone.destroy();
    }

    this.triggerZones.length = 0;
  }

  private markLobbyReady(): void {
    if (this.lobbyReady || this.cameras.main.fadeEffect.isRunning) {
      return;
    }

    this.lobbyReady = true;
    saveCheckpoint(this, "lobby");
    this.game.canvas.dataset.lobbyReady = "true";
    this.time.delayedCall(800, () => {
      if (this.requiredVisits().some(({ flag }) => isProgressionFlagComplete(this.registry, flag))) warmSceneAssets(this, SCENE_KEYS.VenueHall);
      warmStage(this, "photo");
      warmStage(this, "reception");
      if (readGuestSide(this.registry) === GUEST_SIDES.bride) { warmStage(this, "garden"); warmStage(this, "bridal"); }
    });
    this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.markLobbyReady, this);
    if (!this.registry.get(GAME_STATE_REGISTRY_KEYS.lobbyIntroShown)) {
      this.registry.set(GAME_STATE_REGISTRY_KEYS.lobbyIntroShown, true);
      this.showInfo("arrival-guide", "도착! 로비가 넓군.\n어디부터 갈까?", { variant: "tutorial", tapToContinue: true });
    }
  }

  private requiredVisits(): { label: string; location: string; flag: typeof PROGRESSION_FLAGS[keyof typeof PROGRESSION_FLAGS] }[] {
    const visits: ReturnType<VenueLobbyScene["requiredVisits"]> = [
      { label: "포토부스에서 사진 찍기", location: "로비 왼쪽", flag: PROGRESSION_FLAGS.photoBoothVisited },
      { label: "포토테이블 구경하기", location: "로비 오른쪽 위", flag: PROGRESSION_FLAGS.photoTableVisited },
      { label: "축의대에서 접수하기", location: "로비 정면", flag: PROGRESSION_FLAGS.receptionComplete },
    ];
    if (readGuestSide(this.registry) === GUEST_SIDES.bride) visits.push({ label: "현서와 사진 찍기", location: "오른쪽 아래 신부대기실 통로", flag: PROGRESSION_FLAGS.bridalRoomVisited });
    return visits;
  }

  private notebookCopy(): string {
    return `오늘의 추억 수첩\n식장 입장 전 필수 일정\n\n${this.requiredVisits().map(({ label, location, flag }) => `${isProgressionFlagComplete(this.registry, flag) ? "♥" : "♡"}  ${label}\n　 ${location}`).join("\n")}`;
  }

  private async showNotebook(): Promise<void> {
    if (!this.lobbyReady || this.infoOpen || this.transitionRequested) return;
    // Open the requested panel in the same input event. Restored photos hydrate
    // this panel afterwards; no invisible asynchronous interval can accept a room tap.
    const content = document.createElement("div");
    this.showInfo("memory-book", this.notebookCopy(), { variant: "notebook", content });
    await restoreNotebookPhotos(this);
    if (content.isConnected && this.scene.isActive() && this.infoOpen
      && this.game.canvas.dataset.lobbyInfo === "memory-book") {
      const photos = notebookKeepsakes(this.game);
      if (photos) content.replaceChildren(photos);
    }
  }

  private updateNotebook(): void {
    const visits = this.requiredVisits();
    const completed = visits.filter(({ flag }) => isProgressionFlagComplete(this.registry, flag)).length;
    this.notebookLabel?.setText(`수첩 ${completed}/${visits.length}`);
    this.game.canvas.dataset.lobbyProgress = `${completed}/${visits.length}`;
  }

  private closeInfo(): void {
    if (this.infoReturn) this.standAtFacility(this.infoReturn);
    this.infoReturn = undefined;
    this.infoOpen = false;
    this.game.canvas.dataset.lobbyInfo = "";
    this.tapToMove?.setEnabled(true);
  }

  private isModalOpen(): boolean {
    return this.infoOpen || this.photoGallery?.isOpen() === true;
  }

  private inspectItem(item: "atm" | "drinks"): void {
    if (!this.lobbyReady || this.transitionRequested || this.isModalOpen()) return;
    this.infoReturn = item;
    this.showInfo(item, item === "atm"
      ? "지하1층으로 가면 은행 ATM(국민, 우리, 신한, SC제일은행)이 있다고 한다."
      : "오 목좀 축이고 쉬고있을까.");
  }

  private showInfo(item: string, copy: string, options: StoryInfoOptions = {}): void {
    if (!this.lobbyReady || this.transitionRequested || this.isModalOpen()) return;
    this.player?.stop();
    this.tapToMove?.setEnabled(false);
    this.infoOpen = true;
    this.game.canvas.dataset.lobbyInfo = item;
    this.infoDialog ??= new StoryDialog(this, "notebook");
    this.infoDialog.showInfo(copy, () => this.closeInfo(), { tapToContinue: !options.variant || options.variant === "tutorial", ...options });
  }

  private standAtFacility(facility: keyof typeof FACILITY_RETURN_POINTS): void {
    const point = FACILITY_RETURN_POINTS[facility];
    this.player?.stop().setPosition(point.x, point.y);
  }

  private openPhotoGallery(immediate = false): void {
    if (!this.lobbyReady || this.transitionRequested || this.isModalOpen()) return;
    const destination = this.tapToMove?.getDestination();
    if (!immediate && destination && (destination.x < 480 || destination.x > 620 || destination.y < 420 || destination.y > 484)) return;
    this.player?.stop();
    this.tapToMove?.setEnabled(false);
    completeProgressionFlag(this.registry, PROGRESSION_FLAGS.photoTableVisited);
    saveCheckpoint(this, "lobby");
    this.game.canvas.dataset.photoTableVisited = "true";
    this.updateNotebook();
    this.photoGallery ??= new PhotoGalleryModal(this, () => {
      this.standAtFacility("photo-table");
      this.tapToMove?.setEnabled(true);
    });
    this.photoGallery.open();
  }
}

function findTrigger(triggers: readonly LayoutTrigger[], triggerId: string): LayoutTrigger {
  const trigger = triggers.find((candidate) => candidate.id === triggerId);

  if (trigger === undefined) {
    throw new Error(`Missing venue lobby trigger ${triggerId}.`);
  }

  return trigger;
}

function toTriggerZoneConfig(shape: TriggerShape): TriggerZoneConfig {
  switch (shape.kind) {
    case "rectangle":
      return {
        shape: "rectangle",
        x: shape.bounds.x,
        y: shape.bounds.y,
        width: shape.bounds.width,
        height: shape.bounds.height,
      };
    case "circle":
      return {
        shape: "circle",
        x: shape.center.x,
        y: shape.center.y,
        radius: shape.radius,
      };
  }
}
