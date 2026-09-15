import { warmStage } from "../systems/stageAssets";
import { warmInvitationPhotos } from "../ui/invitationPhotos";
import Phaser from "phaser";
import { GAME_WIDTH } from "../config";
import { WEDDING_METADATA } from "../data/weddingMetadata";
import { Npc } from "../objects/Npc";
import { photoArt } from "./photoArt";
import { SCENE_KEYS } from "../state/gameState";
import { resetSessionMemories } from "../ui/sessionMemories";
import { loadCheckpoint, applyCheckpoint, restartVisit } from "../state/checkpoint";
import { StoryDialog } from "../ui/StoryDialog";
import { weddingScreen } from "../ui/weddingScreen";
import {
  createKoreanText,
  createTouchButton,
  fadeToScene,
  markActiveScene,
} from "../ui/sceneUi";

export class IntroScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.Intro);
  }

  create(): void {
    resetSessionMemories(this.game);
    // Delay until the initial screen is usable and its transfer measurement ends.
    this.time.delayedCall(1200, () => warmStage(this, "setup"));
    const saved = loadCheckpoint();
    markActiveScene(this, SCENE_KEYS.Intro);
    photoArt(this, "hall");
    createTouchButton(this, {
      x: 604, y: 78, width: 184, height: 88, label: "건너뛰기", depth: 20,
      onPress: () => fadeToScene(this, SCENE_KEYS.Invitation),
    });
    weddingScreen(this, "opening");
    new Npc(this, { x: 320, y: 698, label: WEDDING_METADATA.groomName, variant: "groom", showLabel: false });
    new Npc(this, { x: 395, y: 698, label: WEDDING_METADATA.brideName, variant: "bride", showLabel: false });
    createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: 967,
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
      y: 1015,
      copy: WEDDING_METADATA.eventDate.displayText,
      width: 512,
      maxCharactersPerLine: 24,
      maxLines: 1,
      fontSize: 22,
      lineHeight: 32,
      color: "inkOutline",
    });
    if (!saved.value) createKoreanText(this, {
      x: GAME_WIDTH / 2,
      y: 1080,
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
      y: saved.value ? 1104 : 1180,
      width: 368,
      height: 88,
      label: saved.value ? "이어하기" : "출발",
      onPress: (): void => {
        warmInvitationPhotos();
        if (saved.value) fadeToScene(this, applyCheckpoint(this, saved.value));
        else { restartVisit(this); fadeToScene(this, SCENE_KEYS.HomeSelect); }
      },
    });
    if (saved.value) createTouchButton(this, {
      x: GAME_WIDTH / 2, y: 1216, width: 368, height: 80, label: "처음부터",
      onPress: () => { warmInvitationPhotos(); restartVisit(this); fadeToScene(this, SCENE_KEYS.HomeSelect); },
    });
    if (saved.problem) new StoryDialog(this).showInfo(saved.problem === "unavailable"
      ? "이 브라우저에서는 이어하기 저장을 사용할 수 없어요. 지금 게임은 계속 즐길 수 있어요."
      : "저장된 방문 기록을 읽을 수 없어 새로 시작해요. 방명록은 그대로 남아 있어요.", () => {}, { tapToContinue: true });
  }
}
