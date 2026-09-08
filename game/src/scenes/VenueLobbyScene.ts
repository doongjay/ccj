import Phaser from "phaser";
import { GAME_WIDTH } from "../config";
import { GAMEPLAY_LAYOUTS } from "../data/layout";
import type { LayoutTrigger, TriggerShape } from "../data/layout";
import { QUIZZES } from "../data/scenario";
import type { CorrectQuizOption, QuizData } from "../data/scenario";
import { Npc } from "../objects/Npc";
import { Player } from "../objects/Player";
import { sceneArt } from "./sceneArt";
import { LOBBY_ROOM_ENTRANCES, renderLobbyLandmarks } from "./lobbyArt";
import {
  completeProgressionFlag,
  GUEST_SIDES,
  isProgressionFlagComplete,
  PROGRESSION_FLAGS,
  readGuestSide,
  SCENE_KEYS,
  setGuestSide,
} from "../state/gameState";
import type { GuestSide } from "../state/gameState";
import { QuizModal } from "../systems/QuizModal";
import { PhotoGalleryModal } from "../systems/PhotoGalleryModal";
import { TapToMove } from "../systems/TapToMove";
import { TriggerZone } from "../systems/TriggerZone";
import type { TriggerZoneConfig } from "../systems/TriggerZone";
import {
  createKoreanText,
  createSceneHeader,
  createTouchButton,
  fadeToScene,
  markActiveScene,
  SCENE_UI_COLORS,
} from "../ui/sceneUi";

type ReceptionTarget = Readonly<{
  side: GuestSide;
  triggerId: "groom-desk" | "bride-desk";
  datasetValue: "groom" | "bride";
  label: "신랑측 축의대" | "신부측 축의대";
}>;

const RECEPTION_TARGETS = [
  { side: GUEST_SIDES.groom, triggerId: "groom-desk", datasetValue: "groom", label: "신랑측 축의대" },
  { side: GUEST_SIDES.bride, triggerId: "bride-desk", datasetValue: "bride", label: "신부측 축의대" },
] as const satisfies readonly ReceptionTarget[];

export class VenueLobbyScene extends Phaser.Scene {
  private player: Player | undefined;
  private tapToMove: TapToMove | undefined;
  private quizModal: QuizModal | undefined;
  private photoGallery: PhotoGalleryModal | undefined;
  private readonly triggerZones: TriggerZone[] = [];
  private statusText: Phaser.GameObjects.Text | undefined;
  private lobbyReady = false;
  private receptionComplete = false;
  private transitionRequested = false;

  constructor() {
    super(SCENE_KEYS.VenueLobby);
  }

  create(): void {
    const layout = GAMEPLAY_LAYOUTS["venue-lobby"];
    const spawn = layout.spawns[0];

    if (spawn === undefined) {
      throw new Error("VenueLobbyScene requires a lobby entry spawn.");
    }

    this.lobbyReady = false;
    this.receptionComplete = isProgressionFlagComplete(this.registry, PROGRESSION_FLAGS.receptionComplete);
    this.transitionRequested = false;
    this.triggerZones.length = 0;
    markActiveScene(this, SCENE_KEYS.VenueLobby);
    this.game.canvas.dataset.lobbyReady = "false";
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

    sceneArt(this, "lobby-background");
    const header = createSceneHeader(this, {
      title: "라시따시어터",
      y: 48,
    });
    header.title.setStroke(SCENE_UI_COLORS.ivory.text, 4);
    this.statusText = createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: 98,
      copy: "축의대에서 접수해 주세요",
      width: 640,
      maxCharactersPerLine: 32,
      maxLines: 1,
      fontSize: 18,
      lineHeight: 24,
      color: "labelText",
    }).setBackgroundColor(SCENE_UI_COLORS.labelSurface.text);

    renderLobbyLandmarks(this);
    new Npc(this, { x: 110, y: 300, label: "접수", variant: "reception" });
    new Npc(this, { x: 260, y: 300, label: "접수", variant: "reception" });

    this.player = new Player(this, {
      x: spawn.point.x,
      y: spawn.point.y,
      label: "하객",
      speed: 640,
    });
    this.tapToMove = new TapToMove(this, this.player, {
      bounds: layout.worldBounds,
      blockedAreas: LOBBY_ROOM_ENTRANCES.map(room => ({ x: room.x - 104, y: room.y - 44, width: 208, height: 88 })),
    });
    this.renderRoomNavigation();
    const selectedSide = readGuestSide(this.registry);
    if (this.receptionComplete) {
      this.statusText.setText("접수 완료! 식장 입구로 이동해요");
    } else if (selectedSide !== undefined) {
      this.statusText.setText(`${findReceptionTarget(selectedSide).label}로 이동해 접수해요`);
    }

    this.triggerZones.push(
      new TriggerZone(this, {
        ...toTriggerZoneConfig(findTrigger(layout.triggers, "visit-photo-table").shape),
        mode: "repeat",
        onEnter: () => this.openPhotoGallery(),
      }),
    );

    for (const target of RECEPTION_TARGETS) {
      this.triggerZones.push(
        new TriggerZone(this, {
          ...toTriggerZoneConfig(findTrigger(layout.triggers, target.triggerId).shape),
          mode: "repeat",
          onEnter: () => this.handleReceptionDesk(target),
        }),
      );
    }

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

    for (const zone of this.triggerZones) {
      zone.update(player);
    }
  }

  private renderRoomNavigation(): void {
    for (const room of LOBBY_ROOM_ENTRANCES) {
      createTouchButton(this, {
        x: room.x, y: room.y, width: 208, height: 88,
        label: room.label, depth: 10,
        onPress: () => {
          if (!this.lobbyReady || this.transitionRequested || this.isModalOpen()) return;
          this.transitionRequested = true;
          this.tapToMove?.setEnabled(false);
          fadeToScene(this, room.scene);
        },
      });
    }
  }

  private openGuestSideQuiz(quiz: QuizData, receptionTarget: ReceptionTarget): void {
    if (!this.lobbyReady || this.isModalOpen() || readGuestSide(this.registry) !== undefined) {
      return;
    }

    this.tapToMove?.setEnabled(false);
    this.player?.stop();
    this.game.canvas.dataset.activeQuiz = quiz.id;
    this.game.canvas.dataset.q3ModalOpen = "true";
    this.quizModal = new QuizModal({
      scene: this,
      quiz,
      onCorrect: (option) => this.chooseGuestSide(option, receptionTarget),
    });
    this.quizModal.open();
  }

  private chooseGuestSide(option: CorrectQuizOption, receptionTarget: ReceptionTarget): void {
    const side = guestSideForOption(option);
    const target = findReceptionTarget(side);
    const state = setGuestSide(this.registry, side);
    this.game.canvas.dataset.activeQuiz = "";
    this.game.canvas.dataset.q3ModalOpen = "false";
    this.game.canvas.dataset.guestSide = state.guestSide ?? "";
    this.game.canvas.dataset.receptionExpectedDesk = target.datasetValue;
    this.game.canvas.dataset.receptionWarning = "";
    this.statusText?.setText(`${target.label}로 이동해 접수해요`);
    this.tapToMove?.setEnabled(true);
    this.handleReceptionDesk(receptionTarget);
  }

  private handleReceptionDesk(target: ReceptionTarget): void {
    const selectedSide = readGuestSide(this.registry);

    if (selectedSide === undefined) {
      this.openGuestSideQuiz(findQuiz("Q3"), target);
      return;
    }

    if (selectedSide !== target.side) {
      this.statusText?.setText("어이쿠, 그쪽은 반대편 축의대예요!");
      this.game.canvas.dataset.receptionWarning = "wrong-desk";
      return;
    }

    this.receptionComplete = true;
    completeProgressionFlag(this.registry, PROGRESSION_FLAGS.receptionComplete);
    this.game.canvas.dataset.receptionComplete = "true";
    this.game.canvas.dataset.receptionDesk = target.datasetValue;
    this.game.canvas.dataset.receptionWarning = "";
    this.statusText?.setText("접수 완료! 이제 식장 입구로 이동해요");
  }

  private tryEnterHall(): void {
    if (!this.receptionComplete || this.transitionRequested) {
      this.statusText?.setText("접수를 마친 뒤 식장 입구로 갈 수 있어요");
      return;
    }

    this.transitionRequested = true;
    this.tapToMove?.setEnabled(false);
    this.game.canvas.dataset.lobbyTransitionCount = "1";
    fadeToScene(this, SCENE_KEYS.VenueHall);
  }

  private shutdownLobby(): void {
    this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.markLobbyReady, this);
    this.photoGallery?.destroy();
    this.photoGallery = undefined;
    this.quizModal?.destroy();
    this.quizModal = undefined;
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
    this.game.canvas.dataset.lobbyReady = "true";
    this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.markLobbyReady, this);
  }

  private isModalOpen(): boolean {
    return this.quizModal?.isOpen() === true || this.photoGallery?.isOpen() === true;
  }

  private openPhotoGallery(): void {
    if (!this.lobbyReady || this.transitionRequested || this.isModalOpen()) return;
    this.player?.stop();
    this.tapToMove?.setEnabled(false);
    completeProgressionFlag(this.registry, PROGRESSION_FLAGS.photoTableVisited);
    this.photoGallery ??= new PhotoGalleryModal(this, () => this.tapToMove?.setEnabled(true));
    this.photoGallery.open();
  }
}

function findQuiz(quizId: "Q3"): QuizData {
  const quiz = QUIZZES.find((candidate) => candidate.id === quizId);

  if (quiz === undefined) {
    throw new Error(`Missing quiz ${quizId}.`);
  }

  return quiz;
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

function guestSideForOption(option: CorrectQuizOption): GuestSide {
  switch (option.callbackIntent) {
    case "guide-to-groom-reception":
      return GUEST_SIDES.groom;
    case "guide-to-bride-reception":
      return GUEST_SIDES.bride;
    case "advance-to-venue-lobby":
      throw new Error("Q3 answer cannot advance directly to the venue lobby.");
  }
}

function findReceptionTarget(side: GuestSide): ReceptionTarget {
  const target = RECEPTION_TARGETS.find((candidate) => candidate.side === side);

  if (target === undefined) {
    throw new Error(`Missing reception target for guest side ${side}.`);
  }

  return target;
}
