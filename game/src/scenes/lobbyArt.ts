import type Phaser from "phaser";
import { SCENE_KEYS } from "../state/gameState";
import { createKoreanText, SCENE_UI_COLORS } from "../ui/sceneUi";
import { sceneArt } from "./sceneArt";

export const LOBBY_ROOM_ENTRANCES = [
  { x: 360, y: 850, label: "연회장 가는 길", scene: SCENE_KEYS.Banquet },
  { x: 130, y: 990, label: "대기실", scene: SCENE_KEYS.WaitingRoom },
  { x: 590, y: 990, label: "신부대기실", scene: SCENE_KEYS.GreeneryCorridor },
  { x: 360, y: 1200, label: "포토부스", scene: SCENE_KEYS.PhotoBooth },
] as const;

export function renderLobbyLandmarks(scene: Phaser.Scene): void {
  sceneArt(scene, "reception-desk", 110, 350, 128, 80);
  sceneArt(scene, "reception-desk", 260, 350, 128, 80);
  label(scene, 185, 190, "축의대", 280);
  label(scene, 110, 398, "신랑측", 120);
  label(scene, 260, 398, "신부측", 120);
  sceneArt(scene, "photo-table", 550, 350, 168, 96);
  label(scene, 550, 220, "포토테이블", 200);
  sceneArt(scene, "drinks-station", 590, 650, 144, 96);
  label(scene, 590, 728, "웰컴 드링크", 184);
  label(scene, 360, 150, "예식홀 입구", 184);
}

function label(scene: Phaser.Scene, x: number, y: number, copy: string, width: number): void {
  createKoreanText(scene, {
    x, y, copy, width, maxCharactersPerLine: 10, maxLines: 1,
    fontSize: 20, lineHeight: 28, color: "labelText",
  }).setBackgroundColor(SCENE_UI_COLORS.labelSurface.text);
}
