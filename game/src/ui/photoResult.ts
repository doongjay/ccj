import type Phaser from "phaser";
import { StoryDialog } from "./StoryDialog";

/** The same world-pixel bounds used by the visible viewfinder corners. */
export const GROUP_PHOTO_FRAME = { x: 40, y: 510, width: 640, height: 485 } as const;

export function captureGroupPhoto(scene: Phaser.Scene): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const { x, y, width, height } = GROUP_PHOTO_FRAME;
    const cameraUi = scene.children.getByName("group-photo-camera-ui") as Phaser.GameObjects.Container | null;
    const visible = cameraUi?.visible ?? false;
    cameraUi?.setVisible(false);
    scene.game.renderer.snapshotArea(x, y, width, height, image => {
      if (cameraUi?.scene) cameraUi.setVisible(visible);
      if (!(image instanceof HTMLImageElement)) { reject(new Error("사진을 만들지 못했어요.")); return; }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) { reject(new Error("사진을 만들지 못했어요.")); return; }
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0);
      resolve(canvas);
    });
  });
}

export async function showGroupPhotoResult(scene: Phaser.Scene, onContinue: () => void): Promise<void> {
  const dialog = new StoryDialog(scene);
  dialog.showInfo("기념사진을 만드는 중…", () => {}, { closeLabel: null, escapeCloses: false });
  try {
    const canvas = await captureGroupPhoto(scene);
    if (!scene.scene.isActive()) return;
    const figure = document.createElement("figure");
    figure.className = "keepsake keepsake-group";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "신랑신부와 함께한 원판 사진");
    figure.append(canvas);
    dialog.showInfo("찰칵! 결혼 축하해!", onContinue, { variant: "photo-result", content: figure, closeLabel: "다음으로" });
  } catch {
    if (!scene.scene.isActive()) return;
    dialog.showInfo("사진을 만들지 못했어요.", onContinue, {
      closeLabel: "다음으로", choices: [{ label: "다시 촬영하기", onSelect: () => { void showGroupPhotoResult(scene, onContinue); } }],
    });
  }
}
