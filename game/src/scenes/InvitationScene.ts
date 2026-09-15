import Phaser from "phaser";
import { SCENE_KEYS } from "../state/gameState";
import { markActiveScene } from "../ui/sceneUi";
import { InvitationView } from "../ui/InvitationView";

export class InvitationScene extends Phaser.Scene {
  constructor() { super(SCENE_KEYS.Invitation); }

  create(): void {
    markActiveScene(this, SCENE_KEYS.Invitation);
    const view = new InvitationView(this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => view.destroy());
  }
}
