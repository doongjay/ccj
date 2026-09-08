import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { WEDDING_METADATA } from "../data/weddingMetadata";
import { ASSET_MANIFEST } from "../data/assetManifest";
import { loadGameFont, registerCharacterAnimations } from "../ui/assetHelpers";
import { SCENE_KEYS } from "../state/gameState";
import {
  createKoreanText,
  createSceneBackground,
  createSceneHeader,
  SCENE_UI_COLORS,
  fadeToScene,
  markActiveScene,
} from "../ui/sceneUi";

export class BootScene extends Phaser.Scene {
  private readonly failedAssets = new Set<string>();
  private loadingText: Phaser.GameObjects.Text | undefined;
  constructor() {
    super(SCENE_KEYS.Boot);
  }

  preload(): void {
    this.failedAssets.clear();
    const dataset = this.game.canvas.dataset;
    dataset.assetLoadState = "loading";
    dataset.assetLoadProgress = "0";
    delete dataset.assetLoadError;
    markActiveScene(this, SCENE_KEYS.Boot);
    createSceneBackground(this, {
      color: "ivory",
      bands: [
        { y: 256, width: GAME_WIDTH, height: 192, color: "blush" },
        { y: 1096, width: GAME_WIDTH, height: 368, color: "greenery" },
      ],
    });
    createSceneHeader(this, {
      title: WEDDING_METADATA.title,
    });
    // The preload view cannot depend on textures still in the loader queue.
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 608, 216, SCENE_UI_COLORS.labelSurface.fill)
      .setStrokeStyle(4, SCENE_UI_COLORS.ivory.fill);
    this.loadingText = createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      copy: "초대장을 준비하고 있어요\n잠시만 기다려 주세요",
      width: 512,
      maxCharactersPerLine: 18,
      maxLines: 2,
      fontSize: 24,
      lineHeight: 32,
      color: "labelText",
    });

    this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) => {
      dataset.assetLoadProgress = String(progress);
    });
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      this.failedAssets.add(file.key);
      this.showLoadFailure();
    });
    for (const asset of ASSET_MANIFEST) {
      if (asset.preloadGroup !== "initial") continue;
      switch (asset.kind) {
        case "image": this.load.image(asset.key, asset.url); break;
        case "spritesheet":
          this.load.spritesheet(asset.key, asset.url, {
            frameWidth: asset.frameWidth, frameHeight: asset.frameHeight,
            margin: asset.margin, spacing: asset.spacing,
          });
          break;
        case "font": break;
      }
    }
  }

  create(): void {
    for (const asset of ASSET_MANIFEST) {
      if (asset.preloadGroup !== "initial" || asset.kind === "font") continue;
      if (!this.textures.exists(asset.key)) {
        this.failedAssets.add(asset.key);
        continue;
      }
      const texture = this.textures.get(asset.key);
      const source = texture.getSourceImage();
      if (source.width !== asset.width || source.height !== asset.height) this.failedAssets.add(asset.key);
      if (asset.kind === "spritesheet" && !texture.has("15")) this.failedAssets.add(asset.key);
      texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.failedAssets.size > 0) {
      this.showLoadFailure();
      return;
    }
    registerCharacterAnimations(this);
    this.add.image(GAME_WIDTH / 2, 800, "loading-accent").setScale(2);
    void this.finishLoading();
  }

  private showLoadFailure(): void {
    this.game.canvas.dataset.assetLoadState = "error";
    this.game.canvas.dataset.assetLoadError = [...this.failedAssets].join(",");
    this.loadingText?.setText("초대장을 불러오지 못했어요\n새로고침해 주세요");
  }

  private async finishLoading(): Promise<void> {
    await loadGameFont(this.game.canvas);
    if (!this.scene.isActive()) return;
    this.loadingText?.setFontFamily("Galmuri11, system-ui, sans-serif");
    this.game.canvas.dataset.assetLoadState = "complete";
    this.game.canvas.dataset.assetLoadProgress = "1";
    let transitionRequested = false;
    const goToIntro = (): void => {
      if (transitionRequested) {
        return;
      }

      transitionRequested = true;
      fadeToScene(this, SCENE_KEYS.Intro);
    };

    this.time.delayedCall(500, goToIntro);
    this.input.once("pointerdown", goToIntro);
  }
}
