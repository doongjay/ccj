import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { photosForGuestSide } from "../data/photoGallery";
import { readGuestSide } from "../state/gameState";

type Point = Readonly<{ x: number; y: number }>;
type Panel = readonly [Point, Point, Point, Point];

// Inner screen corners, clockwise from top left, in the original 941 × 1671 lobby.
// Only the screen contents are drawn; the gold frames and flowers belong to the background.
const PANELS: readonly Panel[] = [
  [{ x: 655, y: 317 }, { x: 686, y: 331 }, { x: 686, y: 423 }, { x: 655, y: 409 }],
  [{ x: 697, y: 339 }, { x: 728, y: 353 }, { x: 728, y: 447 }, { x: 697, y: 433 }],
  [{ x: 737, y: 360 }, { x: 770, y: 375 }, { x: 770, y: 471 }, { x: 737, y: 456 }],
];

export function renderLobbyPhotoWall(scene: Phaser.Scene): void {
  const photos = photosForGuestSide(readGuestSide(scene.registry));
  const background = scene.textures.get("venue-lobby").getSourceImage();
  const key = "lobby-photo-wall";
  const texture = scene.textures.exists(key)
    ? scene.textures.get(key) as Phaser.Textures.CanvasTexture
    : scene.textures.createCanvas(key, background.width, background.height)!;
  const context = texture.context;
  context.clearRect(0, 0, texture.width, texture.height);
  context.save();
  context.scale(background.width / 941, background.height / 1671);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  const screen = document.createElement("canvas");
  screen.width = 128;
  screen.height = 192;
  const screenContext = screen.getContext("2d")!;
  screenContext.imageSmoothingQuality = "high";
  for (const [index, corners] of PANELS.entries()) {
    screenContext.fillStyle = "#f5eddf";
    screenContext.fillRect(0, 0, screen.width, screen.height);
    const photo = photos[index];
    if (photo && scene.textures.exists(photo.texture)) {
      const source = scene.textures.get(photo.texture).getSourceImage() as HTMLImageElement;
      // Fill the whole frame, including the former blue margins. Only this small
      // display is cropped; the source and the photo-table viewer stay complete.
      const scale = Math.max(screen.width / source.width, screen.height / source.height);
      const width = source.width * scale, height = source.height * scale;
      screenContext.drawImage(source, (screen.width - width) / 2, (screen.height - height) / 2, width, height);
    }
    drawPanel(context, screen, corners);
  }
  context.restore();
  texture.refresh();
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, key)
    .setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setDepth(0).setName(key)
    .setData("photos", photos.map(photo => photo.texture));
}

function drawPanel(context: CanvasRenderingContext2D, screen: HTMLCanvasElement, [topLeft, topRight, bottomRight, bottomLeft]: Panel): void {
  // These frame interiors are parallelograms. One transform avoids the thin
  // diagonal transparency seam produced by two separately antialiased triangles.
    context.save();
    context.beginPath();
    context.moveTo(topLeft.x, topLeft.y);
    context.lineTo(topRight.x, topRight.y);
    context.lineTo(bottomRight.x, bottomRight.y);
    context.lineTo(bottomLeft.x, bottomLeft.y);
    context.closePath();
    context.clip();
    context.transform(
      (topRight.x - topLeft.x) / screen.width,
      (topRight.y - topLeft.y) / screen.width,
      (bottomLeft.x - topLeft.x) / screen.height,
      (bottomLeft.y - topLeft.y) / screen.height,
      topLeft.x, topLeft.y,
    );
    context.drawImage(screen, 0, 0);
    context.restore();
}
