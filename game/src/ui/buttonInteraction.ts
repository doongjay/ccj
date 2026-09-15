import Phaser from "phaser";

/** A press commits only on release inside the same enabled control. */
export function bindCanvasButton(scene: Phaser.Scene, target: Phaser.GameObjects.Rectangle, action: () => void, decorate = false): void {
  let armed: number | undefined, over = false, disposed = false;
  const enabled = () => Boolean(target.scene && target.visible && target.input?.enabled && scene.scene.isActive());
  const paint = () => {
    if (!target.scene) return;
    const state = !target.input?.enabled ? "disabled" : armed !== undefined ? "pressed" : over ? "hover" : "idle";
    target.setData("buttonState", state);
    if (decorate) target.setFillStyle({ idle: 0xffffff, hover: 0xffefd0, pressed: 0xd1b36c, disabled: 0xc9c4b7 }[state]);
  };
  const cancel = () => { armed = undefined; over = false; paint(); };
  const down = (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
    event.stopPropagation();
    if (!enabled()) return;
    armed = pointer.id; over = true; paint();
  };
  const up = (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
    event.stopPropagation();
    const commit = armed === pointer.id && over && enabled();
    armed = undefined; paint();
    if (commit) action();
  };
  const enter = () => { over = true; paint(); };
  const leave = () => { armed = undefined; over = false; paint(); };
  const releaseOutside = () => { armed = undefined; paint(); };
  let previousEnabled = enabled();
  const sync = () => { const next = enabled(); if (next !== previousEnabled) { previousEnabled = next; cancel(); } };
  target.on("pointerdown", down).on("pointerup", up).on("pointerover", enter).on("pointerout", leave);
  scene.input.on("pointerup", releaseOutside);
  scene.game.canvas.addEventListener("pointercancel", cancel);
  scene.game.canvas.addEventListener("touchcancel", cancel);
  window.addEventListener("blur", cancel);
  scene.events.on("pause", cancel);
  scene.events.on("sleep", cancel);
  scene.events.on("postupdate", sync);
  const destroy = () => {
    if (disposed) return; disposed = true;
    scene.input.off("pointerup", releaseOutside);
    scene.game.canvas.removeEventListener("pointercancel", cancel);
    scene.game.canvas.removeEventListener("touchcancel", cancel);
    window.removeEventListener("blur", cancel);
    scene.events.off("pause", cancel); scene.events.off("sleep", cancel); scene.events.off("postupdate", sync);
    scene.events.off("shutdown", destroy);
  };
  scene.events.once("shutdown", destroy); target.once("destroy", destroy);
  paint();
}
