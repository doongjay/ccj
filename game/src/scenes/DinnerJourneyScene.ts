import Phaser from "phaser";
import { saveCheckpoint, CHECKPOINT_REGISTRY } from "../state/checkpoint";
import { Player } from "../objects/Player";
import { completeProgressionFlag, isProgressionFlagComplete, PROGRESSION_FLAGS, readGuestSide, readRouteChoice, ROUTE_CHOICES, SCENE_KEYS } from "../state/gameState";
import { fadeToScene, markActiveScene } from "../ui/sceneUi";
import { StoryDialog } from "../ui/StoryDialog";
import { photoArt } from "./photoArt";
import { waitForTap } from "../ui/waitForTap";
import { reducedMotion } from "../ui/motionPreference";

export class DinnerJourneyScene extends Phaser.Scene {
  private dialog: StoryDialog | undefined;
  private player: Player | undefined;
  private arrival: (() => void) | undefined;
  private byCar = false;

  constructor() { super(SCENE_KEYS.DinnerJourney); }

  create(): void {
    markActiveScene(this, SCENE_KEYS.DinnerJourney);
    if (!this.registry.get(CHECKPOINT_REGISTRY.meal) || this.registry.get(CHECKPOINT_REGISTRY.meal) === "pending") this.registry.set(CHECKPOINT_REGISTRY.meal, isProgressionFlagComplete(this.registry, PROGRESSION_FLAGS.banquetGuideComplete) ? "after" : "first");
    saveCheckpoint(this, "dinner");
    this.byCar = readRouteChoice(this.registry) === ROUTE_CHOICES.car;
    this.arrival = undefined;
    this.cameras.main.fadeIn(350);
    this.dialog = new StoryDialog(this, "bottom");
    if (isProgressionFlagComplete(this.registry, PROGRESSION_FLAGS.mealComplete)) {
      this.homeward(true);
      return;
    }
    photoArt(this, "banquet-corridor");
    this.player = new Player(this, { x: 650, y: 815, speed: 310 });
    this.game.canvas.dataset.dinnerStage = "to-banquet";
    this.narrate("자, 이제 밥을 먹으러 갈까.", () => {
      this.dialog?.hide();
      this.player?.walkPath([{ x: 560, y: 800 }, { x: 400, y: 790 }, { x: 220, y: 790 }, { x: 70, y: 790 }]);
      this.arrival = () => this.transition(() => this.buffet());
    }, 0);
  }

  update(_time: number, delta: number): void {
    this.player?.updateMovement(delta);
    if (this.arrival && !this.player?.isMoving()) {
      const callback = this.arrival;
      this.arrival = undefined;
      callback();
    }
  }

  private buffet(): void {
    photoArt(this, "banquet");
    this.game.canvas.dataset.dinnerStage = "banquet-arrival";
    waitForTap(this, 2000, () => this.revealFood());
  }

  private revealFood(): void {
    this.add.rectangle(360, 640, 720, 1280, 0x302c23, 0.35);
    const foods: { image: Phaser.GameObjects.Image; y: number }[] = [];
    for (const [index, key] of ["buffet-left", "buffet-right"].entries()) {
      const texture = this.textures.get(key);
      const source = texture.getSourceImage();
      const edges = index === 0 ? [0, 0.378, 0.683, 1] : [0, 0.33, 0.628, 1];
      for (let row = 0; row < 3; row += 1) {
        const top = Math.round((edges[row] ?? 0) * source.height);
        const bottom = Math.round((edges[row + 1] ?? 1) * source.height);
        const frame = `food-${row}`;
        if (!texture.has(frame)) texture.add(frame, 0, 0, top, source.width, bottom - top);
        const food = this.add.image(210 + index * 300, 196 + row * 280, key, frame).setDisplaySize(290, 270).setAlpha(0);
        foods.push({ image: food, y: 180 + row * 280 });
        if (reducedMotion()) food.setAlpha(1).setY(180 + row * 280);
        else this.tweens.add({ targets: food, alpha: 1, y: 180 + row * 280, duration: 650, delay: (row * 2 + index) * 500, ease: "Sine.easeOut" });
        food.setName(`buffet-photo-${row * 2 + index}`);
      }
    }
    this.game.canvas.dataset.buffetPhotoCount = String(foods.length);
    this.game.canvas.dataset.dinnerStage = "buffet";
    this.game.canvas.dataset.buffetRevealComplete = "false";
    waitForTap(this, reducedMotion() ? 0 : 3200, () => {
      this.game.canvas.dataset.buffetRevealComplete = "true";
      for (const food of foods) {
        this.tweens.killTweensOf(food.image);
        food.image.setAlpha(1).setY(food.y);
      }
      this.narrate("따뜻한 음식부터 디저트까지, 종류가 꽤 다양하네. 맛있어 보이는 것부터 조금씩 담아봐야겠다.", () => {
        this.game.canvas.dataset.dinnerStage = "buffet-route";
        const copy = this.byCar
          ? "생맥주에 레드·화이트 와인, 장어덮밥에 온사케까지. 차를 가져와서 술은 못 마시는 게 아쉽네. 대신 음식이랑 디저트를 더 즐겨야겠다."
          : "지하철 타고 오길 잘했네. 생맥주에 레드·화이트 와인도 있고, 장어덮밥에는 따뜻한 사케도 곁들여 봐야겠다.";
        const finishMeal = () => {
          completeProgressionFlag(this.registry, PROGRESSION_FLAGS.mealComplete);
          this.game.canvas.dataset.mealComplete = "true";
          saveCheckpoint(this, isProgressionFlagComplete(this.registry, PROGRESSION_FLAGS.banquetGuideComplete) ? "ending" : "lobby");
          if (isProgressionFlagComplete(this.registry, PROGRESSION_FLAGS.banquetGuideComplete)) this.transition(() => this.homeward());
          else this.transition(() => this.toCeremony());
        };
        this.dialog?.show(copy, [], undefined, finishMeal);
      });
    });
  }

  private toCeremony(): void {
    photoArt(this, "banquet-corridor");
    this.player = new Player(this, { x: 70, y: 790, speed: 310 });
    this.game.canvas.dataset.dinnerStage = "to-ceremony";
    this.narrate("잘 먹었다. 이제 결혼식을 보러 가야지.", () => {
      this.dialog?.hide();
      this.player?.walkPath([{ x: 220, y: 790 }, { x: 400, y: 790 }, { x: 560, y: 800 }, { x: 650, y: 815 }]);
      this.arrival = () => {
        const visitsComplete = [PROGRESSION_FLAGS.photoBoothVisited, PROGRESSION_FLAGS.photoTableVisited, PROGRESSION_FLAGS.receptionComplete]
          .every((flag) => isProgressionFlagComplete(this.registry, flag));
        const bridalComplete = readGuestSide(this.registry) !== "bride" || isProgressionFlagComplete(this.registry, PROGRESSION_FLAGS.bridalRoomVisited);
        fadeToScene(this, visitsComplete && bridalComplete ? SCENE_KEYS.VenueHall : SCENE_KEYS.VenueLobby);
      };
    }, 0);
  }

  private homeward(afterCeremony = false): void {
    photoArt(this, afterCeremony ? "hall" : "banquet");
    this.player = undefined;
    this.game.canvas.dataset.dinnerStage = "after-meal";
    this.narrate(afterCeremony ? "사진도 잘 찍었다. 밥은 아까 먹었으니 이제 집에 가야지." : "아, 잘 먹었다. 이제 집에 가야지.", () => {
      this.game.canvas.dataset.dinnerStage = "homeward";
      const copy = this.byCar
        ? "주차 정산은… 그냥 나가면 되는구나? 자동으로 3시간 적용되는군. 편하네."
        : "내렸던 곳에서 다시 셔틀 타고 집에 가야지.";
      this.narrate(copy, () => {
        this.dialog?.hide();
        fadeToScene(this, SCENE_KEYS.Ending);
      });
    });
  }

  private narrate(copy: string, next: () => void, hold = 3500): void {
    this.dialog?.narrate(copy, next, hold);
  }

  private transition(render: () => void): void {
    this.dialog?.hide();
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.children.removeAll(true);
      this.player = undefined;
      render();
      this.cameras.main.fadeIn(350);
    });
    this.cameras.main.fadeOut(350);
  }
}
