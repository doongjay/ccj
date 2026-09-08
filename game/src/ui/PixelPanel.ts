import Phaser from "phaser";

export class PixelPanel extends Phaser.GameObjects.Rectangle {
  private decoration: Phaser.GameObjects.NineSlice | undefined;

  public constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number,
    texture: "dialog-panel" | "quiz-frame" | "touch-button") {
    super(scene, x, y, width, height, 0xffffff, 0);
    this.decoration = scene.add.nineslice(x, y, texture, undefined, width, height, 8, 8, 8, 8);
    scene.add.existing(this);
  }

  public override setFillStyle(color?: number, alpha = 1): this {
    this.decoration?.setTint(color ?? 0xffffff).setAlpha(alpha);
    return super.setFillStyle(color, 0);
  }

  public override setDepth(value: number): this {
    this.decoration?.setDepth(value);
    return super.setDepth(value);
  }

  public override setVisible(value: boolean): this {
    this.decoration?.setVisible(value);
    return super.setVisible(value);
  }

  public override destroy(fromScene?: boolean): void {
    this.decoration?.destroy(fromScene);
    this.decoration = undefined;
    super.destroy(fromScene);
  }
}
