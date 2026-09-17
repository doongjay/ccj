import { showGroupPhotoResult } from "../ui/photoResult";
import { warmStage } from "../systems/stageAssets";
import { reducedMotion, watchMotion } from "../ui/motionPreference";
import Phaser from "phaser";
import { speechBubble } from "../ui/speechBubble";
import { saveCheckpoint, CHECKPOINT_REGISTRY } from "../state/checkpoint";
import { Npc } from "../objects/Npc";
import { Player } from "../objects/Player";
import { WEDDING_METADATA } from "../data/weddingMetadata";
import { completeProgressionFlag, isProgressionFlagComplete, GUEST_SIDES, PROGRESSION_FLAGS, readGuestSide, readGuestFace, readGuestGender, readGuestHair, readGuestOutfit, SCENE_KEYS } from "../state/gameState";
import { fadeToScene, markActiveScene } from "../ui/sceneUi";
import { StoryDialog } from "../ui/StoryDialog";
import { photoArt } from "./photoArt";
import { waitForTap } from "../ui/waitForTap";
import { GUEST_PHOTO_POSITIONS } from "../ui/guestPhotoLayout";
import { CEREMONY_SEED, ceremonyCandidates, selectCeremonyGuests } from "../ui/ceremonyGuests";

export class VenueHallScene extends Phaser.Scene {
  private completed = false;
  private participant: Player | undefined;
  constructor() { super(SCENE_KEYS.VenueHall); }

  create(): void {
    if (readGuestSide(this.registry) === GUEST_SIDES.bride
      && !isProgressionFlagComplete(this.registry, PROGRESSION_FLAGS.bridalRoomVisited)) {
      this.scene.start(SCENE_KEYS.GreeneryCorridor);
      return;
    }
    this.completed = false;
    markActiveScene(this, SCENE_KEYS.VenueHall);
    warmStage(this, "dinner");
    saveCheckpoint(this, "hall");
    this.game.canvas.dataset.venueRoom = "hall";
    this.game.canvas.dataset.roomBridePresent = "false";
    this.game.canvas.dataset.hallTransitionCount = "0";
    this.game.canvas.dataset.ceremonyStage = "choice";
    this.game.canvas.dataset.ceremonyReactionCount = "0";
    this.game.canvas.dataset.groupPhotoEntryCount = "0";
    this.game.canvas.dataset.hallCharacterTextureCountBefore = String(this.textures.getTextureKeys().filter(key => /^(?:minimi-(?:male|female)(?:-face-[12])?|heads-(?:male|female)-face-[012]|formal-guest-portraits)$/.test(key)).length);
    this.cameras.main.fadeIn(350);
    photoArt(this, "hall");
    weddingScreen(this, "opening");
    new Npc(this, { x: 320, y: 698, label: WEDDING_METADATA.groomName, variant: "groom", showLabel: false });
    new Npc(this, { x: 395, y: 698, label: WEDDING_METADATA.brideName, variant: "bride", showLabel: false });
    this.participant = new Player(this, { x: 360, y: 1000, appearance: "guest" });
    this.participant.disableInteractive();
    const dialog = new StoryDialog(this, "ceremony");
    dialog.show("시어터가 진짜 영화관만한 스크린이있어서 시어터였구나.", [
      { label: "박수를 친다", onSelect: () => this.celebrate("applause") },
      { label: "환호를 한다", onSelect: () => this.celebrate("cheer") },
    ]);
  }

  private celebrate(reaction: string): void {
    if (this.completed) return;
    this.completed = true;
    this.game.canvas.dataset.ceremonyReaction = reaction;
    this.game.canvas.dataset.ceremonyReactionCount = "1";
    this.game.canvas.dataset.ceremonyStage = "reaction";
    this.game.canvas.dataset.ceremonyReactionStartedAt = String(performance.now());
    this.participant?.setAppearance(reaction === "cheer" ? "posing" : "clapping");
    const copy = reaction === "cheer" ? "축하해!" : "짝짝!";
    const label = speechBubble(this, 360, 885, copy);
    label.setData("reaction", reaction);
    const recipient = readGuestSide(this.registry) === GUEST_SIDES.bride ? "bride" : "groom";
    speechBubble(this, recipient === "bride" ? 395 : 320, 780,
      reaction === "cheer" ? "고마워 ♥" : "♥", true).setData("recipient", recipient);
    // A scene-owned timer pauses with the invitation; input cannot skip this response.
    this.time.delayedCall(1250, () => {
      this.game.canvas.dataset.ceremonyReactionEndedAt = String(performance.now());
      this.beginGroupPhoto();
    });
  }

  private beginGroupPhoto(): void {
    this.game.canvas.dataset.ceremonyStage = "group-photo";
    this.game.canvas.dataset.groupPhotoEntryCount = "1";
    this.children.removeAll(true);
    this.add.image(360, 640, "wedding-group-portrait").setDisplaySize(720, 1280).setDepth(-2);
    // Reuse the opening screen's exact pixels at 1:1 world scale, covering the old film bezel.
    const screen = GROUP_SCREEN_SOURCE;
    this.add.image(360 - screen.width / 2 - screen.x, 364 - screen.height / 2 - screen.y, "venue-hall", "__BASE")
      .setOrigin(0).setCrop(screen.x, screen.y, screen.width, screen.height).setDepth(-1).setName("group-photo-screen");
    weddingScreen(this, "group-photo");
    const guests = ceremonyCandidates();
    const profile = { gender: readGuestGender(this.registry), outfit: readGuestOutfit(this.registry), hair: readGuestHair(this.registry), face: readGuestFace(this.registry) };
    const indices = selectCeremonyGuests(guests, GUEST_PHOTO_POSITIONS.length - 1, profile);
    const keys = indices.map(index => guests[index]!.key);
    Object.assign(this.game.canvas.dataset, { groupCandidateCount: String(guests.length), groupSelectedIndices: JSON.stringify(indices), groupProfileKeys: JSON.stringify(keys), groupUniqueCount: String(new Set(keys).size), groupSeed: String(CEREMONY_SEED), groupPlayerProfile: JSON.stringify(profile) });
    const drawGuest = (index: number, x: number, feet: number, depth: number) => {
      const guest = guests[indices[index]!]!;
      this.add.ellipse(x, feet, 35, 5, 0x827b69, 0.18).setDepth(depth);
      this.add.image(x, feet + 5, guest.texture, guest.frame).setOrigin(0.5, 1)
        .setDisplaySize(86.4, 129.6).setTint(depth === 4 ? 0xffffff : 0xeee8df).setDepth(depth);
    };
    const guestSide = readGuestSide(this.registry);
    const guestPosition = guestSide === GUEST_SIDES.bride ? 70 : 30;
    let index = 0;
    for (const position of GUEST_PHOTO_POSITIONS) {
      if (position.depth === 4 && position.x === guestPosition) continue;
      drawGuest(index++, position.x * 7.2, 940 - (position.bottom - 6) * 5.4, position.depth);
    }
    this.game.canvas.dataset.groupPhotoGuestCount = String(GUEST_PHOTO_POSITIONS.length);
    this.game.canvas.dataset.groupPhotoBackground = "group-photo-portrait-v3";
    const feet = 940;
    new Npc(this, { x: 326, y: feet - 72, label: "", variant: "groom", showLabel: false }).setScale(1.5).setDepth(5);
    new Npc(this, { x: 394, y: feet - 72, label: "", variant: "bride", showLabel: false }).setScale(1.5).setDepth(5);
    const guestX = guestPosition * 7.2;
    new Player(this, { x: guestX, y: feet - 67.2, appearance: "posing" }).setScale(1.4).setDepth(5);
    this.game.canvas.dataset.groupPhotoGuestSide = guestSide ?? "groom";
    this.renderCameraFrame();
    this.game.canvas.dataset.groupPlayerMarker = "false";
    const stopGreetings = this.startGuestGreetings();
    this.game.canvas.dataset.hallCharacterTextureCountAfter = String(this.textures.getTextureKeys().filter(key => /^(?:minimi-(?:male|female)(?:-face-[12])?|heads-(?:male|female)-face-[012]|formal-guest-portraits)$/.test(key)).length);
    const photoDialog = new StoryDialog(this, "group-photo");
    photoDialog.show("다 같이 원판 사진도 남겨야지.\n바로 옆에 서니까 괜히 더 뭉클하네.", [{
      label: "사진 찍기", onSelect: () => {
        stopGreetings();
        this.game.canvas.dataset.ceremonyStage = "countdown";
        const countdown = this.add.text(360, 520, "3", { fontFamily: "Galmuri11, monospace", fontSize: "44px", color: "#ffffff", stroke: "#26332a", strokeThickness: 5 }).setOrigin(0.5).setDepth(32);
        let remaining = 3;
        const ticking = this.time.addEvent({ delay: 1000, repeat: 1, callback: () => {
          remaining -= 1;
          countdown.setText(String(remaining));
        } });
        waitForTap(this, 3000, () => {
          ticking.remove();
          countdown.destroy();
          this.game.canvas.dataset.ceremonyStage = "photo";
          completeProgressionFlag(this.registry, PROGRESSION_FLAGS.banquetGuideComplete);
          this.game.canvas.dataset.banquetGuideComplete = "true";
          if (!this.registry.get(CHECKPOINT_REGISTRY.meal) || this.registry.get(CHECKPOINT_REGISTRY.meal) === "pending") this.registry.set(CHECKPOINT_REGISTRY.meal, "after");
          saveCheckpoint(this, "dinner");
          void showGroupPhotoResult(this, () => {
            this.game.canvas.dataset.hallTransitionCount = "1";
            fadeToScene(this, SCENE_KEYS.DinnerJourney);
          });
        });
      },
    }]);
  }

  private startGuestGreetings(): () => void {
    // Back-row speakers have clear space above their heads inside the viewfinder.
    const greetings = [
      { x: 19, copy: "축하해!" }, { x: 79, copy: "잘살아!" },
      { x: 43, copy: "멋지다!" }, { x: 67, copy: "예쁘다!" },
      { x: 55, copy: "행복해!" },
    ];
    let index = 0;
    let bubble: Phaser.GameObjects.Text | undefined;
    let timer: Phaser.Time.TimerEvent | undefined;
    const show = () => {
      bubble?.destroy();
      const greeting = greetings[index++ % greetings.length]!;
      bubble = speechBubble(this, greeting.x * 7.2, 640, greeting.copy, false, 0.5).setData("groupGreeting", true);
    };
    show();
    const stopMotion = watchMotion(this, () => {
      timer?.remove();
      // Reduced motion keeps one stationary greeting; the camera action still clears it.
      if (!reducedMotion()) timer = this.time.addEvent({ delay: 1500, loop: true, callback: show });
    });
    const stop = () => {
      timer?.remove();
      bubble?.destroy();
      stopMotion();
      this.events.off(Phaser.Scenes.Events.SHUTDOWN, stop);
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, stop);
    return stop;
  }

  private renderCameraFrame(): void {
    const frame = this.add.graphics().setDepth(30);
    frame.fillStyle(0x000000, 0.45).fillRect(30, 500, 660, 56).fillRect(30, 960, 660, 44);
    frame.lineStyle(4, 0xffffff, 0.95);
    for (const corner of [{ x: 40, y: 510, dx: 1, dy: 1 }, { x: 680, y: 510, dx: -1, dy: 1 }, { x: 40, y: 995, dx: 1, dy: -1 }, { x: 680, y: 995, dx: -1, dy: -1 }]) {
      frame.lineBetween(corner.x, corner.y, corner.x + 65 * corner.dx, corner.y);
      frame.lineBetween(corner.x, corner.y, corner.x, corner.y + 65 * corner.dy);
    }
    frame.lineStyle(2, 0xffffff, 0.8);
    for (const corner of [{ x: 292, y: 808, dx: 1, dy: 1 }, { x: 428, y: 808, dx: -1, dy: 1 }, { x: 292, y: 960, dx: 1, dy: -1 }, { x: 428, y: 960, dx: -1, dy: -1 }]) {
      frame.lineBetween(corner.x, corner.y, corner.x + 20 * corner.dx, corner.y);
      frame.lineBetween(corner.x, corner.y, corner.x, corner.y + 20 * corner.dy);
    }
    frame.lineBetween(351, 884, 369, 884).lineBetween(360, 875, 360, 893);
    const recording = this.add.circle(74, 534, 7, 0xf04c54).setDepth(31);
    const stopMotion = watchMotion(this, () => {
      this.tweens.killTweensOf(recording); recording.setAlpha(1);
      if (!reducedMotion()) this.tweens.add({ targets: recording, alpha: 0.2, duration: 650, yoyo: true, repeat: -1 });
    });
    recording.once("destroy", stopMotion);
    const style = { fontFamily: "Galmuri11, monospace", fontSize: "20px", color: "#ffffff" };
    this.add.text(92, 521, "REC", style).setDepth(31);
    this.add.text(58, 967, "HD  •  AF", style).setDepth(31);
    const timer = this.add.text(548, 967, "00:00:00", style).setDepth(31);
    let seconds = 0;
    this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      seconds += 1;
      timer.setText(`00:${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`);
    } });
    this.game.canvas.dataset.groupPhotoCamera = "viewfinder";
  }
}
import { GROUP_SCREEN_SOURCE, weddingScreen } from "../ui/weddingScreen";
