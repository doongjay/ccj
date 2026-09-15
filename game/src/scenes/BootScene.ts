import Phaser from "phaser";
import { SCENE_KEYS } from "../state/gameState";
import { markActiveScene } from "../ui/sceneUi";
import { ensureSceneAssets, ensureStages } from "../systems/stageAssets";

export class BootScene extends Phaser.Scene {
  constructor() { super(SCENE_KEYS.Boot); }
  create(): void {
    markActiveScene(this, SCENE_KEYS.Boot);
    this.cameras.main.setBackgroundColor("#f8f2e7");
    void this.open();
  }
  private async open(): Promise<void> {
    await ensureStages(this, ["opening"], true);
    const target = window.location.hash === "#invitation" ? SCENE_KEYS.Invitation : SCENE_KEYS.Intro;
    await ensureSceneAssets(this, target);
    this.scene.start(target);
  }
}
