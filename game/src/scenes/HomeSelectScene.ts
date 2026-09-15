import { warmStage } from "../systems/stageAssets";
import Phaser from "phaser";
import { Player } from "../objects/Player";
import { GUEST_SIDES, ROUTE_CHOICES, SCENE_KEYS, setGuestSide, setRouteChoice, setGuestName, setGuestGender, setGuestOutfit, setGuestHair, setGuestFace } from "../state/gameState";
import { TextEntryDialog } from "../ui/TextEntryDialog";
import type { RouteChoice, RouteSceneKey } from "../state/gameState";
import { fadeToScene, markActiveScene } from "../ui/sceneUi";
import { StoryDialog } from "../ui/StoryDialog";
import { sceneArt } from "./sceneArt";

export class HomeSelectScene extends Phaser.Scene {
  private player: Player | undefined;
  private arrival: (() => void) | undefined;
  constructor() { super(SCENE_KEYS.HomeSelect); }
  create(): void {
    markActiveScene(this, SCENE_KEYS.HomeSelect);
    this.cameras.main.fadeIn(350);
    this.arrival = undefined;
    this.game.canvas.dataset.routeChoice = "";
    this.game.canvas.dataset.routeTransitionCount = "0";
    sceneArt(this, "home-background");
    this.player = undefined;
    const dialog = new StoryDialog(this);
    new TextEntryDialog(this, {
      title: "결혼식에 갈 준비를 해볼까?", fieldLabel: "내 이름은", submitLabel: "시작하기", maxLength: 20, collectGender: true,
      onSubmit: (name, gender, outfit, hair, face) => {
        setGuestName(this.registry, name);
        setGuestGender(this.registry, gender ?? "male");
        setGuestOutfit(this.registry, outfit ?? 0);
        setGuestHair(this.registry, hair ?? 0);
        setGuestFace(this.registry, face ?? 0);
        this.game.canvas.dataset.guestFace = String(face ?? 0);
        this.game.canvas.dataset.guestHair = String(hair ?? 0);
        this.game.canvas.dataset.guestOutfit = String(outfit ?? 0);
        this.game.canvas.dataset.guestName = name;
        this.game.canvas.dataset.guestGender = gender ?? "male";
        this.player = new Player(this, { x: 360, y: 742, speed: 240 });
        this.askSide(dialog);
      },
    });
  }

  private askSide(dialog: StoryDialog): void {
    dialog.show("오늘 누구 하객으로 가지?", [
      { label: "신랑측", onSelect: () => { setGuestSide(this.registry, GUEST_SIDES.groom); this.game.canvas.dataset.guestSide = "groom"; this.askRoute(dialog); } },
      { label: "신부측", onSelect: () => { setGuestSide(this.registry, GUEST_SIDES.bride); this.game.canvas.dataset.guestSide = "bride"; this.askRoute(dialog); } },
    ]);
  }

  private askRoute(dialog: StoryDialog): void {
    dialog.show("오, 결혼식장이 라시따시어터네.\n오후 2시까지 가야하는군.\n어떻게 갈까?", [
      { label: "자차로 간다", onSelect: () => this.choose(ROUTE_CHOICES.car, SCENE_KEYS.CarRoute, 190) },
      { label: "지하철을 탄다", onSelect: () => this.choose(ROUTE_CHOICES.subway, SCENE_KEYS.SubwayRoute, 530) },
    ]);
  }
  update(_time: number, delta: number): void {
    this.player?.updateMovement(delta);
    if (this.arrival && !this.player?.isMoving()) {
      const callback = this.arrival;
      this.arrival = undefined;
      callback();
    }
  }
  private choose(route: RouteChoice, next: RouteSceneKey, x: number): void {
    setRouteChoice(this.registry, route);
    warmStage(this, route === ROUTE_CHOICES.car ? "car" : "subway");
    this.game.canvas.dataset.routeChoice = route;
    this.game.canvas.dataset.routeTransitionCount = "1";
    this.player?.walkPath([{ x: 360, y: 656 }, { x, y: 546 }, { x: route === ROUTE_CHOICES.car ? 110 : 550, y: 475 }]);
    this.arrival = () => fadeToScene(this, next);
  }
}
