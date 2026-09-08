import Phaser from "phaser";
import { GAME_WIDTH } from "../config";
import { GAMEPLAY_LAYOUTS } from "../data/layout";
import { QUIZZES } from "../data/scenario";
import type { CorrectQuizOption, QuizData, QuizOption } from "../data/scenario";
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
} from "../ui/sceneUi";

type SubwayExitOptionId = "exit-1" | "exit-4" | "exit-5" | "exit-7" | "exit-8";

const SUBWAY_EXIT_OPTION_IDS = ["exit-1", "exit-4", "exit-5", "exit-7", "exit-8"] as const satisfies readonly SubwayExitOptionId[];
const CORRECT_EXIT_OPTION_ID = "exit-5" satisfies SubwayExitOptionId;
const GENERIC_WRONG_EXIT_REACTION = "어? 여기서 나가면 반대편인데요, 다시 내려가 볼까요?";
const SUBWAY_EXIT_OPTION_NUMBERS = "1,4,5,7,8";

export class SubwayRouteScene extends Phaser.Scene {
  private player: Player | undefined;
  private tapToMove: TapToMove | undefined;
  private exitZones: readonly TriggerZone[] = [];
  private quizModal: QuizModal | undefined;
  private quizSolved = false;
  private transitionRequested = false;

  constructor() {
    super(SCENE_KEYS.SubwayRoute);
  }

  create(): void {
    const layout = GAMEPLAY_LAYOUTS["subway-route"];
    const spawn = layout.spawns[0];

    if (spawn === undefined) {
      throw new Error("SubwayRouteScene requires a platform spawn.");
    }

    const quiz = findQuiz("Q2");
    this.quizSolved = false;
    this.transitionRequested = false;
    this.exitZones = [];
    markActiveScene(this, SCENE_KEYS.SubwayRoute);
    this.resetQuizDataset();

    sceneArt(this, "subway-background");
    sceneArt(this, "shuttle-bus", 512, 880, 256, 160);
    createSceneHeader(this, {
      title: "양재시민의숲역",
      status: "라시따시어터 셔틀 · 5번 출구",
    });
    createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: 256,
      copy: "5번 출구 앞에서 셔틀을 만나세요\n예식 1시간 전부터 10분 간격 운행",
      width: 540,
      maxCharactersPerLine: 22,
      maxLines: 2,
      fontSize: 22,
      lineHeight: 32,
      color: "inkOutline",
    });

    createKoreanText(this, {
      x: 192, y: 912, copy: "다른 오시는 길\n서초20 버스 · 도보",
      width: 280, maxCharactersPerLine: 14, maxLines: 2,
      fontSize: 20, lineHeight: 28, color: "inkOutline",
    });

    const exitTriggers = layout.triggers.filter((trigger) => trigger.id.startsWith("exit-"));
    for (const trigger of exitTriggers) {
      if (trigger.shape.kind !== "circle") {
        continue;
      }

      this.renderExit(trigger.shape.center.x, trigger.shape.center.y, `${trigger.id.slice(5)}번 출구`);
      this.exitZones = [
        ...this.exitZones,
        new TriggerZone(this, {
          shape: "circle",
          x: trigger.shape.center.x,
          y: trigger.shape.center.y,
          radius: trigger.shape.radius,
          mode: "once",
          onEnter: () => this.openQuiz(quiz),
        }),
      ];
    }

    this.player = new Player(this, {
      x: spawn.point.x,
      y: spawn.point.y,
      label: "하객",
      speed: 620,
    });
    this.tapToMove = new TapToMove(this, this.player, {
      bounds: layout.worldBounds,
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownRoute, this);
  }

  update(_time: number, delta: number): void {
    const player = this.player;

    if (player === undefined || this.quizSolved) {
      return;
    }

    this.tapToMove?.update(delta);

    for (const zone of this.exitZones) {
      zone.update(player);
    }
  }

  private renderExit(x: number, y: number, label: string): void {
    sceneArt(this, "exit-sign", x, y, 96, 96);
    createKoreanText(this, {
      x,
      y,
      copy: label,
      width: 84,
      maxCharactersPerLine: 6,
      maxLines: 1,
      fontSize: 18,
      lineHeight: 24,
      color: "inkOutline",
    });
  }

  private openQuiz(quiz: QuizData): void {
    if (this.quizModal?.isOpen() === true || this.quizSolved) {
      return;
    }

    const subwayQuiz = createSubwayExitQuiz(quiz, (optionId) => this.recordWrongExit(optionId, quiz.hint));
    this.game.canvas.dataset.routeQuiz = quiz.id;
    this.game.canvas.dataset.routeQuizOpen = "true";
    this.game.canvas.dataset.routeQuizOptions = SUBWAY_EXIT_OPTION_NUMBERS;
    this.game.canvas.dataset.routeQuizCorrectExit = "5";
    this.tapToMove?.setEnabled(false);
    this.quizModal = new QuizModal({
      scene: this,
      quiz: subwayQuiz,
      onCorrect: (option) => this.completeQuiz(option),
    });
    this.quizModal.open();
  }

  private completeQuiz(_option: CorrectQuizOption): void {
    if (this.transitionRequested) {
      return;
    }

    this.transitionRequested = true;
    this.quizSolved = true;
    completeProgressionFlag(this.registry, PROGRESSION_FLAGS.routeQuizSolved);
    this.game.canvas.dataset.routeQuizSolved = "true";
    this.game.canvas.dataset.routeQuizOpen = "false";
    this.game.canvas.dataset.routeQuizSelectedExit = CORRECT_EXIT_OPTION_ID;
    this.game.canvas.dataset.routeQuizCorrectCount = "1";
    this.game.canvas.dataset.routeQuizTransitionCount = "1";
    fadeToScene(this, SCENE_KEYS.VenueLobby);
  }

  private recordWrongExit(optionId: SubwayExitOptionId, hint: string): void {
    this.game.canvas.dataset.routeQuizSelectedExit = optionId;
    this.game.canvas.dataset.routeQuizWrongCount = String(readDatasetCount(this.game.canvas, "routeQuizWrongCount") + 1);
    this.game.canvas.dataset.routeQuizHintCount = "1";
    this.game.canvas.dataset.routeQuizWrongReaction = GENERIC_WRONG_EXIT_REACTION;
    this.game.canvas.dataset.routeQuizHintText = hint;
  }

  private shutdownRoute(): void {
    this.quizModal?.destroy();
    this.quizModal = undefined;
    this.tapToMove?.destroy();
    this.tapToMove = undefined;
    this.player = undefined;

    for (const zone of this.exitZones) {
      zone.destroy();
    }

    this.exitZones = [];
  }

  private resetQuizDataset(): void {
    this.game.canvas.dataset.routeQuiz = "";
    this.game.canvas.dataset.routeQuizOpen = "false";
    this.game.canvas.dataset.routeQuizSolved = "false";
    this.game.canvas.dataset.routeQuizWrongCount = "0";
    this.game.canvas.dataset.routeQuizHintCount = "0";
    this.game.canvas.dataset.routeQuizCorrectCount = "0";
    this.game.canvas.dataset.routeQuizTransitionCount = "0";
    this.game.canvas.dataset.routeQuizSelectedExit = "";
    this.game.canvas.dataset.routeQuizOptions = "";
    this.game.canvas.dataset.routeQuizCorrectExit = "";
    this.game.canvas.dataset.routeQuizWrongReaction = "";
    this.game.canvas.dataset.routeQuizHintText = "";
  }
}

type SubwayWrongExitHandler = (optionId: SubwayExitOptionId) => void;

function findQuiz(quizId: "Q2"): QuizData {
  const quiz = QUIZZES.find((candidate) => candidate.id === quizId);

  if (quiz === undefined) {
    throw new Error(`Missing quiz ${quizId}.`);
  }

  return quiz;
}

function createSubwayExitQuiz(quiz: QuizData, onWrongExit: SubwayWrongExitHandler): QuizData {
  return {
    ...quiz,
    options: SUBWAY_EXIT_OPTION_IDS.map((optionId) => findSubwayExitOption(quiz, optionId, onWrongExit)),
  };
}

function findSubwayExitOption(
  quiz: QuizData,
  optionId: SubwayExitOptionId,
  onWrongExit: SubwayWrongExitHandler,
): QuizOption {
  const option = quiz.options.find((candidate) => candidate.id === optionId);

  if (option === undefined) {
    throw new Error(`Missing subway quiz option ${optionId}.`);
  }

  if (option.id === CORRECT_EXIT_OPTION_ID) {
    if (!option.isCorrect) {
      throw new Error("Subway quiz exit 5 must be the correct option.");
    }

    return option;
  }

  if (option.isCorrect) {
    throw new Error(`Subway quiz option ${option.id} must be a wrong exit.`);
  }

  return {
    id: option.id,
    label: option.label,
    isCorrect: false,
    get wrongReaction(): string {
      onWrongExit(optionId);
      return GENERIC_WRONG_EXIT_REACTION;
    },
  };
}

function readDatasetCount(canvas: HTMLCanvasElement, key: string): number {
  const value = canvas.dataset[key];

  if (value === undefined) {
    return 0;
  }

  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) ? parsedValue : 0;
}
