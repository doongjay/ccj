import Phaser from "phaser";
import { saveCheckpoint } from "../state/checkpoint";
import { completeProgressionFlag, PROGRESSION_FLAGS, readGuestName, readGuestSide, SCENE_KEYS } from "../state/gameState";
import { StoryDialog } from "../ui/StoryDialog";
import { createKoreanText, fadeToScene, markActiveScene } from "../ui/sceneUi";
import type { SceneTransitionData } from "../ui/sceneUi";
import { waitForTap } from "../ui/waitForTap";

export class ReceptionScene extends Phaser.Scene {
  private lobbyReturn: SceneTransitionData["lobbyReturn"];
  constructor() { super(SCENE_KEYS.Reception); }

  create(data: SceneTransitionData = {}): void {
    this.lobbyReturn = data.lobbyReturn;
    markActiveScene(this, SCENE_KEYS.Reception);
    this.cameras.main.fadeIn(300);
    const side = readGuestSide(this.registry) ?? "groom";
    const texture = this.textures.get("reception-family");
    const source = texture.getSourceImage();
    const frameWidth = Math.floor(source.width / 2);
    const frameHeight = Math.floor(frameWidth * 1280 / 720);
    if (!texture.has(side)) texture.add(side, 0, side === "bride" ? frameWidth : 0, Math.floor(source.height * 0.15), frameWidth, frameHeight);
    this.add.image(360, 640, "reception-family", side).setDisplaySize(720, 1280);
    this.game.canvas.dataset.receptionFamily = side === "bride" ? "parents-and-brother" : "parents";
    this.game.canvas.dataset.receptionStage = "greeting";
    const dialog = new StoryDialog(this, "bottom");
    dialog.show("와줘서 고마워요", [{ label: "인사하기", onSelect: () => this.writeEnvelope() }]);
  }

  private writeEnvelope(): void {
    this.game.canvas.dataset.receptionStage = "writing";
    const shade = this.add.rectangle(360, 640, 720, 1280, 0x000000, 0.7).setDepth(20);
    const paper = this.add.rectangle(360, 660, 380, 760, 0xfff9ef).setStrokeStyle(6, 0xc8a24b).setDepth(21);
    const flap = this.add.graphics().setDepth(22);
    flap.lineStyle(3, 0xc7bda9).lineBetween(170, 300, 360, 390).lineBetween(360, 390, 550, 300);
    flap.lineBetween(360, 390, 360, 1020);
    const title = createKoreanText(this, { x: 360, y: 210, copy: "봉투에 이름을 적자.\n슥슥슥…", width: 600, maxCharactersPerLine: 28, maxLines: 2, fontSize: 24, lineHeight: 32, color: "labelText", depth: 23 });
    const name = Array.from(readGuestName(this.registry));
    const startY = Math.max(430, 930 - name.length * 25);
    const ink = this.add.text(225, startY, "", { fontFamily: "Galmuri11, monospace", fontSize: "22px", color: "#26332a", lineSpacing: 3 }).setDepth(23);
    let count = 0;
    const writing = this.time.addEvent({ delay: 320, repeat: Math.max(0, name.length - 1), callback: () => {
      ink.setText(name.slice(0, ++count).join("\n"));
    } });
    waitForTap(this, Math.max(1, name.length) * 320, () => {
      writing.remove();
      ink.setText(name.join("\n"));
      waitForTap(this, 1300, () => {
        completeProgressionFlag(this.registry, PROGRESSION_FLAGS.receptionComplete);
        saveCheckpoint(this, "lobby");
        this.game.canvas.dataset.receptionComplete = "true";
        this.game.canvas.dataset.receptionDesk = readGuestSide(this.registry) ?? "";
        this.game.canvas.dataset.receptionStage = "complete";
        for (const object of [shade, paper, flap, title, ink]) object.destroy();
        fadeToScene(this, SCENE_KEYS.VenueLobby, { entrance: this.lobbyReturn });
      });
    });
  }
}
