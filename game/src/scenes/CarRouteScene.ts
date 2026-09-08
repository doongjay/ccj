import Phaser from "phaser";
import { GAME_WIDTH } from "../config";
import { GAMEPLAY_LAYOUTS } from "../data/layout";
import { QUIZZES } from "../data/scenario";
import type { CorrectQuizOption, QuizData, WrongQuizOption } from "../data/scenario";
import { Player } from "../objects/Player";
import { sceneArt } from "./sceneArt";
import { completeProgressionFlag, PROGRESSION_FLAGS, SCENE_KEYS } from "../state/gameState";
import { QuizModal } from "../systems/QuizModal";
import { TapToMove } from "../systems/TapToMove";
import { TriggerZone } from "../systems/TriggerZone";
import {
  createKoreanText,
  createSceneHeader,
  fadeToScene,
  markActiveScene,
  SCENE_UI_COLORS,
} from "../ui/sceneUi";

export class CarRouteScene extends Phaser.Scene {
  private player: Player | undefined;
  private tapToMove: TapToMove | undefined;
  private quizZone: TriggerZone | undefined;
  private quizModal: QuizModal | undefined;
  private quizSolved = false;
  private transitionRequested = false;
  private wrongCount = 0;
  private hintCount = 0;
  private correctCount = 0;

  constructor() {
    super(SCENE_KEYS.CarRoute);
  }

  create(): void {
    const layout = GAMEPLAY_LAYOUTS["car-route"];
    const spawn = layout.spawns[0];
    const blueGuideTrigger = layout.triggers.find((trigger) => trigger.id === "blue-guide");

    if (spawn === undefined || blueGuideTrigger === undefined || blueGuideTrigger.shape.kind !== "rectangle") {
      throw new Error("CarRouteScene requires spawn and blue guide rectangle trigger.");
    }

    const quiz = findQuiz("Q1");
    this.quizSolved = false;
    this.transitionRequested = false;
    this.wrongCount = 0;
    this.hintCount = 0;
    this.correctCount = 0;
    markActiveScene(this, SCENE_KEYS.CarRoute);
    this.game.canvas.dataset.routeQuiz = "";
    this.game.canvas.dataset.routeQuizSolved = "false";
    this.game.canvas.dataset.routeQuizState = "idle";
    this.game.canvas.dataset.routeQuizModalOpen = "false";
    this.game.canvas.dataset.routeQuizOptions = quiz.options.map((option) => option.id).join("|");
    this.game.canvas.dataset.routeQuizWrongCount = "0";
    this.game.canvas.dataset.routeQuizHintCount = "0";
    this.game.canvas.dataset.routeQuizCorrectCount = "0";
    this.game.canvas.dataset.routeQuizTransitionCount = "0";
    this.game.canvas.dataset.routeQuizLastWrong = "";
    this.game.canvas.dataset.routeQuizLastReaction = "";
    this.game.canvas.dataset.routeQuizHint = quiz.hint;

    sceneArt(this, "car-background");
    const header = createSceneHeader(this, {
      title: "하이브랜드 · 라시따시어터",
      status: "양재IC에서 A Gate로",
    });
    header.title.setColor(SCENE_UI_COLORS.labelText.text);
    header.status?.setColor(SCENE_UI_COLORS.labelText.text);
    createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: 256,
      copy: "파란 유도선은 지하 3층 주차장\n분홍 유도선은 타워 주차장이에요",
      width: 540,
      maxCharactersPerLine: 22,
      maxLines: 2,
      fontSize: 22,
      lineHeight: 32,
      color: "inkOutline",
    });

    this.renderGuideLane(152, "노란색", SCENE_UI_COLORS.gold.fill);
    this.renderGuideLane(360, "핑크색", SCENE_UI_COLORS.blush.fill);
    this.renderGuideLane(568, "파란색", 0x4c8edb);

    this.player = new Player(this, {
      x: spawn.point.x,
      y: spawn.point.y,
      label: "자차",
      speed: 600,
    });
    this.tapToMove = new TapToMove(this, this.player, {
      bounds: layout.worldBounds,
    });
    this.quizZone = new TriggerZone(this, {
      shape: "rectangle",
      x: blueGuideTrigger.shape.bounds.x,
      y: blueGuideTrigger.shape.bounds.y,
      width: blueGuideTrigger.shape.bounds.width,
      height: blueGuideTrigger.shape.bounds.height,
      mode: "once",
      onEnter: () => this.openQuiz(quiz),
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownRoute, this);
  }

  update(_time: number, delta: number): void {
    const player = this.player;

    if (player === undefined || this.quizSolved) {
      return;
    }

    this.tapToMove?.update(delta);
    this.quizZone?.update(player);
  }

  private renderGuideLane(x: number, label: string, color: number): void {
    this.add.rectangle(x, 676, 12, 280, color).setStrokeStyle(2, SCENE_UI_COLORS.inkOutline.fill);
    sceneArt(this, "route-sign", x, 520, 160, 80);
    createKoreanText(this, {
      x,
      y: 520,
      copy: label,
      width: 112,
      maxCharactersPerLine: 4,
      maxLines: 1,
      fontSize: 20,
      lineHeight: 28,
      color: "labelText",
    });
    createKoreanText(this, {
      x,
      y: 820,
      copy: x === 568 ? "B3\n라시따" : x === 360 ? "타워\n주차장" : "노란\n유도선",
      width: 144,
      maxCharactersPerLine: 6,
      maxLines: 2,
      fontSize: 18,
      lineHeight: 24,
      color: "labelText",
    });
  }

  private openQuiz(quiz: QuizData): void {
    if (this.quizModal?.isOpen() === true || this.quizSolved) {
      return;
    }

    this.game.canvas.dataset.routeQuiz = quiz.id;
    this.game.canvas.dataset.routeQuizState = "open";
    this.game.canvas.dataset.routeQuizModalOpen = "true";
    this.tapToMove?.setEnabled(false);
    this.quizModal = new QuizModal({
      scene: this,
      quiz: this.withObservableWrongAnswers(quiz),
      onCorrect: (option) => this.completeQuiz(option),
    });
    this.quizModal.open();
  }

  private completeQuiz(option: CorrectQuizOption): void {
    if (this.transitionRequested) {
      return;
    }

    this.transitionRequested = true;
    this.quizSolved = true;
    this.correctCount += 1;
    completeProgressionFlag(this.registry, PROGRESSION_FLAGS.routeQuizSolved);
    this.game.canvas.dataset.routeQuizSolved = "true";
    this.game.canvas.dataset.routeQuizState = "correct";
    this.game.canvas.dataset.routeQuizModalOpen = "false";
    this.game.canvas.dataset.routeQuizCorrectCount = String(this.correctCount);
    this.game.canvas.dataset.routeQuizCorrectOption = option.id;
    this.game.canvas.dataset.routeQuizTransitionCount = "1";
    fadeToScene(this, SCENE_KEYS.VenueLobby);
  }

  private withObservableWrongAnswers(quiz: QuizData): QuizData {
    const scene = this;
    const options = quiz.options.map((option) => {
      if (option.isCorrect) {
        return option;
      }

      const wrongOption: WrongQuizOption = {
        id: option.id,
        label: option.label,
        isCorrect: false,
        get wrongReaction(): string {
          scene.recordWrongAnswer(option);
          return option.wrongReaction;
        },
      };

      return wrongOption;
    });

    return { ...quiz, options };
  }

  private recordWrongAnswer(option: WrongQuizOption): void {
    this.wrongCount += 1;

    if (this.hintCount === 0) {
      this.hintCount = 1;
    }

    this.game.canvas.dataset.routeQuizState = "wrong";
    this.game.canvas.dataset.routeQuizModalOpen = "true";
    this.game.canvas.dataset.routeQuizWrongCount = String(this.wrongCount);
    this.game.canvas.dataset.routeQuizHintCount = String(this.hintCount);
    this.game.canvas.dataset.routeQuizLastWrong = option.id;
    this.game.canvas.dataset.routeQuizLastReaction = option.wrongReaction;
  }

  private shutdownRoute(): void {
    this.quizModal?.destroy();
    this.quizModal = undefined;
    this.quizZone?.destroy();
    this.quizZone = undefined;
    this.tapToMove?.destroy();
    this.tapToMove = undefined;
    this.player = undefined;
  }
}

function findQuiz(quizId: "Q1"): QuizData {
  const quiz = QUIZZES.find((candidate) => candidate.id === quizId);

  if (quiz === undefined) {
    throw new Error(`Missing quiz ${quizId}.`);
  }

  return quiz;
}
