import { bindCanvasButton } from "./buttonInteraction";
import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { keyboardMode } from "./keyboardAccess";

/** Continue a timed visual once, either on a tap or when its normal delay ends. */
export function waitForTap(scene: Phaser.Scene, delay: number, next: () => void): void {
  let finished = false;
  const surface = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0)
    .setScrollFactor(0).setDepth(90).setInteractive().setName("tap-to-continue");
  const hint = document.createElement("button");
  hint.type = "button";
  hint.setAttribute("aria-label", "계속");
  hint.className = "timed-continue-hint";
  hint.textContent = "계속";
  const position = () => {
    const bounds = scene.game.canvas.getBoundingClientRect();
    Object.assign(hint.style, { left: `${bounds.left + 8}px`, top: `${bounds.bottom - 42}px`, width: `${bounds.width - 16}px` });
  };
  document.body.append(hint);
  position();
  window.addEventListener("resize", position);
  const cancel = () => {
    if (finished) return;
    finished = true;
    timer.remove();
    surface.destroy();
    hint.remove();
    window.removeEventListener("resize", position);
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, cancel);
  };
  const advance = () => {
    if (finished) return;
    cancel();
    next();
  };
  const timer = scene.time.delayedCall(delay, advance);
  hint.onclick = advance;
  if (keyboardMode()) hint.focus({ preventScroll: true });
  bindCanvasButton(scene, surface, advance);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cancel);
}
