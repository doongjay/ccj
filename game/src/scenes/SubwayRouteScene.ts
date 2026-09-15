import Phaser from "phaser";
import { CHECKPOINT_REGISTRY } from "../state/checkpoint";
import { Player } from "../objects/Player";
import { completeProgressionFlag, PROGRESSION_FLAGS, SCENE_KEYS } from "../state/gameState";
import { createSceneHeader, fadeToScene, markActiveScene } from "../ui/sceneUi";
import { StoryDialog } from "../ui/StoryDialog";
import { sceneArt } from "./sceneArt";
import { photoArt } from "./photoArt";
import { warmSceneAssets } from "../systems/stageAssets";

const STATION_EXITS = [96, 226, 360, 494, 624].map((exitX, index) => ({ number: index + 1, x: exitX, y: 516 }));

export class SubwayRouteScene extends Phaser.Scene {
  private player: Player | undefined;
  private dialog: StoryDialog | undefined;
  private arrival: (() => void) | undefined;
  private readonly triedExits = new Set<number>();
  constructor() { super(SCENE_KEYS.SubwayRoute); }
  create(): void {
    markActiveScene(this, SCENE_KEYS.SubwayRoute);
    this.cameras.main.fadeIn(350);
    this.arrival = undefined;
    this.triedExits.clear();
    this.game.canvas.dataset.routeQuizSolved = "false";
    this.game.canvas.dataset.routeQuizWrongCount = "0";
    sceneArt(this, "subway-background");
    for (const exit of STATION_EXITS) {
      this.add.text(exit.x, exit.y, String(exit.number), {
        fontFamily: "Galmuri11, monospace", fontSize: "25px", color: "#493c30", resolution: 3,
      }).setOrigin(0.5).setName(`subway-exit-${exit.number}`);
    }
    createSceneHeader(this, { title: "지하철역" });
    this.player = new Player(this, { x: 360, y: 1080, speed: 420 });
    this.dialog = new StoryDialog(this, "station");
    this.prompt();
    warmSceneAssets(this, SCENE_KEYS.VenueLobby);
  }
  update(_time: number, delta: number): void {
    this.player?.updateMovement(delta);
    if (this.arrival && !this.player?.isMoving()) {
      const callback = this.arrival;
      this.arrival = undefined;
      callback();
    }
  }
  private prompt(): void {
    this.player?.setVisible(false);
    this.dialog?.show("양재시민의숲역에서 내리라고 했지.\n근데 셔틀이 몇번 출구더라?", [1, 2, 3, 4, 5].map(exit => ({
      label: `${exit}번\n출구`, tried: this.triedExits.has(exit), onSelect: () => this.chooseExit(exit),
    })));
  }
  private chooseExit(exit: number): void {
    this.triedExits.add(exit);
    this.player?.setVisible(true);
    const exitX = STATION_EXITS[exit - 1]!.x;
    this.player?.walkPath([{ x: 360, y: 890 }, { x: exitX, y: 760 }, { x: exitX, y: 650 }]);
    this.arrival = () => {
      if (exit !== 5) {
        const dataset = this.game.canvas.dataset;
        dataset.routeQuizWrongCount = String(Number(dataset.routeQuizWrongCount) + 1);
        this.dialog?.narrate("셔틀 버스는 5번 출구 앞 이었던것 같은데...", () => {
          this.player?.moveTo(360, 1080);
          this.arrival = () => this.prompt();
        }, 1600);
        return;
      }
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.children.removeAll(true);
        photoArt(this, "shuttle");
        this.cameras.main.fadeIn(400);
        this.player = new Player(this, { x: 500, y: 1120, speed: 250 });
        this.player.walkPath([{ x: 410, y: 1000 }, { x: 430, y: 880 }, { x: 440, y: 780 }, { x: 440, y: 700 }]);
        this.arrival = () => {
          this.player?.setVisible(false);
          completeProgressionFlag(this.registry, PROGRESSION_FLAGS.routeQuizSolved);
          this.registry.set(CHECKPOINT_REGISTRY.route, "exit5");
          this.game.canvas.dataset.routeQuizSolved = "true";
          this.time.delayedCall(700, () => fadeToScene(this, SCENE_KEYS.VenueLobby));
        };
      });
      this.cameras.main.fadeOut(350);
    };
  }
}
