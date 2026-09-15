import type Phaser from "phaser";
import { GUEST_SIDES, readGuestSide, SCENE_KEYS } from "../state/gameState";
import { createKoreanText, createSceneHotspot, resizeSceneUi } from "../ui/sceneUi";
import { photoArt } from "./photoArt";
import { renderLobbyPhotoWall } from "./lobbyPhotoWall";

export const LOBBY_ROOM_ENTRANCES = [
  { x: 360, y: 145, height: 88, label: "연회장", scene: SCENE_KEYS.Banquet },
  { x: 590, y: 1024, height: 100, label: "신부대기실", scene: SCENE_KEYS.GreeneryCorridor },
  { x: 130, y: 630, height: 220, label: "포토부스", scene: SCENE_KEYS.PhotoBooth },
] as const;

export const LOBBY_OBSTACLES = [
  { x: 275, y: 470, width: 166, height: 245 },
  { x: 30, y: 430, width: 170, height: 250 },
  { x: 500, y: 470, width: 190, height: 265 },
  { x: 30, y: 770, width: 125, height: 220 },
  { x: 490, y: 790, width: 200, height: 140 },
  { x: 270, y: 290, width: 195, height: 90 },
  { x: 500, y: 260, width: 190, height: 130 },
] as const;

export function renderLobbyLandmarks(scene: Phaser.Scene, inspect: (item: "atm" | "drinks") => void): void {
  label(scene, 360, 420, "축의대", 120);
  label(scene, 550, 440, "포토테이블", 160);
  label(scene, 130, 690, "포토부스", 144);
  label(scene, 655, 625, "ATM", 100);
  label(scene, 590, 930, "웰컴드링크", 184);
  label(scene, 590, 1024, "신부대기실", 208);
  label(scene, 360, 145, "↑ 연회장", 160);
  for (const item of [{ x: 667, y: 560, width: 84, height: 168, key: "atm" }, { x: 590, y: 855, width: 240, height: 190, key: "drinks" }] as const) {
    createSceneHotspot(scene, { ...item, name: item.key, onPress: () => inspect(item.key) });
  }
  label(scene, 590, 150, "웨딩홀 →", 184);
}

function label(scene: Phaser.Scene, x: number, y: number, copy: string, width: number): void {
  const required = ["축의대", "포토테이블", "포토부스", "웨딩홀 →"].includes(copy)
    || (copy === "신부대기실" && readGuestSide(scene.registry) === GUEST_SIDES.bride);
  const plate = scene.add.rectangle(x, y, width, 36, required ? 0xfff9ef : 0x26332a)
    .setStrokeStyle(2, 0xc8a24b).setDepth(11).setName(`lobby-sign-${copy}`);
  const text = createKoreanText(scene, {
    x, y, copy, width, maxCharactersPerLine: 10, maxLines: 1,
    fontSize: 20, lineHeight: 28, color: required ? "inkOutline" : "labelText", depth: 12,
  }).setName(`lobby-label-${copy}`).setFixedSize(0, 0);
  resizeSceneUi(scene, () => { plate.setSize(Math.ceil(text.width) + 12, Math.ceil(text.height) + 4); });
}

export function renderLobbyFloor(scene: Phaser.Scene): void {
  photoArt(scene, "lobby");
  renderLobbyPhotoWall(scene);
  const side = readGuestSide(scene.registry) ?? GUEST_SIDES.groom;
  const texture = scene.textures.get("parents");
  const source = texture.getSourceImage();
  const frameWidth = Math.floor(source.width / 2);
  if (!texture.has(side)) texture.add(side, 0, side === GUEST_SIDES.bride ? frameWidth : 0, 0, frameWidth, source.height);
  scene.add.image(175, 350, "parents", side).setDisplaySize(144, 144);
  scene.game.canvas.dataset.parentsSide = side;
}
