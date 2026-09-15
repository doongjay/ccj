import type Phaser from "phaser";
import { StoryDialog } from "./StoryDialog";
import { cloudEnabled, CloudSaveError } from "../cloud/client";
import { sendCloudPhoto, type PhotoSubmission } from "../cloud/photos";
import { readGuestName, readGuestSide, readGuestGender, readGuestOutfit, readGuestHair, readGuestFace } from "../state/gameState";

const ids = new WeakMap<HTMLCanvasElement, string>();

export function photoUploadStatus(scene: Phaser.Scene, canvas: HTMLCanvasElement, kind: PhotoSubmission["kind"]): HTMLElement {
  const container = document.createElement("div");
  container.className = "photo-upload-status";
  if (!cloudEnabled) return container;
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "story-choice";
  retry.textContent = "사진 다시 보내기";
  container.append(status);
  const id = ids.get(canvas) ?? crypto.randomUUID();
  ids.set(canvas, id);
  const photo: PhotoSubmission = { id, canvas, kind, name: readGuestName(scene.registry),
    side: readGuestSide(scene.registry) ?? "groom", avatar: { gender: readGuestGender(scene.registry),
      outfit: readGuestOutfit(scene.registry), hair: readGuestHair(scene.registry), face: readGuestFace(scene.registry) } };
  const upload = async (): Promise<void> => {
    retry.remove();
    retry.disabled = true;
    status.textContent = "신랑신부에게 사진을 보내는 중…";
    try {
      await sendCloudPhoto(photo);
      status.textContent = "신랑신부에게 사진을 보냈어요.";
    } catch (failure) {
      status.textContent = failure instanceof CloudSaveError ? failure.message : "사진을 보내지 못했어요. 다시 시도해 주세요.";
      container.append(retry);
    } finally { retry.disabled = false; }
  };
  retry.onclick = event => { event.stopPropagation(); void upload(); };
  void upload();
  return container;
}

export function captureGroupPhoto(scene: Phaser.Scene): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    scene.game.renderer.snapshot(image => {
      if (!(image instanceof HTMLImageElement)) { reject(new CloudSaveError("사진을 만들지 못했어요.")); return; }
      const canvas = document.createElement("canvas");
      canvas.width = 720; canvas.height = 1280;
      const context = canvas.getContext("2d");
      if (!context) { reject(new CloudSaveError("사진을 만들지 못했어요.")); return; }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
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
    figure.append(canvas, photoUploadStatus(scene, canvas, "group"));
    dialog.showInfo("찰칵! 결혼 축하해!", onContinue, { variant: "photo-result", content: figure, closeLabel: "다음으로" });
  } catch (failure) {
    if (!scene.scene.isActive()) return;
    dialog.showInfo(failure instanceof CloudSaveError ? failure.message : "사진을 만들지 못했어요.", onContinue, {
      closeLabel: "다음으로", choices: [{ label: "다시 촬영하기", onSelect: () => { void showGroupPhotoResult(scene, onContinue); } }],
    });
  }
}
