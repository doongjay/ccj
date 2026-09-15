import type Phaser from "phaser";

let usingKeyboard = false;
const held = new Map<string, EventTarget | null>();
window.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const control = event.target instanceof Element && event.target.closest('button, [role="button"]');
  if (event.repeat && (control || (held.has(event.key) && held.get(event.key) !== event.target))) { event.preventDefault(); event.stopImmediatePropagation(); return; }
  if (!event.repeat) held.set(event.key, event.target);
}, true);
window.addEventListener("keyup", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const control = event.target instanceof Element && event.target.closest('button, [role="button"]');
  if (control && held.has(event.key) && held.get(event.key) !== event.target) { event.preventDefault(); event.stopImmediatePropagation(); }
  held.delete(event.key);
}, true);
window.addEventListener("blur", () => held.clear());
window.addEventListener("keydown", event => { if (event.key === "Tab") { usingKeyboard = true; document.body.classList.add("keyboard-mode"); } }, true);
window.addEventListener("pointerdown", () => { usingKeyboard = false; document.body.classList.remove("keyboard-mode"); }, true);
export const keyboardMode = () => usingKeyboard;
const menus = new WeakMap<Phaser.Scene, HTMLElement>();

/** Semantic counterparts share the existing canvas actions, visibility and scene lifetime. */
export function keyboardCanvasAction(scene: Phaser.Scene, target: Phaser.GameObjects.Rectangle, label: () => string, action: () => void, destination = false): void {
  const button = document.createElement("button");
  button.type = "button";
  button.className = destination ? "keyboard-destination" : "canvas-keyboard-button";
  if (destination) {
    let menu = menus.get(scene);
    if (!menu) {
      menu = document.createElement("nav");
      menu.className = "keyboard-destinations";
      menu.setAttribute("aria-label", "로비 장소 선택");
      const title = document.createElement("p");
      title.textContent = "장소 선택 · Tab으로 둘러보세요";
      menu.append(title);
      document.body.append(menu);
      menus.set(scene, menu);
      scene.events.once("shutdown", () => { menu?.remove(); menus.delete(scene); });
    }
    menu.append(button);
  } else document.body.append(button);
  button.onclick = () => { if (!button.hidden && !button.disabled && scene.scene.isActive() && target.visible && target.input?.enabled) action(); };
  let wasHidden = true;
  const sync = () => {
    const blocked = Boolean(document.querySelector('.story-overlay:not([hidden]), .stage-loading:not([hidden])'))
      || (scene.game.canvas.dataset.photoGalleryOpen === "true" && target.depth < 100);
    button.hidden = !target.scene || !target.visible || !scene.scene.isActive() || blocked
      || (scene.scene.key === "VenueLobbyScene" && scene.game.canvas.dataset.lobbyReady !== "true");
    const becameVisible = wasHidden && !button.hidden;
    wasHidden = button.hidden;
    button.disabled = !target.input?.enabled;
    const copy = label();
    if (button.textContent !== copy) button.textContent = copy;
    if (button.hidden) return;
    const canvas = scene.game.canvas.getBoundingClientRect();
    if (destination) {
      const menu = menus.get(scene)!;
      Object.assign(menu.style, { left: `${canvas.left + 16}px`, top: `${canvas.top + 84}px`, width: `${canvas.width - 32}px` });
    } else {
      const bounds = target.getBounds();
      Object.assign(button.style, { left: `${canvas.left + bounds.x * canvas.width / 720}px`, top: `${canvas.top + bounds.y * canvas.height / 1280}px`,
        width: `${Math.max(44, bounds.width * canvas.width / 720)}px`, height: `${Math.max(44, bounds.height * canvas.height / 1280)}px` });
    }
    if (becameVisible && usingKeyboard && (document.activeElement === document.body || (target.depth >= 100 && copy === "닫기"))) button.focus({ preventScroll: true });
  };
  scene.events.on("postupdate", sync);
  sync();
  const destroy = () => { scene.events.off("postupdate", sync); button.remove(); };
  target.once("destroy", destroy);
  scene.events.once("shutdown", destroy);
}
