import Phaser from "phaser";
import { openGameInvitation } from "./GameAccess";

/** Short landscape screens cannot fit the portrait game's readable controls. */
export function showPortraitNotice(scene: Phaser.Scene): void {
  const notice = document.createElement("div");
  notice.className = "portrait-notice";
  notice.setAttribute("role", "dialog");
  notice.setAttribute("aria-label", "화면 방향 안내");
  const panel = document.createElement("div");
  panel.className = "portrait-notice-panel";
  const copy = document.createElement("p");
  copy.textContent = "세로 화면에서 더 편하게 즐길 수 있어요";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "portrait-invitation";
  button.textContent = "청첩장 바로 보기";
  button.onclick = () => openGameInvitation(scene);
  panel.append(copy, button);
  notice.append(panel);
  document.body.append(notice);
  const landscape = window.matchMedia("(orientation: landscape) and (max-height: 600px)");
  const update = () => {
    notice.hidden = !landscape.matches;
    if (landscape.matches) button.focus({ preventScroll: true });
  };
  update();
  scene.events.on(Phaser.Scenes.Events.RESUME, update);
  landscape.addEventListener("change", update);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    landscape.removeEventListener("change", update);
    scene.events.off(Phaser.Scenes.Events.RESUME, update);
    notice.remove();
  });
}
