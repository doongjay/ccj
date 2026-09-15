import Phaser from "phaser";
import { OUTFIT_LABELS, OUTFIT_POSES } from "../data/guestOutfits";
import { clothingPart, extraClothingPart, addWhiteCamisole, neckPart, partCanvas, MINIMI_NECK } from "./minimiParts";
import { transparentAtlas } from "./minimiArt";
import { classicHead, classicExpression, classicHairThumbnail, classicFaceThumbnail } from "./classicMinimi";

export type MinimiProfile = { gender: "male" | "female"; outfit: number; hair: number; face?: number };
export const HAIR_LABELS = { male: ["단정한 가르마", "앞머리", "웨이브"], female: ["단발", "긴 생머리", "포니테일"] } as const;
export const FACE_LABELS = ["기본 얼굴", "안경 얼굴", "땡글이 얼굴"] as const;

export function minimiTextureKey(profile: Pick<MinimiProfile, "gender" | "face">): string {
  const face = profile.face === 1 || profile.face === 2 ? profile.face : 0;
  return `minimi-${profile.gender}${face ? `-face-${face}` : ""}`;
}

type MinimiParts = {
  neck: HTMLCanvasElement;
  clothes: HTMLCanvasElement[][];
  hairArt: HTMLCanvasElement[][];
  faces: Map<number, HTMLCanvasElement[][]>;
};
const partsByGame = new WeakMap<Phaser.Game, Map<string, MinimiParts>>();

function prepareParts(scene: Phaser.Scene, gender: "male" | "female"): MinimiParts {
  let cache = partsByGame.get(scene.game);
  if (!cache) { cache = new Map(); partsByGame.set(scene.game, cache); }
  const cached = cache.get(gender);
  if (cached) return cached;
  const sourceHair = transparentAtlas(scene.textures.get("minimi-hair").getSourceImage() as HTMLImageElement);
  const faceKey = gender === "female" ? "minimi-faces-female" : "minimi-faces";
  if (!scene.textures.exists(faceKey)) {
    // Keep the approved neutral thumbnail base free of hairstyle fragments;
    // only the shared expression changes with gender.
    const originalFace = classicHead(sourceHair, "male", 0, 0);
    const faceArt = Array.from({ length: 3 }, (_, face) => classicFaceThumbnail(originalFace, face, gender));
    const faceSheet = scene.textures.createCanvas(faceKey, 384, 768)!;
    for (let face = 0; face < 3; face++) for (let row = 0; row < 4; row++) faceSheet.context.drawImage(faceArt[face], face * 128, row * 192);
    faceSheet.refresh().setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
  const sourceClothes = scene.textures.get(`outfits-${gender}`).getSourceImage() as HTMLImageElement;
  const count = OUTFIT_LABELS[gender].length;
  const extra = transparentAtlas(scene.textures.get(`extra-outfits-${gender}`).getSourceImage() as HTMLImageElement);
  const gray = gender === "female" ? transparentAtlas(scene.textures.get("gray-tweed").getSourceImage() as HTMLImageElement) : extra;
  const sixth = transparentAtlas(scene.textures.get(gender === "female" ? "sixth-outfits-female" : "sixth-outfits").getSourceImage() as HTMLImageElement);
  const clothes = Array.from({ length: count }, (_, outfit) => OUTFIT_POSES.map((_pose, row) => outfit < 3 ? clothingPart(sourceClothes, gender, outfit, row)
    : outfit === 5 ? extraClothingPart(sixth, gender === "male" ? 0 : 1, row, gender, gender === "male" ? 302 : 207, gender === "male" ? 9 : 8)
    : extraClothingPart(outfit === 4 ? gray : extra, outfit - 3, row, gender)));
  if (gender === "female") clothes[5].forEach(addWhiteCamisole);
  const hairArt = Array.from({ length: 3 }, (_, hair) => Array.from({ length: 4 }, (_, row) => classicHead(sourceHair, gender, hair, row)));
  const hairstyles = scene.textures.createCanvas(`hairstyles-${gender}`, 384, 192)!;
  for (let hair = 0; hair < 3; hair++) hairstyles.context.drawImage(classicHairThumbnail(hairArt[hair][0]), hair * 128, 0);
  hairstyles.refresh().setFilter(Phaser.Textures.FilterMode.NEAREST);
  const wardrobe = scene.textures.createCanvas(`wardrobe-${gender}`, count * 128, 128)!;
  wardrobe.context.imageSmoothingEnabled = false;
  for (let outfit = 0; outfit < count; outfit++) {
    wardrobe.context.drawImage(clothes[outfit][0], 0, 80, 128, 112, outfit * 128, 8, 128, 112);
    wardrobe.add(outfit, 0, outfit * 128, 0, 128, 128);
  }
  wardrobe.refresh().setFilter(Phaser.Textures.FilterMode.NEAREST);
  const parts = { neck: neckPart(), clothes, hairArt, faces: new Map<number, HTMLCanvasElement[][]>() };
  cache.set(gender, parts);
  return parts;
}

/** Keep the established atlas/frame API, but draw only a requested combination. */
export function buildMinimiTextures(scene: Phaser.Scene, profile: MinimiProfile = { gender: "male", outfit: 0, hair: 0, face: 0 }): void {
  const { gender, outfit, hair } = profile;
  const face = profile.face === 1 || profile.face === 2 ? profile.face : 0;
  const key = minimiTextureKey(profile);
  if (scene.textures.exists(key) && scene.textures.get(key).has(`${outfit}-${hair}-down`)) return;
  const { neck, clothes, hairArt, faces: cache } = prepareParts(scene, gender);
  let faces = cache.get(face);
  if (!faces) {
    faces = hairArt.map(directions => directions.map((head, row) => classicExpression(head, face, row)));
    cache.set(face, faces);
    const headSheet = scene.textures.createCanvas(`heads-${gender}-face-${face}`, 384, 768)!;
    headSheet.context.imageSmoothingEnabled = false;
    for (let hair = 0; hair < 3; hair++) for (let row = 0; row < 4; row++) headSheet.context.drawImage(faces[hair][row], hair * 128, row * 192);
    headSheet.refresh().setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
  const texture = (scene.textures.exists(key) ? scene.textures.get(key) : scene.textures.createCanvas(key, OUTFIT_LABELS[gender].length * 384, 1728)) as Phaser.Textures.CanvasTexture;
  const context = texture.context;
  context.imageSmoothingEnabled = false;
  for (const [row, pose] of OUTFIT_POSES.entries()) {
    const x = (outfit * 3 + hair) * 128;
    const headRow = row < 4 ? row : 0;
    const draw = (y: number, head: HTMLCanvasElement) => {
      context.drawImage(neck, x, y);
      context.drawImage(clothes[outfit][row], x, y);
      context.drawImage(head, x, y + MINIMI_NECK.headOffsetY);
    };
    draw(row * 192, faces[hair][headRow]);
    texture.add(`${outfit}-${hair}-${pose}`, 0, x, row * 192, 128, 192);
    if (row === 0 || row === 4 || row === 5) {
      const blinkY = (row === 0 ? 6 : row === 4 ? 7 : 8) * 192;
      draw(blinkY, classicExpression(hairArt[hair][headRow], face, headRow, true));
      texture.add(`${outfit}-${hair}-${pose}-blink`, 0, x, blinkY, 128, 192);
    }
  }
  texture.refresh().setFilter(Phaser.Textures.FilterMode.NEAREST);
}

export function drawMinimiPart(scene: Phaser.Scene, canvas: HTMLCanvasElement, profile: MinimiProfile, part: "hair" | "outfit" | "face"): void {
  prepareParts(scene, profile.gender);
  canvas.width = 128; canvas.height = 128;
  const context = canvas.getContext("2d")!;
  context.imageSmoothingEnabled = false;
  const raw = partCanvas(128, 128);
  const rawContext = raw.getContext("2d")!;
  if (part === "outfit") {
    const wardrobe = scene.textures.get(`wardrobe-${profile.gender}`).getSourceImage() as HTMLCanvasElement;
    rawContext.drawImage(wardrobe, profile.outfit * 128, 0, 128, 128, 0, 0, 128, 128);
  } else if (part === "hair") {
    const hairstyles = scene.textures.get(`hairstyles-${profile.gender}`).getSourceImage() as HTMLCanvasElement;
    rawContext.drawImage(hairstyles, profile.hair * 128, 0, 128, 128, 0, 0, 128, 128);
  } else {
    const face = profile.face === 1 || profile.face === 2 ? profile.face : 0;
    const faces = scene.textures.get(profile.gender === "female" ? "minimi-faces-female" : "minimi-faces").getSourceImage() as HTMLCanvasElement;
    rawContext.drawImage(faces, face * 128, 0, 128, 128, 0, 0, 128, 128);
  }
  // Center the visible artwork, rather than the uneven transparent margins in each source frame.
  const pixels = rawContext.getImageData(0, 0, 128, 128).data;
  let left = 128, top = 128, right = -1, bottom = -1;
  for (let y = 0; y < 128; y += 1) for (let x = 0; x < 128; x += 1) {
    if (pixels[(y * 128 + x) * 4 + 3] < 128) continue;
    left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  if (right < left) return;
  const width = right - left + 1, height = bottom - top + 1;
  const scale = Math.min(108 / width, 108 / height);
  const drawnWidth = Math.round(width * scale), drawnHeight = Math.round(height * scale);
  context.drawImage(raw, left, top, width, height, Math.round((128 - drawnWidth) / 2), Math.round((128 - drawnHeight) / 2), drawnWidth, drawnHeight);
}

export function buildFormalGuestTexture(scene: Phaser.Scene): void {
  const source = scene.textures.get("formal-guests").getSourceImage() as HTMLImageElement;
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = source.width; sourceCanvas.height = source.height;
  const sourceContext = sourceCanvas.getContext("2d")!;
  sourceContext.drawImage(source, 0, 0);
  const texture = scene.textures.createCanvas("formal-guest-portraits", 512, 576)!;
  texture.context.imageSmoothingEnabled = false;
  const edges = [0, 0.352, 0.668, 1];
  for (let index = 0; index < 12; index += 1) {
    const column = index % 4;
    const row = Math.floor(index / 4);
    const sourceX = Math.round(column * source.width / 4);
    const sourceY = Math.round(edges[row]! * source.height);
    const width = Math.floor(source.width / 4);
    const height = Math.floor((edges[row + 1]! - edges[row]!) * source.height);
    const data = sourceContext.getImageData(sourceX, sourceY, width, height).data;
    let left = width, top = height, right = 0, bottom = 0;
    for (let pixelY = 0; pixelY < height; pixelY += 1) {
      for (let pixelX = 0; pixelX < width; pixelX += 1) {
        if (data[(pixelY * width + pixelX) * 4 + 3]! < 128) continue;
        left = Math.min(left, pixelX); right = Math.max(right, pixelX);
        top = Math.min(top, pixelY); bottom = Math.max(bottom, pixelY);
      }
    }
    const drawWidth = Math.round(176 * (right - left + 1) / (bottom - top + 1));
    texture.context.drawImage(source, sourceX + left, sourceY + top, right - left + 1, bottom - top + 1,
      column * 128 + Math.round((128 - drawWidth) / 2), row * 192 + 8, drawWidth, 176);
    texture.add(index, 0, column * 128, row * 192, 128, 192);
  }
  texture.refresh();
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

export function drawMinimi(scene: Phaser.Scene, canvas: HTMLCanvasElement, profile: MinimiProfile, pose = "down"): void {
  buildMinimiTextures(scene, profile);
  canvas.width = 128;
  canvas.height = 192;
  const context = canvas.getContext("2d")!;
  const texture = scene.textures.get(minimiTextureKey(profile));
  const frame = texture.get(`${profile.outfit}-${profile.hair}-${pose}`);
  context.clearRect(0, 0, 128, 192);
  context.imageSmoothingEnabled = false;
  context.drawImage(texture.getSourceImage() as HTMLCanvasElement, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, 128, 192);
}
