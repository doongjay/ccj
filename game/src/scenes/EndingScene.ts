import { cloudEnabled } from "../cloud/client";
import Phaser from "phaser";
import { readGuestName, readGuestSide, readGuestGender, readGuestOutfit, readGuestHair, readGuestFace, SCENE_KEYS } from "../state/gameState";
import { saveCheckpoint, restartVisit, CHECKPOINT_REGISTRY } from "../state/checkpoint";
import { saveGuestMessage } from "../state/guestMessages";
import { TextEntryDialog } from "../ui/TextEntryDialog";
import { fadeToScene, markActiveScene } from "../ui/sceneUi";
import { StoryDialog } from "../ui/StoryDialog";
import { photoArt } from "./photoArt";

export class EndingScene extends Phaser.Scene {
  private replayRequested = false;
  constructor() { super(SCENE_KEYS.Ending); }

  create(): void {
    this.replayRequested = false;
    markActiveScene(this, SCENE_KEYS.Ending);
    this.game.canvas.dataset.endingReady = "true";
    this.game.canvas.dataset.endingReplayReady = "false";
    this.game.canvas.dataset.replayRequested = "false";
    this.cameras.main.fadeIn(600);
    photoArt(this, "hall");
    this.add.rectangle(360, 640, 720, 1280, 0x26332a, 0.5);
    this.add.text(360, 280, "JJ ♥ HS", {
      fontFamily: "Galmuri11, monospace", fontSize: "56px", color: "#fffaf2", resolution: 3,
    }).setOrigin(0.5);
    const side = readGuestSide(this.registry) ?? "groom";
    const recipient = side === "bride" ? "현서" : "재준";
    this.game.canvas.dataset.messageSaved = "false";
    const disposition = this.registry.get(CHECKPOINT_REGISTRY.ending);
    if (disposition === "saved" || disposition === "skipped") {
      this.game.canvas.dataset.messageSaved = String(disposition === "saved");
      this.showEndingChoices(disposition === "saved");
      return;
    }
    saveCheckpoint(this, "ending");
    new TextEntryDialog(this, {
      title: `${recipient}에게 메시지 남기기`,
      fieldLabel: "축하 메시지",
      submitLabel: "메시지 남기기",
      maxLength: 1000,
      multiline: true,
      note: `보내는 사람: ${readGuestName(this.registry)} · ${cloudEnabled ? "메시지는 신랑신부에게만 전달됩니다." : "로컬 확인용으로 이 브라우저에만 저장됩니다."}`,
      onSkip: () => this.showEndingChoices(false),
      onSubmit: async message => {
        await saveGuestMessage(readGuestName(this.registry), side, message, { gender: readGuestGender(this.registry), outfit: readGuestOutfit(this.registry), hair: readGuestHair(this.registry), face: readGuestFace(this.registry) });
        this.game.canvas.dataset.messageSaved = "true";
        this.showEndingChoices(true);
      },
    });
  }

  private showEndingChoices(saved: boolean): void {
    this.registry.set(CHECKPOINT_REGISTRY.ending, saved ? "saved" : "skipped");
    saveCheckpoint(this, "ending");
    new StoryDialog(this).show(saved ? (cloudEnabled ? "메시지를 신랑신부에게 보냈어요. 함께해 줘서 고마워요!" : "메시지를 이 브라우저에 저장했어요. 함께해 줘서 고마워요!") : "함께해 줘서 고마워요! 메시지는 나중에 남겨도 좋아요.", [
      { label: "청첩장 보기", onSelect: () => fadeToScene(this, SCENE_KEYS.Invitation) },
      { label: "처음부터 다시", onSelect: () => this.replay() },
    ], () => { this.game.canvas.dataset.endingReplayReady = "true"; });
  }

  private replay(): void {
    if (this.replayRequested) return;
    this.replayRequested = true;
    const dataset = this.game.canvas.dataset;
    const count = Number(dataset.replayCount ?? "0") + 1;
    restartVisit(this);
    for (const key of Object.keys(dataset)) {
      if (!key.startsWith("asset") && !key.startsWith("font")) delete dataset[key];
    }
    dataset.replayCount = String(count);
    dataset.replayRequested = "true";
    dataset.routeChoice = "";
    dataset.guestSide = "";
    dataset.bridalRoomVisited = "false";
    dataset.photoBoothVisited = "false";
    dataset.photoTableVisited = "false";
    fadeToScene(this, SCENE_KEYS.Intro);
  }
}
