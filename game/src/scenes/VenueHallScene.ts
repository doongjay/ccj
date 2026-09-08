import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { GAMEPLAY_LAYOUTS } from "../data/layout";
import { GUIDE_PATHS } from "../data/scenario";
import type { GuidePath, LogicalPoint } from "../data/scenario";
import { Npc } from "../objects/Npc";
import { Player } from "../objects/Player";
import { sceneArt } from "./sceneArt";
import {
  completeProgressionFlag,
  GUEST_SIDES,
  PROGRESSION_FLAGS,
  readGuestSide,
  SCENE_KEYS,
} from "../state/gameState";
import { ArrowGuide } from "../systems/ArrowGuide";
import { TapToMove } from "../systems/TapToMove";
import type { TapToMoveDestination } from "../systems/TapToMove";
import {
  createKoreanText,
  createTouchButton,
  fadeToScene,
  markActiveScene,
  SCENE_UI_COLORS,
} from "../ui/sceneUi";

type WorldPoint = Readonly<{
  x: number;
  y: number;
}>;

const LOGICAL_GRID_SIZE = 100;
const GUIDE_ARRIVAL_TOLERANCE = 2;

export class VenueHallScene extends Phaser.Scene {
  private player: Player | undefined;
  private tapToMove: TapToMove | undefined;
  private arrowGuide: ArrowGuide | undefined;
  private guidePoints: readonly WorldPoint[] = [];
  private guideArrivalCount = 0;
  private completed = false;

  constructor() {
    super(SCENE_KEYS.VenueHall);
  }

  create(): void {
    const layout = GAMEPLAY_LAYOUTS["venue-hall"];
    const spawn = layout.spawns[0];

    if (spawn === undefined) {
      throw new Error("VenueHallScene requires a hall entry spawn.");
    }

    const guidePath = this.findGuidePath();
    this.guidePoints = guidePath.points.map((point) => toWorldPoint(point));
    this.guideArrivalCount = 0;
    this.completed = false;
    markActiveScene(this, SCENE_KEYS.VenueHall);
    this.game.canvas.dataset.venueRoom = "hall";
    this.game.canvas.dataset.roomBridePresent = "false";
    this.game.canvas.dataset.banquetGuideComplete = "false";
    this.game.canvas.dataset.guidePath = guidePath.id;
    this.game.canvas.dataset.hallGuideArrivalCount = "0";
    this.game.canvas.dataset.hallGuideLastArrival = "";
    this.game.canvas.dataset.hallGuideTarget = formatPoint(this.guidePoints[0]);
    this.game.canvas.dataset.hallTransitionCount = "0";

    sceneArt(this, "hall-background");
    createKoreanText(this, {
      x: GAME_WIDTH / 2, y: 292,
      copy: "라시따시어터\n그랜드볼룸",
      width: 240, maxCharactersPerLine: 8, maxLines: 2,
      fontSize: 20, lineHeight: 28, color: "labelText",
    });
    createKoreanText(this, {
      x: 564,
      y: 1032,
      copy: "예식홀에\n오신 걸 환영해요\n축하를 전해주세요",
      width: 240,
      maxCharactersPerLine: 12,
      maxLines: 3,
      fontSize: 20,
      lineHeight: 28,
      color: "labelText",
    }).setBackgroundColor(SCENE_UI_COLORS.labelSurface.text);
    this.renderHallLandmarks();
    new Npc(this, { x: 240, y: 780, label: "예식 안내", variant: "guide" });

    this.player = new Player(this, {
      x: spawn.point.x,
      y: spawn.point.y,
      label: "접수완료",
      speed: 700,
    });
    this.tapToMove = new TapToMove(this, this.player, {
      bounds: layout.worldBounds,
      blockedAreas: [{ x: 16, y: 48, width: 188, height: 96 }],
      onArrival: (destination) => this.recordGuideArrival(destination),
    });
    this.arrowGuide = new ArrowGuide(this, {
      path: guidePath,
      radius: 56,
      onComplete: () => this.completeGuide(),
    });
    createTouchButton(this, {
      x: 110, y: 96, width: 188, height: 88, label: "로비로", depth: 10,
      onPress: () => {
        if (this.completed) return;
        this.completed = true;
        this.tapToMove?.setEnabled(false);
        fadeToScene(this, SCENE_KEYS.VenueLobby);
      },
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownHall, this);
  }

  update(_time: number, delta: number): void {
    const player = this.player;

    if (player === undefined || this.completed) {
      return;
    }

    this.tapToMove?.update(delta);
    this.arrowGuide?.update(player);
  }

  private findGuidePath(): GuidePath {
    const guestSide = readGuestSide(this.registry);
    if (guestSide === undefined) {
      throw new Error("VenueHallScene requires a selected guest side before showing the ceremony guide.");
    }

    const pathId = guidePathIdForGuestSide(guestSide);
    const guidePath = GUIDE_PATHS.find((candidate) => candidate.id === pathId);

    if (guidePath === undefined) {
      throw new Error(`Missing guide path ${pathId}.`);
    }

    return guidePath;
  }

  private recordGuideArrival(destination: TapToMoveDestination): void {
    const currentTarget = this.guidePoints[this.guideArrivalCount];

    if (currentTarget === undefined || !isNearPoint(destination, currentTarget)) {
      this.game.canvas.dataset.hallGuideLastArrival = formatPoint(destination);
      return;
    }

    this.guideArrivalCount += 1;
    this.game.canvas.dataset.hallGuideArrivalCount = String(this.guideArrivalCount);
    this.game.canvas.dataset.hallGuideLastArrival = formatPoint(currentTarget);
    this.game.canvas.dataset.hallGuideTarget = formatPoint(this.guidePoints[this.guideArrivalCount]);
  }

  private renderHallLandmarks(): void {
    createKoreanText(this, {
      x: 360,
      y: 368,
      copy: "예식 무대",
      width: 180,
      maxCharactersPerLine: 8,
      maxLines: 1,
      fontSize: 22,
      lineHeight: 28,
      color: "labelText",
    }).setBackgroundColor(SCENE_UI_COLORS.labelSurface.text);
  }

  private completeGuide(): void {
    if (this.completed) {
      return;
    }

    this.recordRemainingGuideArrivals();
    this.completed = true;
    completeProgressionFlag(this.registry, PROGRESSION_FLAGS.banquetGuideComplete);
    this.game.canvas.dataset.banquetGuideComplete = "true";
    this.game.canvas.dataset.hallTransitionCount = "1";
    this.tapToMove?.setEnabled(false);
    fadeToScene(this, SCENE_KEYS.Ending);
  }

  private shutdownHall(): void {
    this.arrowGuide?.destroy();
    this.arrowGuide = undefined;
    this.tapToMove?.destroy();
    this.tapToMove = undefined;
    this.player = undefined;
    this.guidePoints = [];
  }

  private recordRemainingGuideArrivals(): void {
    while (this.guideArrivalCount < this.guidePoints.length) {
      const currentTarget = this.guidePoints[this.guideArrivalCount];

      if (currentTarget === undefined) {
        return;
      }

      this.recordGuideArrival(currentTarget);
    }
  }
}

function guidePathIdForGuestSide(guestSide: typeof GUEST_SIDES.groom | typeof GUEST_SIDES.bride): string {
  switch (guestSide) {
    case GUEST_SIDES.groom:
      return "groom-reception-to-banquet";
    case GUEST_SIDES.bride:
      return "bride-reception-to-banquet";
  }
}

function toWorldPoint(point: LogicalPoint): WorldPoint {
  return {
    x: (point.x / LOGICAL_GRID_SIZE) * GAME_WIDTH,
    y: (point.y / LOGICAL_GRID_SIZE) * GAME_HEIGHT,
  };
}

function formatPoint(point: WorldPoint | undefined): string {
  if (point === undefined) {
    return "";
  }

  return `${Math.round(point.x)},${Math.round(point.y)}`;
}

function isNearPoint(point: WorldPoint, target: WorldPoint): boolean {
  return Math.abs(point.x - target.x) <= GUIDE_ARRIVAL_TOLERANCE && Math.abs(point.y - target.y) <= GUIDE_ARRIVAL_TOLERANCE;
}
