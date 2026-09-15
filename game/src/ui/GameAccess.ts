import type Phaser from "phaser";
import { SCENE_KEYS } from "../state/gameState";
import { InvitationView } from "./InvitationView";
import { ensureSceneAssets } from "../systems/stageAssets";

const opened = new WeakSet<Phaser.Scene>();

/** Suspend the live scene, including its timers, instead of rebuilding its progression. */
export async function openGameInvitation(scene: Phaser.Scene): Promise<void> {
  if (opened.has(scene)) return;
  opened.add(scene);
  const focus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
  const key = scene.game.canvas.dataset.activeScene;
  const ui = [...document.querySelectorAll<HTMLElement>(".story-overlay, .timed-continue-hint, .game-access, .canvas-keyboard-button, .keyboard-destinations, .portrait-notice, .scene-feedback")]
    .map(node => ({ node, hidden: node.hidden, visibility: node.style.visibility, inert: node.inert }));
  for (const { node } of ui) { node.hidden = true; node.style.visibility = "hidden"; node.inert = true; }
  scene.scene.pause();
  await ensureSceneAssets(scene, SCENE_KEYS.Invitation);
  scene.game.canvas.dataset.activeScene = SCENE_KEYS.Invitation;
  scene.game.canvas.dataset.invitationReturnScene = key ?? "";
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    view.destroy();
    window.removeEventListener("keydown", escape);
    for (const { node, hidden, visibility, inert } of ui) { node.hidden = hidden; node.style.visibility = visibility; node.inert = inert; }
    opened.delete(scene);
    scene.game.canvas.dataset.activeScene = key ?? scene.scene.key;
    delete scene.game.canvas.dataset.invitationReturnScene;
    scene.scene.resume();
    if (focus?.isConnected) focus.focus({ preventScroll: true });
  };
  const view = new InvitationView(scene, close);
  const escape = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || document.querySelector("dialog[open]")) return;
    event.preventDefault();
    close();
  };
  window.addEventListener("keydown", escape);
}

export function createGameAccess(scene: Phaser.Scene): void {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "game-access";
  button.textContent = "청첩장";
  button.onclick = () => openGameInvitation(scene);
  document.body.append(button);
  const position = () => {
    const bounds = scene.game.canvas.getBoundingClientRect();
    const beside = window.innerWidth - bounds.right >= 92;
    const inset = !beside && bounds.top < 52;
    document.body.classList.toggle("inset-game-access", inset);
    Object.assign(button.style, { left: `${beside ? bounds.right + 8 : bounds.right - 84}px`, top: `${beside ? bounds.top + 8 : inset ? bounds.top + 4 : bounds.top - 48}px` });
  };
  position();
  window.addEventListener("resize", position);
  scene.events.once("shutdown", () => {
    window.removeEventListener("resize", position);
    button.remove();
    document.body.classList.remove("inset-game-access");
  });
}
