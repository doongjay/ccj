import Phaser from "phaser";
import { GAME_WIDTH } from "../config";
import { GAMEPLAY_LAYOUTS } from "../data/layout";
import type { LayoutTrigger } from "../data/layout";
import { Player } from "../objects/Player";
import { sceneArt } from "./sceneArt";
import { ROUTE_CHOICES, SCENE_KEYS, setRouteChoice } from "../state/gameState";
import type { RouteChoice, RouteSceneKey } from "../state/gameState";
import { TapToMove } from "../systems/TapToMove";
import { TriggerZone } from "../systems/TriggerZone";
import type { TriggerZoneConfig, TriggerZoneEnterHandler } from "../systems/TriggerZone";
import {
  createKoreanText,
  createSceneHeader,
  createTouchButton,
  fadeToScene,
  markActiveScene,
  SCENE_UI_COLORS,
} from "../ui/sceneUi";

type RouteOption = Readonly<{
  route: RouteChoice;
  sceneKey: RouteSceneKey;
  triggerId: "choose-car" | "choose-subway";
  x: number;
  y: number;
  title: string;
  description: string;
}>;

const ROUTE_OPTIONS = [
  {
    route: ROUTE_CHOICES.car,
    sceneKey: SCENE_KEYS.CarRoute,
    triggerId: "choose-car",
    x: 190,
    y: 790,
    title: "자차로 간다",
    description: "하이브랜드\n지하 3층 주차장",
  },
  {
    route: ROUTE_CHOICES.subway,
    sceneKey: SCENE_KEYS.SubwayRoute,
    triggerId: "choose-subway",
    x: 530,
    y: 790,
    title: "지하철을 탄다",
    description: "양재시민의숲역\n5번 출구 셔틀",
  },
] as const satisfies readonly RouteOption[];

export class HomeSelectScene extends Phaser.Scene {
  private player: Player | undefined;
  private tapToMove: TapToMove | undefined;
  private triggerZones: readonly TriggerZone[] = [];
  private transitionRequested = false;

  constructor() {
    super(SCENE_KEYS.HomeSelect);
  }

  create(): void {
    const layout = GAMEPLAY_LAYOUTS.home;
    const spawn = layout.spawns[0];

    if (spawn === undefined) {
      throw new Error("Home layout is missing a player spawn point.");
    }

    markActiveScene(this, SCENE_KEYS.HomeSelect);
    this.game.canvas.dataset.routeChoice = "";
    this.game.canvas.dataset.routeTransitionCount = "0";
    this.transitionRequested = false;
    const player = new Player(this, spawn.point);
    player.setDepth(4);
    this.player = player;
    this.tapToMove = new TapToMove(this, player, layout.worldBounds);
    this.triggerZones = ROUTE_OPTIONS.map((option) => {
      const trigger = layout.triggers.find((candidate) => candidate.id === option.triggerId);

      if (trigger === undefined) {
        throw new Error(`Home layout is missing the ${option.triggerId} route trigger.`);
      }

      return new TriggerZone(this, createTriggerZoneConfig(trigger, () => this.chooseRoute(option)));
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroyMovementSystems, this);

    sceneArt(this, "home-background");
    createSceneHeader(this, {
      title: "집 앞 갈림길",
      status: "라시따시어터에서 만나요",
    });
    createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: 256,
      copy: "설레는 마음을 안고\n두 사람을 만나러\n가는 길",
      width: 320,
      maxCharactersPerLine: 14,
      maxLines: 3,
      fontSize: 24,
      lineHeight: 32,
      color: "inkOutline",
    });

    createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: 336,
      copy: "어떻게 오시나요?",
      width: 520,
      maxCharactersPerLine: 18,
      maxLines: 1,
      fontSize: 24,
      lineHeight: 28,
      color: "inkOutline",
    });

    createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: 1016,
      copy: "집",
      width: 96,
      maxCharactersPerLine: 2,
      maxLines: 1,
      fontSize: 28,
      lineHeight: 32,
      color: "labelText",
    }).setBackgroundColor(SCENE_UI_COLORS.labelSurface.text);

    for (const option of ROUTE_OPTIONS) {
      sceneArt(this, option.route === ROUTE_CHOICES.car ? "car-choice" : "subway-choice", option.x, 660, 96, 64);
      createKoreanText(this, {
        x: option.x,
        y: 568,
        copy: option.route === ROUTE_CHOICES.car ? "주차장 방면" : "셔틀 방면",
        width: 216,
        maxCharactersPerLine: 7,
        maxLines: 1,
        fontSize: 22,
        lineHeight: 24,
        color: "labelText",
      }).setBackgroundColor(SCENE_UI_COLORS.labelSurface.text);
      createKoreanText(this, {
        x: option.x,
        y: 882,
        copy: option.description,
        width: 216,
        maxCharactersPerLine: 10,
        maxLines: 2,
        fontSize: 22,
        lineHeight: 28,
        color: "labelText",
      }).setBackgroundColor(SCENE_UI_COLORS.labelSurface.text);
      createTouchButton(this, {
        x: option.x,
        y: option.y,
        width: 220,
        height: 120,
        label: option.title,
        onPress: (): void => this.chooseRoute(option),
      });
    }
  }

  update(_time: number, delta: number): void {
    const player = this.player;
    const tapToMove = this.tapToMove;

    if (player === undefined || tapToMove === undefined) {
      return;
    }

    tapToMove.update(delta);

    for (const triggerZone of this.triggerZones) {
      triggerZone.update(player);
    }
  }

  private chooseRoute(option: RouteOption): void {
    if (this.transitionRequested) {
      return;
    }

    this.transitionRequested = true;
    this.tapToMove?.setEnabled(false);
    const state = setRouteChoice(this.registry, option.route);
    this.game.canvas.dataset.routeChoice = state.routeChoice ?? "";
    this.game.canvas.dataset.routeTransitionCount = "1";
    fadeToScene(this, option.sceneKey);
  }

  private destroyMovementSystems(): void {
    this.tapToMove?.destroy();
    this.tapToMove = undefined;

    for (const triggerZone of this.triggerZones) {
      triggerZone.destroy();
    }

    this.triggerZones = [];
  }
}

function createTriggerZoneConfig(
  trigger: LayoutTrigger,
  onEnter: TriggerZoneEnterHandler,
): TriggerZoneConfig {
  switch (trigger.shape.kind) {
    case "rectangle":
      return {
        shape: "rectangle",
        x: trigger.shape.bounds.x,
        y: trigger.shape.bounds.y,
        width: trigger.shape.bounds.width,
        height: trigger.shape.bounds.height,
        onEnter,
      };
    case "circle":
      return {
        shape: "circle",
        x: trigger.shape.center.x,
        y: trigger.shape.center.y,
        radius: trigger.shape.radius,
        onEnter,
      };
  }
}
