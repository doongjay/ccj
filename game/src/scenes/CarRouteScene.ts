import Phaser from "phaser";
import { Player } from "../objects/Player";
import { completeProgressionFlag, PROGRESSION_FLAGS, SCENE_KEYS } from "../state/gameState";
import { fadeToScene, markActiveScene } from "../ui/sceneUi";
import { StoryDialog } from "../ui/StoryDialog";
import { sceneArt } from "./sceneArt";
import { parkingArt } from "./parkingArt";
import { warmSceneAssets } from "../systems/stageAssets";
import { CHECKPOINT_REGISTRY } from "../state/checkpoint";

export class CarRouteScene extends Phaser.Scene {
  private player: Player | undefined;
  private dialog: StoryDialog | undefined;
  private arrival: (() => void) | undefined;
  constructor() { super(SCENE_KEYS.CarRoute); }
  create(): void {
    markActiveScene(this, SCENE_KEYS.CarRoute);
    this.cameras.main.fadeIn(350);
    this.arrival = undefined;
    this.game.canvas.dataset.routeQuizSolved = "false";
    this.game.canvas.dataset.routeQuizWrongCount = "0";
    sceneArt(this, "car-background");
    this.player = new Player(this, { x: 360, y: 1080, appearance: "car", speed: 420 });
    this.player.setDepth(3);
    this.dialog = new StoryDialog(this, "car");
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
    this.dialog?.setPlacement("car");
    this.dialog?.show("양재IC랑 가깝군. 그런데 진입구에 유도선이 많은데?", [
      { label: "노란색", tried: Number(this.game.canvas.dataset.routeQuizWrongCount) > 0, onSelect: () => this.drive(0) },
      { label: "분홍색", onSelect: () => this.drive(1) },
      { label: "파란색", onSelect: () => this.drive(2) },
    ]);
  }
  private drive(lane: number): void {
    const paths = [
      [{ x: 226, y: 1180 }, { x: 233, y: 1040 }, { x: 241, y: 920 }, { x: 240, y: 889 }, { x: 229, y: 862 }, { x: 208, y: 843 }, { x: 161, y: 824 }, { x: 80, y: 806 }, { x: 12, y: 794 }],
      [{ x: 353, y: 1180 }, { x: 352, y: 1040 }, { x: 347, y: 920 }, { x: 336, y: 827 }, { x: 327, y: 781 }, { x: 319, y: 755 }, { x: 307, y: 734 }, { x: 291, y: 720 }, { x: 269, y: 710 }, { x: 225, y: 702 }, { x: 185, y: 697 }, { x: 145, y: 690 }, { x: 125, y: 680 }, { x: 113, y: 670 }, { x: 106, y: 660 }, { x: 102, y: 650 }, { x: 98, y: 645 }],
      [{ x: 476, y: 1180 }, { x: 466, y: 1040 }, { x: 456, y: 932 }, { x: 443, y: 834 }, { x: 436, y: 783 }, { x: 437, y: 759 }, { x: 450, y: 736 }, { x: 476, y: 718 }, { x: 519, y: 699 }, { x: 556, y: 679 }, { x: 571, y: 665 }, { x: 578, y: 652 }, { x: 582, y: 637 }, { x: 579, y: 622 }, { x: 570, y: 605 }, { x: 556, y: 590 }, { x: 534, y: 577 }, { x: 520, y: 566 }],
    ];
    // Start on the selected painted lane; all waypoints trace the single baked line.
    const start = paths[lane]?.[0] ?? paths[2]![0]!;
    this.player?.setPosition(start.x, start.y);
    this.game.canvas.dataset.carLane = ["yellow", "pink", "blue"][lane];
    this.game.canvas.dataset.carLanePath = JSON.stringify(paths[lane]);
    this.player?.walkPath(paths[lane] ?? paths[2]!);
    this.arrival = () => {
      const parking = this.renderParking(lane);
      if (lane === 0) {
        const dataset = this.game.canvas.dataset;
        dataset.routeQuizWrongCount = String(Number(dataset.routeQuizWrongCount) + 1);
        this.dialog?.narrate("여긴 이마트 주차장이네.\n주차 정산이 안될테니 다른 유도선을 타야겠군.", () => {
          this.player?.moveTo(360, 1080);
          this.arrival = () => {
            parking.destroy();
            this.player?.setParkingMap(false);
            this.prompt();
          };
        }, 2400);
        return;
      }
      this.dialog?.narrate(lane === 1 ? "어라, 타워주차장이었네. 귀찮지만 어쩔수없지." : "지하 3층이구나. 넓어서 좋군.", () => {
        completeProgressionFlag(this.registry, PROGRESSION_FLAGS.routeQuizSolved);
        this.registry.set(CHECKPOINT_REGISTRY.route, lane === 1 ? "tower" : "b3");
        this.game.canvas.dataset.routeQuizSolved = "true";
        this.player?.moveTo(360, 350);
        this.arrival = () => fadeToScene(this, SCENE_KEYS.VenueLobby);
      }, 2400);
    };
  }

  private renderParking(lane: number): Phaser.GameObjects.Container {
    this.dialog?.setPlacement("parking");
    this.player?.setParkingMap(true).setPosition(360, 1000);
    this.game.canvas.dataset.parkingMap = ["emart", "tower", "b3"][lane];
    return parkingArt(this, lane);
  }
}
