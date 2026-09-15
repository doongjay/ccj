import type Phaser from "phaser";
import { readGuestFace, readGuestGender, readGuestHair, readGuestOutfit } from "../state/gameState";
import { drawMinimi, type MinimiProfile } from "./minimi";
import { PHOTO_COMPOSITION_VERSION, type PhotoMemory } from "../state/checkpointData";
import { ensureAvatarAssets, ensureStages } from "../systems/stageAssets";
import { drawBridalRoomBride } from "./bridalRoomBride";

export type KeepsakeKind = "booth" | "bridal";
export type Keepsake = { kind: KeepsakeKind; title: string; canvas: HTMLCanvasElement; profile: MinimiProfile };
type Session = { photos: Map<KeepsakeKind, Keepsake>; memories: PhotoMemory[] };
const sessions = new WeakMap<Phaser.Game, Session>();
function session(game: Phaser.Game): Session {
  let value = sessions.get(game);
  if (!value) { value = { photos: new Map(), memories: [] }; sessions.set(game, value); }
  return value;
}

/** At most two small canvases. Only versioned composition/profile metadata is persisted. */
export function captureKeepsake(scene: Phaser.Scene, kind: KeepsakeKind): Keepsake {
  const photos = session(scene.game).photos;
  const existing = photos.get(kind);
  if (existing) return existing;
  const profile = session(scene.game).memories.find(photo => photo.kind === kind)?.profile
    ?? { gender: readGuestGender(scene.registry), outfit: readGuestOutfit(scene.registry), hair: readGuestHair(scene.registry), face: readGuestFace(scene.registry) };
  const canvas = document.createElement("canvas");
  canvas.width = 480; canvas.height = 400;
  const context = canvas.getContext("2d")!;
  context.imageSmoothingEnabled = false;
  const background = scene.textures.get(kind === "booth" ? "venue-photo-booth" : "venue-bridal-room").getSourceImage() as HTMLImageElement;
  // A stable 2× crop of the authored scene; movement coordinates are not changed.
  const crop = kind === "booth" ? { x: 280, y: 510 } : { x: 400, y: 315 };
  context.drawImage(background, crop.x * background.width / 720, crop.y * background.height / 1280,
    240 * background.width / 720, 200 * background.height / 1280, 0, 0, 480, 400);
  if (kind === "bridal") drawBridalRoomBride(scene, context, crop, 2);
  const x = kind === "booth" ? 400 : 512, y = kind === "booth" ? 650 : 429;
  if (kind === "booth") {
    context.fillStyle = "#817a68";
    context.fillRect((x - crop.x) * 2 - 20, (y + 44 - crop.y) * 2, 40, 4);
  }
  const minimi = document.createElement("canvas");
  drawMinimi(scene, minimi, profile, kind === "booth" ? "posing" : "seated");
  context.drawImage(minimi, (x - crop.x) * 2 - 64, (y - crop.y) * 2 - 96);
  const photo = { kind, title: kind === "booth" ? "나의 포토부스 기념사진" : "현서와 함께한 기념사진", canvas, profile };
  photos.set(kind, photo);
  if (!session(scene.game).memories.some(photo => photo.kind === kind)) session(scene.game).memories.push({ kind, profile: { ...profile }, composition: PHOTO_COMPOSITION_VERSION });
  scene.game.canvas.dataset.sessionKeepsakeCount = String(photos.size);
  scene.game.canvas.dataset.sessionKeepsakeBuilds = String(photos.size);
  return photo;
}

export function photoMemories(game: Phaser.Game): PhotoMemory[] { return structuredClone(session(game).memories); }
export function restorePhotoMemories(game: Phaser.Game, memories: PhotoMemory[]): void {
  resetSessionMemories(game);
  session(game).memories = structuredClone(memories);
}
export async function restoreNotebookPhotos(scene: Phaser.Scene): Promise<void> {
  const started = performance.now();
  for (const memory of session(scene.game).memories) {
    if (session(scene.game).photos.has(memory.kind)) continue;
    await ensureStages(scene, [memory.kind === "booth" ? "photo" : "bridal"]);
    await ensureAvatarAssets(scene, memory.profile.gender);
    if (!scene.scene.isActive()) return;
    captureKeepsake(scene, memory.kind);
  }
  scene.game.canvas.dataset.notebookRestoreMs = String(Math.round(performance.now() - started));
}

export function keepsakeFigure(photo: Keepsake): HTMLElement {
  const figure = document.createElement("figure");
  figure.className = "keepsake";
  figure.dataset.keepsake = photo.kind;
  figure.dataset.profile = JSON.stringify(photo.profile);
  const copy = document.createElement("canvas");
  copy.width = photo.canvas.width; copy.height = photo.canvas.height;
  copy.setAttribute("role", "img"); copy.setAttribute("aria-label", photo.title);
  copy.getContext("2d")!.drawImage(photo.canvas, 0, 0);
  figure.append(copy);
  return figure;
}

export function notebookKeepsakes(game: Phaser.Game): HTMLElement | undefined {
  const photos = session(game).photos;
  if (!photos.size) return;
  const album = document.createElement("div");
  album.className = "notebook-keepsakes";
  album.setAttribute("aria-label", "수첩에 남긴 사진");
  for (const photo of photos.values()) {
    const figure = keepsakeFigure(photo);
    const caption = document.createElement("figcaption");
    caption.textContent = photo.kind === "booth" ? "포토부스 ♥" : "현서와 사진";
    figure.append(caption); album.append(figure);
  }
  return album;
}

export function resetSessionMemories(game: Phaser.Game): void {
  for (const photo of session(game).photos.values()) { photo.canvas.width = 0; photo.canvas.height = 0; }
  sessions.delete(game);
  game.canvas.dataset.sessionKeepsakeCount = "0";
  game.canvas.dataset.sessionKeepsakeBuilds = "0";
  game.canvas.dataset.photoBoothCompletionCount = "0";
  game.canvas.dataset.bridalPhotoCompletionCount = "0";
}
