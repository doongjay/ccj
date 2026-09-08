import Phaser from "phaser";
import { GAME_WIDTH } from "../config";
import { GAMEPLAY_LAYOUTS } from "../data/layout";
import { WEDDING_METADATA } from "../data/weddingMetadata";
import { Player } from "../objects/Player";
import { Npc } from "../objects/Npc";
import { sceneArt } from "./sceneArt";
import { resetWeddingGameState, SCENE_KEYS } from "../state/gameState";
import { TapToMove } from "../systems/TapToMove";
import { TriggerZone } from "../systems/TriggerZone";
import {
  createKoreanText,
  createSceneHeader,
  createTouchButton,
  fadeToScene,
  markActiveScene,
} from "../ui/sceneUi";

export class EndingScene extends Phaser.Scene {
  private player: Player | undefined;
  private tapToMove: TapToMove | undefined;
  private replayZone: TriggerZone | undefined;
  private replayRequested = false;
  private replayReady = false;

  constructor() {
    super(SCENE_KEYS.Ending);
  }

  create(): void {
    const layout = GAMEPLAY_LAYOUTS.ending;
    const spawn = layout.spawns[0];
    const replayTrigger = layout.triggers.find((trigger) => trigger.id === "replay");

    if (spawn === undefined || replayTrigger === undefined || replayTrigger.shape.kind !== "rectangle") {
      throw new Error("EndingScene requires a spawn and replay rectangle trigger.");
    }

    this.replayRequested = false;
    this.replayReady = false;
    markActiveScene(this, SCENE_KEYS.Ending);
    this.game.canvas.dataset.endingReady = "true";
    this.game.canvas.dataset.endingReplayReady = "false";
    this.game.canvas.dataset.replayRequested = "false";
    this.game.canvas.dataset.replayTarget = "";
    this.game.canvas.dataset.replayCount = this.game.canvas.dataset.replayCount ?? "0";

    sceneArt(this, "ending-background");
    new Npc(this, { x: 304, y: 584, label: WEDDING_METADATA.groomName, variant: "groom" });
    new Npc(this, { x: 416, y: 584, label: WEDDING_METADATA.brideName, variant: "bride" });
    sceneArt(this, "photo-booth", 548, 848, 104, 104);
    createSceneHeader(this, {
      title: WEDDING_METADATA.venue.name,
      status: "함께 축하해 주셔서 감사합니다",
    });
    createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: 380,
      copy: `${WEDDING_METADATA.groomName} ♥ ${WEDDING_METADATA.brideName}`,
      width: 520,
      maxCharactersPerLine: 18,
      maxLines: 1,
      fontSize: 32,
      lineHeight: 38,
      color: "inkOutline",
    });
    createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: 444,
      copy: `${WEDDING_METADATA.eventDate.displayText}\n${WEDDING_METADATA.venue.name} ${WEDDING_METADATA.venue.hall}`,
      width: 520,
      maxCharactersPerLine: 24,
      maxLines: 2,
      fontSize: 22,
      lineHeight: 32,
      color: "inkOutline",
    });
    createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: 768,
      copy: "식장까지의 여정을 함께해 주셔서 고맙습니다\n따뜻한 마음만 가지고 와 주세요",
      width: 520,
      maxCharactersPerLine: 23,
      maxLines: 2,
      fontSize: 23,
      lineHeight: 32,
      color: "inkOutline",
    });
    createKoreanText(this, {
      x: 360,
      y: 864,
      copy: "오늘의 한 컷",
      width: 180,
      maxCharactersPerLine: 8,
      maxLines: 1,
      fontSize: 20,
      lineHeight: 28,
      color: "inkOutline",
    });

    createTouchButton(this, {
      x: 360,
      y: 994,
      width: 300,
      height: 88,
      label: "처음부터 다시",
      onPress: () => this.replay(),
    });

    this.player = new Player(this, {
      x: spawn.point.x,
      y: 1144,
      label: "귀가",
      speed: 620,
    });
    this.tapToMove = new TapToMove(this, this.player, { bounds: layout.worldBounds });
    this.replayZone = new TriggerZone(this, {
      shape: "rectangle",
      x: replayTrigger.shape.bounds.x,
      y: replayTrigger.shape.bounds.y,
      width: replayTrigger.shape.bounds.width,
      height: replayTrigger.shape.bounds.height,
      mode: "once",
      onEnter: () => this.replay(),
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownEnding, this);
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.markReplayReady, this);
  }

  update(_time: number, delta: number): void {
    const player = this.player;

    if (player === undefined || this.replayRequested) {
      return;
    }

    this.tapToMove?.update(delta);
    this.replayZone?.update(player);
  }

  private replay(): void {
    if (this.replayRequested || !this.replayReady) {
      return;
    }

    this.replayRequested = true;
    this.tapToMove?.setEnabled(false);
    this.replayZone?.setEnabled(false);
    const currentReplayCount = Number.parseInt(this.game.canvas.dataset.replayCount ?? "0", 10);
    const nextReplayCount = Number.isInteger(currentReplayCount) ? currentReplayCount + 1 : 1;
    resetWeddingGameState(this.registry);
    this.game.canvas.dataset.replayCount = String(nextReplayCount);
    this.game.canvas.dataset.replayRequested = "true";
    this.game.canvas.dataset.replayTarget = SCENE_KEYS.Intro;
    this.game.canvas.dataset.routeChoice = "";
    this.game.canvas.dataset.routeTransitionCount = "";
    this.game.canvas.dataset.routeQuiz = "";
    this.game.canvas.dataset.routeQuizSolved = "";
    this.game.canvas.dataset.routeQuizState = "";
    this.game.canvas.dataset.routeQuizModalOpen = "";
    this.game.canvas.dataset.routeQuizOpen = "";
    this.game.canvas.dataset.routeQuizOptions = "";
    this.game.canvas.dataset.routeQuizWrongCount = "";
    this.game.canvas.dataset.routeQuizHintCount = "";
    this.game.canvas.dataset.routeQuizCorrectCount = "";
    this.game.canvas.dataset.routeQuizTransitionCount = "";
    this.game.canvas.dataset.routeQuizLastWrong = "";
    this.game.canvas.dataset.routeQuizLastReaction = "";
    this.game.canvas.dataset.routeQuizHint = "";
    this.game.canvas.dataset.routeQuizCorrectOption = "";
    this.game.canvas.dataset.routeQuizSelectedExit = "";
    this.game.canvas.dataset.routeQuizCorrectExit = "";
    this.game.canvas.dataset.routeQuizWrongReaction = "";
    this.game.canvas.dataset.routeQuizHintText = "";
    this.game.canvas.dataset.activeQuiz = "";
    this.game.canvas.dataset.q3ModalOpen = "";
    this.game.canvas.dataset.lobbyReady = "";
    this.game.canvas.dataset.guestSide = "";
    this.game.canvas.dataset.receptionComplete = "";
    this.game.canvas.dataset.receptionDesk = "";
    this.game.canvas.dataset.receptionExpectedDesk = "";
    this.game.canvas.dataset.receptionWarning = "";
    this.game.canvas.dataset.lobbyTransitionCount = "";
    this.game.canvas.dataset.venueRoom = "";
    this.game.canvas.dataset.roomReady = "";
    this.game.canvas.dataset.roomBridePresent = "";
    this.game.canvas.dataset.banquetGuideComplete = "";
    this.game.canvas.dataset.guidePath = "";
    this.game.canvas.dataset.hallGuideArrivalCount = "";
    this.game.canvas.dataset.hallGuideLastArrival = "";
    this.game.canvas.dataset.hallGuideTarget = "";
    this.game.canvas.dataset.hallTransitionCount = "";
    this.game.canvas.dataset.endingReady = "";
    this.game.canvas.dataset.endingReplayReady = "";
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.game.canvas.dataset.activeScene = SCENE_KEYS.Intro;
    });
    fadeToScene(this, SCENE_KEYS.Intro);
  }

  private markReplayReady(): void {
    if (this.replayReady || this.cameras.main.fadeEffect.isRunning) {
      return;
    }

    this.replayReady = true;
    this.game.canvas.dataset.endingReplayReady = "true";
    this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.markReplayReady, this);
  }

  private shutdownEnding(): void {
    this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.markReplayReady, this);
    this.replayZone?.destroy();
    this.replayZone = undefined;
    this.tapToMove?.destroy();
    this.tapToMove = undefined;
    this.player = undefined;
  }
}
