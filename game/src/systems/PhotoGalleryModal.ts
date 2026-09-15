import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { photosForGuestSide } from "../data/photoGallery";
import { readGuestSide } from "../state/gameState";
import { createKoreanText, createScenePanel, createTouchButton, SCENE_UI_COLORS } from "../ui/sceneUi";

export class PhotoGalleryModal {
  private readonly scene: Phaser.Scene;
  private readonly onClose: () => void;
  private readonly photos: ReturnType<typeof photosForGuestSide>;
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private photo: Phaser.GameObjects.Image | undefined;
  private originalPhoto: HTMLImageElement | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private counter: Phaser.GameObjects.Text | undefined;
  private opened = false;
  private index = 0;
  private previousFocus: HTMLElement | undefined;

  constructor(scene: Phaser.Scene, onClose: () => void) {
    this.scene = scene;
    this.onClose = onClose;
    this.photos = photosForGuestSide(readGuestSide(scene.registry));
  }

  public isOpen(): boolean { return this.opened; }

  public open(): void {
    if (this.opened) return;
    this.opened = true;
    this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    this.index = 0;
    this.scene.game.canvas.dataset.photoGalleryOpen = "true";
    const blocker = this.scene.add.rectangle(360, 640, GAME_WIDTH, GAME_HEIGHT,
      SCENE_UI_COLORS.inkOutline.fill, 0.7).setDepth(100).setInteractive();
    blocker.on(Phaser.Input.Events.POINTER_DOWN, this.stopPointer);
    blocker.on(Phaser.Input.Events.POINTER_UP, this.stopPointer);
    this.objects.push(blocker, createScenePanel(this.scene, {
      x: 360, y: 640, width: 640, height: 1040, texture: "quiz-frame", depth: 101,
    }));
    this.text("포토테이블", 360, 192, 360, 30);
    this.button("×", 620, 192, () => this.close(), "닫기");
    this.photo = this.scene.add.image(360, 616, this.photos[0].texture).setDepth(102).setName("photo-gallery-image");
    // Keep the world-space layout, but let the browser display the original photo
    // at the device's resolution instead of rasterizing it into the pixel-art canvas.
    this.originalPhoto = document.createElement("img");
    this.originalPhoto.className = "photo-table-original";
    this.originalPhoto.draggable = false;
    document.body.append(this.originalPhoto);
    this.resizeObserver = new ResizeObserver(this.positionOriginal);
    this.resizeObserver.observe(this.scene.game.canvas);
    window.addEventListener("resize", this.positionOriginal);
    window.visualViewport?.addEventListener("resize", this.positionOriginal);
    this.objects.push(this.photo);
    this.counter = this.text("", 360, 1052, 180, 22);
    this.button("‹", 140, 1050, () => this.move(-1), "이전 사진");
    this.button("›", 580, 1050, () => this.move(1), "다음 사진");
    this.showPhoto();
    this.scene.input.keyboard?.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.onKey, this);
  }

  public close(): void {
    if (!this.opened) return;
    this.destroy();
    this.onClose();
    if (this.previousFocus?.isConnected) this.previousFocus.focus({ preventScroll: true });
  }

  public destroy(): void {
    this.opened = false;
    this.scene.game.canvas.dataset.photoGalleryOpen = "false";
    this.scene.input.keyboard?.off(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.onKey, this);
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    window.removeEventListener("resize", this.positionOriginal);
    window.visualViewport?.removeEventListener("resize", this.positionOriginal);
    this.originalPhoto?.remove();
    this.originalPhoto = undefined;
    for (const object of this.objects) object.destroy();
    this.objects.length = 0;
    this.photo = undefined;
    this.counter = undefined;
  }

  private move(offset: number): void {
    this.index = (this.index + offset + this.photos.length) % this.photos.length;
    this.showPhoto();
  }

  private showPhoto(): void {
    const entry = this.photos[this.index];
    if (entry === undefined || this.photo === undefined) return;
    this.photo.setTexture(entry.texture);
    this.photo.setScale(Math.min(544 / this.photo.width, 656 / this.photo.height));
    if (this.originalPhoto) {
      this.originalPhoto.src = entry.src;
      this.originalPhoto.alt = `${readGuestSide(this.scene.registry) === "bride" ? "현서" : "재준"}의 웨딩 사진 ${this.index + 1}`;
      this.originalPhoto.dataset.texture = entry.texture;
      this.photo.setVisible(false);
      this.positionOriginal();
    }
    this.counter?.setText(`${this.index + 1} / ${this.photos.length}`);
    this.scene.game.canvas.dataset.photoGalleryIndex = String(this.index);
  }

  private positionOriginal = (): void => {
    if (!this.photo || !this.originalPhoto) return;
    const canvas = this.scene.game.canvas.getBoundingClientRect();
    const bounds = this.photo.getBounds();
    Object.assign(this.originalPhoto.style, {
      left: `${canvas.left + bounds.left * canvas.width / GAME_WIDTH}px`,
      top: `${canvas.top + bounds.top * canvas.height / GAME_HEIGHT}px`,
      width: `${bounds.width * canvas.width / GAME_WIDTH}px`,
      height: `${bounds.height * canvas.height / GAME_HEIGHT}px`,
    });
  };

  private onKey(event: KeyboardEvent): void {
    if (event.key === "Escape") this.close();
    else if (event.key === "ArrowLeft") this.move(-1);
    else if (event.key === "ArrowRight") this.move(1);
    else if (!event.key.startsWith("Arrow")) return;
    event.preventDefault();
  }

  private text(copy: string, x: number, y: number, width: number, fontSize: number): Phaser.GameObjects.Text {
    const text = createKoreanText(this.scene, { x, y, copy, width, fontSize,
      maxCharactersPerLine: 28, maxLines: 1, lineHeight: fontSize + 8, color: "labelText", depth: 103 });
    this.objects.push(text);
    return text;
  }

  private button(label: string, x: number, y: number, onPress: () => void, tooltip: string): void {
    const button = createTouchButton(this.scene, { x, y, width: 88, height: 88, label, keyboardLabel: tooltip, onPress, depth: 104 });
    button.label.setFontSize(36);
    const hint = this.text(tooltip, x, y + 64, 160, 18).setVisible(false);
    button.hitArea.on(Phaser.Input.Events.POINTER_OVER, () => hint.setVisible(true));
    button.hitArea.on(Phaser.Input.Events.POINTER_OUT, () => hint.setVisible(false));
    button.hitArea.on(Phaser.Input.Events.POINTER_DOWN, this.stopPointer);
    button.hitArea.on(Phaser.Input.Events.POINTER_UP, this.stopPointer);
    this.objects.push(button.hitArea, button.label);
  }

  private stopPointer(_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData): void {
    event.stopPropagation();
  }
}
