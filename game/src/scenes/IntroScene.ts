import Phaser from "phaser";
import { GAME_WIDTH } from "../config";
import { WEDDING_METADATA } from "../data/weddingMetadata";
import { Npc } from "../objects/Npc";
import { sceneArt } from "./sceneArt";
import { SCENE_KEYS } from "../state/gameState";
import {
  createKoreanText,
  createSceneHeader,
  createTouchButton,
  fadeToScene,
  markActiveScene,
} from "../ui/sceneUi";

export class IntroScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.Intro);
  }

  create(): void {
    markActiveScene(this, SCENE_KEYS.Intro);
    sceneArt(this, "ending-background");
    new Npc(this, { x: 304, y: 584, label: WEDDING_METADATA.groomName, variant: "groom" });
    new Npc(this, { x: 416, y: 584, label: WEDDING_METADATA.brideName, variant: "bride" });
    createSceneHeader(this, {
      title: WEDDING_METADATA.venue.name,
      status: WEDDING_METADATA.venue.hall,
    });
    createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: 380,
      copy: `${WEDDING_METADATA.groomName} ♥ ${WEDDING_METADATA.brideName}`,
      width: 512,
      maxCharactersPerLine: 18,
      maxLines: 1,
      fontSize: 32,
      lineHeight: 32,
      color: "inkOutline",
    });
    createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: 444,
      copy: WEDDING_METADATA.eventDate.displayText,
      width: 512,
      maxCharactersPerLine: 24,
      maxLines: 1,
      fontSize: 22,
      lineHeight: 32,
      color: "inkOutline",
    });
    createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: 752,
      copy: "저희 두 사람의 시작에\n소중한 당신을 초대합니다",
      width: 512,
      maxCharactersPerLine: 22,
      maxLines: 2,
      fontSize: 24,
      lineHeight: 32,
      color: "inkOutline",
    });
    createTouchButton(this, {
      x: GAME_WIDTH / 2,
      y: 876,
      width: 368,
      height: 88,
      label: "출발하기",
      onPress: (): void => fadeToScene(this, SCENE_KEYS.HomeSelect),
    });
  }
}
